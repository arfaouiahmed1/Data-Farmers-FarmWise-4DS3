import gradio as gr
from ultralytics import YOLO
import os
from PIL import Image
import numpy as np
import torch # Ensure torch is imported if needed indirectly by ultralytics or for device checks

# --- Configuration ---
# Use an absolute path or make sure the script is run from a location where this relative path is valid
# MODEL_PATH = r"C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\yolov8l-seg.pt" # Use raw string for windows paths
# Let's try a relative path assuming Models dir is two levels up from backend/
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'Models', 'yolov8l-seg.pt')
MODEL_PATH = os.path.abspath(MODEL_PATH) # Convert to absolute path

print(f"Attempting to load model from: {MODEL_PATH}")

# --- Model Loading ---
try:
    # Check if CUDA is available, otherwise use CPU
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Load the YOLO model
    model = YOLO(MODEL_PATH)
    print(f"Successfully loaded model: {MODEL_PATH}")
    
    # Move model to the selected device (important if using GPU)
    # model.to(device) # Note: YOLO class might handle device automatically, but explicit is safer
    
except Exception as e:
    print(f"Error loading model: {e}")
    model = None # Set model to None if loading fails

# --- Prediction Function ---
def predict_image(img_pil):
    """
    Runs inference on the uploaded image using the loaded YOLO model.

    Args:
        img_pil (PIL.Image.Image): Input image from Gradio.

    Returns:
        numpy.ndarray: Image with segmentation masks plotted, in RGB format.
                       Returns the original image if model loading failed.
    """
    if model is None:
        print("Model not loaded. Returning original image.")
        # Convert PIL to NumPy array for consistent return type
        return np.array(img_pil)
        
    print(f"Received image of type: {type(img_pil)}, size: {img_pil.size}")

    try:
        # Convert PIL image to format expected by the model if necessary 
        # (YOLOv8 typically handles PIL images directly)
        
        # Run inference
        # You might need to adjust parameters like conf, iou, imgsz based on your needs
        results = model(img_pil, device=device) 

        # Check if results are valid and contain plots
        if results and len(results) > 0:
            # Plotting the results (draws boxes, masks, etc. on the image)
            # results[0].plot() returns a NumPy array (BGR format by default)
            plotted_image_bgr = results[0].plot() 

            # Convert BGR to RGB for display in Gradio
            plotted_image_rgb = plotted_image_bgr[..., ::-1] 
            
            print(f"Inference successful. Returning plotted image of shape: {plotted_image_rgb.shape}")
            return plotted_image_rgb
        else:
            print("Inference ran but produced no results or plots.")
            return np.array(img_pil) # Return original image if no results

    except Exception as e:
        print(f"Error during prediction: {e}")
        return np.array(img_pil) # Return original image on error

# --- Gradio Interface ---
print("Setting up Gradio interface...")
# Use theme="soft" for a potentially nicer look
iface = gr.Interface(
    fn=predict_image,
    inputs=gr.Image(type="pil", label="Upload Image for Segmentation"),
    outputs=gr.Image(type="numpy", label="Segmented Image"),
    title="YOLOv8 Segmentation Test",
    description="Upload an image to see the segmentation results from the YOLOv8l-seg model.",
    allow_flagging='never',
    theme="soft" 
)

# --- Launch the App ---
if __name__ == "__main__":
    print("Launching Gradio app...")
    # share=True creates a public link (use with caution)
    iface.launch() 
    print("Gradio app launched. Check the console for the URL.") 