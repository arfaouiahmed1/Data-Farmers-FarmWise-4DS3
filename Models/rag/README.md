# Modèles RAG (Retrieval-Augmented Generation) - FarmWise

Ce dossier contient les modèles et implémentations RAG (Retrieval-Augmented Generation) du projet FarmWise. Ces modèles sont conçus pour fournir des recommandations contextuelles et basées sur les connaissances agricoles pour la gestion des engrais et des pesticides.

## Composants du système RAG

### 1. Recommandations d'engrais (`rag_fertilizer.py`)
- **Fonction** : Génère des recommandations personnalisées pour l'application d'engrais en fonction des conditions du sol, du type de culture et d'autres variables
- **Approche** : Combine des données historiques, des recherches agronomiques et des feedback d'experts pour formuler des recommandations précises
- **Caractéristiques** : Prise en compte des besoins nutritionnels spécifiques aux cultures, de la composition du sol et des conditions environnementales

### 2. Recommandations de pesticides (`rag_pesticide.py`)
- **Fonction** : Suggère des traitements phytosanitaires adaptés aux problèmes identifiés (insectes, maladies, mauvaises herbes)
- **Approche** : Utilise une base de connaissances sur les ravageurs et les maladies courantes, avec des recommandations sur les produits et méthodes appropriés
- **Caractéristiques** : Intègre des principes de lutte intégrée (IPM) pour minimiser l'utilisation de pesticides chimiques

### 3. Évaluation et visualisation (`evaluate_rag.py` et `visualize_results.py`)
- **Fonction** : Évalue la pertinence et la qualité des recommandations générées par les modèles RAG
- **Métriques** : Précision, rappel, pertinence et applicabilité pratique des recommandations
- **Visualisations** : Graphiques comparant les recommandations générées aux meilleures pratiques et aux résultats historiques

## Structure du dossier

```
rag/
│
├── rag_fertilizer.py     # Système de recommandation d'engrais
├── rag_pesticide.py      # Système de recommandation de pesticides
├── evaluate_rag.py       # Scripts d'évaluation des performances des modèles RAG
├── visualize_results.py  # Outils de visualisation des résultats
└── requirements.txt      # Dépendances Python requises
```

## Prérequis

Le système RAG nécessite les bibliothèques Python suivantes :

```
langchain>=0.0.267
openai>=0.28.0
pinecone-client>=2.2.2
numpy>=1.24.3
pandas>=2.0.3
matplotlib>=3.7.2
seaborn>=0.12.2
faiss-cpu>=1.7.4
scikit-learn>=1.3.0
chromadb>=0.4.13
sentence-transformers>=2.2.2
```

## Installation

Pour installer les dépendances nécessaires :

```bash
pip install -r requirements.txt
```

## Utilisation

### Recommandation d'engrais

```python
from rag_fertilizer import FertilizerRecommender

# Initialiser le système de recommandation
recommender = FertilizerRecommender()

# Obtenir une recommandation spécifique
recommendation = recommender.get_recommendation(
    crop_type="tomate",
    soil_type="argileux",
    soil_ph=6.8,
    previous_crops=["haricots"],
    region="Jendouba"
)

# Afficher la recommandation
print(recommendation)
```

### Recommandation de pesticides

```python
from rag_pesticide import PesticideRecommender

# Initialiser le système de recommandation
recommender = PesticideRecommender()

# Obtenir une recommandation pour un problème spécifique
recommendation = recommender.get_recommendation(
    crop_type="olivier",
    pest_problem="mouche de l'olive",
    growth_stage="fructification",
    severity="modérée",
    organic_farming=True
)

# Afficher la recommandation
print(recommendation)
```

### Évaluation des recommandations

```python
from evaluate_rag import evaluate_model

# Évaluer les performances du modèle de recommandation
evaluation_results = evaluate_model(
    model_type="fertilizer",  # ou "pesticide"
    test_data_path="path/to/test_data.csv",
    metrics=["relevance", "accuracy", "practicality"]
)

# Visualiser les résultats
from visualize_results import plot_evaluation_results
plot_evaluation_results(evaluation_results)
```

## Intégration avec l'API

Les modèles RAG sont conçus pour être intégrés à l'API FarmWise située dans le dossier `Deployment/RAG`. Consultez la documentation correspondante pour l'intégration.

## Contact

Pour toute question concernant ces modèles RAG, veuillez contacter l'équipe Data Farmers.