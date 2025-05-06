@echo off
echo Installation des dependances pour le systeme RAG d'evaluation...

REM Verifier si Python est installe
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python n'est pas installe. Veuillez l'installer avant de continuer.
    exit /b 1
)

REM Creer un environnement virtuel
python -m venv venv
call venv\Scripts\activate.bat
echo Environnement virtuel cree et active

REM Installer les dependances
pip install -r requirements.txt

REM Verifier si Ollama est installe
where ollama >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Ollama n'est pas installe. Il est necessaire pour executer les modeles localement.
    echo Veuillez installer Ollama en suivant les instructions sur https://ollama.ai/
    echo Apres l'installation, executez la commande: ollama pull mistral:7b
)

echo.
echo Configuration terminee. Pour executer l'evaluation du RAG :
echo 1. Assurez-vous qu'Ollama est en cours d'execution
echo 2. Executez : cd rag ^&^& python evaluate_rag.py 