from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json

# Ajouter le chemin du répertoire parent au chemin de recherche Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer les modules RAG (ajustez les chemins si nécessaire)
try:
    from rag.rag_pesticide import get_pesticide_recommendation
    from rag.rag_fertilizer import get_fertilizer_recommendation
    rag_imported = True
except ImportError:
    print("Avertissement: Les modules RAG n'ont pas pu être importés.")
    print("Les recommandations simulées seront utilisées à la place.")
    rag_imported = False

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin

@app.route('/api/pesticide-recommendation', methods=['POST'])
def pesticide_recommendation():
    data = request.json
    
    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400
    
    try:
        # Vérifier les champs requis
        required_fields = ['crop', 'region', 'pest_problem', 'season', 'temperature', 'humidity', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Le champ '{field}' est manquant"}), 400
        
        # Si les modules RAG sont importés, utiliser la fonction réelle
        if rag_imported:
            recommendation = get_pesticide_recommendation(
                crop=data['crop'],
                region=data['region'],
                pest_problem=data['pest_problem'],
                season=data['season'],
                temperature=float(data['temperature']),
                humidity=float(data['humidity']),
                rainfall=float(data['rainfall'])
            )
            
            # Traiter la recommandation pour l'adapter au format attendu par le frontend
            # Note: Ce traitement dépend du format de sortie de la fonction get_pesticide_recommendation
            main_recommendation = {
                "title": f"Traitement recommandé pour {data['crop']} à {data['region']}",
                "problem": data['pest_problem'],
                "conditions": f"{data['season']}, {data['temperature']}°C, {data['humidity']}% d'humidité, {data['rainfall']}mm de précipitations",
                "treatment": recommendation,  # Supposons que la fonction retourne le texte de traitement
                "dosage": "Voir description",
                "frequency": "Voir description",
                "environmental_considerations": "Voir description"
            }
            
            # Pour les alternatives, nous pourrions les extraire du texte ou les générer autrement
            # Pour l'instant, nous utilisons des alternatives génériques
            alternatives = [
                {
                    "title": "Alternative biologique",
                    "description": "Approche biologique à base d'extraits de plantes et de prédateurs naturels."
                },
                {
                    "title": "Approche préventive",
                    "description": "Méthodes culturales préventives pour éviter l'apparition des ravageurs."
                }
            ]
            
            return jsonify({
                "main_recommendation": main_recommendation,
                "alternatives": alternatives
            })
        
        # Sinon, renvoyer des données simulées
        else:
            return jsonify({
                "main_recommendation": {
                    "title": f"Traitement recommandé pour {data['crop']} à {data['region']}",
                    "problem": data['pest_problem'],
                    "conditions": f"{data['season']}, {data['temperature']}°C, {data['humidity']}% d'humidité, {data['rainfall']}mm de précipitations",
                    "treatment": f"Pour traiter {data['pest_problem']} sur {data['crop']} dans les conditions actuelles, appliquez un mélange de pyréthrine naturelle (30ml/10L d'eau) avec une solution de savon noir (20ml/10L). Pulvérisez tôt le matin ou en soirée pour maximiser l'efficacité et minimiser l'impact sur les insectes bénéfiques.",
                    "dosage": "30ml de pyréthrine + 20ml de savon noir pour 10L d'eau",
                    "frequency": "Appliquez tous les 7-10 jours, deux applications successives",
                    "environmental_considerations": "Ce traitement a un impact minimal sur les organismes non ciblés, se dégrade rapidement et convient aux zones proches de points d'eau."
                },
                "alternatives": [
                    {
                        "title": "Solution biologique",
                        "description": "Pour une approche 100% biologique, utilisez une préparation à base de neem (50ml/10L) combinée avec une infusion d'ail (5 gousses broyées dans 1L d'eau, puis diluée). Efficacité légèrement inférieure mais sans résidus chimiques."
                    },
                    {
                        "title": "Approche mécanique",
                        "description": "Pour les petites surfaces, installez des pièges collants jaunes et des filets anti-insectes. Combinez avec des lâchers de coccinelles (prédateurs naturels) à raison de 10 par m²."
                    },
                    {
                        "title": "Traitement conventionnel",
                        "description": "Si l'infestation est sévère, le Lambda-cyhalothrin (15ml/10L) offre une protection rapide et efficace. À utiliser en dernier recours et en respectant scrupuleusement le délai avant récolte de 14 jours."
                    }
                ]
            })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/fertilizer-recommendation', methods=['POST'])
def fertilizer_recommendation():
    data = request.json
    
    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400
    
    try:
        # Vérifier les champs requis
        required_fields = ['crop', 'region', 'nitrogen', 'phosphorus', 'potassium', 'pH']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Le champ '{field}' est manquant"}), 400
        
        # Si les modules RAG sont importés, utiliser la fonction réelle
        if rag_imported:
            recommendation = get_fertilizer_recommendation(
                crop=data['crop'],
                region=data['region'],
                nitrogen=float(data['nitrogen']),
                phosphorus=float(data['phosphorus']),
                potassium=float(data['potassium']),
                pH=float(data['pH'])
            )
            
            # Traiter la recommandation pour l'adapter au format attendu par le frontend
            main_recommendation = {
                "title": f"Fertilisation recommandée pour {data['crop']} à {data['region']}",
                "soil_analysis": f"N:{data['nitrogen']} kg/ha, P:{data['phosphorus']} kg/ha, K:{data['potassium']} kg/ha, pH:{data['pH']}",
                "fertilizer": recommendation,  # Supposons que la fonction retourne le texte de recommandation
                "dosage": "Voir description",
                "application": "Voir description",
                "ph_adjustment": "Voir description"
            }
            
            # Pour les alternatives, nous pourrions les extraire du texte ou les générer autrement
            alternatives = [
                {
                    "title": "Alternative organique",
                    "description": "Approche 100% organique à base de compost et d'engrais verts."
                },
                {
                    "title": "Approche durable",
                    "description": "Rotation des cultures et incorporation de légumineuses pour améliorer naturellement la fertilité du sol."
                }
            ]
            
            return jsonify({
                "main_recommendation": main_recommendation,
                "alternatives": alternatives
            })
        
        # Sinon, renvoyer des données simulées
        else:
            return jsonify({
                "main_recommendation": {
                    "title": f"Fertilisation recommandée pour {data['crop']} à {data['region']}",
                    "soil_analysis": f"N:{data['nitrogen']} kg/ha, P:{data['phosphorus']} kg/ha, K:{data['potassium']} kg/ha, pH:{data['pH']}",
                    "fertilizer": f"Pour optimiser la croissance et le rendement de {data['crop']} dans votre région avec les niveaux de nutriments actuels, utilisez un engrais NPK 15-10-15 combiné avec un amendement organique.",
                    "dosage": "300 kg/ha d'engrais NPK 15-10-15 + 2 tonnes/ha de compost mûr",
                    "application": "Divisez en 3 applications : 40% au semis/plantation, 40% pendant la phase végétative, 20% pendant la phase reproductive",
                    "ph_adjustment": float(data['pH']) < 6.0 ? "Ajoutez 1.5 tonnes/ha de chaux agricole pour augmenter le pH" : float(data['pH']) > 7.5 ? "Incorporez du soufre élémentaire (250 kg/ha) pour réduire progressivement le pH" : "Le pH est optimal pour cette culture"
                },
                "alternatives": [
                    {
                        "title": "Solution 100% organique",
                        "description": "Appliquez 4 tonnes/ha de compost enrichi (3-2-3) + 500 kg/ha de farine d'os (0-15-0) + 300 kg/ha de cendre de bois (0-2-10). Cette approche favorise la vie microbienne du sol mais peut nécessiter plus de temps pour libérer les nutriments."
                    },
                    {
                        "title": "Fertilisants à libération lente",
                        "description": "Utilisez 400 kg/ha d'engrais enrobé à libération contrôlée (14-7-14) avec technologie polymère. Réduit le nombre d'applications nécessaires à une seule en début de saison. Plus coûteux mais nécessite moins de main-d'œuvre."
                    },
                    {
                        "title": "Biostimulants + fertilisation de précision",
                        "description": "Combinez 250 kg/ha d'engrais NPK standard avec un programme de biostimulants à base d'extraits d'algues et d'acides humiques. Complétez avec une fertilisation foliaire ciblée pendant les phases critiques. Approche moderne visant l'efficacité maximale des nutriments."
                    }
                ]
            })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/extract-data', methods=['POST'])
def extract_data():
    data = request.json
    
    if not data or 'description' not in data or 'type' not in data:
        return jsonify({"error": "Données manquantes (description et/ou type)"}), 400
    
    description = data['description']
    data_type = data['type']
    
    # Ici, nous simulons l'extraction de données
    # Dans une application réelle, vous pourriez utiliser NLP ou appeler un modèle LLM
    
    try:
        if data_type == 'pesticide':
            # Données par défaut
            extracted = {
                "crop": "tomate",
                "region": "Jendouba",
                "pest_problem": "pucerons et mildiou",
                "season": "été",
                "temperature": 25,
                "humidity": 70,
                "rainfall": 10
            }
            
            # Extraction très basique
            if "tomate" in description.lower(): extracted["crop"] = "tomate"
            if "pomme" in description.lower(): extracted["crop"] = "pomme"
            if "blé" in description.lower(): extracted["crop"] = "blé"
            
            if "jendouba" in description.lower(): extracted["region"] = "Jendouba"
            if "bizerte" in description.lower(): extracted["region"] = "Bizerte"
            if "sfax" in description.lower(): extracted["region"] = "Sfax"
            
            if "printemps" in description.lower(): extracted["season"] = "printemps"
            if "été" in description.lower(): extracted["season"] = "été"
            if "automne" in description.lower(): extracted["season"] = "automne"
            if "hiver" in description.lower(): extracted["season"] = "hiver"
            
            if "puceron" in description.lower(): extracted["pest_problem"] = "pucerons"
            if "mildiou" in description.lower():
                extracted["pest_problem"] = extracted["pest_problem"] if "pucerons" in extracted["pest_problem"] else ""
                extracted["pest_problem"] += " et mildiou" if extracted["pest_problem"] else "mildiou"
            
            # Extraction de valeurs numériques
            import re
            temp_match = re.search(r'(\d+)\s*°C', description)
            if temp_match: extracted["temperature"] = int(temp_match.group(1))
            
            humidity_match = re.search(r'(\d+)\s*%', description)
            if humidity_match: extracted["humidity"] = int(humidity_match.group(1))
            
            rainfall_match = re.search(r'(\d+)\s*mm', description)
            if rainfall_match: extracted["rainfall"] = int(rainfall_match.group(1))
            
            return jsonify(extracted)
            
        elif data_type == 'fertilizer':
            # Données par défaut
            extracted = {
                "crop": "maïs",
                "region": "Jendouba",
                "nitrogen": 80,
                "phosphorus": 40,
                "potassium": 20,
                "pH": 6.5
            }
            
            # Extraction très basique
            if "maïs" in description.lower(): extracted["crop"] = "maïs"
            if "tomate" in description.lower(): extracted["crop"] = "tomate"
            if "blé" in description.lower(): extracted["crop"] = "blé"
            
            if "jendouba" in description.lower(): extracted["region"] = "Jendouba"
            if "bizerte" in description.lower(): extracted["region"] = "Bizerte"
            if "sfax" in description.lower(): extracted["region"] = "Sfax"
            
            # Extraction de valeurs numériques
            import re
            n_match = re.search(r'azote.*?(\d+)', description, re.IGNORECASE)
            if n_match: extracted["nitrogen"] = int(n_match.group(1))
            
            p_match = re.search(r'phosphore.*?(\d+)', description, re.IGNORECASE)
            if p_match: extracted["phosphorus"] = int(p_match.group(1))
            
            k_match = re.search(r'potassium.*?(\d+)', description, re.IGNORECASE)
            if k_match: extracted["potassium"] = int(k_match.group(1))
            
            ph_match = re.search(r'pH.*?(\d+\.?\d*)', description, re.IGNORECASE)
            if ph_match: extracted["pH"] = float(ph_match.group(1))
            
            return jsonify(extracted)
        
        else:
            return jsonify({"error": f"Type de données inconnu: {data_type}"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route de test pour vérifier que le serveur fonctionne
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({"status": "success", "message": "L'API fonctionne correctement"})

if __name__ == '__main__':
    # Lancer le serveur sur le port 5000
    app.run(debug=True, host='0.0.0.0', port=5000) 