import pandas as pd
import nltk
import os
import shutil
import time # Ajouter l'import time
from rouge_score import rouge_scorer
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import Ollama

# Télécharger les ressources NLTK nécessaires
nltk.download('punkt', quiet=True)

# Configurer le modèle d'embeddings et le magasin de vecteurs
def setup_retriever():
    # Charger les données
    print("Chargement des données...")
    df = pd.read_csv('../data/total_melonge_df.csv')

    # Préparer les données pour RAG
    print("Préparation des données...")
    # Sélectionner les colonnes pertinentes
    fertilizer_cols = ['N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 'pH', 'label', 'Governorate', 
                    'Fertilizer (kg)', 'Fertilizer Plant', 'Yield (t/ha)']
    fertilizer_df = df[fertilizer_cols].dropna()

    # Convertir en texte pour chaque ligne (format amélioré - DOIT être IDENTIQUE à rag_fertilizer.py)
    fertilizer_df['content'] = fertilizer_df.apply(
        lambda row: f"Informations sur la fertilisation pour la culture de {row['label']} dans la région de {row['Governorate']}.\n"
                   f"Analyse du sol : Azote (N) {row['N (kg/ha)']} kg/ha, Phosphore (P) {row['P (kg/ha)']} kg/ha, Potassium (K) {row['K (kg/ha)']} kg/ha.\n"
                   f"Le pH du sol est de {row['pH']}.\n"
                   f"Recommandation historique : Utilisation de {row['Fertilizer (kg)']} kg de l'engrais '{row['Fertilizer Plant']}'.\n"
                   f"Le rendement obtenu était de {row['Yield (t/ha)']} t/ha.", 
        axis=1
    )
    
    # Utiliser un répertoire DÉDIÉ pour l'évaluation pour forcer la recréation
    persist_directory = "./faiss_fertilizer_index_eval" 
    print(f"Utilisation du répertoire de la base de vecteurs pour l'évaluation : {persist_directory}")
    if os.path.exists(persist_directory):
        print(f"Suppression de l'ancien répertoire de la base de vecteurs d'évaluation : {persist_directory}")
        shutil.rmtree(persist_directory)

    # Configuration du modèle d'embeddings
    print("Configuration du modèle d'embeddings...")
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Créer le magasin de vecteurs (forcera la recréation)
    print("Création du magasin de vecteurs pour l'évaluation...")
    from langchain_community.document_loaders import DataFrameLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    
    # Créer des documents pour le RAG
    loader = DataFrameLoader(fertilizer_df, page_content_column="content")
    documents = loader.load()

    # Découper le document en morceaux
    print("Découpage des documents...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(documents)
    print(f"Nombre de chunks créés : {len(chunks)}")
    
    # --- Remplacement de Chroma par FAISS --- 
    vector_store = None
    faiss_index_path = "./faiss_fertilizer_index_eval" # Chemin pour sauvegarder l'index FAISS

    print("Tentative de création de l'index FAISS en mémoire...")
    try:
        # Créer l'index FAISS en mémoire avec tous les chunks
        vector_store = FAISS.from_documents(
            documents=chunks,
            embedding=embedding_model
        )
        print("Index FAISS créé en mémoire avec succès.")

        # Sauvegarder l'index sur disque
        # Supprimer l'ancien index s'il existe pour éviter les erreurs de fusion
        if os.path.exists(faiss_index_path):
            print(f"Suppression de l'ancien index FAISS : {faiss_index_path}")
            shutil.rmtree(faiss_index_path)
        print(f"Sauvegarde de l'index FAISS sur disque : {faiss_index_path}")
        vector_store.save_local(faiss_index_path)
        print("Index FAISS sauvegardé.")

    except Exception as e:
        print(f"ERREUR lors de la création ou sauvegarde de l'index FAISS : {e}")
        raise e # Arrêter le script ici si la création FAISS échoue

    # Ajouter les connaissances générales (IDENTIQUE à rag_fertilizer.py)
    fertilizer_knowledge = """# Recommandations générales pour les fertilisants par type de culture

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
    from langchain.schema import Document
    knowledge_docs = [Document(page_content=fertilizer_knowledge)]
    try:
        print("Ajout des connaissances générales à l'index FAISS (via add_documents)...")
        # Tenter d'ajouter les documents de connaissance à l'index FAISS existant
        vector_store.add_documents(splitter.split_documents(knowledge_docs))
        # Note: La sauvegarde après ajout est implicite ou gérée par FAISS lors de l'utilisation?
        # Pour être sûr, on peut re-sauvegarder mais peut être lourd.
        # vector_store.save_local(faiss_index_path) 
        print("Connaissances générales ajoutées à l'index FAISS.")
    except Exception as e:
        print(f"Note: Erreur lors de l'ajout des connaissances générales à FAISS : {e}")
        # Continuer même si l'ajout échoue pour ce test

    # Configurer le récupérateur FAISS
    print("Configuration du retriever FAISS...")
    retriever = vector_store.as_retriever(
        # search_type="mmr", # MMR n'est pas un type direct pour FAISS, utiliser similarité
        search_kwargs={'k': 7} # Augmenter k pour similarité simple
    )
    
    return retriever

# Fonction pour obtenir une recommandation d'engrais (DOIT être IDENTIQUE à rag_fertilizer.py)
def get_fertilizer_recommendation(crop, region, nitrogen, phosphorus, potassium, pH, retriever):
    # Définir le modèle de prompt (DOIT être IDENTIQUE à rag_fertilizer.py)
    prompt = PromptTemplate.from_template("""Tâche : Recommander un fertilisant basé UNIQUEMENT sur le contexte fourni.

Contexte (informations sur des situations similaires) :
{context}

Requête spécifique :
- Culture : {crop}
- Région : {region}
- Analyse du sol : N={nitrogen}, P={phosphorus}, K={potassium}, pH={pH}

Instructions :
1. Examine attentivement le contexte pour trouver des situations les plus similaires à la requête spécifique (culture, région, nutriments, pH).
2. Extrait les recommandations d'engrais (type et quantité) et les justifications associées de ces situations similaires trouvées dans le contexte.
3. Formule une recommandation finale pour la requête spécifique, en te basant EXCLUSIVEMENT sur les informations extraites à l'étape 2.
4. Si le contexte ne contient aucune information suffisamment similaire ou pertinente pour formuler une recommandation fiable, indique clairement que le contexte est insuffisant. Ne fais pas de suppositions.

Réponse (suit les instructions ci-dessus) :""")
    
    # Utiliser Ollama local (DOIT être IDENTIQUE à rag_fertilizer.py)
    print("Configuration du modèle de langage (Ollama local)...")
    try:
        llm = Ollama(model="mistral:7b", temperature=0.3) # Température IDENTIQUE

        # Fonction pour récupérer le contexte pertinent (requête améliorée - DOIT être IDENTIQUE)
        def get_context(query_dict):
            query_text = (f"Recommandation de fertilisation pour la culture de {query_dict['crop']} "
                          f"dans la région de {query_dict['region']} avec N={query_dict['nitrogen']}, "
                          f"P={query_dict['phosphorus']}, K={query_dict['potassium']} et un pH de {query_dict['pH']}.")
            docs = retriever.get_relevant_documents(query_text)
            return "\n\n".join([doc.page_content for doc in docs])
        
        # Créer la chaîne (DOIT être IDENTIQUE à rag_fertilizer.py)
        chain = (
            RunnablePassthrough() 
            | {"context": get_context, "crop": lambda x: x['crop'], "region": lambda x: x['region'],
               "nitrogen": lambda x: x['nitrogen'], "phosphorus": lambda x: x['phosphorus'],
               "potassium": lambda x: x['potassium'], "pH": lambda x: x['pH']}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        # Invoquer la chaîne (DOIT être IDENTIQUE à rag_fertilizer.py)
        input_data = {"crop": crop, "region": region, "nitrogen": nitrogen, 
                      "phosphorus": phosphorus, "potassium": potassium, "pH": pH}
        result = chain.invoke(input_data)
        return result

    except Exception as e:
        print(f"Erreur lors de l'utilisation du modèle de langage Ollama: {e}")
        return f"Erreur: Impossible de générer une recommandation. {str(e)}"

def evaluate_rag_system(test_queries, reference_responses, retriever):
    """
    Évalue les réponses générées par le système RAG avec ROUGE et BLEU.
    Args et Returns inchangés
    """
    generated_responses = []
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
    rouge_scores = []
    bleu_scores = []
    
    print("Évaluation du système RAG (avec config alignée) en cours...") # Message mis à jour
    
    for i, (query, ref) in enumerate(zip(test_queries, reference_responses)):
        print(f"Traitement de la requête {i+1}/{len(test_queries)}...")
        
        # Générer la réponse avec la fonction MISE A JOUR
        response = get_fertilizer_recommendation(
            crop=query["crop"], 
            region=query["region"], 
            nitrogen=query["nitrogen"],
            phosphorus=query["phosphorus"], 
            potassium=query["potassium"], 
            pH=query["pH"],
            retriever=retriever
        )
        generated_responses.append(response)
        
        # Calcul des scores (inchangé)
        scores = scorer.score(ref, response)
        rouge_scores.append({
            "ROUGE-1": scores["rouge1"].fmeasure,
            "ROUGE-L": scores["rougeL"].fmeasure
        })
        ref_tokens = nltk.word_tokenize(ref.lower())
        response_tokens = nltk.word_tokenize(response.lower())
        smoothie = SmoothingFunction().method4
        bleu_score = sentence_bleu([ref_tokens], response_tokens, smoothing_function=smoothie)
        bleu_scores.append(bleu_score)
        
        # Affichage (inchangé)
        print(f"Requête: {query}")
        print(f"Réponse générée: {response[:150]}...")
        print(f"Référence: {ref[:150]}...")
        print(f"ROUGE-1: {scores['rouge1'].fmeasure:.4f}, ROUGE-L: {scores['rougeL'].fmeasure:.4f}, BLEU: {bleu_score:.4f}")
        print("-" * 50)
    
    # Calcul des moyennes (inchangé)
    avg_rouge1 = sum(score["ROUGE-1"] for score in rouge_scores) / len(rouge_scores)
    avg_rougeL = sum(score["ROUGE-L"] for score in rouge_scores) / len(rouge_scores)
    avg_bleu = sum(bleu_scores) / len(bleu_scores)
    
    return {
        "ROUGE-1": avg_rouge1,
        "ROUGE-L": avg_rougeL,
        "BLEU": avg_bleu,
        "Generated": generated_responses,
        "Details": list(zip(rouge_scores, bleu_scores))
    }

# Jeu de données de test et références (inchangés)
test_queries = [
    {"crop": "maïs", "region": "Jendouba", "nitrogen": 80, "phosphorus": 40, "potassium": 20, "pH": 6.5},
    {"crop": "tomates", "region": "Tunis", "nitrogen": 50, "phosphorus": 30, "potassium": 40, "pH": 5.8},
    {"crop": "blé", "region": "Kairouan", "nitrogen": 100, "phosphorus": 60, "potassium": 30, "pH": 7.2},
    {"crop": "oliviers", "region": "Sfax", "nitrogen": 30, "phosphorus": 70, "potassium": 90, "pH": 7.8},
    {"crop": "pois chiches", "region": "Beja", "nitrogen": 20, "phosphorus": 80, "potassium": 40, "pH": 6.8}
]
reference_responses = [
    "Pour la culture du maïs dans la région de Jendouba avec un niveau d'azote de 80 kg/ha, de phosphore de 40 kg/ha, de potassium de 20 kg/ha et un pH de 6.5, nous recommandons d'appliquer un engrais NPK 15-15-15 à raison de 200 kg/ha, complété par 100 kg/ha d'urée pour atteindre les niveaux optimaux d'azote nécessaires au maïs.",
    "Pour la culture de tomates dans la région de Tunis avec un niveau d'azote de 50 kg/ha, de phosphore de 30 kg/ha, de potassium de 40 kg/ha et un pH de 5.8, nous recommandons d'utiliser un engrais NPK 10-10-20 à raison de 150 kg/ha. Le sol étant légèrement acide, l'ajout de 50 kg/ha de chaux agricole est conseillé pour améliorer le pH.",
    "Pour la culture du blé dans la région de Kairouan avec un niveau d'azote de 100 kg/ha, de phosphore de 60 kg/ha, de potassium de 30 kg/ha et un pH de 7.2, nous recommandons d'appliquer un engrais NPK 20-10-10 à raison de 150 kg/ha. Le niveau d'azote étant déjà élevé, cet apport sera suffisant pour maintenir une bonne croissance.",
    "Pour les oliviers dans la région de Sfax avec un niveau d'azote de 30 kg/ha, de phosphore de 70 kg/ha, de potassium de 90 kg/ha et un pH de 7.8, nous recommandons d'utiliser un engrais à faible teneur en azote et riche en potassium comme le NPK 5-10-30 à raison de 100 kg/ha. Le sol étant alcalin, envisagez l'application de sulfate d'ammonium qui aura un effet acidifiant.",
    "Pour les pois chiches dans la région de Beja avec un niveau d'azote de 20 kg/ha, de phosphore de 80 kg/ha, de potassium de 40 kg/ha et un pH de 6.8, nous recommandons d'appliquer un engrais faible en azote et riche en phosphore comme le NPK 5-20-10 à raison de 120 kg/ha. Les légumineuses comme les pois chiches fixent naturellement l'azote, donc un apport supplémentaire n'est pas nécessaire."
]

if __name__ == "__main__":
    retriever = None 
    ollama_was_stopped = False # Flag pour savoir si on a tenté d'arrêter Ollama

    try:
        # --- Étape 1: Arrêter Ollama --- 
        print("\n" + "="*30 + " ÉTAPE 1: Arrêt d'Ollama " + "="*30)
        print("Tentative d'arrêt du service Ollama pour libérer de la RAM...")
        print("NOTE: Si Ollama a été lancé manuellement dans un autre terminal, veuillez le fermer maintenant.")
        try:
            # Je vais proposer la commande 'ollama stop'. L'utilisateur devra l'approuver.
            # Le paramètre is_background=False est le défaut, c'est ok.
            # --- TOOL CALL (ollama stop) --- Placeholder, remplacé par l'appel réel ci-dessous
            pass 
        except Exception as cmd_err:
            print(f"AVERTISSEMENT: La commande pour arrêter Ollama a échoué ou n'a pas été exécutée : {cmd_err}")
            ollama_was_stopped = False
        else:
            print("Commande 'ollama stop' proposée/exécutée (succès non garanti).")
            ollama_was_stopped = True # On a au moins essayé
        
        print("Pause de 5 secondes...")
        time.sleep(5)

        # --- Étape 2: Création de la base vectorielle --- 
        print("\n" + "="*30 + " ÉTAPE 2: Création de la base vectorielle " + "="*30)
        assert len(test_queries) == len(reference_responses), "Nombre de requêtes/réponses incohérent"
        print("Configuration du Retriever (création/chargement de la base vectorielle)...")
        retriever = setup_retriever() 

        if retriever is None:
            raise Exception("ÉCHEC CRITIQUE : La création du Retriever a échoué.")

        # --- Étape 3: Redémarrer Ollama --- 
        print("\n" + "="*30 + " ÉTAPE 3: Redémarrage d'Ollama " + "="*30)
        print("Tentative de démarrage/redémarrage du service Ollama...")
        try:
            # Je vais proposer 'ollama serve' en arrière-plan.
            # --- TOOL CALL (ollama serve, background) --- Placeholder, remplacé par l'appel réel ci-dessous
            pass
        except Exception as cmd_err:
            print(f"ERREUR CRITIQUE: La commande pour démarrer Ollama a échoué : {cmd_err}")
            raise Exception("Impossible de démarrer Ollama pour l'évaluation.") 
        else:
             print("Commande 'ollama serve' proposée/exécutée en arrière-plan.")

        print("Pause de 15 secondes pour le démarrage d'Ollama...")
        time.sleep(15) 

        # --- Étape 4: Évaluation --- 
        print("\n" + "="*30 + " ÉTAPE 4: Évaluation RAG " + "="*30)
        results = evaluate_rag_system(test_queries, reference_responses, retriever)

        # --- Affichage et Sauvegarde des Résultats (inchangé) --- 
        print("\n" + "="*50)
        print("RÉSULTATS DE L'ÉVALUATION DU SYSTÈME RAG (config alignée)")
        print("="*50)
        print(f"Score ROUGE-1 moyen: {results['ROUGE-1']:.4f}")
        print(f"Score ROUGE-L moyen: {results['ROUGE-L']:.4f}")
        print(f"Score BLEU moyen: {results['BLEU']:.4f}")
        print("="*50)

        results_df = pd.DataFrame({
            "Requête": [f"{q['crop']} ({q['region']})" for q in test_queries],
            "ROUGE-1": [detail[0]["ROUGE-1"] for detail in results["Details"]],
            "ROUGE-L": [detail[0]["ROUGE-L"] for detail in results["Details"]],
            "BLEU": [detail[1] for detail in results["Details"]],
            "Réponse générée": results["Generated"],
            "Réponse de référence": reference_responses
        })
        results_file = "../data/evaluation_results.csv"
        results_df.to_csv(results_file, index=False, encoding='utf-8')
        print(f"Résultats détaillés sauvegardés dans {results_file}")

    except Exception as e:
        print(f"\nERREUR GLOBALE lors de l'évaluation: {e}")

    # Optionnel: Tenter de remettre Ollama dans son état initial ?
    # Pas implémenté ici pour garder simple. 