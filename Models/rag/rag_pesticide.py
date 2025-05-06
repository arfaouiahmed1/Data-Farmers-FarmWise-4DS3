import pandas as pd
from langchain_community.document_loaders import DataFrameLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from langchain_community.llms import Ollama

# Charger les données
print("Chargement des données...")
df = pd.read_csv('../data/total_melonge_df.csv')

# Préparer les données pour RAG
print("Préparation des données...")
# Sélectionner les colonnes pertinentes pour les prédictions de pesticides
pesticide_cols = ['label', 'Governorate', 'Pesticide (kg)', 'District', 
                  'Temperature (°C)', 'Humidity (%)', 'Rainfall (mm)', 
                  'Growing Season', 'Planting Season', 'Harvest Season']

pesticide_df = df[pesticide_cols].dropna()

# Ajouter des synonymes et traductions pour les cultures
culture_map = {
    'tomato': 'tomate',
    'potato': 'pomme de terre',
    'wheat': 'blé',
    'corn': 'maïs',
    'grapes': 'raisin',
    'apple': 'pomme'
}

# Convertir en texte pour chaque ligne (format amélioré - correction syntaxe)
pesticide_df['content'] = pesticide_df.apply(
    lambda row: f"""Informations sur le traitement pesticide pour la culture de {row['label']} dans la région de {row['Governorate']} (District: {row['District']}).
Traitement historique : Utilisation de {row['Pesticide (kg)']} kg de pesticide.
Conditions climatiques enregistrées : Température {row['Temperature (°C)']}°C, Humidité {row['Humidity (%)']}%, Précipitations {row['Rainfall (mm)']} mm.
Calendrier agricole : Plantation en {row['Planting Season']}, Croissance en {row['Growing Season']}, Récolte en {row['Harvest Season']}.""",
    axis=1
)

# Créer des documents pour le RAG
loader = DataFrameLoader(pesticide_df, page_content_column="content")
documents = loader.load()

# Découper le document en morceaux
print("Découpage des documents...")
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)

# Configurer le modèle d'embeddings
print("Configuration du modèle d'embeddings...")
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Créer le magasin de vecteurs
print("Création du magasin de vecteurs...")
# S'assurer que le persist_directory est unique ou géré correctement
persist_directory_pesticide = "./chroma_pesticide_db"
vector_store = Chroma.from_documents(
    documents=chunks,
    embedding=embedding_model,
    persist_directory=persist_directory_pesticide
)

# Configurer le récupérateur (Utilisation de MMR)
retriever = vector_store.as_retriever(
    search_type="mmr", # Changé de "similarity" à "mmr"
    search_kwargs={'k': 5, 'fetch_k': 20} # Alignement sur fertilizer
)

# Définir le modèle de prompt (Ajusté pour guider l'extraction et gérer hors contexte)
prompt = PromptTemplate.from_template("""**Votre rôle** : Assistant expert en traitements pesticides agricoles. Répondez UNIQUEMENT aux questions concernant les recommandations de pesticides basées sur les données fournies.

**Évaluation initiale de la requête :**
1. La requête de l'utilisateur (Culture: {crop}, Région: {region}, Problème: {pest_problem}, etc.) concerne-t-elle les traitements pesticides agricoles ?
2. Si la requête est **hors sujet** (ex: demande la météo générale, parle de sport), répondez poliment que vous ne pouvez traiter que les questions de pesticides.

**Si la requête est pertinente pour les pesticides :**

**Contexte fourni (informations sur des situations similaires) :**
{context}

**Requête spécifiques de l'utilisateur :**
- Culture : {crop} (équivalent: {crop_en})
- Région : {region}
- Problème signalé : {pest_problem}
- Saison actuelle : {season}
- Conditions climatiques : Température={temperature}°C, Humidité={humidity}%, Pluie={rainfall} mm

**Instructions strictes pour la réponse :**
1. Examinez ATTENTIVEMENT le contexte. Contient-il des informations **directement pertinentes** et **suffisamment similaires** à la requête spécifique (même culture/région/problème ou type de culture/région/problème similaire avec conditions proches) ?
2. **SI OUI**, extrayez les recommandations de pesticides (type, quantité), les justifications et considérations de sécurité/environnement de ces exemples pertinents.
   Formulez ensuite une recommandation pour la requête spécifique, en vous basant **EXCLUSIVEMENT** sur ces informations extraites. Mentionnez clairement les éléments du contexte utilisés.
3. **SI NON** (contexte vide, non pertinent, trop différent, ou informations insuffisantes), répondez **EXPLICITEMENT** que vous ne disposez pas d'informations suffisantes dans la base de données pour fournir une recommandation fiable pour cette situation spécifique. Ne tentez PAS d'inventer ou d'extrapoler. Vous pouvez suggérer des pratiques générales d'IPM si elles sont explicitement mentionnées dans le contexte récupéré, mais précisez qu'elles sont générales.

**Réponse (Doit suivre les instructions ci-dessus à la lettre) :**""")

# Configurer le modèle de langage avec Ollama
print("Configuration du modèle de langage...")
llm = Ollama(model="mistral:7b", temperature=0.3) # Température alignée sur fertilizer

def get_pesticide_recommendation(crop, region, pest_problem, season, temperature, humidity, rainfall):
    # Normaliser les entrées
    crop_norm_fr = crop.lower().strip()
    region_norm = region.lower().strip()
    
    # Trouver l'équivalent anglais pour la recherche si possible
    crop_norm_en = crop_norm_fr # Par défaut
    for en, fr in culture_map.items():
        if fr == crop_norm_fr:
            crop_norm_en = en
            break
    
    # Fonction pour récupérer le contexte pertinent (requête améliorée)
    def get_context(query_dict):
        # Requête textuelle plus descriptive
        query_text = (f"Recommandation de traitement pesticide pour la culture de {query_dict['crop_fr']} ({query_dict['crop_en']}) "
                      f"dans la région de {query_dict['region']} confrontée à '{query_dict['pest_problem']}' "
                      f"pendant la saison '{query_dict['season']}'. "
                      f"Conditions climatiques : {query_dict['temperature']}°C, {query_dict['humidity']}%, {query_dict['rainfall']}mm de pluie.")
        docs = retriever.get_relevant_documents(query_text)
        return "\n\n".join([doc.page_content for doc in docs])
    
    # Créer la chaîne
    chain = (
        RunnablePassthrough()
        | {"context": get_context, "crop": lambda x: x['crop_fr'], "crop_en": lambda x: x['crop_en'], 
           "region": lambda x: x['region'], "pest_problem": lambda x: x['pest_problem'],
           "season": lambda x: x['season'], "temperature": lambda x: x['temperature'],
           "humidity": lambda x: x['humidity'], "rainfall": lambda x: x['rainfall']}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # Invoquer la chaîne
    input_data = {"crop_fr": crop_norm_fr, "crop_en": crop_norm_en, "region": region_norm, 
                  "pest_problem": pest_problem, "season": season,
                  "temperature": temperature, "humidity": humidity, "rainfall": rainfall}
    result = chain.invoke(input_data)
    
    # La correction post-hoc est moins nécessaire avec le prompt strict, mais peut rester en filet de sécurité
    if region_norm.lower() not in result.lower() or crop_norm_fr.lower() not in result.lower():
        correction = f"INFO: Réponse potentiellement non spécifique. Rappel des paramètres : CULTURE={crop_norm_fr.upper()}, RÉGION={region_norm.upper()}\n\n"
        result = correction + result
    
    return result

# Compléter avec des données externes de bonnes pratiques (inchangé pour l'instant)
external_knowledge = """
# Bonnes pratiques de gestion intégrée des ravageurs (IPM)

1. **Surveillance régulière** - Inspectez vos cultures régulièrement pour détecter les signes précoces d'infestation.
2. **Seuils d'intervention** - N'utilisez des pesticides que lorsque les niveaux de ravageurs dépassent les seuils économiques.
3. **Rotation des cultures** - Alternez les cultures pour perturber les cycles de vie des ravageurs.
4. **Ennemis naturels** - Encouragez la présence de prédateurs naturels comme les coccinelles et les guêpes parasites.
5. **Variétés résistantes** - Choisissez des variétés de cultures résistantes aux ravageurs courants.
6. **Méthodes culturales** - Ajustez les dates de plantation, l'espacement et d'autres pratiques pour réduire les problèmes.
7. **Rotation des pesticides** - Utilisez différentes classes chimiques pour éviter la résistance.
8. **Application précise** - Appliquez les pesticides uniquement où nécessaire, au moment optimal.
9. **Doses minimales efficaces** - Utilisez la quantité minimale nécessaire pour contrôler les ravageurs.
10. **Protection de l'environnement** - Minimisez l'impact sur les organismes non ciblés et les ressources naturelles.

# Considérations climatiques pour l'application des pesticides

1. **Température** - La plupart des pesticides sont plus efficaces lorsqu'ils sont appliqués à des températures entre 15°C et 25°C.
   - Températures élevées (>30°C) : risque d'évaporation rapide et de phytotoxicité
   - Températures basses (<10°C) : activité réduite des insecticides

2. **Humidité** - L'humidité relative affecte l'efficacité des traitements:
   - Humidité élevée (>80%) : favorise le développement des maladies fongiques
   - Humidité faible (<40%) : peut augmenter la dérive des pesticides et réduire l'efficacité

3. **Précipitations** - Évitez d'appliquer des pesticides lorsque des pluies sont prévues dans les 24 heures:
   - Précipitations >5mm : risque de lessivage des produits
   - Rosée : peut améliorer l'efficacité des certains herbicides

4. **Vent** - Évitez d'appliquer des pesticides lorsque la vitesse du vent dépasse 15 km/h pour réduire la dérive.

# Ravageurs et maladies communs par région en Tunisie

1. **Nord (Jendouba, Bizerte)** : mildiou, oïdium, pucerons, mouche méditerranéenne des fruits
2. **Centre (Kairouan, Kasserine)** : thrips, aleurodes, acariens, fusariose
3. **Sud (Sfax, Gabès, Tataouine)** : noctuelle, pyrale, cochenilles, pourriture des racines
"""

# Ajouter les connaissances externes au système RAG
from langchain.schema import Document
external_docs = [Document(page_content=external_knowledge)]
# Assurer l'ajout à la base existante si elle est chargée
try:
    additional_chunks = splitter.split_documents(external_docs)
    vector_store.add_documents(additional_chunks)
    print("Connaissances externes (pesticide) ajoutées/mises à jour.")
except Exception as e:
    print(f"Note: Impossible d'ajouter les connaissances externes (pesticide) : {e}")

# Exemple d'utilisation
if __name__ == "__main__":
    print("Exemple de recommandation de pesticide:")
    # Utiliser des valeurs d'exemple
    recommendation = get_pesticide_recommendation(
        crop="tomate", 
        region="Jendouba", 
        pest_problem="pucerons et mildiou", 
        season="été",
        temperature=25.0,
        humidity=70.0,
        rainfall=10.0
    )
    print(recommendation)
    
    # Interface simple pour l'utilisateur
    print("\n" + "="*50)
    print("Système de recommandation de pesticides")
    print("="*50)
    
    while True:
        try:
            print("\nEntrez les détails pour obtenir une recommandation (ou 'q' pour quitter):")
            if input("Continuer? (o/q): ").lower() == 'q':
                break
                
            crop = input("Culture: ")
            region = input("Région (Governorate): ")
            pest_problem = input("Problème (ravageurs/maladies): ")
            season = input("Saison actuelle: ")
            temperature = float(input("Température (°C): "))
            humidity = float(input("Humidité (%): "))
            rainfall = float(input("Précipitations (mm): "))
            
            # --- FILTRE AMONT : Vérification mots-clés hors sujet --- 
            off_topic_keywords = ["ecole", "école", "politique", "sport", "météo", "recette", "cuisine", "musique", "film"]
            user_inputs = [crop, region, pest_problem] # Vérifier aussi le problème signalé
            if any(keyword in str(val).lower() for keyword in off_topic_keywords for val in user_inputs):
                 print("\nDÉSOLÉ: Ma fonction est de fournir des recommandations sur les pesticides. Votre demande semble hors sujet.")
                 continue # Revenir au début de la boucle
            # --- Fin du filtre --- 
            
            print("\nCalcul de la recommandation en cours...")
            recommendation = get_pesticide_recommendation(
                crop=crop, 
                region=region, 
                pest_problem=pest_problem, 
                season=season,
                temperature=temperature,
                humidity=humidity,
                rainfall=rainfall
            )
            
            print("\nRECOMMANDATION DE TRAITEMENT:")
            print("-"*50)
            print(recommendation)
            print("-"*50)
            
        except Exception as e:
            print(f"Erreur: {e}")
            print("Veuillez réessayer avec des valeurs valides.")
