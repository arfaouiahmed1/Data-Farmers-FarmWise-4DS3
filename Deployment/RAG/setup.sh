#!/bin/bash

echo "Installation des dépendances pour le système RAG d'évaluation..."

# Créer un environnement virtuel (optionnel mais recommandé)
if command -v python3 &>/dev/null; then
    python3 -m venv venv
    source venv/bin/activate
    echo "Environnement virtuel créé et activé"
else
    echo "Python 3 n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Installer les dépendances
pip install -r requirements.txt

# Vérifier si Ollama est installé (pour les modèles locaux)
if ! command -v ollama &>/dev/null; then
    echo "Ollama n'est pas installé. Il est nécessaire pour exécuter les modèles localement."
    echo "Veuillez installer Ollama en suivant les instructions sur https://ollama.ai/"
    echo "Après l'installation, exécutez la commande: ollama pull mistral:7b"
fi

echo "Configuration terminée. Pour exécuter l'évaluation du RAG :"
echo "1. Assurez-vous qu'Ollama est en cours d'exécution"
echo "2. Exécutez : cd rag && python evaluate_rag.py" 