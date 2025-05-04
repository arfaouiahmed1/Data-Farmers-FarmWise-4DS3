# FarmWise - Farm Analytics with YOLOv8

## Overview
FarmWise utilizes YOLOv8 models to perform specialized agricultural image analysis tasks, specifically Farm Boundary Segmentation and Weed Detection. It provides a user-friendly Gradio interface for running inference on images.

## Features
*   **Farm Boundary Segmentation**: Identifies and segments farm boundaries in satellite or aerial imagery using a `yolov8l-seg.pt` model.
*   **Weed Detection**: Detects various types of weeds in field images using a `PIDS_weed_detection.pt` model.
*   **Gradio User Interface**: Allows users to:
    *   Upload images for analysis.
    *   Select between the Farm Boundary and Weed Detection models.
    *   Adjust model confidence and IoU thresholds.
    *   Customize visualization options (bounding boxes, labels, confidence scores, segmentation masks).
    *   Apply post-processing enhancements (contrast, sharpening, denoising).
    *   Download the processed results.

## Project Structure
```
/
├── Datasets/             # Raw datasets used for training/testing
│   ├── Satellite-Segmentation/
│   └── Weed-Detection/
├── Deployment/           # Deployment artifacts
│   └── gradio_interface/ # Gradio application code and resources
│       ├── app.py        # Main Gradio application script
│       ├── README.md     # Specific README for the Gradio interface
│       ├── requirements.txt # Python dependencies for the interface
│       ├── run_gradio.ps1 # PowerShell script to run the interface (Windows)
│       └── test_images/  # Example images for testing
├── Models/               # Trained model files
│   ├── Farm Boundaries/
│   │   └── yolov8l-seg.pt
│   └── Weed Detection/
│       └── PIDS_weed_detection.pt
├── Notebooks/            # Jupyter notebooks for experimentation and model training
│   ├── Land Cover/
│   ├── Satellite/
│   └── Weed Detection/
├── README.md             # This file: Main project overview
└── requirements.txt      # (Optional) Top-level requirements if any
```

## Technology Stack
*   **Core ML/DL**: Python, PyTorch, Ultralytics YOLOv8
*   **Image Processing**: OpenCV, Pillow, NumPy
*   **User Interface**: Gradio
*   **Environment Management**: Python Virtual Environments (`venv`)

## Running the Gradio Interface

Detailed instructions can be found in `Deployment/gradio_interface/README.md`. The primary method for Windows users is:

1.  **Navigate to the Project Root directory** in PowerShell:
    ```powershell
    cd "C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3 Ahmed"
    ```
2.  **Ensure a Python virtual environment exists** (e.g., at `.\Deployment\venv`). If not, create one:
    ```powershell
    python -m venv .\Deployment\venv 
    ```
3.  **Run the PowerShell script**:
    ```powershell
    .\Deployment\gradio_interface\run_gradio.ps1
    ```

This script will activate the virtual environment, install the necessary requirements from `Deployment/gradio_interface/requirements.txt`, and launch the Gradio application.

Alternatively, follow the manual setup steps outlined in `Deployment/gradio_interface/README.md`.

## Contribution
Contributions are welcome! Feel free to submit issues and pull requests to improve FarmWise.

## License
This project is licensed under the MIT License.

