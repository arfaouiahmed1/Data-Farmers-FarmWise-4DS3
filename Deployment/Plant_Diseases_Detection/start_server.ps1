# Get the directory where the script is located
$ScriptDir = $PSScriptRoot

# Define the path to Python in the virtual environment
$PythonExe = Join-Path $ScriptDir ".venv\Scripts\python.exe"

# Check if the virtual environment exists
if (-not (Test-Path $PythonExe)) {
    Write-Error "Virtual environment not found at expected location. Please ensure it's created with required dependencies."
    exit 1
}

Write-Host "Using Python from virtual environment: $PythonExe"
Write-Host "Starting Gradio server..."

# Run the Gradio application directly with the venv python
& $PythonExe app.py

Write-Host "Gradio server stopped." 