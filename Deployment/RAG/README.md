# Système Déployé de Recommandation Agricole Intelligente

Ce projet implémente un système web de recommandation agricole basé sur l'approche RAG (Retrieval-Augmented Generation) pour les engrais et pesticides, ainsi qu'un modèle d'optimisation d'irrigation. Il fournit une interface web accessible pour les agriculteurs.

## Structure du projet

```
/
├── api_connector.js       # Connecteur JavaScript pour les API du backend
├── flask_server.py        # Serveur Flask fournissant les API de recommandation
├── index.html             # Interface utilisateur principale
├── irrigation_optimizer.pkl # Modèle sérialisé pour l'optimisation d'irrigation
├── ml_models.js           # Logique JavaScript pour communiquer avec les modèles ML
├── ml.css                 # Styles spécifiques aux composants ML
├── script.js              # Script principal du frontend
├── styles.css             # Styles généraux de l'interface
├── setup.bat              # Script d'installation pour Windows
├── setup.sh               # Script d'installation pour Linux/Mac
└── requirements.txt       # Dépendances Python du projet
```

## Installation

1. Clonez ce dépôt
2. Installez les dépendances requises:

**Pour Windows:**
```bash
setup.bat
```

**Pour Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

Ou installez manuellement les dépendances:
```bash
pip install -r requirements.txt
```

## Démarrage du serveur

Pour lancer l'application:

```bash
python flask_server.py
```

Le serveur démarre sur http://localhost:5000. Ouvrez cette adresse dans votre navigateur pour accéder à l'interface utilisateur.

## Fonctionnalités

### Recommandation d'Engrais

Le système analyse les caractéristiques du sol (niveaux de NPK, pH) et recommande les engrais optimaux pour une culture spécifique dans une région donnée.

### Recommandation de Pesticides

En fonction des problèmes de ravageurs signalés et des conditions environnementales (température, humidité, précipitations), le système suggère les traitements phytosanitaires appropriés.

### Optimisation d'Irrigation

Le système utilise un modèle d'apprentissage automatique pour déterminer les programmes d'irrigation optimaux basés sur les conditions climatiques et les besoins des cultures.

## API Disponibles

Le système expose les API REST suivantes:

- `/api/fertilizer-recommendation`: Obtient des recommandations d'engrais
- `/api/pesticide-recommendation`: Obtient des recommandations de pesticides
- `/api/extract-data`: Extrait automatiquement les informations pertinentes d'une description en texte libre

Consultez le code source de `flask_server.py` pour plus de détails sur les paramètres requis.

## Technologie

Ce système utilise:
- **Flask** pour le backend API
- **RAG (Retrieval-Augmented Generation)** pour des recommandations précises et contextuelles
- **HTML/CSS/JavaScript** pour l'interface utilisateur
- **ChromaDB** pour le stockage et la recherche vectorielle
- **Sentence Transformers** pour l'embedding des requêtes et documents

## Évaluation du système

Pour évaluer les performances du système avec les métriques ROUGE et BLEU, utilisez le module d'évaluation dans le dossier `Models/rag`.

## Notes sur la sécurité

Ce système est configuré pour un développement local. Pour un déploiement en production, assurez-vous d'implémenter les mesures de sécurité appropriées comme HTTPS, une authentification robuste, et une validation des entrées.