import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

# Essayer d'importer CatBoost, sinon utiliser RandomForest comme alternative
try:
    from catboost import CatBoostRegressor, Pool
    USE_CATBOOST = True
    print("Utilisation de CatBoostRegressor pour la modélisation.")
except ImportError:
    from sklearn.ensemble import RandomForestRegressor
    USE_CATBOOST = False
    print("Module CatBoost non disponible. Utilisation de RandomForestRegressor comme alternative.")
    print("Pour installer CatBoost: pip install catboost")

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
# Vérifier si la cible existe
if "Yield (t/ha)" not in df.columns:
    print("ERREUR: La colonne 'Yield (t/ha)' n'existe pas dans le dataset.")
    if "Yield" in df.columns:
        print("Utilisation de la colonne 'Yield' comme cible.")
        df["Yield (t/ha)"] = df["Yield"]
    else:
        print("Aucune colonne de rendement trouvée. Arrêt du programme.")
        exit(1)

# Vérification de l'échelle des rendements
max_yield = df["Yield (t/ha)"].max()
if max_yield > 200:
    print(f"ATTENTION: Rendements anormalement élevés détectés (max={max_yield} t/ha)")
    print("Conversion automatique kg/ha → t/ha (division par 1000)")
    df["Yield (t/ha)"] = df["Yield (t/ha)"] / 1000
    print(f"Nouveaux rendements: min={df['Yield (t/ha)'].min():.2f}, max={df['Yield (t/ha)'].max():.2f} t/ha")

# Sélection des caractéristiques pertinentes
# Variables numériques
numeric_features = [
    'N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 
    'Temperature (°C)', 'Humidity (%)', 'pH', 'Rainfall (mm)'
]

# Ajouter d'autres variables numériques si elles existent
optional_numeric = [
    'Area (ha)', 'Fertilizer (kg)', 'Pesticide (kg)',
    'Max Temperature (°C)', 'Min Temperature (°C)', 
    'Precipitation (mm)', 'Wind Speed (m/s)'
]
for col in optional_numeric:
    if col in df.columns:
        numeric_features.append(col)

# Variables catégorielles
categorical_features = [
    'label', 'Irrigation', 'Fertilizer Plant',
    'Planting Season', 'Growing Season', 'Harvest Season'
]

# Ajouter District si présent
if 'District' in df.columns:
    categorical_features.append('District')

# Définir toutes les caractéristiques à utiliser
all_features = numeric_features + categorical_features

# Supprimer les lignes avec des valeurs manquantes dans les colonnes importantes
df_clean = df.dropna(subset=all_features + ['Yield (t/ha)'])

# Supprimer les doublons
df_clean = df_clean.drop_duplicates()

print(f"\nDataset nettoyé: {df_clean.shape} lignes")

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

# Mettre à jour la liste de toutes les caractéristiques
all_features = numeric_features + categorical_features

print("\nÉtape 4: Exploration des données et visualisation...")
# Distribution du rendement
plt.figure(figsize=(10, 6))
sns.histplot(df_clean['Yield (t/ha)'], kde=True)
plt.title('Distribution du rendement (t/ha)')
plt.tight_layout()
plt.savefig('./plots/yield_distribution.png')

# Rendement moyen par type de culture (top 15)
plt.figure(figsize=(12, 8))
top_crops = df_clean.groupby('label')['Yield (t/ha)'].mean().nlargest(15)
sns.barplot(x=top_crops.index, y=top_crops.values)
plt.title('Rendement moyen par culture (Top 15)')
plt.xlabel('Culture')
plt.ylabel('Rendement moyen (t/ha)')
plt.xticks(rotation=90)
plt.tight_layout()
plt.savefig('./plots/yield_by_crop.png')

# Matrice de corrélation pour les variables numériques
plt.figure(figsize=(12, 10))
correlation = df_clean[numeric_features + ['Yield (t/ha)']].corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm', linewidths=0.5, fmt='.2f')
plt.title('Corrélation entre variables numériques et rendement')
plt.tight_layout()
plt.savefig('./plots/yield_correlation.png')

# Boxplot du rendement par méthode d'irrigation
plt.figure(figsize=(10, 6))
sns.boxplot(x='Irrigation', y='Yield (t/ha)', data=df_clean)
plt.title('Rendement par méthode d\'irrigation')
plt.tight_layout()
plt.savefig('./plots/yield_by_irrigation.png')

# Rendement par saison de plantation
plt.figure(figsize=(10, 6))
sns.boxplot(x='Planting Season', y='Yield (t/ha)', data=df_clean)
plt.title('Rendement par saison de plantation')
plt.tight_layout()
plt.savefig('./plots/yield_by_season.png')

print("\nÉtape 5: Préparation des données pour la modélisation...")

# Traitement des variables catégorielles
if not USE_CATBOOST:
    # Pour RandomForest, nous devons encoder les variables catégorielles
    print("Encodage des variables catégorielles...")
    from sklearn.preprocessing import OneHotEncoder
    from sklearn.compose import ColumnTransformer
    from sklearn.pipeline import Pipeline
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ],
        remainder='passthrough'
    )

# Séparation des features et de la cible
X = df_clean[all_features]
y = df_clean['Yield (t/ha)']

# Division en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Ensemble d'entraînement: {X_train.shape[0]} échantillons")
print(f"Ensemble de test: {X_test.shape[0]} échantillons")

print("\nÉtape 6: Entraînement du modèle...")

if USE_CATBOOST:
    # Initialiser et entraîner le modèle CatBoost
    print("Entraînement du modèle CatBoost...")
    model = CatBoostRegressor(
        iterations=1000,
        learning_rate=0.1,
        depth=6,
        loss_function='RMSE',
        cat_features=categorical_features,
        eval_metric='RMSE',
        verbose=100  # Afficher l'avancement toutes les 100 itérations
    )
    
    # Créer des pools de données pour CatBoost
    train_pool = Pool(X_train, y_train, cat_features=categorical_features)
    test_pool = Pool(X_test, y_test, cat_features=categorical_features)
    
    # Entraîner le modèle
    model.fit(train_pool, eval_set=test_pool, early_stopping_rounds=50)
    
else:
    # Initialiser et entraîner le modèle RandomForest avec pipeline
    print("Entraînement du modèle RandomForest...")
    rf_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    # Créer le pipeline avec prétraitement et modèle
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', rf_model)
    ])
    
    # Entraîner le modèle
    model.fit(X_train, y_train)

print("\nÉtape 7: Évaluation du modèle...")
# Prédictions sur l'ensemble de test
y_pred = model.predict(X_test)

# Calculer les métriques d'évaluation
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Erreur quadratique moyenne (MSE): {mse:.4f}")
print(f"Racine de l'erreur quadratique moyenne (RMSE): {rmse:.4f}")
print(f"Erreur absolue moyenne (MAE): {mae:.4f}")
print(f"Coefficient de détermination (R²): {r2:.4f}")

# Validation croisée
print("\nValidation croisée (5-fold):")
if USE_CATBOOST:
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_root_mean_squared_error')
else:
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_root_mean_squared_error')
cv_rmse = -cv_scores  # Convertir les scores négatifs en positifs
print(f"RMSE par fold: {cv_rmse}")
print(f"RMSE moyen: {cv_rmse.mean():.4f}, Écart-type: {cv_rmse.std():.4f}")

print("\nÉtape 8: Analyse des caractéristiques importantes...")
# Obtenir l'importance des caractéristiques
if USE_CATBOOST:
    feature_importance = model.get_feature_importance()
    feature_names = X.columns
else:
    # Pour RandomForest dans un pipeline, nous devons accéder au modèle interne
    feature_importance = model.named_steps['regressor'].feature_importances_
    # Pour les noms de caractéristiques, nous devons reconstruire les noms après one-hot encoding
    # C'est complexe, pour simplifier, nous utiliserons des indices
    feature_names = [f"Feature_{i}" for i in range(len(feature_importance))]

# Trier par importance
sorted_idx = np.argsort(feature_importance)[::-1]
sorted_features = [feature_names[i] for i in sorted_idx]
sorted_importance = feature_importance[sorted_idx]

# Afficher et visualiser les 20 caractéristiques les plus importantes (ou moins si moins disponibles)
plt.figure(figsize=(12, 8))
num_feat_to_show = min(20, len(sorted_features))
plt.bar(range(num_feat_to_show), sorted_importance[:num_feat_to_show])
plt.xticks(range(num_feat_to_show), sorted_features[:num_feat_to_show], rotation=90)
plt.title('Importance des caractéristiques pour la prédiction du rendement')
plt.tight_layout()
plt.savefig('./plots/yield_feature_importance.png')

print("\nCaractéristiques les plus importantes:")
for i in range(min(10, len(sorted_features))):
    print(f"{sorted_features[i]}: {sorted_importance[i]:.4f}")

# Visualisation des prédictions vs valeurs réelles
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
plt.xlabel('Rendement réel (t/ha)')
plt.ylabel('Rendement prédit (t/ha)')
plt.title('Prédictions vs Valeurs réelles')
plt.tight_layout()
plt.savefig('./plots/yield_predictions_vs_actual.png')

print("\nÉtape 9: Sauvegarde du modèle...")
# Sauvegarder le modèle
joblib.dump(model, './yield_predictor.pkl')
print("Modèle sauvegardé dans './yield_predictor.pkl'")

print("\nÉtape 10: Exemple de prédiction...")
# Fonction pour prédire le rendement
def predict_yield(crop, soil_n, soil_p, soil_k, temperature, humidity, ph, rainfall, 
                 irrigation, fertilizer_type, planting_season, growing_season, harvest_season,
                 district=None, area=None, fertilizer_amount=None, pesticide_amount=None,
                 max_temp=None, min_temp=None, precipitation=None, wind_speed=None):
    """
    Prédit le rendement d'une culture en fonction des paramètres fournis.
    
    Retourne:
    - rendement prédit en tonnes par hectare
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
        'label': [crop],
        'Irrigation': [irrigation],
        'Fertilizer Plant': [fertilizer_type],
        'Planting Season': [planting_season],
        'Growing Season': [growing_season],
        'Harvest Season': [harvest_season]
    }
    
    # Ajouter les variables optionnelles si disponibles
    if district is not None:
        data['District'] = [district]
    else:
        data['District'] = ['Unknown']  # Valeur par défaut
        
    if area is not None:
        data['Area (ha)'] = [area]
    if fertilizer_amount is not None:
        data['Fertilizer (kg)'] = [fertilizer_amount]
    if pesticide_amount is not None:
        data['Pesticide (kg)'] = [pesticide_amount]
    if max_temp is not None:
        data['Max Temperature (°C)'] = [max_temp]
    if min_temp is not None:
        data['Min Temperature (°C)'] = [min_temp]
    if precipitation is not None:
        data['Precipitation (mm)'] = [precipitation]
    if wind_speed is not None:
        data['Wind Speed (m/s)'] = [wind_speed]
    
    # Ajouter les caractéristiques dérivées si disponibles dans le modèle
    if max_temp is not None and min_temp is not None:
        data['Temp Range (°C)'] = [max_temp - min_temp]
        data['Avg Temperature (°C)'] = [(max_temp + min_temp) / 2]
    
    # Ajouter les indicateurs de saison
    data['Same Plant_Grow'] = [(planting_season == growing_season) * 1]
    data['Same Grow_Harvest'] = [(growing_season == harvest_season) * 1]
    
    # Créer un DataFrame
    df_predict = pd.DataFrame(data)
    
    try:
        # Charger le modèle
        model = joblib.load('./yield_predictor.pkl')
        
        # S'assurer que toutes les colonnes nécessaires sont présentes
        for col in all_features:
            if col not in df_predict.columns:
                # Ajouter des colonnes manquantes avec des valeurs par défaut
                if col in numeric_features:
                    df_predict[col] = 0  # Valeur numérique par défaut
                else:
                    df_predict[col] = 'Unknown'  # Valeur catégorique par défaut
        
        # Sélectionner uniquement les colonnes nécessaires dans le bon ordre
        df_predict = df_predict[all_features]
        
        # Prédire le rendement
        predicted_yield = model.predict(df_predict)[0]
        
        # Vérifier la plausibilité du rendement prédit
        if predicted_yield > 200:
            print("ATTENTION: Rendement prédit anormalement élevé, application d'une correction d'échelle")
            predicted_yield = predicted_yield / 1000
        
        # Valeurs minimales raisonnables
        if predicted_yield < 0.1:
            predicted_yield = 0.1  # Rendement minimal plausible
        
        return predicted_yield
    
    except Exception as e:
        print(f"Erreur lors de la prédiction: {e}")
        return None

# Exemple d'utilisation
example_yield = predict_yield(
    crop="banana", 
    soil_n=112, soil_p=87, soil_k=48, 
    temperature=27.2, humidity=77.4, ph=6.2, rainfall=99.5,
    irrigation="Sprinkler", fertilizer_type="DAP",
    planting_season="spring", growing_season="summer", harvest_season="autumn",
    district="District I (Nord-Ouest)", area=5, fertilizer_amount=500, pesticide_amount=10,
    max_temp=32, min_temp=22, precipitation=100, wind_speed=15
)

print(f"Rendement prédit pour l'exemple: {example_yield:.2f} t/ha")

# Interface simple pour l'utilisateur
if __name__ == "__main__":
    print("\n" + "="*50)
    print("Système de prédiction du rendement des cultures")
    print("="*50)
    
    while True:
        try:
            print("\nEntrez les détails pour prédire le rendement (ou 'q' pour quitter):")
            if input("Continuer? (o/q): ").lower() == 'q':
                break
                
            crop = input("Culture: ")
            soil_n = float(input("Niveau d'azote N (kg/ha): "))
            soil_p = float(input("Niveau de phosphore P (kg/ha): "))
            soil_k = float(input("Niveau de potassium K (kg/ha): "))
            temperature = float(input("Température moyenne (°C): "))
            humidity = float(input("Humidité (%): "))
            ph = float(input("pH du sol: "))
            rainfall = float(input("Précipitations (mm): "))
            irrigation = input("Méthode d'irrigation (Drip/Sprinkler/Flood): ")
            fertilizer_type = input("Type d'engrais (Urea/DAP/...): ")
            planting_season = input("Saison de plantation (spring/summer/autumn/winter): ")
            growing_season = input("Saison de croissance (spring/summer/autumn/winter): ")
            harvest_season = input("Saison de récolte (spring/summer/autumn/winter): ")
            
            # Variables optionnelles
            district = input("District [Optionnel]: ") or None
            
            area = input("Surface (ha) [Optionnel]: ")
            area = float(area) if area else None
            
            fertilizer_amount = input("Quantité d'engrais (kg) [Optionnel]: ")
            fertilizer_amount = float(fertilizer_amount) if fertilizer_amount else None
            
            pesticide_amount = input("Quantité de pesticide (kg) [Optionnel]: ")
            pesticide_amount = float(pesticide_amount) if pesticide_amount else None
            
            max_temp = input("Température maximale (°C) [Optionnel]: ")
            max_temp = float(max_temp) if max_temp else None
            
            min_temp = input("Température minimale (°C) [Optionnel]: ")
            min_temp = float(min_temp) if min_temp else None
            
            precipitation = input("Précipitations précises (mm) [Optionnel]: ")
            precipitation = float(precipitation) if precipitation else None
            
            wind_speed = input("Vitesse du vent (m/s) [Optionnel]: ")
            wind_speed = float(wind_speed) if wind_speed else None
            
            print("\nPrédiction en cours...")
            predicted_yield = predict_yield(
                crop=crop, 
                soil_n=soil_n, soil_p=soil_p, soil_k=soil_k,
                temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall,
                irrigation=irrigation, fertilizer_type=fertilizer_type,
                planting_season=planting_season, growing_season=growing_season, harvest_season=harvest_season,
                district=district, area=area, fertilizer_amount=fertilizer_amount, pesticide_amount=pesticide_amount,
                max_temp=max_temp, min_temp=min_temp, precipitation=precipitation, wind_speed=wind_speed
            )
            
            print("\nRÉSULTAT DE LA PRÉDICTION:")
            print("-"*50)
            print(f"Rendement prédit pour {crop}: {predicted_yield:.2f} t/ha")
            
            # Fournir des recommandations supplémentaires basées sur le rendement prédit
            avg_yield = df_clean[df_clean['label'] == crop]['Yield (t/ha)'].mean()
            if not np.isnan(avg_yield):
                print(f"\nRendement moyen pour {crop} dans la dataset: {avg_yield:.2f} t/ha")
                if predicted_yield > avg_yield * 1.1:
                    print(f"→ Le rendement prédit est supérieur à la moyenne de {((predicted_yield/avg_yield)-1)*100:.1f}% !")
                elif predicted_yield < avg_yield * 0.9:
                    print(f"→ Le rendement prédit est inférieur à la moyenne de {(1-(predicted_yield/avg_yield))*100:.1f}%.")
                    print("  Considérez d'ajuster les niveaux de nutriments ou la méthode d'irrigation.")
                else:
                    print("→ Le rendement prédit est proche de la moyenne pour cette culture.")
            
            print("-"*50)
            
        except Exception as e:
            print(f"Erreur: {e}")
            print("Veuillez réessayer avec des valeurs valides.")
