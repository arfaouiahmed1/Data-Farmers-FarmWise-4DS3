# PowerShell script to activate the backend venv and run the Gradio interface

# Get the directory where the script is located (backend/gradio_interface)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Determine the project root directory (two levels up)
$ProjectRootDir = Resolve-Path (Join-Path $ScriptDir "..\..")

# Change directory to the Project Root
Write-Host "Changing directory to Project Root: $ProjectRootDir"
Set-Location $ProjectRootDir

# Define paths relative to the Project Root
$VenvActivateScript = ".\backend\venv\Scripts\Activate.ps1"
$GradioAppScript = ".\backend\gradio_interface\app.py"

# Activate the virtual environment
Write-Host "Activating virtual environment ($VenvActivateScript)..."
& $VenvActivateScript

# Check if activation was successful
if ($?) {
    Write-Host "Virtual environment activated."
    
    # Run the Gradio app
    Write-Host "Launching Gradio application ($GradioAppScript)..."
    python $GradioAppScript
} else {
    Write-Host "Failed to activate virtual environment." -ForegroundColor Red
}

# Pause at the end to keep the window open
Write-Host "Press any key to exit..." -NoNewline
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null 