/**
 * Connecteur API pour les systèmes RAG
 * 
 * Ce fichier contient les fonctions pour connecter l'interface web aux systèmes RAG Python.
 * Dans cette version de démonstration, les appels API sont simulés.
 * Pour une implémentation réelle, remplacez ces fonctions par de véritables appels à l'API.
 */

// URL de base de l'API (à remplacer par l'URL réelle)
const API_BASE_URL = 'http://localhost:5000';

/**
 * Fonction pour obtenir une recommandation de pesticide
 * 
 * @param {Object} data - Les données du formulaire
 * @returns {Promise} - Une promesse qui résout avec les recommandations
 */
async function getPesticideRecommendation(data) {
    // Dans une application réelle, décommentez le code ci-dessous et supprimez le code de simulation
    
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/api/pesticide-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la communication avec l\'API');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
    */
    
    // Code de simulation - À REMPLACER par le vrai appel API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simuler une réponse de l'API
            const response = {
                main_recommendation: {
                    title: `Traitement recommandé pour ${data.crop} à ${data.region}`,
                    problem: data.pest_problem,
                    conditions: `${data.season}, ${data.temperature}°C, ${data.humidity}% d'humidité, ${data.rainfall}mm de précipitations`,
                    treatment: `Pour traiter ${data.pest_problem} sur ${data.crop} dans les conditions actuelles, appliquez un mélange de pyréthrine naturelle (30ml/10L d'eau) avec une solution de savon noir (20ml/10L). Pulvérisez tôt le matin ou en soirée pour maximiser l'efficacité et minimiser l'impact sur les insectes bénéfiques.`,
                    dosage: "30ml de pyréthrine + 20ml de savon noir pour 10L d'eau",
                    frequency: "Appliquez tous les 7-10 jours, deux applications successives",
                    environmental_considerations: "Ce traitement a un impact minimal sur les organismes non ciblés, se dégrade rapidement et convient aux zones proches de points d'eau."
                },
                alternatives: [
                    {
                        title: "Solution biologique",
                        description: "Pour une approche 100% biologique, utilisez une préparation à base de neem (50ml/10L) combinée avec une infusion d'ail (5 gousses broyées dans 1L d'eau, puis diluée). Efficacité légèrement inférieure mais sans résidus chimiques."
                    },
                    {
                        title: "Approche mécanique",
                        description: "Pour les petites surfaces, installez des pièges collants jaunes et des filets anti-insectes. Combinez avec des lâchers de coccinelles (prédateurs naturels) à raison de 10 par m²."
                    },
                    {
                        title: "Traitement conventionnel",
                        description: "Si l'infestation est sévère, le Lambda-cyhalothrin (15ml/10L) offre une protection rapide et efficace. À utiliser en dernier recours et en respectant scrupuleusement le délai avant récolte de 14 jours."
                    }
                ]
            };
            
            resolve(response);
        }, 2000);
    });
}

/**
 * Fonction pour obtenir une recommandation de fertilisant
 * 
 * @param {Object} data - Les données du formulaire
 * @returns {Promise} - Une promesse qui résout avec les recommandations
 */
async function getFertilizerRecommendation(data) {
    // Dans une application réelle, décommentez le code ci-dessous et supprimez le code de simulation
    
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/api/fertilizer-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la communication avec l\'API');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
    */
    
    // Code de simulation - À REMPLACER par le vrai appel API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simuler une réponse de l'API
            const response = {
                main_recommendation: {
                    title: `Fertilisation recommandée pour ${data.crop} à ${data.region}`,
                    soil_analysis: `N:${data.nitrogen} kg/ha, P:${data.phosphorus} kg/ha, K:${data.potassium} kg/ha, pH:${data.pH}`,
                    fertilizer: `Pour optimiser la croissance et le rendement de ${data.crop} dans votre région avec les niveaux de nutriments actuels, utilisez un engrais NPK 15-10-15 combiné avec un amendement organique.`,
                    dosage: "300 kg/ha d'engrais NPK 15-10-15 + 2 tonnes/ha de compost mûr",
                    application: "Divisez en 3 applications : 40% au semis/plantation, 40% pendant la phase végétative, 20% pendant la phase reproductive",
                    ph_adjustment: data.pH < 6.0 ? "Ajoutez 1.5 tonnes/ha de chaux agricole pour augmenter le pH" : data.pH > 7.5 ? "Incorporez du soufre élémentaire (250 kg/ha) pour réduire progressivement le pH" : "Le pH est optimal pour cette culture"
                },
                alternatives: [
                    {
                        title: "Solution 100% organique",
                        description: "Appliquez 4 tonnes/ha de compost enrichi (3-2-3) + 500 kg/ha de farine d'os (0-15-0) + 300 kg/ha de cendre de bois (0-2-10). Cette approche favorise la vie microbienne du sol mais peut nécessiter plus de temps pour libérer les nutriments."
                    },
                    {
                        title: "Fertilisants à libération lente",
                        description: "Utilisez 400 kg/ha d'engrais enrobé à libération contrôlée (14-7-14) avec technologie polymère. Réduit le nombre d'applications nécessaires à une seule en début de saison. Plus coûteux mais nécessite moins de main-d'œuvre."
                    },
                    {
                        title: "Biostimulants + fertilisation de précision",
                        description: "Combinez 250 kg/ha d'engrais NPK standard avec un programme de biostimulants à base d'extraits d'algues et d'acides humiques. Complétez avec une fertilisation foliaire ciblée pendant les phases critiques. Approche moderne visant l'efficacité maximale des nutriments."
                    }
                ]
            };
            
            resolve(response);
        }, 2000);
    });
}

/**
 * Fonction pour extraire des données structurées à partir d'une description textuelle
 * 
 * @param {string} description - La description textuelle
 * @param {string} type - Le type de données à extraire ('pesticide' ou 'fertilizer')
 * @returns {Promise} - Une promesse qui résout avec les données extraites
 */
async function extractDataFromText(description, type) {
    // Dans une application réelle, décommentez le code ci-dessous et supprimez le code de simulation
    
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/api/extract-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description, type })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la communication avec l\'API');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
    */
    
    // Code de simulation - À REMPLACER par le vrai appel API
    return new Promise((resolve) => {
        setTimeout(() => {
            if (type === 'pesticide') {
                // Données par défaut
                const data = {
                    crop: "tomate",
                    region: "Jendouba",
                    pest_problem: "pucerons et mildiou",
                    season: "été",
                    temperature: 25,
                    humidity: 70,
                    rainfall: 10
                };
                
                // Extraction très basique
                if (description.toLowerCase().includes("tomate")) data.crop = "tomate";
                if (description.toLowerCase().includes("pomme")) data.crop = "pomme";
                if (description.toLowerCase().includes("blé")) data.crop = "blé";
                
                if (description.toLowerCase().includes("jendouba")) data.region = "Jendouba";
                if (description.toLowerCase().includes("bizerte")) data.region = "Bizerte";
                if (description.toLowerCase().includes("sfax")) data.region = "Sfax";
                
                if (description.toLowerCase().includes("printemps")) data.season = "printemps";
                if (description.toLowerCase().includes("été")) data.season = "été";
                if (description.toLowerCase().includes("automne")) data.season = "automne";
                if (description.toLowerCase().includes("hiver")) data.season = "hiver";
                
                if (description.toLowerCase().includes("puceron")) data.pest_problem = "pucerons";
                if (description.toLowerCase().includes("mildiou")) {
                    data.pest_problem = data.pest_problem ? data.pest_problem + " et mildiou" : "mildiou";
                }
                
                const tempMatch = description.match(/(\d+)°C/);
                if (tempMatch) data.temperature = parseInt(tempMatch[1]);
                
                const humidityMatch = description.match(/(\d+)%/);
                if (humidityMatch) data.humidity = parseInt(humidityMatch[1]);
                
                const rainfallMatch = description.match(/(\d+)mm/);
                if (rainfallMatch) data.rainfall = parseInt(rainfallMatch[1]);
                
                resolve(data);
            } else if (type === 'fertilizer') {
                // Données par défaut
                const data = {
                    crop: "maïs",
                    region: "Jendouba",
                    nitrogen: 80,
                    phosphorus: 40,
                    potassium: 20,
                    pH: 6.5
                };
                
                // Extraction très basique
                if (description.toLowerCase().includes("maïs")) data.crop = "maïs";
                if (description.toLowerCase().includes("tomate")) data.crop = "tomate";
                if (description.toLowerCase().includes("blé")) data.crop = "blé";
                
                if (description.toLowerCase().includes("jendouba")) data.region = "Jendouba";
                if (description.toLowerCase().includes("bizerte")) data.region = "Bizerte";
                if (description.toLowerCase().includes("sfax")) data.region = "Sfax";
                
                const nMatch = description.match(/azote.*?(\d+)/i);
                if (nMatch) data.nitrogen = parseInt(nMatch[1]);
                
                const pMatch = description.match(/phosphore.*?(\d+)/i);
                if (pMatch) data.phosphorus = parseInt(pMatch[1]);
                
                const kMatch = description.match(/potassium.*?(\d+)/i);
                if (kMatch) data.potassium = parseInt(kMatch[1]);
                
                const phMatch = description.match(/pH.*?(\d+\.?\d*)/i);
                if (phMatch) data.pH = parseFloat(phMatch[1]);
                
                resolve(data);
            }
        }, 1000);
    });
}

// Exporter les fonctions pour utilisation dans script.js
export { 
    getPesticideRecommendation, 
    getFertilizerRecommendation, 
    extractDataFromText 
}; 