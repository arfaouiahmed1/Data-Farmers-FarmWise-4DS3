# Get the directory where the script is located
$ScriptDir = $PSScriptRoot

# Path to virtual environment
$VenvPath = Join-Path $ScriptDir ".venv"
$PythonExe = Join-Path $VenvPath "Scripts\python.exe"

# Check if Python is installed
try {
    $PythonVersion = python --version
    Write-Host "Found Python: $PythonVersion"
} catch {
    Write-Error "Python is not installed or not in PATH. Please install Python first."
    exit 1
}

# Check if the virtual environment exists and has a working Python
$VenvIsValid = $false
if (Test-Path $PythonExe) {
    try {
        # Try to run the Python interpreter to see if it works
        $testOutput = & $PythonExe -c "print('Virtual environment test')" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Existing virtual environment is valid."
            $VenvIsValid = $true
        } else {
            Write-Host "Existing virtual environment seems corrupted."
        }
    } catch {
        Write-Host "Error testing virtual environment: $_"
    }
}

# Create or recreate virtual environment if needed
if (-not $VenvIsValid) {
    # Delete existing corrupted venv if it exists
    if (Test-Path $VenvPath) {
        Write-Host "Removing existing corrupted virtual environment..."
        Remove-Item -Path $VenvPath -Recurse -Force
    }
    
    Write-Host "Creating new virtual environment at $VenvPath..."
    python -m venv $VenvPath
    if (-not $?) {
        Write-Error "Failed to create virtual environment."
        exit 1
    }
    Write-Host "Virtual environment created successfully."
}

# Check if gradio is installed
Write-Host "Checking if gradio is installed..."
$isGradioInstalled = $false
try {
    $moduleCheck = & $PythonExe -c "import gradio; print('Gradio is installed')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Gradio is already installed."
        $isGradioInstalled = $true
    }
} catch {
    Write-Host "Gradio is not installed."
}

# Install gradio if not installed
if (-not $isGradioInstalled) {
    Write-Host "Installing gradio package..."
    & $PythonExe -m pip install gradio
    if (-not $?) {
        Write-Error "Failed to install gradio package."
        exit 1
    }
    Write-Host "Gradio installed successfully."
}

# Check if torch and torchvision are installed
Write-Host "Checking if PyTorch is installed..."
$isPytorchInstalled = $false
try {
    $moduleCheck = & $PythonExe -c "import torch, torchvision; print('PyTorch is installed')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PyTorch is already installed."
        $isPytorchInstalled = $true
    }
} catch {
    Write-Host "PyTorch is not installed."
}

# Install PyTorch if not installed
if (-not $isPytorchInstalled) {
    Write-Host "Installing PyTorch and torchvision..."
    & $PythonExe -m pip install torch torchvision
    if (-not $?) {
        Write-Error "Failed to install PyTorch packages."
        exit 1
    }
    Write-Host "PyTorch installed successfully."
}

# Check if imagenet_class_index.json exists
$ImagenetFile = Join-Path $ScriptDir "imagenet_class_index.json"
if (-not (Test-Path $ImagenetFile)) {
    Write-Host "Downloading ImageNet class index file..."
    
    # Create a temporary download script
    $DownloadScript = @"
import json
import urllib.request

# URL of the ImageNet class index JSON
url = 'https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt'

try:
    print('Downloading ImageNet classes...')
    with urllib.request.urlopen(url) as response:
        classes = [line.decode('utf-8').strip() for line in response.readlines()]
    
    # Convert to the format expected by the app
    class_idx = {str(i): ['n{:08d}'.format(i), classes[i]] for i in range(len(classes))}
    
    # Save to file
    with open('imagenet_class_index.json', 'w') as f:
        json.dump(class_idx, f)
    
    print('Successfully created imagenet_class_index.json')
except Exception as e:
    print(f'Error downloading ImageNet classes: {e}')
    exit(1)
"@

    $DownloadScriptPath = Join-Path $ScriptDir "download_imagenet.py"
    $DownloadScript | Out-File -FilePath $DownloadScriptPath -Encoding utf8
    
    # Run the download script
    & $PythonExe $DownloadScriptPath
    if (-not $?) {
        Write-Error "Failed to download ImageNet class index file."
        exit 1
    }
    
    # Clean up
    Remove-Item -Path $DownloadScriptPath -Force
    
    Write-Host "ImageNet class index file downloaded successfully."
} else {
    Write-Host "ImageNet class index file already exists."
}

# Check if the trained model file exists
$ModelPath = Join-Path $ScriptDir "model.pt"
$ModelPathFull = Join-Path $ScriptDir "model_full.pt"

if ((-not (Test-Path $ModelPath)) -and (-not (Test-Path $ModelPathFull))) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Yellow
    Write-Host "IMPORTANT: No trained model file found!" -ForegroundColor Yellow
    Write-Host "You need to provide a trained PyTorch model file named:" -ForegroundColor Yellow
    Write-Host "- 'model.pt' (preferred) OR" -ForegroundColor Yellow
    Write-Host "- 'model_full.pt'" -ForegroundColor Yellow
    Write-Host "Copy your trained model file to: $ScriptDir" -ForegroundColor Yellow
    Write-Host "Without this file, the app will run but predictions will be random." -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Yellow
    Write-Host ""
} elseif (Test-Path $ModelPath) {
    Write-Host "Found trained model file: $ModelPath" -ForegroundColor Green
} else {
    Write-Host "Found trained model file: $ModelPathFull" -ForegroundColor Green
}

Write-Host "Environment setup complete. You can now run start_server.ps1 to start the Gradio server." 