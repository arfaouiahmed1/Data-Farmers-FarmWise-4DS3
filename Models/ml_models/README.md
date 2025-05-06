# Modèles d'apprentissage automatique - FarmWise

Ce dossier contient les différents modèles d'apprentissage automatique développés pour le projet FarmWise. Ces modèles sont conçus pour aider les agriculteurs à prendre des décisions basées sur les données concernant les cultures, l'irrigation et la prévision des rendements.

## Modèles disponibles

### 1. Classification des cultures (`crop_classification.py`)
- **Fonction** : Suggère les cultures optimales en fonction des conditions du sol, du climat et d'autres paramètres agricoles
- **Modèle entraîné** : `crop_classifier.pkl`
- **Visualisations** : Matrices de confusion, importance des caractéristiques, distribution des cultures

### 2. Optimisation de l'irrigation (`irrigation_optimization.py`)
- **Fonction** : Optimise les stratégies d'irrigation pour maximiser le rendement tout en minimisant la consommation d'eau
- **Modèle entraîné** : `irrigation_optimizer.pkl`
- **Approche** : Algorithmes d'optimisation basés sur des techniques d'apprentissage par renforcement

### 3. Prédiction des rendements (`yield_prediction.py`)
- **Fonction** : Prédit les rendements des cultures en fonction des variables environnementales et des pratiques agricoles
- **Modèle entraîné** : `yield_predictor.pkl`
- **Métriques** : RMSE, MAE, R²

## Structure du dossier

```
ml_models/
│
├── crop_classification.py     # Script pour l'entraînement du modèle de classification des cultures
├── crop_classifier.pkl        # Modèle de classification des cultures entraîné
├── irrigation_optimization.py # Script pour l'optimisation de l'irrigation
├── irrigation_optimizer.pkl   # Modèle d'optimisation de l'irrigation entraîné
├── yield_prediction.py        # Script pour la prédiction des rendements
├── yield_predictor.pkl        # Modèle de prédiction des rendements entraîné
├── requirements.txt           # Dépendances Python requises
│
├── plots/                     # Visualisations générées par les modèles
│   ├── confusion_matrix.png
│   ├── correlation_matrix.png
│   ├── yield_distribution.png
│   └── ...
│
└── catboost_info/             # Informations de debug pour les modèles CatBoost
```

## Prérequis

```
pandas>=2.0.3
numpy>=1.24.3
scikit-learn>=1.3.0
matplotlib>=3.7.2
seaborn>=0.12.2
joblib>=1.3.1
tqdm>=4.66.1
xgboost>=2.0.0
lightgbm>=4.0.0
optuna>=3.2.0
shap>=0.42.1
```

## Installation

Pour installer les dépendances nécessaires :

```bash
pip install -r requirements.txt
```

## Utilisation

Chaque modèle peut être utilisé indépendamment. Voici comment utiliser chacun d'eux :

### Classification des cultures

```python
import joblib

# Charger le modèle
model = joblib.load('crop_classifier.pkl')

# Préparer les données d'entrée (exemple)
input_data = {...}  # Dictionnaire avec les caractéristiques requises

# Prédire la culture optimale
predicted_crop = model.predict(input_data)
```

### Optimisation de l'irrigation

```python
import joblib

# Charger le modèle d'optimisation
optimizer = joblib.load('irrigation_optimizer.pkl')

# Obtenir la stratégie d'irrigation optimale
optimal_strategy = optimizer.optimize(field_conditions, crop_type)
```

### Prédiction des rendements

```python
import joblib

# Charger le prédicteur de rendement
predictor = joblib.load('yield_predictor.pkl')

# Prédire le rendement
predicted_yield = predictor.predict(crop_data)
```

## Contact

Pour toute question concernant ces modèles, veuillez contacter l'équipe Data Farmers.