# Système RAG de Recommandation d'Engrais

Ce projet implémente un système de recommandation d'engrais basé sur l'approche RAG (Retrieval-Augmented Generation), et fournit des outils pour évaluer ses performances.

## Structure du projet

```
/
├── data/
│   ├── total_melonge_df.csv        # Données sur les cultures et engrais
│   └── evaluation_results.csv      # Résultats d'évaluation exportés
├── rag/
│   ├── rag_fertilizer.py           # Implémentation principale du système RAG
│   ├── evaluate_rag.py             # Outil d'évaluation avec ROUGE et BLEU
│   └── chroma_fertilizer_db/       # Base de données vectorielle (générée)
├── requirements.txt                # Dépendances du projet
└── README.md                       # Ce fichier
```

## Installation

1. Clonez ce dépôt
2. Installez les dépendances requises:

```bash
pip install -r requirements.txt
```

## Utilisation du système de recommandation

Pour obtenir des recommandations d'engrais:

```bash
cd rag
python rag_fertilizer.py
```

Suivez les instructions pour entrer les détails de votre culture et obtenir une recommandation personnalisée.

## Évaluation du système RAG

Pour évaluer les performances du système avec les métriques ROUGE et BLEU:

```bash
cd rag
python evaluate_rag.py
```

Le script comparera les recommandations générées par le système avec des réponses de référence et calculera:
- Score ROUGE-1: Mesure la présence des mots de référence dans la réponse générée
- Score ROUGE-L: Évalue les séquences communes les plus longues
- Score BLEU: Évalue la précision des n-grammes par rapport à la référence

Les résultats seront affichés dans la console et exportés dans un fichier CSV pour une analyse plus approfondie.

## Personnalisation de l'évaluation

Pour personnaliser l'évaluation avec vos propres requêtes et réponses de référence, modifiez les listes `test_queries` et `reference_responses` dans le fichier `evaluate_rag.py`.

## Notes sur les métriques d'évaluation

- **ROUGE** (Recall-Oriented Understudy for Gisting Evaluation): Évalue dans quelle mesure les réponses générées contiennent les mêmes mots/séquences que les références.
- **BLEU** (Bilingual Evaluation Understudy): Mesure la précision des n-grammes dans les réponses générées par rapport aux références.

Ces métriques fournissent une évaluation quantitative, mais une évaluation qualitative par des experts agricoles reste recommandée pour une validation complète. 