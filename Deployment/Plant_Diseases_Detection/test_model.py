import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import json
import os
import argparse
from pathlib import Path
import torchvision.transforms as transforms

# Load class names from the same JSON file used in app.py
imagenet_labels = json.load(open("imagenet_class_index.json"))
labels = [imagenet_labels[str(k)][0] for k in range(len(imagenet_labels))]
num_classes = len(labels)

# Base class for image classification models
class ImageClassificationBase(nn.Module):
    def training_step(self, batch):
        images, labels = batch 
        out = self(images)
        loss = F.cross_entropy(out, labels)
        return loss
    
    def validation_step(self, batch):
        images, labels = batch 
        out = self(images)
        loss = F.cross_entropy(out, labels)
        acc = accuracy(out, labels)
        return {'val_loss': loss.detach(), 'val_acc': acc}
        
    def validation_epoch_end(self, outputs):
        batch_losses = [x['val_loss'] for x in outputs]
        epoch_loss = torch.stack(batch_losses).mean()
        batch_accs = [x['val_acc'] for x in outputs]
        epoch_acc = torch.stack(batch_accs).mean()
        return {'val_loss': epoch_loss.item(), 'val_acc': epoch_acc.item()}
    
    def epoch_end(self, epoch, result):
        print("Epoch [{}], train_loss: {:.4f}, val_loss: {:.4f}, val_acc: {:.4f}".format(
            epoch, result['train_loss'], result['val_loss'], result['val_acc']))

# Accuracy calculation function (needed for the base class)
def accuracy(outputs, labels):
    _, preds = torch.max(outputs, dim=1)
    return torch.tensor(torch.sum(preds == labels).item() / len(preds))

# convolution block with BatchNormalization
def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
             nn.BatchNorm2d(out_channels),
             nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))  # Changed to 4 to match notebook
    return nn.Sequential(*layers)

# resnet architecture - matching app.py
class ResNet9(ImageClassificationBase):
    def __init__(self, in_channels=3, num_diseases=num_classes):
        super().__init__()

        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)  # out_dim : 128 x 64 x 64
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))

        self.conv3 = ConvBlock(128, 256, pool=True)  # out_dim : 256 x 16 x 16
        self.conv4 = ConvBlock(256, 512, pool=True)  # out_dim : 512 x 4 x 4
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))

        # Use adaptive pooling for compatibility with any input size
        self.classifier = nn.Sequential(nn.AdaptiveAvgPool2d(1),
                                       nn.Flatten(),
                                       nn.Linear(512, num_diseases))

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out

def get_transforms():
    # Use the EXACT same transforms as in the notebook
    return transforms.Compose([
        # No resizing
        transforms.ToTensor(),
        # No normalization
    ])

def load_model():
    model = ResNet9()
    
    # Try to load the model
    if os.path.exists("model.pt"):
        try:
            print(f"Loading model from model.pt")
            state_dict = torch.load("model.pt", map_location='cpu')
            if isinstance(state_dict, dict) and 'state_dict' in state_dict:
                state_dict = state_dict['state_dict']
                
            # Load state dict directly since structure matches
            model.load_state_dict(state_dict, strict=False)
            print("Successfully loaded model")
        except Exception as e:
            print(f"Error loading model: {e}")
    
    model.eval()
    return model

def predict_image(model, img_path):
    img = Image.open(img_path).convert('RGB')
    transform = get_transforms()
    img_tensor = transform(img).unsqueeze(0)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        
    # Get probabilities
    probs = F.softmax(outputs[0], dim=0)
    
    # Get top 5 predictions
    top_probs, top_idxs = torch.topk(probs, 5)
    
    return [(labels[idx], prob.item()) for idx, prob in zip(top_idxs, top_probs)]

def main():
    parser = argparse.ArgumentParser(description='Test Plant Disease Classification Model')
    parser.add_argument('--image', type=str, help='Path to image file to test')
    parser.add_argument('--folder', type=str, help='Path to folder of test images')
    parser.add_argument('--expected', type=str, help='Expected class name (optional)')
    parser.add_argument('--threshold', type=float, default=0.70, help='Confidence threshold (default: 0.70)')
    
    args = parser.parse_args()
    confidence_threshold = args.threshold
    
    # Load model
    model = load_model()
    
    if args.image:
        # Test single image
        predictions = predict_image(model, args.image)
        print(f"\nResults for image: {args.image}")
        
        # Check if top prediction meets threshold
        top_prediction = predictions[0]
        if top_prediction[1] < confidence_threshold:
            print(f"WARNING: Top prediction confidence {top_prediction[1]:.2%} is below threshold {confidence_threshold:.2%}")
            print(f"Prediction may not be reliable!")
        
        print("\nTop 5 Predictions:")
        for i, (label, prob) in enumerate(predictions):
            status = "" if prob >= confidence_threshold else " (below threshold)"
            print(f"{i+1}. {label}: {prob:.2%}{status}")
            
        if args.expected:
            # Check if expected class is in top predictions
            expected_found = False
            expected_rank = -1
            expected_prob = 0
            
            for i, (label, prob) in enumerate(predictions):
                if args.expected.lower() in label.lower():
                    expected_found = True
                    expected_rank = i + 1
                    expected_prob = prob
                    break
            
            if expected_found:
                print(f"\nExpected class '{args.expected}' found at rank {expected_rank} with probability {expected_prob:.4f}")
            else:
                print(f"\nExpected class '{args.expected}' not found in top 5 predictions")
                
    elif args.folder:
        # Test multiple images in a folder
        folder_path = Path(args.folder)
        image_extensions = ['.jpg', '.jpeg', '.png']
        image_files = [f for f in folder_path.iterdir() if f.suffix.lower() in image_extensions]
        
        if not image_files:
            print(f"No images found in folder {args.folder}")
            return
        
        print(f"\nTesting {len(image_files)} images in folder: {args.folder}")
        
        correct_count = 0
        total_count = 0
        
        for img_path in image_files:
            # Try to extract expected class from filename or folder structure
            img_name = img_path.stem
            parent_folder = img_path.parent.name
            
            expected_class = parent_folder if parent_folder in str(imagenet_labels) else None
            
            if not expected_class:
                # Try to find a class name in the image filename
                for class_name in labels:
                    if class_name.lower().replace('_', ' ') in img_name.lower():
                        expected_class = class_name
                        break
            
            predictions = predict_image(model, img_path)
            top_prediction = predictions[0][0]
            
            print(f"\nImage: {img_path.name}")
            print(f"Top prediction: {top_prediction} ({predictions[0][1]:.4f})")
            
            if expected_class:
                is_correct = expected_class.lower() in top_prediction.lower()
                print(f"Expected: {expected_class}, {'Correct' if is_correct else 'Incorrect'}")
                
                if is_correct:
                    correct_count += 1
                total_count += 1
        
        if total_count > 0:
            accuracy = correct_count / total_count
            print(f"\nOverall accuracy: {correct_count}/{total_count} = {accuracy:.2%}")
    else:
        print("Please provide either --image or --folder argument")

if __name__ == "__main__":
    main() 