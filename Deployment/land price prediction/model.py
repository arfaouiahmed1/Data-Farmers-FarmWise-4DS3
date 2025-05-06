# model.py
import pickle
import pandas as pd
import time
import logging

# Configure les logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("Début chargement du modèle...")
start_time = time.time()

# Charger le modèle
with open('best_bagging_model.pkl', 'rb') as f:
    data = pickle.load(f)
model = data['model']  # ou la clé exacte utilisée lors du dump

logger.info(f"Modèle chargé en {time.time() - start_time:.2f} secondes")

def predict_price(input_data: dict) -> float:
    logger.info("Prédiction demandée...")

    # Préparer les features dans le bon ordre
    features = [
        'region_encoded',
        'Surface(m2)',
        'Proximiteplage',
        'TitreFoncier',
        'EauDisponible',
        'electricite',
        'Cloture',
        'NbArbres',
        'TypedeCulture',
        'Irrigation',
        'batiment',
        'route'
    ]
    X = pd.DataFrame([[input_data[feat] for feat in features]], columns=features)

    # Prédire directement sans scaler
    prediction = model.predict(X)[0]
    return prediction