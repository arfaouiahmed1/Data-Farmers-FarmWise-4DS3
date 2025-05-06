import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
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
# Supprimer les colonnes d'évaluation qui ne sont pas utilisables comme variables d'entrée
if "Flood" in df.columns and "Sprinkler" in df.columns and "Drip" in df.columns:
    df = df.drop(columns=["Flood", "Sprinkler", "Drip"])

# Vérifier si la cible existe
if "Yield (t/ha)" not in df.columns:
    print("ERREUR: La colonne 'Yield (t/ha)' n'existe pas dans le dataset.")
    if "Yield" in df.columns:
        print("Utilisation de la colonne 'Yield' comme cible.")
        df["Yield (t/ha)"] = df["Yield"]
    else:
        print("Aucune colonne de rendement trouvée. Arrêt du programme.")
        exit(1)

# Sélection des colonnes pertinentes
# Variables numériques
numeric_features = [
    'N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 
    'Temperature (°C)', 'Humidity (%)', 'pH', 'Rainfall (mm)',
    'Area (ha)', 'Fertilizer (kg)', 'Pesticide (kg)'
]

# Ajouter d'autres variables numériques si elles existent
optional_numeric = [
    'Max Temperature (°C)', 'Min Temperature (°C)', 
    'Precipitation (mm)', 'Wind Speed (m/s)', 'Year', 'Month'
]
for col in optional_numeric:
    if col in df.columns:
        numeric_features.append(col)

# Variables catégorielles
categorical_features = [
    'label', 'Governorate', 'Irrigation', 'Fertilizer Plant',
    'Planting Season', 'Growing Season', 'Harvest Season'
]

# Ajouter District si présent
if 'District' in df.columns:
    categorical_features.append('District')

# Supprimer les lignes avec des valeurs manquantes dans les colonnes importantes
all_features = numeric_features + categorical_features + ['Yield (t/ha)']
df_clean = df.dropna(subset=all_features)

# Supprimer les doublons
df_clean = df_clean.drop_duplicates()

# Feature Engineering
print("\nÉtape 3: Feature Engineering...")
# Créer des variables supplémentaires si possible
if 'Max Temperature (°C)' in df_clean.columns and 'Min Temperature (°C)' in df_clean.columns:
    df_clean['Temp Range (°C)'] = df_clean['Max Temperature (°C)'] - df_clean['Min Temperature (°C)']
    df_clean['Avg Temperature (°C)'] = (df_clean['Max Temperature (°C)'] + df_clean['Min Temperature (°C)']) / 2
    numeric_features.append('Temp Range (°C)')
    numeric_features.append('Avg Temperature (°C)')

# Ajouter des indicateurs pour les saisons
if 'Planting Season' in df_clean.columns:
    df_clean['Same Plant_Grow'] = (df_clean['Planting Season'] == df_clean['Growing Season']).astype(int)
    df_clean['Same Grow_Harvest'] = (df_clean['Growing Season'] == df_clean['Harvest Season']).astype(int)
    numeric_features.append('Same Plant_Grow')
    numeric_features.append('Same Grow_Harvest')

# Séparation des features et de la cible
X = df_clean[numeric_features + categorical_features]
y = df_clean['Yield (t/ha)']

# Créer un pipeline de prétraitement
# Préprocesseur pour les variables numériques: standardisation
# Préprocesseur pour les variables catégorielles: one-hot encoding
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

print("\nÉtape 4: Exploration des données...")
# Visualisations
plt.figure(figsize=(12, 8))
# Distribution du rendement
plt.subplot(2, 2, 1)
sns.histplot(df_clean['Yield (t/ha)'], kde=True)
plt.title('Distribution du rendement')

# Rendement par méthode d'irrigation
plt.subplot(2, 2, 2)
sns.boxplot(x='Irrigation', y='Yield (t/ha)', data=df_clean)
plt.title('Rendement par méthode d\'irrigation')
plt.xticks(rotation=45)

# Rendement par saison de plantation
plt.subplot(2, 2, 3)
sns.boxplot(x='Planting Season', y='Yield (t/ha)', data=df_clean)
plt.title('Rendement par saison de plantation')
plt.xticks(rotation=45)

# Top cultures par rendement
plt.subplot(2, 2, 4)
top_yield_crops = df_clean.groupby('label')['Yield (t/ha)'].mean().nlargest(10)
sns.barplot(x=top_yield_crops.index, y=top_yield_crops.values)
plt.title('Rendement moyen des 10 meilleures cultures')
plt.xticks(rotation=90)

plt.tight_layout()
plt.savefig('./plots/yield_exploration.png')

# Matrice de corrélation pour les variables numériques
plt.figure(figsize=(12, 10))
correlation = df_clean[numeric_features + ['Yield (t/ha)']].corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm', linewidths=0.5)
plt.title('Matrice de corrélation des variables numériques')
plt.tight_layout()
plt.savefig('./plots/yield_correlation.png')

# Rendement par méthode d'irrigation et culture
plt.figure(figsize=(15, 10))
top_crops = df_clean['label'].value_counts().nlargest(5).index
df_top_crops = df_clean[df_clean['label'].isin(top_crops)]

sns.boxplot(x='label', y='Yield (t/ha)', hue='Irrigation', data=df_top_crops)
plt.title('Rendement par culture et méthode d\'irrigation (top 5 cultures)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('./plots/crop_irrigation_yield.png')

print("\nÉtape 5: Division des données et entraînement du modèle...")
# Division en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Construction du pipeline complet avec RandomForest
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(random_state=42))
])

# Entraînement du modèle
pipeline.fit(X_train, y_train)

# Évaluation sur l'ensemble de test
y_pred = pipeline.predict(X_test)

print("\nÉtape 6: Évaluation du modèle...")
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)
print(f"Erreur quadratique moyenne (MSE): {mse:.4f}")
print(f"Racine de l'erreur quadratique moyenne (RMSE): {rmse:.4f}")
print(f"Coefficient de détermination (R²): {r2:.4f}")

print("\nValidation croisée (5-fold):")
cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring='r2')
print(f"Scores R²: {cv_scores}")
print(f"Moyenne R²: {cv_scores.mean():.4f}, Écart-type: {cv_scores.std():.4f}")

print("\nÉtape 7: Optimisation du modèle...")
# Grille de paramètres pour l'optimisation
param_grid = {
    'regressor__n_estimators': [50, 100, 200],
    'regressor__max_depth': [None, 10, 20, 30],
    'regressor__min_samples_split': [2, 5, 10]
}

# Recherche par grille avec validation croisée (limitée pour la démonstration)
grid_search = GridSearchCV(pipeline, param_grid, cv=3, scoring='r2', n_jobs=-1)
grid_search.fit(X_train, y_train)

print("\nMeilleurs paramètres:")
print(grid_search.best_params_)

# Évaluation du modèle optimisé
best_model = grid_search.best_estimator_
y_pred_opt = best_model.predict(X_test)
mse_opt = mean_squared_error(y_test, y_pred_opt)
rmse_opt = np.sqrt(mse_opt)
r2_opt = r2_score(y_test, y_pred_opt)
print(f"\nPerformance du modèle optimisé:")
print(f"MSE: {mse_opt:.4f}")
print(f"RMSE: {rmse_opt:.4f}")
print(f"R²: {r2_opt:.4f}")

# Importance des caractéristiques
feature_names = (
    numeric_features + 
    list(best_model.named_steps['preprocessor']
         .named_transformers_['cat']
         .get_feature_names_out(categorical_features))
)

importances = best_model.named_steps['regressor'].feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(12, 8))
plt.title('Importance des caractéristiques pour la prédiction du rendement')
plt.bar(range(min(20, len(indices))), importances[indices[:20]], align='center')
plt.xticks(range(min(20, len(indices))), [feature_names[i] for i in indices[:20]], rotation=90)
plt.tight_layout()
plt.savefig('./plots/yield_feature_importance.png')

# Sauvegarder le modèle
joblib.dump(best_model, './irrigation_optimizer.pkl')
print("\nModèle sauvegardé dans './irrigation_optimizer.pkl'")

print("\nÉtape 8: Système de recommandation d'irrigation...")
def recommend_irrigation(soil_n, soil_p, soil_k, temperature, humidity, ph, rainfall, 
                        area, fertilizer_amount, pesticide_amount, crop,
                        governorate, fertilizer_type, planting_season, growing_season, 
                        harvest_season, district=None, max_temp=None, min_temp=None, 
                        precipitation=None, wind_speed=None, year=None, month=None):
    """
    Recommande la meilleure méthode d'irrigation en fonction des conditions données.
    
    Retourne:
    - méthode d'irrigation recommandée et rendements prévus pour chaque méthode
    """
    # Créer un dictionnaire avec les données de base
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
        'label': [crop],
        'Governorate': [governorate],
        'Fertilizer Plant': [fertilizer_type],
        'Planting Season': [planting_season],
        'Growing Season': [growing_season],
        'Harvest Season': [harvest_season],
        'District': [district] if district is not None else ["Unknown"]
    }
    
    # Ajouter les variables optionnelles si disponibles (avec valeurs par défaut)
    if max_temp is not None and min_temp is not None:
        data['Max Temperature (°C)'] = [max_temp]
        data['Min Temperature (°C)'] = [min_temp]
        data['Temp Range (°C)'] = [max_temp - min_temp]
        data['Avg Temperature (°C)'] = [(max_temp + min_temp) / 2]
    else:
        # Utiliser les valeurs moyennes comme valeurs par défaut
        data['Max Temperature (°C)'] = [temperature + 5 if temperature is not None else 25]
        data['Min Temperature (°C)'] = [temperature - 5 if temperature is not None else 15]
        data['Temp Range (°C)'] = [10]  # Valeur par défaut
        data['Avg Temperature (°C)'] = [temperature if temperature is not None else 20]
    
    if precipitation is not None:
        data['Precipitation (mm)'] = [precipitation]
    else:
        data['Precipitation (mm)'] = [rainfall if rainfall is not None else 50]  # Utiliser rainfall ou valeur par défaut
    
    if wind_speed is not None:
        data['Wind Speed (m/s)'] = [wind_speed]
    else:
        data['Wind Speed (m/s)'] = [10]  # Valeur par défaut
    
    if year is not None:
        data['Year'] = [year]
    else:
        data['Year'] = [2022]  # Valeur par défaut
    
    if month is not None:
        data['Month'] = [month]
    else:
        data['Month'] = [6]  # Valeur par défaut, juin
    
    # Ajouter les indicateurs de saison
    data['Same Plant_Grow'] = [(planting_season == growing_season) * 1]
    data['Same Grow_Harvest'] = [(growing_season == harvest_season) * 1]
    
    # Tester chaque méthode d'irrigation
    irrigation_methods = ['Drip', 'Sprinkler', 'Flood']
    results = {}
    
    # Charger le modèle une seule fois (optimisation)
    try:
        model = joblib.load('./irrigation_optimizer.pkl')
    except FileNotFoundError:
        print("ERREUR: Modèle non trouvé. Exécutez d'abord le script complet pour entraîner le modèle.")
        return "Inconnu", {"Drip": 0, "Sprinkler": 0, "Flood": 0}
    
    for method in irrigation_methods:
        # Copier les données et définir la méthode d'irrigation
        data_copy = data.copy()
        data_copy['Irrigation'] = [method]
        
        # Créer un DataFrame
        df_predict = pd.DataFrame(data_copy)
        
        try:
            # Prédire le rendement
            predicted_yield = model.predict(df_predict)[0]
            
            # Stocker le résultat
            results[method] = predicted_yield
        except Exception as e:
            print(f"Erreur lors de la prédiction pour {method}: {e}")
            # En cas d'erreur, attribuer une valeur neutre
            results[method] = 0
    
    # Trouver la meilleure méthode
    if all(yield_val == 0 for yield_val in results.values()):
        return "Pas de recommandation possible", results
        
    best_method = max(results, key=results.get)
    
    return best_method, results

# Exemple d'utilisation
print("\nExemple de recommandation:")
example_best_method, example_yields = recommend_irrigation(
    soil_n=40, soil_p=60, soil_k=30, 
    temperature=25, humidity=70, ph=6.5, rainfall=100,
    area=10, fertilizer_amount=500, pesticide_amount=20,
    crop="pigeonpeas", governorate="Sfax", fertilizer_type="Urea",
    planting_season="spring", growing_season="summer", harvest_season="autumn",
    max_temp=30, min_temp=20, precipitation=5, wind_speed=10, year=2022, month=4
)
print(f"Méthode d'irrigation recommandée: {example_best_method}")
print(f"Rendements prévus: {example_yields}")

# Interface simple pour l'utilisateur
if __name__ == "__main__":
    print("\n" + "="*50)
    print("Système d'optimisation d'irrigation")
    print("="*50)
    
    while True:
        try:
            print("\nEntrez les détails pour obtenir une recommandation (ou 'q' pour quitter):")
            if input("Continuer? (o/q): ").lower() == 'q':
                break
                
            soil_n = float(input("Niveau d'azote N (kg/ha): "))
            soil_p = float(input("Niveau de phosphore P (kg/ha): "))
            soil_k = float(input("Niveau de potassium K (kg/ha): "))
            temperature = float(input("Température moyenne (°C): "))
            humidity = float(input("Humidité (%): "))
            ph = float(input("pH du sol: "))
            rainfall = float(input("Précipitations (mm): "))
            area = float(input("Surface (ha): "))
            fertilizer_amount = float(input("Quantité d'engrais (kg): "))
            pesticide_amount = float(input("Quantité de pesticide (kg): "))
            crop = input("Culture: ")
            governorate = input("Gouvernorat: ")
            fertilizer_type = input("Type d'engrais (Urea/DAP/...): ")
            planting_season = input("Saison de plantation (spring/summer/autumn/winter): ")
            growing_season = input("Saison de croissance (spring/summer/autumn/winter): ")
            harvest_season = input("Saison de récolte (spring/summer/autumn/winter): ")
            
            # Variables optionnelles
            max_temp = input("Température maximale (°C) [Optionnel, appuyez sur Entrée pour ignorer]: ")
            max_temp = float(max_temp) if max_temp else None
            
            min_temp = input("Température minimale (°C) [Optionnel, appuyez sur Entrée pour ignorer]: ")
            min_temp = float(min_temp) if min_temp else None
            
            precipitation = input("Précipitations précises (mm) [Optionnel]: ")
            precipitation = float(precipitation) if precipitation else None
            
            wind_speed = input("Vitesse du vent (m/s) [Optionnel]: ")
            wind_speed = float(wind_speed) if wind_speed else None
            
            district = input("District [Optionnel]: ") or None
            
            year = input("Année [Optionnel]: ")
            year = int(year) if year else None
            
            month = input("Mois (1-12) [Optionnel]: ")
            month = int(month) if month else None
            
            print("\nCalcul de la recommandation en cours...")
            best_method, yields = recommend_irrigation(
                soil_n, soil_p, soil_k, temperature, humidity, ph, rainfall,
                area, fertilizer_amount, pesticide_amount, crop,
                governorate, fertilizer_type, planting_season, growing_season,
                harvest_season, district, max_temp, min_temp, precipitation,
                wind_speed, year, month
            )
            
            print("\nRÉSULTAT DE LA RECOMMANDATION:")
            print("-"*50)
            print(f"Méthode d'irrigation recommandée: {best_method}")
            print("\nRendements prévus:")
            for method, yield_value in yields.items():
                print(f"  - {method}: {yield_value:.2f} t/ha")
            
            print("\nLa méthode recommandée devrait augmenter le rendement de:")
            next_best_yield = max([y for m, y in yields.items() if m != best_method], default=0)
            improvement = ((yields[best_method] - next_best_yield) / next_best_yield * 100) if next_best_yield > 0 else 0
            print(f"  {improvement:.1f}% par rapport à la deuxième meilleure méthode")
            print("-"*50)
            
        except Exception as e:
            print(f"Erreur: {e}")
            print("Veuillez réessayer avec des valeurs valides.")
