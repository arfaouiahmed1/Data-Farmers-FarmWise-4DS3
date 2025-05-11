// Fonctions JavaScript pour l'interface des modèles ML

document.addEventListener('DOMContentLoaded', () => {
    // Gestion des options pour les modèles ML
    const mlOptions = document.querySelectorAll('#ml-models .option-btn');
    const mlContents = document.querySelectorAll('#ml-models .option-content');

    // Formulaires des modèles ML
    const cropClassificationForm = document.getElementById('crop-classification-form');
    const irrigationOptimizationForm = document.getElementById('irrigation-optimization-form');
    const yieldPredictionForm = document.getElementById('yield-prediction-form');

    // Sections de résultats
    const cropClassificationResults = document.getElementById('crop-classification-results');
    const irrigationOptimizationResults = document.getElementById('irrigation-optimization-results');
    const yieldPredictionResults = document.getElementById('yield-prediction-results');

    // Gestion des clics sur les options
    mlOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Mettre à jour les classes active
            mlOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Afficher le contenu correspondant
            const target = option.getAttribute('data-target');
            mlContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                }
            });

            // Masquer tous les résultats
            cropClassificationResults.style.display = 'none';
            irrigationOptimizationResults.style.display = 'none';
            yieldPredictionResults.style.display = 'none';
        });
    });

    // Gestion de la soumission du formulaire de classification des cultures
    cropClassificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher la section de résultats et le chargement
        cropClassificationResults.style.display = 'block';
        cropClassificationResults.querySelector('.results-loading').style.display = 'block';
        cropClassificationResults.querySelector('.results-content').style.display = 'none';

        // Récupérer les données du formulaire
        const formData = new FormData(cropClassificationForm);
        const data = Object.fromEntries(formData.entries());

        // Simulation d'un appel API (à remplacer par un vrai appel API)
        setTimeout(() => {
            // Simuler la réponse du modèle ML
            const results = simulateCropClassificationResponse(data);
            
            // Afficher les résultats
            displayCropClassificationResults(results);
            
            // Masquer le chargement et afficher le contenu
            cropClassificationResults.querySelector('.results-loading').style.display = 'none';
            cropClassificationResults.querySelector('.results-content').style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            cropClassificationResults.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });

    // Gestion de la soumission du formulaire d'optimisation d'irrigation
    irrigationOptimizationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher la section de résultats et le chargement
        irrigationOptimizationResults.style.display = 'block';
        irrigationOptimizationResults.querySelector('.results-loading').style.display = 'block';
        irrigationOptimizationResults.querySelector('.results-content').style.display = 'none';

        // Récupérer les données du formulaire
        const formData = new FormData(irrigationOptimizationForm);
        const data = Object.fromEntries(formData.entries());

        // Simulation d'un appel API (au lieu de l'appel fetch réel)
        setTimeout(() => {
            // Simuler la réponse du modèle ML
            const results = simulateIrrigationOptimizationResponse(data);
            
            // Afficher les résultats simulés
            displayIrrigationOptimizationResults(results);
            
            // Masquer le chargement et afficher le contenu
            irrigationOptimizationResults.querySelector('.results-loading').style.display = 'none';
            irrigationOptimizationResults.querySelector('.results-content').style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            irrigationOptimizationResults.scrollIntoView({ behavior: 'smooth' });
        }, 1500); // Simuler un délai
    });

    // Gestion de la soumission du formulaire de prédiction de rendement
    yieldPredictionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher la section de résultats et le chargement
        yieldPredictionResults.style.display = 'block';
        yieldPredictionResults.querySelector('.results-loading').style.display = 'block';
        yieldPredictionResults.querySelector('.results-content').style.display = 'none';

        // Récupérer les données du formulaire
        const formData = new FormData(yieldPredictionForm);
        const data = Object.fromEntries(formData.entries());

        // Simulation d'un appel API (à remplacer par un vrai appel API)
        setTimeout(() => {
            // Simuler la réponse du modèle ML
            const results = simulateYieldPredictionResponse(data);
            
            // Afficher les résultats
            displayYieldPredictionResults(results);
            
            // Masquer le chargement et afficher le contenu
            yieldPredictionResults.querySelector('.results-loading').style.display = 'none';
            yieldPredictionResults.querySelector('.results-content').style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            yieldPredictionResults.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });

    // Fonction pour afficher les résultats de classification des cultures
    function displayCropClassificationResults(results) {
        const mainResult = document.getElementById('crop-classification-main-result');
        const alternatives = document.getElementById('crop-classification-alternatives');
        
        // Afficher la culture principale recommandée
        mainResult.innerHTML = `
            <div class="recommended-crop">
                <h4>${results.recommendedCrop}</h4>
                <p>Confiance: <strong>${results.confidence}%</strong></p>
                <p>${results.recommendation}</p>
            </div>
        `;
        
        // Afficher les cultures alternatives
        let alternativesHTML = '<div class="alternatives-container">';
        results.alternatives.forEach(alt => {
            alternativesHTML += `
                <div class="alternative-crop">
                    <h4>${alt.crop}</h4>
                    <p>Confiance: <strong>${alt.confidence}%</strong></p>
                </div>
            `;
        });
        alternativesHTML += '</div>';
        
        alternatives.innerHTML = alternativesHTML;
    }

    // Fonction pour afficher les résultats d'optimisation d'irrigation
    function displayIrrigationOptimizationResults(results) {
        const mainResult = document.getElementById('irrigation-optimization-main-result');
        const comparison = document.getElementById('irrigation-optimization-comparison');
        
        // Afficher la méthode d'irrigation recommandée
        mainResult.innerHTML = `
            <div class="recommended-method">
                <h4>${translateIrrigationMethod(results.recommendedMethod)}</h4>
                <p>Rendement estimé: <strong>${results.expectedYield} tonnes/ha</strong></p>
                <p>${results.recommendation}</p>
            </div>
        `;
        
        // Afficher la comparaison des méthodes
        let comparisonHTML = '<div class="comparison-chart">';
        results.comparison.forEach(method => {
            const isRecommended = method.name === results.recommendedMethod;
            const yieldPercentage = (method.yield / results.maxYield) * 100;
            
            comparisonHTML += `
                <div class="comparison-item ${isRecommended ? 'recommended' : ''}">
                    <div class="method-name">${translateIrrigationMethod(method.name)}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${yieldPercentage}%"></div>
                        <span class="yield-value">${method.yield} t/ha</span>
                    </div>
                </div>
            `;
        });
        
        comparisonHTML += `
            <div class="additional-info">
                <p>${results.additionalInfo}</p>
            </div>
        `;
        
        comparisonHTML += '</div>';
        comparison.innerHTML = comparisonHTML;
    }

    // Fonction pour afficher les résultats de prédiction de rendement
    function displayYieldPredictionResults(results) {
        const mainResult = document.getElementById('yield-prediction-main-result');
        const analysis = document.getElementById('yield-prediction-analysis');
        
        // Afficher le rendement prédit
        mainResult.innerHTML = `
            <div class="predicted-yield">
                <h4>${results.predictedYield} tonnes/ha</h4>
                <p>${results.summary}</p>
                <div class="yield-gauge">
                    <div class="gauge-fill" style="width: ${results.percentOfOptimal}%"></div>
                </div>
                <p>${results.percentOfOptimal}% du rendement optimal potentiel</p>
            </div>
        `;
        
        // Afficher l'analyse du rendement
        analysis.innerHTML = `
            <div class="yield-analysis-details">
                <p>Rendement moyen pour ${results.crop} en Tunisie: <strong>${results.averageYield} tonnes/ha</strong></p>
                <p>Votre rendement prédit est <span class="${results.comparedToAverage > 0 ? 'positive-result' : 'negative-result'}">
                    ${Math.abs(results.comparedToAverage)}% ${results.comparedToAverage > 0 ? 'au-dessus' : 'en-dessous'} de la moyenne
                </span></p>
                <p><strong>Facteurs clés affectant votre rendement:</strong></p>
                <ul>
                    ${results.keyFactors.map(factor => `<li>${factor}</li>`).join('')}
                </ul>
                <p><strong>Recommandations pour améliorer le rendement:</strong></p>
                <ul>
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Fonction pour traduire les méthodes d'irrigation en français
    function translateIrrigationMethod(method) {
        const translations = {
            'Drip': 'Goutte à goutte',
            'Sprinkler': 'Aspersion',
            'Flood': 'Inondation',
            'Subsurface': 'Irrigation souterraine',
            'Center Pivot': 'Pivot central',
            'Micro-sprinkler': 'Micro-aspersion'
        };
        
        return translations[method] || method;
    }

    // Fonctions pour simuler les réponses des modèles ML (à remplacer par des appels API réels)
    function simulateCropClassificationResponse(formData) {
        // Calcul basé sur les données du formulaire
        const crops = [
            'Tomate', 'Blé', 'Maïs', 'Pomme de terre', 'Oignon', 
            'Olivier', 'Agrumes', 'Piment', 'Pastèque', 'Carotte'
        ];
        
        // Logique simplifiée pour choisir une culture basée sur les paramètres
        let mainCropIndex = Math.floor((parseInt(formData.ph) * parseInt(formData.rainfall)) % crops.length);
        if (mainCropIndex < 0) mainCropIndex = 0;
        
        // Générer des alternatives
        const usedIndexes = [mainCropIndex];
        const alternatives = [];
        
        for (let i = 0; i < 3; i++) {
            let altIndex;
            do {
                altIndex = Math.floor(Math.random() * crops.length);
            } while (usedIndexes.includes(altIndex));
            
            usedIndexes.push(altIndex);
            const confidence = Math.floor(65 + Math.random() * 20);
            alternatives.push({
                crop: crops[altIndex],
                confidence: confidence
            });
        }
        
        // Trier les alternatives par confiance
        alternatives.sort((a, b) => b.confidence - a.confidence);
        
        return {
            recommendedCrop: crops[mainCropIndex],
            confidence: Math.floor(85 + Math.random() * 15),
            recommendation: `Basé sur les conditions de sol et climatiques que vous avez fournies, le ${crops[mainCropIndex]} est particulièrement adapté à votre situation. Cette culture devrait bien se développer avec les niveaux d'azote, de phosphore et de potassium indiqués, ainsi qu'avec le pH du sol et les conditions météorologiques spécifiées.`,
            alternatives: alternatives
        };
    }

    function simulateIrrigationOptimizationResponse(formData) {
        // Méthodes d'irrigation à comparer
        const irrigationMethods = ['Drip', 'Sprinkler', 'Flood', 'Subsurface', 'Center Pivot', 'Micro-sprinkler'];
        
        // Calcul simplifié basé sur les données du formulaire
        const crop = formData.crop;
        const temperature = parseFloat(formData.temperature);
        const rainfall = parseFloat(formData.rainfall);
        const soilK = parseFloat(formData.soil_k);

        // Définir les facteurs d'efficacité AVANT la boucle
        const efficiencyFactors = {
            'Drip': 0.95,
            'Sprinkler': 0.80,
            'Flood': 0.65,
            'Subsurface': 0.90,
            'Center Pivot': 0.85,
            'Micro-sprinkler': 0.88
        };
        
        // Générer des rendements pour chaque méthode
        const yields = {};
        irrigationMethods.forEach(method => {
            // Calculer le rendement en fonction des paramètres
            let baseYield = 10 + (soilK / 50) - (Math.abs(temperature - 25) / 5) + (rainfall / 200);
            // Utiliser les facteurs d'efficacité définis plus haut
            let yieldValue = baseYield * (efficiencyFactors[method] || 0.7); // Ajouter une valeur par défaut au cas où
            
            // Ajouter une variation aléatoire
            yieldValue *= (0.95 + Math.random() * 0.1);
            
            yields[method] = Math.round(yieldValue * 10) / 10;
        });
        
        // Trouver la méthode avec le rendement maximum
        let maxYield = 0;
        let recommendedMethod = '';
        Object.entries(yields).forEach(([method, yieldVal]) => { // Renommer yield pour éviter conflit
            if (yieldVal > maxYield) {
                maxYield = yieldVal;
                recommendedMethod = method;
            }
        });
        
        // Préparer la comparaison
        const comparison = irrigationMethods.map(method => ({
            name: method,
            yield: yields[method]
        }));
        
        // Trier par rendement
        comparison.sort((a, b) => b.yield - a.yield);
        
        // Calculer l'économie d'eau (s'assurer que recommendedMethod existe dans efficiencyFactors)
        const savings = efficiencyFactors[recommendedMethod] 
            ? Math.round((1 - (efficiencyFactors['Flood'] || 0.65) / efficiencyFactors[recommendedMethod]) * 100)
            : 0; // Comparaison par rapport à Flood par défaut

        return {
            recommendedMethod: recommendedMethod,
            expectedYield: yields[recommendedMethod],
            recommendation: `Pour votre culture de ${crop}, l'irrigation par ${translateIrrigationMethod(recommendedMethod)} offre le meilleur rendement potentiel. Cette méthode est particulièrement efficace dans les conditions que vous avez spécifiées, notamment avec une température de ${temperature}°C et des précipitations de ${rainfall}mm.`,
            comparison: comparison,
            maxYield: maxYield,
            additionalInfo: `L'efficacité d'irrigation est cruciale. Avec les conditions spécifiées, la méthode ${translateIrrigationMethod(recommendedMethod)} permettrait d'économiser environ ${savings}% d'eau par rapport à l'irrigation par inondation (Flood).`
        };
    }

    function simulateYieldPredictionResponse(formData) {
        // Données de base pour les rendements moyens par culture (tonnes/ha)
        const averageYields = {
            'tomate': 40,
            'pomme de terre': 25,
            'blé': 3.5,
            'maïs': 6,
            'raisin': 15,
            'pomme': 20,
            'olive': 3.5,
            'piment': 18,
            'agrumes': 25,
            'oignon': 30,
            'carotte': 35,
            'pastèque': 45,
            'melon': 30,
            'concombre': 35,
            'aubergine': 30,
            'banana': 35
        };
        
        // Valeurs optimales par culture
        const optimalYields = {
            'tomate': 80,
            'pomme de terre': 45,
            'blé': 7,
            'maïs': 12,
            'raisin': 30,
            'pomme': 40,
            'olive': 6,
            'piment': 35,
            'agrumes': 40,
            'oignon': 50,
            'carotte': 60,
            'pastèque': 80,
            'melon': 50,
            'concombre': 60,
            'aubergine': 50,
            'banana': 60
        };
        
        const crop = formData.crop;
        const averageYield = averageYields[crop] || 20;
        const optimalYield = optimalYields[crop] || 40;
        
        // Paramètres clés qui influencent le rendement
        const soilN = parseFloat(formData.soil_n);
        const soilP = parseFloat(formData.soil_p);
        const soilK = parseFloat(formData.soil_k);
        const temperature = parseFloat(formData.temperature);
        const humidity = parseFloat(formData.humidity);
        const ph = parseFloat(formData.ph);
        const rainfall = parseFloat(formData.rainfall);
        const irrigation = formData.irrigation;
        
        // Calculer le rendement prédit
        let yieldModifier = 1.0;
        
        // Effets de la température
        const optimalTemp = 25;
        yieldModifier *= 1 - (Math.abs(temperature - optimalTemp) / 100);
        
        // Effets de l'humidité
        const optimalHumidity = 65;
        yieldModifier *= 1 - (Math.abs(humidity - optimalHumidity) / 200);
        
        // Effets du pH
        const optimalPH = 6.5;
        yieldModifier *= 1 - (Math.abs(ph - optimalPH) / 14);
        
        // Effets des nutriments
        const nutrientEffect = (soilN / 100 + soilP / 100 + soilK / 100) / 3;
        yieldModifier *= (0.7 + nutrientEffect);
        
        // Effet de l'irrigation
        const irrigationEffects = {
            'Drip': 1.1,
            'Sprinkler': 1.0,
            'Flood': 0.9
        };
        yieldModifier *= irrigationEffects[irrigation] || 1.0;
        
        // Ajouter une variation aléatoire
        yieldModifier *= (0.95 + Math.random() * 0.1);
        
        // Calculer le rendement final
        const predictedYield = Math.round(averageYield * yieldModifier * 10) / 10;
        
        // Calculer le pourcentage par rapport à l'optimal
        const percentOfOptimal = Math.round((predictedYield / optimalYield) * 100);
        
        // Calculer le pourcentage par rapport à la moyenne
        const comparedToAverage = Math.round(((predictedYield / averageYield) - 1) * 100);
        
        // Déterminer les facteurs clés
        const keyFactors = [];
        if (Math.abs(temperature - optimalTemp) > 5) {
            keyFactors.push(`Température: ${temperature}°C (optimale autour de ${optimalTemp}°C)`);
        }
        if (Math.abs(humidity - optimalHumidity) > 15) {
            keyFactors.push(`Humidité: ${humidity}% (optimale autour de ${optimalHumidity}%)`);
        }
        if (Math.abs(ph - optimalPH) > 1) {
            keyFactors.push(`pH du sol: ${ph} (optimal autour de ${optimalPH})`);
        }
        if (soilN < 50) {
            keyFactors.push(`Niveau d'azote relativement bas: ${soilN} kg/ha`);
        }
        if (soilP < 40) {
            keyFactors.push(`Niveau de phosphore relativement bas: ${soilP} kg/ha`);
        }
        if (soilK < 30) {
            keyFactors.push(`Niveau de potassium relativement bas: ${soilK} kg/ha`);
        }
        
        // Recommandations pour améliorer le rendement
        const recommendations = [];
        if (Math.abs(temperature - optimalTemp) > 5) {
            recommendations.push(`Envisagez d'ajuster le calendrier de plantation pour éviter les températures extrêmes`);
        }
        if (rainfall < 300 && humidity < 60) {
            recommendations.push(`Augmentez la fréquence d'irrigation, particulièrement pendant les périodes sèches`);
        }
        if (soilN < 50) {
            recommendations.push(`Augmentez l'application d'engrais azotés`);
        }
        if (soilP < 40) {
            recommendations.push(`Augmentez l'application d'engrais phosphatés`);
        }
        if (soilK < 30) {
            recommendations.push(`Augmentez l'application d'engrais potassiques`);
        }
        if (Math.abs(ph - optimalPH) > 1) {
            if (ph < optimalPH) {
                recommendations.push(`Appliquez de la chaux pour augmenter le pH du sol`);
            } else {
                recommendations.push(`Appliquez du soufre ou du compost pour réduire le pH du sol`);
            }
        }
        
        // Résumé du rendement
        let summary = '';
        if (comparedToAverage > 10) {
            summary = `Le rendement prédit est excellent, significativement au-dessus de la moyenne tunisienne pour cette culture.`;
        } else if (comparedToAverage > 0) {
            summary = `Le rendement prédit est bon, légèrement au-dessus de la moyenne tunisienne pour cette culture.`;
        } else if (comparedToAverage > -10) {
            summary = `Le rendement prédit est proche de la moyenne tunisienne pour cette culture.`;
        } else {
            summary = `Le rendement prédit est inférieur à la moyenne tunisienne pour cette culture.`;
        }
        
        return {
            crop: crop,
            predictedYield: predictedYield,
            averageYield: averageYield,
            percentOfOptimal: percentOfOptimal,
            comparedToAverage: comparedToAverage,
            summary: summary,
            keyFactors: keyFactors,
            recommendations: recommendations
        };
    }

    // Fonction pour afficher les erreurs d'optimisation d'irrigation
    function displayIrrigationOptimizationError(errorMessage) {
        const mainResult = document.getElementById('irrigation-optimization-main-result');
        const comparison = document.getElementById('irrigation-optimization-comparison');
        
        mainResult.innerHTML = `<p class="error">Erreur: ${errorMessage}</p>`;
        comparison.innerHTML = ''; // Effacer la zone de comparaison
    }
}); 