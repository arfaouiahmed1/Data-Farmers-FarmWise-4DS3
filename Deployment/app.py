import gradio as gr
from ultralytics import YOLO
import os
from PIL import Image
import numpy as np
import torch
import glob
import cv2

# --- Configuration ---
print("Script started. Ready to load model and run inference on demand.")

# Define model display names and their corresponding paths
MODEL_MAPPING = {
    "Farm Boundary Detection": r"C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\Farm Boundaries\yolov8l-seg.pt",
    "Weed Detection": r"C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\Weed Detection\PIDS_weed_detection.pt"
}
MODEL_DISPLAY_NAMES = list(MODEL_MAPPING.keys())

# Define paths for example images
EXAMPLES_BASE_DIR = os.path.join(os.path.dirname(__file__), 'test_images')
FARM_BOUNDARY_EXAMPLES_DIR = os.path.join(EXAMPLES_BASE_DIR, 'farm_boundary')
WEED_DETECTION_EXAMPLES_DIR = os.path.join(EXAMPLES_BASE_DIR, 'weed_detection')

# Cache for model instances to avoid reloading
model_cache = {}

# --- Helper function to get example images ---
def get_example_paths(model_name):
    """Get example image paths for the selected model"""
    if model_name == "Farm Boundary Detection":
        dir_path = FARM_BOUNDARY_EXAMPLES_DIR
    elif model_name == "Weed Detection":
        dir_path = WEED_DETECTION_EXAMPLES_DIR
    else:
        return []
        
    patterns = [os.path.join(dir_path, f"*.{ext}") for ext in ["jpg", "png", "jpeg", "bmp", "tiff"]]
    examples = []
    for pattern in patterns:
        examples.extend(glob.glob(pattern))
    print(f"Found examples for {model_name}: {examples}")
    return examples[:15]  # Limit the number of examples shown

# --- Load YOLO model ---
def load_model(model_display_name):
    """Load and cache YOLO model"""
    if model_display_name in model_cache:
        return model_cache[model_display_name]
        
    model_path = MODEL_MAPPING.get(model_display_name)
    if not model_path or not os.path.exists(model_path):
        print(f"Model path not found for '{model_display_name}' or path is invalid: {model_path}.")
        return None
        
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Loading model: {model_path} on {device}")
        model = YOLO(model_path)
        model_cache[model_display_name] = model
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# --- Post-processing functions ---
def apply_custom_postprocessing(image, options):
    """Apply custom post-processing to the output image"""
    if not isinstance(image, np.ndarray):
        return image
        
    result = image.copy()
    
    if "Enhance Contrast" in options:
        # Apply CLAHE for contrast enhancement
        if len(result.shape) == 3 and result.shape[2] == 3:
            lab = cv2.cvtColor(result, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            lab = cv2.merge((l, a, b))
            result = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    
    if "Sharpen" in options:
        # Apply sharpening
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        result = cv2.filter2D(result, -1, kernel)
        
    if "Denoise" in options:
        # Apply non-local means denoising
        result = cv2.fastNlMeansDenoisingColored(result, None, 10, 10, 7, 21)

    return result

# --- Prediction Function ---
def predict_image(model_display_name, img_pil, conf_threshold, iou_threshold, 
                  visualization_options, advanced_options, post_processing_options):
    """
    Loads the specified YOLO model and runs inference with custom settings.
    """
    if img_pil is None:
        print("No image provided for prediction.")
        return np.zeros((300, 300, 3), dtype=np.uint8)
        
    # Load model
    model = load_model(model_display_name)
    if model is None:
        return np.array(img_pil) if img_pil else np.zeros((300, 300, 3), dtype=np.uint8)

    # Extract visualization settings
    show_boxes = "Show Boxes" in visualization_options
    show_labels = "Show Labels" in visualization_options
    show_conf = "Show Confidence" in visualization_options
    show_masks = "Show Masks" in visualization_options
    
    # Extract advanced settings
    line_width = int(advanced_options.get("line_width", 2))
    
    # Run inference
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        results = model(img_pil, 
                        device=device, 
                        conf=conf_threshold, 
                        iou=iou_threshold,
                        line_width=line_width)
                        
        if results and len(results) > 0 and hasattr(results[0], 'plot'):
            # Pass visualization options to plot()
            plotted_image_bgr = results[0].plot(
                conf=show_conf,
                labels=show_labels,
                boxes=show_boxes,
                masks=show_masks,
                line_width=line_width
            )
            plotted_image_rgb = plotted_image_bgr[..., ::-1]
            
            # Apply post-processing if selected
            if post_processing_options:
                plotted_image_rgb = apply_custom_postprocessing(plotted_image_rgb, post_processing_options)
                
            print(f"Inference successful. Returning plotted image.")
            return plotted_image_rgb
        else:
            print("Inference ran but produced no results or plots.")
            return np.array(img_pil)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return np.array(img_pil)

# --- UI Components Helper Functions ---
def load_example_image(example_path):
    """Load an example image when clicked"""
    if os.path.exists(example_path):
        try:
            return Image.open(example_path)
        except Exception as e:
            print(f"Error loading example image: {e}")
    return None

# --- Gradio Interface ---
print("Setting up Gradio interface...")

default_model_name = MODEL_DISPLAY_NAMES[0]
default_conf = 0.25
default_iou = 0.7
default_viz_options = ["Show Boxes", "Show Labels", "Show Confidence", "Show Masks"]

with gr.Blocks(theme=gr.themes.Base()) as demo:
    gr.Markdown("# FarmWise Detection System")
    gr.Markdown("Select a model, upload an image or choose an example, adjust settings, and run inference.")

    # State for current examples
    current_examples = gr.State([])
    
    with gr.Row():
        # Left sidebar with settings
        with gr.Column(scale=1):
            gr.Markdown("### Model Selection")
            model_selector = gr.Dropdown(
                choices=MODEL_DISPLAY_NAMES,
                value=default_model_name,
                label="Select Model",
                interactive=True
            )
            
            gr.Markdown("### Basic Settings")
            with gr.Row():
                conf_slider = gr.Slider(minimum=0.0, maximum=1.0, step=0.05, value=default_conf, 
                                        label="Confidence Threshold")
                iou_slider = gr.Slider(minimum=0.0, maximum=1.0, step=0.05, value=default_iou, 
                                        label="IoU Threshold")
            
            viz_options_checkbox = gr.CheckboxGroup(
                label="Visualization Options",
                choices=["Show Boxes", "Show Labels", "Show Confidence", "Show Masks"],
                value=default_viz_options
            )
            
            with gr.Accordion("Advanced Settings", open=False):
                line_width_slider = gr.Slider(minimum=1, maximum=5, step=1, value=2, 
                                            label="Line Width")
                
                advanced_settings = gr.State({
                    "line_width": 2
                })
                
                # Update advanced settings state when sliders change
                def update_advanced_settings(line_width):
                    return {"line_width": line_width}
                
                line_width_slider.change(
                    fn=update_advanced_settings,
                    inputs=[line_width_slider],
                    outputs=advanced_settings
                )
            
            with gr.Accordion("Post-Processing", open=False):
                post_processing_checkbox = gr.CheckboxGroup(
                    label="Image Enhancement",
                    choices=["Enhance Contrast", "Sharpen", "Denoise"],
                    value=[]
                )
            
            submit_btn = gr.Button("Run Inference", variant="primary")

        # Right area with image input and results - side by side instead of tabs
        with gr.Column(scale=2):
            # Input and output in separate columns, side by side
            with gr.Row():
                # Input column
                with gr.Column():
                    gr.Markdown("### Input Image")
                    image_input = gr.Image(type="pil", label="Upload Image", height=400)
                
                # Output column
                with gr.Column():
                    gr.Markdown("### Detection Results")
                    image_output = gr.Image(type="numpy", label="Results", height=400)
                    download_btn = gr.Button("Download Results")
            
            # Examples gallery below both inputs and outputs
            gr.Markdown("### Example Images (click to use)")
            example_gallery = gr.Gallery(
                label="Example Images",
                show_label=False,
                elem_id="example_gallery",
                columns=5,
                object_fit="contain", 
                height="auto"
            )

    # Function to update example gallery
    def update_example_gallery(model_name):
        examples = get_example_paths(model_name)
        # Format for gallery - list of (image_path, caption) tuples
        gallery_examples = [(path, os.path.basename(path)) for path in examples]
        return gallery_examples, examples
        
    # Initialize examples
    demo.load(
        fn=update_example_gallery,
        inputs=[model_selector],
        outputs=[example_gallery, current_examples]
    )
    
    # Update examples when model changes
    model_selector.change(
        fn=update_example_gallery,
        inputs=[model_selector],
        outputs=[example_gallery, current_examples]
    )
    
    # Handle example selection
    def select_example(evt: gr.SelectData, examples):
        if evt.index < len(examples):
            return load_example_image(examples[evt.index])
        return None
        
    example_gallery.select(
        fn=select_example,
        inputs=[current_examples],
        outputs=[image_input]
    )

    # Run inference when button is clicked
    submit_btn.click(
        fn=predict_image,
        inputs=[
            model_selector, 
            image_input, 
            conf_slider, 
            iou_slider, 
            viz_options_checkbox,
            advanced_settings,
            post_processing_checkbox
        ],
        outputs=image_output
    )
    
    # Download button logic
    download_btn.click(
        fn=lambda x: x,
        inputs=image_output,
        outputs=image_output
    )

# --- Launch the App ---
if __name__ == "__main__":
    print("Launching Gradio app...")
    demo.launch()
    print("Gradio app launched. Check the console for the URL.") 