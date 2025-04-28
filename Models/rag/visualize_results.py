import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

def visualize_evaluation_results(csv_file="../data/evaluation_results.csv"):
    """
    Visualise les résultats d'évaluation du système RAG avec des graphiques.
    
    Args:
        csv_file: Chemin vers le fichier CSV contenant les résultats d'évaluation
    """
    # Vérifier si le fichier existe
    if not os.path.exists(csv_file):
        print(f"Le fichier {csv_file} n'existe pas.")
        return
    
    # Charger les résultats
    results = pd.read_csv(csv_file, encoding='utf-8')
    
    # Préparer les données pour le graphique
    cultures = [req.split(' (')[0] for req in results['Requête']]
    rouge1_scores = results['ROUGE-1']
    rougeL_scores = results['ROUGE-L']
    bleu_scores = results['BLEU']
    
    # Configurer la figure
    plt.figure(figsize=(12, 8))
    
    # Créer un graphique à barres groupées
    x = np.arange(len(cultures))
    width = 0.25
    
    plt.bar(x - width, rouge1_scores, width, label='ROUGE-1', color='red')
    plt.bar(x, rougeL_scores, width, label='ROUGE-L', color='blue')
    plt.bar(x + width, bleu_scores, width, label='BLEU', color='green')
    
    # Ajouter les étiquettes, le titre et la légende
    plt.xlabel('Cultures')
    plt.ylabel('Scores')
    plt.title('Évaluation du système RAG par culture')
    plt.xticks(x, cultures, rotation=45)
    plt.ylim(0, 1.0)  # Les scores sont entre 0 et 1
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Ajouter les valeurs sur les barres
    for i, v in enumerate(rouge1_scores):
        plt.text(i - width, v + 0.02, f'{v:.2f}', ha='center', fontsize=9)
    for i, v in enumerate(rougeL_scores):
        plt.text(i, v + 0.02, f'{v:.2f}', ha='center', fontsize=9)
    for i, v in enumerate(bleu_scores):
        plt.text(i + width, v + 0.02, f'{v:.2f}', ha='center', fontsize=9)
    
    # Afficher les moyennes
    mean_rouge1 = rouge1_scores.mean()
    mean_rougeL = rougeL_scores.mean()
    mean_bleu = bleu_scores.mean()
    
    plt.axhline(y=mean_rouge1, color='red', linestyle='--', alpha=0.5, label=f'Moy. ROUGE-1: {mean_rouge1:.2f}')
    plt.axhline(y=mean_rougeL, color='blue', linestyle='--', alpha=0.5, label=f'Moy. ROUGE-L: {mean_rougeL:.2f}')
    plt.axhline(y=mean_bleu, color='green', linestyle='--', alpha=0.5, label=f'Moy. BLEU: {mean_bleu:.2f}')
    
    # Ajuster la mise en page
    plt.tight_layout()
    
    # Sauvegarder le graphique
    plt.savefig("../data/evaluation_results.png", dpi=300)
    print(f"Graphique sauvegardé dans ../data/evaluation_results.png")
    
    # Créer un résumé textuel
    print("\n" + "="*50)
    print("RÉSUMÉ DES RÉSULTATS D'ÉVALUATION")
    print("="*50)
    print(f"Score ROUGE-1 moyen: {mean_rouge1:.4f}")
    print(f"Score ROUGE-L moyen: {mean_rougeL:.4f}")
    print(f"Score BLEU moyen: {mean_bleu:.4f}")
    print("\nRésultats par culture:")
    for i, culture in enumerate(cultures):
        print(f"  {culture}: ROUGE-1={rouge1_scores[i]:.4f}, ROUGE-L={rougeL_scores[i]:.4f}, BLEU={bleu_scores[i]:.4f}")
    print("="*50)
    
    # Afficher le graphique
    plt.show()

if __name__ == "__main__":
    visualize_evaluation_results() 