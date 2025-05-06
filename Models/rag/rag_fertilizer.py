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
# Sélectionner les colonnes pertinentes
fertilizer_cols = ['N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 'pH', 'label', 'Governorate', 
                   'Fertilizer (kg)', 'Fertilizer Plant', 'Yield (t/ha)']
fertilizer_df = df[fertilizer_cols].dropna()

# Convertir en texte pour chaque ligne (format amélioré - correction syntaxe)
fertilizer_df['content'] = fertilizer_df.apply(
    lambda row: f"""Informations sur la fertilisation pour la culture de {row['label']} dans la région de {row['Governorate']}.
Analyse du sol : Azote (N) {row['N (kg/ha)']} kg/ha, Phosphore (P) {row['P (kg/ha)']} kg/ha, Potassium (K) {row['K (kg/ha)']} kg/ha.
Le pH du sol est de {row['pH']}.
Recommandation historique : Utilisation de {row['Fertilizer (kg)']} kg de l'engrais '{row['Fertilizer Plant']}'.
Le rendement obtenu était de {row['Yield (t/ha)']} t/ha.""",
    axis=1
)
# Créer des documents pour le RAG
loader = DataFrameLoader(fertilizer_df, page_content_column="content")
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
vector_store = Chroma.from_documents(
    documents=chunks,
    embedding=embedding_model,
    persist_directory="./chroma_fertilizer_db"
)

# Configurer le récupérateur (Utilisation de MMR)
retriever = vector_store.as_retriever(
    search_type="mmr", # Changé de "similarity" à "mmr"
    search_kwargs={'k': 5, 'fetch_k': 20} # k=5 documents finaux, fetch_k=20 documents initiaux pour MMR
)

# Définir le modèle de prompt (Ajusté pour guider l'extraction et gérer hors contexte)
prompt = PromptTemplate.from_template("""**Votre rôle** : Assistant expert en fertilisation agricole. Répondez UNIQUEMENT aux questions concernant les recommandations de fertilisants basées sur les données fournies.

**Évaluation initiale de la requête :**
1. La requête de l'utilisateur (Culture: {crop}, Région: {region}, etc.) concerne-t-elle la fertilisation agricole ?
2. Si la requête est **hors sujet** (ex: demande une recette, parle de politique), répondez poliment que vous ne pouvez traiter que les questions de fertilisation agricole.

**Si la requête est pertinente pour la fertilisation :**

**Contexte fourni (informations sur des situations similaires) :**
{context}

**Requête spécifique de l'utilisateur :**
- Culture : {crop}
- Région : {region}
- Analyse du sol : N={nitrogen}, P={phosphorus}, K={potassium}, pH={pH}

**Instructions strictes pour la réponse :**
1. Examinez ATTENTIVEMENT le contexte. Contient-il des informations **directement pertinentes** et **suffisamment similaires** à la requête spécifique (même culture/région ou type de culture/région similaire avec conditions proches) ?
2. **SI OUI**, extrayez les recommandations d'engrais (type, quantité) et les justifications de ces exemples pertinents.
   Formulez ensuite une recommandation pour la requête spécifique, en vous basant **EXCLUSIVEMENT** sur ces informations extraites. Mentionnez clairement les éléments du contexte utilisés.
3. **SI NON** (contexte vide, non pertinent, trop différent, ou informations insuffisantes), répondez **EXPLICITEMENT** que vous ne disposez pas d'informations suffisantes dans la base de données pour fournir une recommandation fiable pour cette situation spécifique. Ne tentez PAS d'inventer ou d'extrapoler.

**Réponse (Doit suivre les instructions ci-dessus à la lettre) :**""")

# Configurer le modèle de langage avec Ollama
print("Configuration du modèle de langage...")
llm = Ollama(model="mistral:7b", temperature=0.3) # Température encore réduite pour plus de fidélité

def get_fertilizer_recommendation(crop, region, nitrogen, phosphorus, potassium, pH):
    # Fonction pour récupérer le contexte pertinent (requête améliorée)
    def get_context(query_dict):
        # Création d'une requête textuelle plus descriptive
        query_text = (f"Recommandation de fertilisation pour la culture de {query_dict['crop']} "
                      f"dans la région de {query_dict['region']} avec N={query_dict['nitrogen']}, "
                      f"P={query_dict['phosphorus']}, K={query_dict['potassium']} et un pH de {query_dict['pH']}.")
        docs = retriever.get_relevant_documents(query_text)
        return "\n\n".join([doc.page_content for doc in docs])
    
    # Créer la chaîne
    chain = (
        # Passer le dictionnaire entier pour construire la requête textuelle dans get_context
        RunnablePassthrough() 
        | {"context": get_context, "crop": lambda x: x['crop'], "region": lambda x: x['region'],
           "nitrogen": lambda x: x['nitrogen'], "phosphorus": lambda x: x['phosphorus'],
           "potassium": lambda x: x['potassium'], "pH": lambda x: x['pH']}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # Invoquer la chaîne avec le dictionnaire d'entrée
    input_data = {"crop": crop, "region": region, "nitrogen": nitrogen, 
                  "phosphorus": phosphorus, "potassium": potassium, "pH": pH}
    result = chain.invoke(input_data)
    return result

# Ajouter des connaissances générales sur les fertilisants
fertilizer_knowledge = """
# Recommandations générales pour les fertilisants par type de culture

1. **Céréales (blé, orge, maïs, riz)**
   - Besoins élevés en azote (N) pour la croissance végétative
   - Besoins en phosphore (P) pour le développement des racines et la maturation
   - Besoins modérés en potassium (K) pour la résistance aux maladies et à la sécheresse

2. **Légumineuses (pois chiches, lentilles, haricots)**
   - Faibles besoins en azote (N) car fixent l'azote atmosphérique
   - Besoins élevés en phosphore (P) pour la nodulation et la fixation d'azote
   - Besoins modérés en potassium (K) pour le développement des gousses

3. **Fruits (pommes, raisins, bananes)**
   - Besoins modérés en azote (N)
   - Besoins élevés en phosphore (P) pour la floraison et la fructification
   - Besoins très élevés en potassium (K) pour la qualité des fruits

4. **Légumes (tomates, poivrons, concombres)**
   - Besoins équilibrés en N-P-K
   - Souvent sensibles aux carences en oligo-éléments

5. **Cultures oléagineuses (tournesol, sésame)**
   - Besoins modérés en azote (N)
   - Besoins élevés en phosphore (P) pour la formation des graines
   - Besoins élevés en potassium (K) pour la teneur en huile

# Considérations pour le pH du sol
- pH < 5.5 : Sol acide, peut nécessiter un chaulage
- pH 5.5-7.0 : Optimal pour la plupart des cultures
- pH > 7.0 : Sol alcalin, peut nécessiter des amendements pour réduire le pH
"""

# Ajouter les connaissances générales au système RAG
from langchain.schema import Document
knowledge_docs = [Document(page_content=fertilizer_knowledge)]
# Note: Re-splitter et re-add les documents externes si nécessaire, mais le code actuel le fait à chaque run si db existe pas.
# Assurez-vous que le persist_directory est cohérent ou supprimez-le pour forcer la recréation.
# Si la base existe, il faut explicitement ajouter les nouveaux documents/connaissances.
# Le code actuel semble recréer la base si elle n'existe pas, mais charge l'existante sinon.
# Pour être sûr que les nouvelles connaissances sont ajoutées:
try:
    # Tentative d'ajout explicite, ignorera si déjà présent avec les mêmes IDs
    additional_chunks = splitter.split_documents(knowledge_docs)
    vector_store.add_documents(additional_chunks)
    print("Connaissances générales ajoutées/mises à jour dans le magasin de vecteurs.")
except Exception as e:
    print(f"Note: Impossible d'ajouter les connaissances générales (peut-être déjà présentes ou autre erreur): {e}")


# Exemple d'utilisation
if __name__ == "__main__":
    print("Exemple de recommandation de fertilisant:")
    # Utiliser des valeurs d'exemple (à remplacer par les valeurs réelles)
    recommendation = get_fertilizer_recommendation(
        crop="maïs", 
        region="Jendouba", 
        nitrogen=80, 
        phosphorus=40, 
        potassium=20, 
        pH=6.5
    )
    print(recommendation)
    
    # Interface simple pour l'utilisateur
    print("\n" + "="*50)
    print("Système de recommandation de fertilisants")
    print("="*50)
    
    while True:
        try:
            print("\nEntrez les détails pour obtenir une recommandation (ou 'q' pour quitter):")
            if input("Continuer? (o/q): ").lower() == 'q':
                break
                
            crop = input("Culture: ")
            region = input("Région (Governorate): ")
            nitrogen = float(input("Niveau d'azote N (kg/ha): "))
            phosphorus = float(input("Niveau de phosphore P (kg/ha): "))
            potassium = float(input("Niveau de potassium K (kg/ha): "))
            pH = float(input("pH du sol: "))
            
            # --- FILTRE AMONT : Vérification mots-clés hors sujet --- 
            off_topic_keywords = ["ecole", "école", "politique", "sport", "météo", "recette", "cuisine", "musique", "film"]
            user_inputs = [crop, region]
            if any(keyword in str(val).lower() for keyword in off_topic_keywords for val in user_inputs):
                 print("\nDÉSOLÉ: Ma fonction est de fournir des recommandations agricoles. Votre demande semble hors sujet.")
                 continue # Revenir au début de la boucle
            # --- Fin du filtre --- 
            
            print("\nCalcul de la recommandation en cours...")
            recommendation = get_fertilizer_recommendation(
                crop=crop, 
                region=region, 
                nitrogen=nitrogen, 
                phosphorus=phosphorus, 
                potassium=potassium, 
                pH=pH
            )
            
            print("\nRECOMMANDATION DE FERTILISANT:")
            print("-"*50)
            print(recommendation)
            print("-"*50)
            
        except Exception as e:
            print(f"Erreur: {e}")
            print("Veuillez réessayer avec des valeurs valides.")
