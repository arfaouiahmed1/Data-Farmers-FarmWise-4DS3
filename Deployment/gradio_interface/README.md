# FarmWise Detection System - Gradio Interface

This directory contains a Gradio application for running inference with specialized YOLOv8 models for farm analytics.

## Features

### Core Functionality
* Select between different pre-configured YOLOv8 models:
  - Farm Boundary Detection
  - Weed Detection
* Upload your own images or use provided examples
* View model-specific example images
* Organized, tabbed interface for better workflow

### Enhanced Settings
* **Basic Settings**:
  - Adjust Confidence and IoU thresholds
  - Customize visualization options (boxes, labels, confidence, masks)

* **Advanced Settings**:
  - Control line width for detection boxes
  - Adjust mask opacity for segmentation overlays
  
* **Post-Processing Options**:
  - Enhance contrast using CLAHE algorithm
  - Apply image sharpening
  - Reduce noise with non-local means denoising

### Performance Improvements
* Model caching to prevent reloading when switching between the same models
* Optimized image processing workflow
* Downloadable results

## Running the Application

### Option 1: Using the PowerShell Script (Windows)

The easiest way to run the application on Windows is to use the provided PowerShell script:

1. **Navigate to the gradio_interface directory**:
   ```powershell
   cd C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Deployment\backend\gradio_interface
   ```

2. **Run the PowerShell script**:
   ```powershell
   .\run_gradio.ps1
   ```

The script will automatically activate the virtual environment and launch the application.

### Option 2: Manual Setup

1. **Navigate to the root directory of the project** (the `Deployment` folder) in your terminal:
   ```bash
   # On Windows (Command Prompt or PowerShell)
   cd C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Deployment
   
   # On macOS/Linux
   # cd /path/to/your/project/Deployment 
   ```

2. **Activate the virtual environment**:
   * **Windows (PowerShell):**
     ```powershell
     .\backend\venv\Scripts\Activate.ps1
     ```
   * **Windows (Command Prompt):**
     ```cmd
     backend\venv\Scripts\activate.bat
     ```
   * **macOS/Linux:**
     ```bash
     source backend/venv/bin/activate
     ```

3. **Install required dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Run the application**:
   ```bash
   python backend/gradio_interface/app.py
   ```

5. Open the local URL displayed in the terminal (typically `http://127.0.0.1:7860`)

## Example Images

* Farm Boundary Detection examples: `backend/gradio_interface/test_images/farm_boundary/`
* Weed Detection examples: `backend/gradio_interface/test_images/weed_detection/`

Supported formats: `.jpg`, `.png`, `.jpeg`, `.bmp`, `.tiff`

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are correctly installed
2. Check that the model paths in `app.py` match your system's file structure
3. Verify you have adequate GPU/CPU resources for the selected models
4. For OpenCV-related errors, try reinstalling with `pip install opencv-python`

## Recent Improvements

The interface has been significantly enhanced with:
* Improved layout with tabbed sections for better organization
* Model caching to fix the issue where changing models didn't update results
* Added advanced visualization settings and post-processing options
* Improved error handling and user feedback 