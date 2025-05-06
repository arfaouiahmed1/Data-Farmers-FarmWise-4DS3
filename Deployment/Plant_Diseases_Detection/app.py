import gradio as gr
import torch
import torchvision.transforms as transforms
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import json
import os

# Add the ResNet9 class to the safe globals for PyTorch >= 2.6
try:
    import torch.serialization
    torch.serialization.add_safe_globals(['__main__.ResNet9', '__main__.ImageClassificationBase', '__main__.ConvBlock'])
except (ImportError, AttributeError):
    pass  # For older PyTorch versions

# Load class names
imagenet_labels = json.load(open("imagenet_class_index.json"))
# Map idx -> label
labels = [imagenet_labels[str(k)][0] for k in range(len(imagenet_labels))]

# Number of classes we have in our dataset
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
        layers.append(nn.MaxPool2d(4))  # Changed back to 4 as in the notebook
    return nn.Sequential(*layers)

# resnet architecture - matching EXACTLY the notebook
class ResNet9(ImageClassificationBase):
    def __init__(self, in_channels=3, num_diseases=num_classes):
        super().__init__()

        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True) # out_dim : 128 x 64 x 64  
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))

        self.conv3 = ConvBlock(128, 256, pool=True) # out_dim : 256 x 16 x 16
        self.conv4 = ConvBlock(256, 512, pool=True) # out_dim : 512 x 4 x 4
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))

        # Use AdaptiveAvgPool2d instead of MaxPool2d for compatibility with any input size
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

# Initialize model
model = ResNet9()

# Print model structure for debugging
def print_model_info(model):
    print("\nModel Structure:")
    for name, param in model.named_parameters():
        print(f"{name}: {param.shape}")

print_model_info(model)

# Load model with safety checks disabled to handle the custom class
def safe_load_model(model_path):
    try:
        print(f"Trying to load model from {model_path}")
        state_dict = torch.load(model_path, map_location='cpu')
        if isinstance(state_dict, dict) and 'state_dict' in state_dict:
            state_dict = state_dict['state_dict']
                
        # No need to convert keys as the model structure now matches the saved model exactly
        model.load_state_dict(state_dict, strict=False)
        print(f"Successfully loaded model from {model_path}")
        return True
    except Exception as e:
        print(f"First attempt failed: {e}")
        try:
            print(f"Trying a direct load approach")
            loaded_model = torch.load(model_path, map_location='cpu', weights_only=False)
            
            # If it's a full model, try to extract its state dict
            if hasattr(loaded_model, 'state_dict'):
                model.load_state_dict(loaded_model.state_dict(), strict=False)
            else:
                model.load_state_dict(loaded_model, strict=False)
                
            print(f"Successfully loaded model with direct approach")
            return True
        except Exception as e2:
            print(f"Second attempt failed: {e2}")
            return False

# Check for model weights file
model_loaded = False

# Try loading directly from the original model file
if os.path.exists("model.pt"):
    print("Attempting to load from model.pt")
    model_loaded = safe_load_model("model.pt")
    
if not model_loaded and os.path.exists("model_full.pt"):
    print("Attempting to load from model_full.pt")
    model_loaded = safe_load_model("model_full.pt")

if not model_loaded:
    print("WARNING: Could not load any model. Using random weights!")
    print("Please ensure the model architecture matches the saved model.")

# Print some sample weights to verify loading
print("\nVerifying model weights after loading:")
sample_weights = []
for name, param in model.named_parameters():
    if 'weight' in name and len(sample_weights) < 3:  # Check a few weights
        print(f"{name} - First 5 values: {param.flatten()[:5]}")
        sample_weights.append(param.flatten()[0].item())

# Check if weights are non-random (very simplified check)
if all(abs(w) < 0.1 for w in sample_weights):
    print("WARNING: Weights appear to be random/uninitialized. Model loading may have failed.")
else:
    print("Weights appear to be loaded correctly.")

model.eval()  # Set the model to evaluation mode

# Define transforms - MATCHING EXACTLY what was used in notebook
preprocess = transforms.Compose([
    # No resizing was used in the notebook
    transforms.ToTensor(),
    # No normalization was used in the notebook
])

def predict(inp_image):
    try:
        # Convert to PIL Image first
        img = Image.fromarray(inp_image.astype('uint8'), 'RGB')
        
        # Print image size for debugging
        print(f"Input image size: {img.size}")
        
        # Apply the same preprocessing as during training (ToTensor only)
        input_tensor = preprocess(img)
        
        # Add batch dimension
        input_batch = input_tensor.unsqueeze(0)
        
        # Print tensor shape for debugging
        print(f"Input tensor shape: {input_batch.shape}")

        # Move to device
        if torch.cuda.is_available():
            input_batch = input_batch.to('cuda')
            model.to('cuda')
        
        # Ensure model is in eval mode
        model.eval()
        
        # Get predictions
        with torch.no_grad():
            output = model(input_batch)
            
        # Print raw output for debugging
        print(f"Raw output shape: {output.shape}")
        print(f"Raw output values: {output[0][:5]}")  # First 5 values

        # Apply softmax to get probabilities
        probabilities = F.softmax(output[0], dim=0)
        
        # Print top predicted class
        max_prob, max_idx = torch.max(probabilities, dim=0)
        max_prob_value = max_prob.item()
        print(f"Top predicted class: {labels[max_idx]} with confidence: {max_prob_value:.4f}")

        # Get top 5 predictions
        top_k = min(5, num_classes)
        top_prob, top_indices = torch.topk(probabilities, top_k)

        # Create confidence dictionary
        top_confidences = {labels[i.item()]: float(prob.item()) for i, prob in zip(top_indices, top_prob)}
        
        # Apply 70% confidence threshold
        if max_prob_value < 0.70:
            print(f"Prediction confidence below 70% threshold: {max_prob_value:.2%}")
            return {"Low confidence": 1.0, 
                    f"Highest prediction ({labels[max_idx]})": max_prob_value}
        
        return top_confidences
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"Error": 1.0}

# Create the Gradio interface with more detailed output
with gr.Blocks(title="Plant Disease Classification") as iface:
    gr.Markdown("## Plant Disease Classification")
    gr.Markdown("Upload an image of a plant leaf to detect diseases")
    
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(label="Upload Image")
            submit_btn = gr.Button("Analyze")
        
        with gr.Column():
            output_label = gr.Label(label="Predictions", num_top_classes=5)
            prediction_details = gr.Textbox(label="Detailed Prediction Info", lines=10)
    
    # Function to create detailed prediction info
    def detailed_predict(inp_image):
        try:
            predictions = predict(inp_image)
            if "Error" in predictions:
                return predictions, "Error in prediction"
            
            if "Low confidence" in predictions:
                details = "PREDICTION BELOW CONFIDENCE THRESHOLD (70%)\n\n"
                for label, score in predictions.items():
                    details += f"{label}: {score:.2%}\n"
                details += "\nThe model is not confident enough in its prediction."
                details += "\nTry a clearer image or a different plant specimen."
                return predictions, details
            
            # Format detailed info about predictions
            details = "DETAILED PREDICTION INFORMATION:\n\n"
            items = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
            
            for i, (label, score) in enumerate(items):
                if score >= 0.70:  # Only show predictions above 70% confidence
                    details += f"{i+1}. {label}: {score:.2%}\n"
                else:
                    details += f"{i+1}. {label}: {score:.2%} (below threshold)\n"
            
            # Add additional diagnostic info
            details += "\nInput image size: " + (f"{inp_image.shape}" if hasattr(inp_image, 'shape') else "Unknown")
            
            # Add confidence threshold info
            details += "\n\nNote: Only predictions with confidence ≥ 70% are considered reliable."
            
            return predictions, details
        except Exception as e:
            import traceback
            error_details = f"Error in detailed prediction: {str(e)}\n{traceback.format_exc()}"
            print(error_details)
            return {"Error": 1.0}, error_details
    
    submit_btn.click(
        fn=detailed_predict,
        inputs=input_image,
        outputs=[output_label, prediction_details]
    )

# Launch the interface
iface.launch() 