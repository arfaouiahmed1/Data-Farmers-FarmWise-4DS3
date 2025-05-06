import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

# Créer le dossier pour les visualisations
os.makedirs('plots', exist_ok=True)

print("Étape 1: Chargement et compréhension des données...")
# Charger les données
df = pd.read_csv('../data/total_melonge_df.csv')

# Afficher les informations sur le dataset
print(f"Forme du dataset: {df.shape}")
print("\nAperçu des premières lignes:")
print(df.head())
print("\nStatistiques descriptives:")
print(df.describe())

# Vérifier les valeurs manquantes
print("\nValeurs manquantes par colonne:")
missing_values = df.isnull().sum()
print(missing_values[missing_values > 0])

print("\nÉtape 2: Prétraitement des données...")
# Sélection des colonnes pertinentes pour la classification
# Features numériques
numeric_features = ['N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 'Temperature (°C)', 
                    'Humidity (%)', 'pH', 'Rainfall (mm)', 'Area (ha)', 
                    'Fertilizer (kg)', 'Pesticide (kg)']

# Features catégorielles
categorical_features = ['Governorate', 'Irrigation', 'Fertilizer Plant', 
                        'Planting Season', 'Growing Season', 'Harvest Season']

# Supprimer les lignes avec des valeurs manquantes dans les colonnes importantes
df_clean = df.dropna(subset=numeric_features + categorical_features + ['label'])

# Supprimer les doublons
df_clean = df_clean.drop_duplicates()

# Séparation des features et de la cible
X = df_clean[numeric_features + categorical_features]
y = df_clean['label']

# Analyse des classes (cultures)
print("\nDistribution des classes (cultures):")
class_counts = y.value_counts()
print(class_counts)

# Créer un pipeline de prétraitement
# Préprocesseur pour les variables numériques: standardisation
# Préprocesseur pour les variables catégorielles: one-hot encoding
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

print("\nÉtape 3: Exploration des données...")
# Visualisations
plt.figure(figsize=(12, 8))
# Distribution des cultures (top 15)
top_crops = df_clean['label'].value_counts().nlargest(15).index
df_top = df_clean[df_clean['label'].isin(top_crops)]
sns.countplot(data=df_top, y='label', order=top_crops)
plt.title('Distribution des 15 cultures les plus fréquentes')
plt.tight_layout()
plt.savefig('./plots/culture_distribution.png')

# Matrice de corrélation pour les variables numériques
plt.figure(figsize=(12, 10))
correlation = df_clean[numeric_features].corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm', linewidths=0.5)
plt.title('Matrice de corrélation des variables numériques')
plt.tight_layout()
plt.savefig('./plots/correlation_matrix.png')

# Relation entre N, P, K et les cultures principales
plt.figure(figsize=(15, 10))
top_crops = df_clean['label'].value_counts().nlargest(5).index
df_top_crops = df_clean[df_clean['label'].isin(top_crops)]

for i, nutrient in enumerate(['N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)']):
    plt.subplot(1, 3, i+1)
    sns.boxplot(x='label', y=nutrient, data=df_top_crops)
    plt.xticks(rotation=45)
    plt.title(f'Distribution de {nutrient} par culture')

plt.tight_layout()
plt.savefig('./plots/npk_distribution.png')

print("\nÉtape 4: Division des données et choix de l'algorithme...")
# Division en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Construction du pipeline complet avec RandomForest
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=42))
])

print("\nÉtape 5: Entraînement du modèle initial...")
# Entraînement du modèle
pipeline.fit(X_train, y_train)

# Évaluation sur l'ensemble de test
y_pred = pipeline.predict(X_test)

print("\nÉtape 6: Évaluation du modèle...")
accuracy = accuracy_score(y_test, y_pred)
print(f"Précision (Accuracy): {accuracy:.4f}")

print("\nRapport de classification:")
print(classification_report(y_test, y_pred, zero_division=1))

print("\nValidation croisée (5-fold):")
cv_scores = cross_val_score(pipeline, X, y, cv=5)
print(f"Scores: {cv_scores}")
print(f"Moyenne: {cv_scores.mean():.4f}, Écart-type: {cv_scores.std():.4f}")

print("\nÉtape 7: Optimisation du modèle...")
# Grille de paramètres pour l'optimisation
param_grid = {
    'classifier__n_estimators': [50, 100, 200],
    'classifier__max_depth': [None, 10, 20, 30],
    'classifier__min_samples_split': [2, 5, 10]
}

# Recherche par grille avec validation croisée
grid_search = GridSearchCV(pipeline, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

print("\nMeilleurs paramètres:")
print(grid_search.best_params_)

# Évaluation du modèle optimisé
best_model = grid_search.best_estimator_
y_pred_opt = best_model.predict(X_test)
accuracy_opt = accuracy_score(y_test, y_pred_opt)
print(f"\nPrécision du modèle optimisé: {accuracy_opt:.4f}")

print("\nRapport de classification du modèle optimisé:")
print(classification_report(y_test, y_pred_opt, zero_division=1))

# Importance des caractéristiques
feature_names = (numeric_features + 
                 list(best_model.named_steps['preprocessor']
                     .named_transformers_['cat']
                     .get_feature_names_out(categorical_features)))

importances = best_model.named_steps['classifier'].feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(12, 8))
plt.title('Importance des caractéristiques')
plt.bar(range(len(indices)), importances[indices], align='center')
plt.xticks(range(len(indices)), [feature_names[i] for i in indices], rotation=90)
plt.tight_layout()
plt.savefig('./plots/feature_importance.png')

# Matrice de confusion avec normalisation
plt.figure(figsize=(15, 12))
cm = confusion_matrix(y_test, y_pred_opt)
# Limiter à max 20 classes pour la lisibilité
if len(np.unique(y_test)) > 20:
    # Garder seulement les 20 classes les plus fréquentes
    top_classes = y.value_counts().nlargest(20).index
    mask_test = np.isin(y_test, top_classes)
    
    # Utiliser uniquement y_test[mask_test] et les prédictions correspondantes
    y_pred_filtered = y_pred_opt[mask_test]
    
    cm = confusion_matrix(
        y_test[mask_test], 
        y_pred_filtered,
        labels=top_classes
    )
    class_labels = top_classes
else:
    class_labels = np.unique(y_test)

# Normalisation
cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
sns.heatmap(cm_norm, annot=True, fmt='.2f', cmap='Blues', 
            xticklabels=class_labels, yticklabels=class_labels)
plt.xlabel('Prédictions')
plt.ylabel('Valeurs réelles')
plt.title('Matrice de confusion normalisée')
plt.tight_layout()
plt.savefig('./plots/confusion_matrix.png')

# Sauvegarder le modèle
joblib.dump(best_model, './crop_classifier.pkl')
print("\nModèle sauvegardé dans './crop_classifier.pkl'")

print("\nAnalyse d'overfitting:")
# Ajouter une analyse pour détecter l'overfitting
train_accuracy = accuracy_score(y_train, best_model.predict(X_train))
test_accuracy = accuracy_opt
print(f"Précision sur données d'entraînement: {train_accuracy:.4f}")
print(f"Précision sur données de test: {test_accuracy:.4f}")
print(f"Différence (train-test): {train_accuracy - test_accuracy:.4f}")

if train_accuracy - test_accuracy > 0.05:
    print("ATTENTION: Possible overfitting détecté (différence > 5%)")
    print("Suggestions pour réduire l'overfitting:")
    print("1. Augmenter la taille de l'ensemble de données ou utiliser l'augmentation de données")
    print("2. Ajouter de la régularisation (par exemple, ajuster max_depth ou min_samples_leaf)")
    print("3. Réduire la complexité du modèle (moins d'estimateurs ou features)")
    print("4. Utiliser l'élagage (pruning) pour les arbres de décision")
elif train_accuracy > 0.98 and test_accuracy > 0.98:
    print("REMARQUE: Précision très élevée sur les ensembles d'entraînement et de test")
    print("Cela peut indiquer:")
    print("1. Un modèle bien adapté aux données")
    print("2. Des données qui permettent une séparation facile entre les classes")
    print("3. Un possible overfitting si le modèle ne généralise pas bien à de nouvelles données")
    print("Suggestion: Tester le modèle sur des données totalement nouvelles pour confirmer sa robustesse")

print("\nFonction de prédiction pour de nouvelles données:")
def predict_crop(soil_n, soil_p, soil_k, temperature, humidity, ph, rainfall, 
                 area, fertilizer_amount, pesticide_amount, 
                 governorate, irrigation, fertilizer_type, 
                 planting_season, growing_season, harvest_season):
    """
    Prédit la culture adaptée en fonction des paramètres fournis.
    
    Paramètres:
    - soil_n, soil_p, soil_k: Niveaux de nutriments dans le sol (kg/ha)
    - temperature: Température moyenne (°C)
    - humidity: Humidité (%)
    - ph: pH du sol
    - rainfall: Précipitations (mm)
    - area: Surface cultivée (ha)
    - fertilizer_amount: Quantité d'engrais (kg)
    - pesticide_amount: Quantité de pesticide (kg)
    - governorate: Gouvernorat (région)
    - irrigation: Méthode d'irrigation
    - fertilizer_type: Type d'engrais
    - planting_season, growing_season, harvest_season: Saisons
    
    Retourne:
    - culture prédite et probabilité
    """
    data = {
        'N (kg/ha)': [soil_n],
        'P (kg/ha)': [soil_p],
        'K (kg/ha)': [soil_k],
        'Temperature (°C)': [temperature],
        'Humidity (%)': [humidity],
        'pH': [ph],
        'Rainfall (mm)': [rainfall],
        'Area (ha)': [area],
        'Fertilizer (kg)': [fertilizer_amount],
        'Pesticide (kg)': [pesticide_amount],
        'Governorate': [governorate],
        'Irrigation': [irrigation],
        'Fertilizer Plant': [fertilizer_type],
        'Planting Season': [planting_season],
        'Growing Season': [growing_season],
        'Harvest Season': [harvest_season]
    }
    
    df_input = pd.DataFrame(data)
    
    # Prédiction
    model = joblib.load('./crop_classifier.pkl')
    crop = model.predict(df_input)[0]
    probabilities = model.predict_proba(df_input)[0]
    max_prob = probabilities.max()
    
    return crop, max_prob

# Exemple d'utilisation
print("\nExemple de prédiction:")
example_crop, example_prob = predict_crop(
    soil_n=40, soil_p=60, soil_k=30, 
    temperature=25, humidity=70, ph=6.5, rainfall=100,
    area=10, fertilizer_amount=500, pesticide_amount=20,
    governorate="Jendouba", irrigation="Drip", fertilizer_type="Urea",
    planting_season="spring", growing_season="summer", harvest_season="autumn"
)
print(f"Culture prédite: {example_crop} avec une probabilité de {example_prob:.4f}")

# Interface simple pour l'utilisateur
if __name__ == "__main__":
    print("\n" + "="*50)
    print("Système de classification des cultures")
    print("="*50)
    
    while True:
        try:
            print("\nEntrez les détails pour prédire la culture (ou 'q' pour quitter):")
            if input("Continuer? (o/q): ").lower() == 'q':
                break
                
            soil_n = float(input("Niveau d'azote N (kg/ha): "))
            soil_p = float(input("Niveau de phosphore P (kg/ha): "))
            soil_k = float(input("Niveau de potassium K (kg/ha): "))
            temperature = float(input("Température (°C): "))
            humidity = float(input("Humidité (%): "))
            ph = float(input("pH du sol: "))
            rainfall = float(input("Précipitations (mm): "))
            area = float(input("Surface (ha): "))
            fertilizer_amount = float(input("Quantité d'engrais (kg): "))
            pesticide_amount = float(input("Quantité de pesticide (kg): "))
            governorate = input("Gouvernorat: ")
            irrigation = input("Méthode d'irrigation (Drip/Sprinkler/Flood): ")
            fertilizer_type = input("Type d'engrais (Urea/DAP/...): ")
            planting_season = input("Saison de plantation (spring/summer/autumn/winter): ")
            growing_season = input("Saison de croissance (spring/summer/autumn/winter): ")
            harvest_season = input("Saison de récolte (spring/summer/autumn/winter): ")
            
            print("\nPrédiction en cours...")
            pred_crop, pred_prob = predict_crop(
                soil_n, soil_p, soil_k, temperature, humidity, ph, rainfall,
                area, fertilizer_amount, pesticide_amount,
                governorate, irrigation, fertilizer_type,
                planting_season, growing_season, harvest_season
            )
            
            print("\nRÉSULTAT DE LA PRÉDICTION:")
            print("-"*50)
            print(f"Culture recommandée: {pred_crop}")
            print(f"Confiance: {pred_prob:.2%}")
            print("-"*50)
            
        except Exception as e:
            print(f"Erreur: {e}")
            print("Veuillez réessayer avec des valeurs valides.")
