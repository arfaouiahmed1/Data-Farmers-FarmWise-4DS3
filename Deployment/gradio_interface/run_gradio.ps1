# PowerShell script to activate the backend venv and run the Gradio interface

# Get the directory where the script is located (backend/gradio_interface)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Determine the project root directory (two levels up)
$ProjectRootDir = Resolve-Path (Join-Path $ScriptDir "..\..")

# Change directory to the Project Root
Write-Host "Changing directory to Project Root: $ProjectRootDir"
Set-Location $ProjectRootDir

# Define paths relative to the Project Root
# Assuming the venv is in a 'venv' folder inside the Deployment directory
$VenvActivateScript = ".\Deployment\venv\Scripts\Activate.ps1" 
# Correct path to the Gradio app script
$GradioAppScript = ".\Deployment\gradio_interface\app.py" 
$RequirementsFile = ".\Deployment\gradio_interface\requirements.txt"

# Activate the virtual environment
Write-Host "Activating virtual environment ($VenvActivateScript)..."
# Check if the activation script exists before trying to run it
if (Test-Path $VenvActivateScript) {
    & $VenvActivateScript
    # $? will be automatically set by the execution of & $VenvActivateScript
} else {
    Write-Host "Virtual environment activation script not found at $VenvActivateScript. Please ensure the virtual environment exists and the path is correct." -ForegroundColor Yellow
    # Ensure $? reflects the failure (Test-Path already sets $? to $false if path not found)
    # No need to manually set $?, the 'else' block implies failure
}

# Check if activation was successful (or if the script was found and executed successfully)
if ($?) {
    Write-Host "Virtual environment activated."

    # Install requirements
    Write-Host "Installing requirements from $RequirementsFile..."
    pip install -r $RequirementsFile

    # Check if installation was successful
    if ($?) {
        Write-Host "Requirements installed successfully."
        # Run the Gradio app
        Write-Host "Launching Gradio application ($GradioAppScript)..."
        python $GradioAppScript
    } else {
        Write-Host "Failed to install requirements." -ForegroundColor Red
    }
} else {
    Write-Host "Failed to activate virtual environment." -ForegroundColor Red
}

# Pause at the end to keep the window open
Write-Host "Press any key to exit..." -NoNewline
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null