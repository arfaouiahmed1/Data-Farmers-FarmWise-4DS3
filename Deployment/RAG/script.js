document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets principaux (Pesticides/Fertilisants)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            
            // Changer les états actifs des boutons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Afficher le contenu correspondant
            tabContents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // Gestion des options (Formulaire/Description libre)
    const optionBtns = document.querySelectorAll('.option-btn');
    const optionContents = document.querySelectorAll('.option-content');
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const parentSection = btn.closest('.tab-content');
            
            // Changer les états actifs des boutons dans cette section
            parentSection.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Afficher le contenu correspondant dans cette section
            parentSection.querySelectorAll('.option-content').forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // Données de mapping des districts par région
    const districtsByRegion = {
        "Jendouba": ["Jendouba", "Bousalem", "Fernana", "Ghardimaou", "Ain Draham", "Tabarka", "Beni Mtir"],
        "Bizerte": ["Bizerte", "Mateur", "Menzel Bourguiba", "Ras Jebel", "Sejnane", "El Alia", "Ghar El Melh"],
        "Kairouan": ["Kairouan Nord", "Kairouan Sud", "Chebika", "Sbikha", "Haffouz", "Hajeb El Ayoun", "Nasrallah"],
        "Kasserine": ["Kasserine Nord", "Kasserine Sud", "Sbeitla", "Thala", "Feriana", "Foussana", "Majel Bel Abbès"],
        "Sfax": ["Sfax Ville", "Sfax Ouest", "Sfax Sud", "Sakiet Ezzit", "Sakiet Eddaier", "Mahres", "Jbeniana", "Kerkennah"],
        "Gabès": ["Gabès Ville", "Gabès Ouest", "Gabès Sud", "Mareth", "El Hamma", "Menzel Habib", "Matmata"],
        "Tataouine": ["Tataouine Nord", "Tataouine Sud", "Remada", "Bir Lahmar", "Ghomrassen", "Dhehiba"],
        "Tunis": ["Tunis Ville", "Bab El Bhar", "La Marsa", "Le Bardo", "El Omrane", "El Menzah", "Ezzouhour"],
        "Ariana": ["Ariana Ville", "Soukra", "Raoued", "Kalaat El Andalous", "Sidi Thabet", "Ettadhamen"],
        "Ben Arous": ["Ben Arous", "Ezzahra", "Radès", "Mégrine", "Mohamedia", "Fouchana", "Mornag"],
        "Manouba": ["Manouba", "Douar Hicher", "Oued Ellil", "Tebourba", "Mornaguia", "El Batan", "Jedaida"],
        "Nabeul": ["Nabeul", "Hammamet", "Kélibia", "Korba", "Menzel Temime", "Grombalia", "Beni Khiar", "Dar Chaabane"],
        "Zaghouan": ["Zaghouan", "Zriba", "Bir Mcherga", "Fahs", "El Nadhour", "Saouaf"],
        "Béja": ["Béja Nord", "Béja Sud", "Medjez El Bab", "Testour", "Téboursouk", "Nefza", "Amdoun"],
        "Le Kef": ["Le Kef Est", "Le Kef Ouest", "Tajerouine", "Sakiet Sidi Youssef", "Kalaa Khasba", "Dahmani", "Jérissa"],
        "Siliana": ["Siliana Nord", "Siliana Sud", "Bou Arada", "Gaafour", "El Krib", "Bourouis", "Maktar"],
        "Sousse": ["Sousse Ville", "Sousse Jawhara", "Sousse Riadh", "Hammam Sousse", "Akouda", "Kalaa Kebira", "Msaken", "Enfidha"],
        "Monastir": ["Monastir", "Ksar Hellal", "Moknine", "Jammel", "Sahline", "Zéramdine", "Bembla", "Téboulba"],
        "Mahdia": ["Mahdia", "Bou Merdes", "Ouled Chamekh", "Chorbane", "Chebba", "El Jem", "Ksour Essef", "Sidi Alouane"],
        "Sidi Bouzid": ["Sidi Bouzid Est", "Sidi Bouzid Ouest", "Jelma", "Regueb", "Ouled Haffouz", "Meknassy", "Mezzouna", "Bir El Hafey"],
        "Gafsa": ["Gafsa Nord", "Gafsa Sud", "Sened", "Mdhilla", "El Ksar", "Métlaoui", "Redeyef", "Moularès"],
        "Tozeur": ["Tozeur", "Degache", "Nefta", "Tamaghza", "Hazoua", "Hammet El Jérid"],
        "Kébili": ["Kébili Nord", "Kébili Sud", "Souk El Ahed", "Douz", "El Faouar", "Réjim Maatoug"],
        "Médenine": ["Médenine Nord", "Médenine Sud", "Beni Khedache", "Ben Gardane", "Zarzis", "Houmt Souk", "Midoun", "Ajim"]
    };
    
    // Fonction pour remplir les districts en fonction de la région sélectionnée
    function populateDistricts(regionSelectId, districtSelectId) {
        const regionSelect = document.getElementById(regionSelectId);
        const districtSelect = document.getElementById(districtSelectId);
        
        regionSelect.addEventListener('change', function() {
            const selectedRegion = this.value;
            districtSelect.innerHTML = '<option value="">Sélectionnez un district (optionnel)</option>';
            
            if (selectedRegion && districtsByRegion[selectedRegion]) {
                districtsByRegion[selectedRegion].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
                districtSelect.disabled = false;
            } else {
                districtSelect.disabled = true;
            }
        });
    }
    
    // Initialiser les listes déroulantes de districts
    populateDistricts('pest-region', 'pest-district');
    populateDistricts('fert-region', 'fert-district');
    
    // Gestion du formulaire de pesticides (structuré)
    const pesticideFormData = document.getElementById('pesticide-form-data');
    pesticideFormData.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher le conteneur de résultats
        const resultsContainer = document.getElementById('pesticide-results');
        resultsContainer.style.display = 'block';
        
        // Afficher le chargement
        const loadingDiv = resultsContainer.querySelector('.results-loading');
        const resultsContent = resultsContainer.querySelector('.results-content');
        loadingDiv.style.display = 'block';
        resultsContent.style.display = 'none';
        
        // Récupérer les données du formulaire
        const formData = new FormData(this);
        const pestData = {
            crop: formData.get('crop'),
            region: formData.get('region'),
            district: formData.get('district') || 'Non spécifié',
            pest_problem: formData.get('pest_problem'),
            season: formData.get('season'),
            growing_season: formData.get('growing_season') || 'Non spécifié',
            temperature: formData.get('temperature'),
            humidity: formData.get('humidity'),
            rainfall: formData.get('rainfall')
        };
        
        // Simuler l'appel à l'API RAG (à remplacer par le vrai appel)
        setTimeout(() => {
            // Simuler les résultats
            const mainRecommendation = generatePesticideRecommendation(pestData);
            const alternatives = generatePesticideAlternatives(pestData);
            
            // Afficher les résultats
            document.getElementById('pesticide-main-recommendation').innerHTML = mainRecommendation;
            document.getElementById('pesticide-alternatives').innerHTML = alternatives;
            
            // Masquer le chargement et afficher les résultats
            loadingDiv.style.display = 'none';
            resultsContent.style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 2000); // Simuler un délai de 2 secondes
    });
    
    // Gestion du formulaire de pesticides (description libre)
    const pesticideFreeData = document.getElementById('pesticide-free-data');
    pesticideFreeData.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher le conteneur de résultats
        const resultsContainer = document.getElementById('pesticide-results');
        resultsContainer.style.display = 'block';
        
        // Afficher le chargement
        const loadingDiv = resultsContainer.querySelector('.results-loading');
        const resultsContent = resultsContainer.querySelector('.results-content');
        loadingDiv.style.display = 'block';
        resultsContent.style.display = 'none';
        
        // Récupérer la description
        const description = this.querySelector('textarea').value;
        
        // Simuler un traitement NLP pour extraire les données structurées
        const extractedData = extractPesticideDataFromText(description);
        
        // Simuler l'appel à l'API RAG (à remplacer par le vrai appel)
        setTimeout(() => {
            // Simuler les résultats
            const mainRecommendation = generatePesticideRecommendation(extractedData);
            const alternatives = generatePesticideAlternatives(extractedData);
            
            // Afficher les résultats
            document.getElementById('pesticide-main-recommendation').innerHTML = mainRecommendation;
            document.getElementById('pesticide-alternatives').innerHTML = alternatives;
            
            // Masquer le chargement et afficher les résultats
            loadingDiv.style.display = 'none';
            resultsContent.style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 2000); // Simuler un délai de 2 secondes
    });
    
    // Gestion du formulaire de fertilisants (structuré)
    const fertilizerFormData = document.getElementById('fertilizer-form-data');
    fertilizerFormData.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher le conteneur de résultats
        const resultsContainer = document.getElementById('fertilizer-results');
        resultsContainer.style.display = 'block';
        
        // Afficher le chargement
        const loadingDiv = resultsContainer.querySelector('.results-loading');
        const resultsContent = resultsContainer.querySelector('.results-content');
        loadingDiv.style.display = 'block';
        resultsContent.style.display = 'none';
        
        // Récupérer les données du formulaire
        const formData = new FormData(this);
        const fertData = {
            crop: formData.get('crop'),
            region: formData.get('region'),
            district: formData.get('district') || 'Non spécifié',
            nitrogen: formData.get('nitrogen'),
            phosphorus: formData.get('phosphorus'),
            potassium: formData.get('potassium'),
            pH: formData.get('ph'),
            fertilizer_plant: formData.get('fertilizer_plant') || 'Non spécifié',
            season: formData.get('season')
        };
        
        // Simuler l'appel à l'API RAG (à remplacer par le vrai appel)
        setTimeout(() => {
            // Simuler les résultats
            const mainRecommendation = generateFertilizerRecommendation(fertData);
            const alternatives = generateFertilizerAlternatives(fertData);
            
            // Afficher les résultats
            document.getElementById('fertilizer-main-recommendation').innerHTML = mainRecommendation;
            document.getElementById('fertilizer-alternatives').innerHTML = alternatives;
            
            // Masquer le chargement et afficher les résultats
            loadingDiv.style.display = 'none';
            resultsContent.style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 2000); // Simuler un délai de 2 secondes
    });
    
    // Gestion du formulaire de fertilisants (description libre)
    const fertilizerFreeData = document.getElementById('fertilizer-free-data');
    fertilizerFreeData.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Afficher le conteneur de résultats
        const resultsContainer = document.getElementById('fertilizer-results');
        resultsContainer.style.display = 'block';
        
        // Afficher le chargement
        const loadingDiv = resultsContainer.querySelector('.results-loading');
        const resultsContent = resultsContainer.querySelector('.results-content');
        loadingDiv.style.display = 'block';
        resultsContent.style.display = 'none';
        
        // Récupérer la description
        const description = this.querySelector('textarea').value;
        
        // Simuler un traitement NLP pour extraire les données structurées
        const extractedData = extractFertilizerDataFromText(description);
        
        // Simuler l'appel à l'API RAG (à remplacer par le vrai appel)
        setTimeout(() => {
            // Simuler les résultats
            const mainRecommendation = generateFertilizerRecommendation(extractedData);
            const alternatives = generateFertilizerAlternatives(extractedData);
            
            // Afficher les résultats
            document.getElementById('fertilizer-main-recommendation').innerHTML = mainRecommendation;
            document.getElementById('fertilizer-alternatives').innerHTML = alternatives;
            
            // Masquer le chargement et afficher les résultats
            loadingDiv.style.display = 'none';
            resultsContent.style.display = 'block';
            
            // Faire défiler jusqu'aux résultats
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 2000); // Simuler un délai de 2 secondes
    });
    
    // Fonction pour simuler l'extraction de données à partir de texte libre (pesticides)
    function extractPesticideDataFromText(text) {
        // Cette fonction simule l'extraction de données à partir du texte
        // Dans une application réelle, vous utiliseriez NLP ou une API LLM
        
        const data = {
            crop: "tomate", // valeur par défaut
            region: "Jendouba", // valeur par défaut
            district: "Non spécifié", // valeur par défaut
            pest_problem: "pucerons et mildiou", // valeur par défaut
            season: "été", // valeur par défaut
            growing_season: "été", // valeur par défaut
            temperature: 25, // valeur par défaut
            humidity: 70, // valeur par défaut
            rainfall: 10 // valeur par défaut
        };
        
        // Extraction très basique - dans un projet réel, utilisez NLP ou LLM
        if (text.toLowerCase().includes("tomate")) data.crop = "tomate";
        if (text.toLowerCase().includes("pomme de terre")) data.crop = "pomme de terre";
        if (text.toLowerCase().includes("blé")) data.crop = "blé";
        if (text.toLowerCase().includes("maïs")) data.crop = "maïs";
        if (text.toLowerCase().includes("raisin")) data.crop = "raisin";
        if (text.toLowerCase().includes("pomme")) data.crop = "pomme";
        
        const regionNames = Object.keys(districtsByRegion);
        for (const region of regionNames) {
            if (text.toLowerCase().includes(region.toLowerCase())) {
                data.region = region;
                break;
            }
        }
        
        for (const region in districtsByRegion) {
            const districts = districtsByRegion[region];
            for (const district of districts) {
                if (text.toLowerCase().includes(district.toLowerCase())) {
                    data.district = district;
                    data.region = region;
                    break;
                }
            }
        }
        
        if (text.toLowerCase().includes("printemps")) data.season = "printemps";
        if (text.toLowerCase().includes("été")) data.season = "été";
        if (text.toLowerCase().includes("automne")) data.season = "automne";
        if (text.toLowerCase().includes("hiver")) data.season = "hiver";
        
        // Extraction de problèmes
        const problems = ["pucerons", "mildiou", "oïdium", "mouche méditerranéenne", "thrips", "aleurodes", 
                         "acariens", "fusariose", "noctuelle", "pyrale", "cochenilles", "pourriture", 
                         "botrytis", "tuta absoluta", "alternariose", "anthracnose", "tavelure"];
        
        data.pest_problem = "";
        for (const problem of problems) {
            if (text.toLowerCase().includes(problem)) {
                if (data.pest_problem) data.pest_problem += " et ";
                data.pest_problem += problem;
            }
        }
        if (!data.pest_problem) data.pest_problem = "pucerons et mildiou"; // valeur par défaut
        
        // Extraction de valeurs numériques (très simplifiée)
        const tempMatch = text.match(/(\d+)°C/);
        if (tempMatch) data.temperature = parseInt(tempMatch[1]);
        
        const humidityMatch = text.match(/(\d+)%/);
        if (humidityMatch) data.humidity = parseInt(humidityMatch[1]);
        
        const rainfallMatch = text.match(/(\d+)mm/);
        if (rainfallMatch) data.rainfall = parseInt(rainfallMatch[1]);
        
        return data;
    }
    
    // Fonction pour simuler l'extraction de données à partir de texte libre (fertilisants)
    function extractFertilizerDataFromText(text) {
        // Cette fonction simule l'extraction de données à partir du texte
        // Dans une application réelle, vous utiliseriez NLP ou une API LLM
        
        const data = {
            crop: "maïs", // valeur par défaut
            region: "Jendouba", // valeur par défaut
            district: "Non spécifié", // valeur par défaut
            nitrogen: 80, // valeur par défaut
            phosphorus: 40, // valeur par défaut
            potassium: 20, // valeur par défaut
            pH: 6.5, // valeur par défaut
            fertilizer_plant: "NPK", // valeur par défaut
            season: "printemps" // valeur par défaut
        };
        
        // Extraction très basique - dans un projet réel, utilisez NLP ou LLM
        if (text.toLowerCase().includes("tomate")) data.crop = "tomate";
        if (text.toLowerCase().includes("pomme de terre")) data.crop = "pomme de terre";
        if (text.toLowerCase().includes("blé")) data.crop = "blé";
        if (text.toLowerCase().includes("maïs")) data.crop = "maïs";
        if (text.toLowerCase().includes("raisin")) data.crop = "raisin";
        if (text.toLowerCase().includes("pomme")) data.crop = "pomme";
        
        const regionNames = Object.keys(districtsByRegion);
        for (const region of regionNames) {
            if (text.toLowerCase().includes(region.toLowerCase())) {
                data.region = region;
                break;
            }
        }
        
        for (const region in districtsByRegion) {
            const districts = districtsByRegion[region];
            for (const district of districts) {
                if (text.toLowerCase().includes(district.toLowerCase())) {
                    data.district = district;
                    data.region = region;
                    break;
                }
            }
        }
        
        if (text.toLowerCase().includes("printemps")) data.season = "printemps";
        if (text.toLowerCase().includes("été")) data.season = "été";
        if (text.toLowerCase().includes("automne")) data.season = "automne";
        if (text.toLowerCase().includes("hiver")) data.season = "hiver";
        
        // Types d'engrais
        const fertilizerTypes = {
            "npk": "NPK",
            "urée": "Urée",
            "dap": "DAP",
            "potasse": "Potasse",
            "compost": "Compost",
            "fumier": "Fumier",
            "foliai": "Engrais foliaire",
            "liquide": "Engrais liquide",
            "libération lente": "Engrais à libération lente"
        };
        
        for (const [keyword, type] of Object.entries(fertilizerTypes)) {
            if (text.toLowerCase().includes(keyword)) {
                data.fertilizer_plant = type;
                break;
            }
        }
        
        // Extraction de valeurs numériques (très simplifiée)
        const nMatch = text.match(/azote.*?(\d+)/i) || text.match(/n.*?(\d+)\s*kg/i);
        if (nMatch) data.nitrogen = parseInt(nMatch[1]);
        
        const pMatch = text.match(/phosphore.*?(\d+)/i) || text.match(/p.*?(\d+)\s*kg/i);
        if (pMatch) data.phosphorus = parseInt(pMatch[1]);
        
        const kMatch = text.match(/potassium.*?(\d+)/i) || text.match(/k.*?(\d+)\s*kg/i);
        if (kMatch) data.potassium = parseInt(kMatch[1]);
        
        const phMatch = text.match(/pH.*?(\d+\.?\d*)/i);
        if (phMatch) data.pH = parseFloat(phMatch[1]);
        
        return data;
    }
    
    // Fonction pour générer des recommandations de pesticides (à remplacer par l'appel API RAG)
    function generatePesticideRecommendation(data) {
        // Cette fonction simule un appel à l'API RAG pour pesticides
        // Dans une application réelle, appelez l'API Python RAG
        
        return `
            <div class="recommendation-card">
                <h4>Traitement recommandé pour ${data.crop} à ${data.region}</h4>
                <p><strong>District:</strong> ${data.district}</p>
                <p><strong>Problème:</strong> ${data.pest_problem}</p>
                <p><strong>Conditions:</strong> Saison actuelle: ${data.season}, Saison de croissance: ${data.growing_season}, ${data.temperature}°C, ${data.humidity}% d'humidité, ${data.rainfall}mm de précipitations</p>
                <div class="treatment">
                    <p><strong>Traitement recommandé:</strong> Pour traiter ${data.pest_problem} sur ${data.crop} dans les conditions actuelles, appliquez un mélange de pyréthrine naturelle (30ml/10L d'eau) avec une solution de savon noir (20ml/10L). Pulvérisez tôt le matin ou en soirée pour maximiser l'efficacité et minimiser l'impact sur les insectes bénéfiques.</p>
                    <p><strong>Dosage:</strong> 30ml de pyréthrine + 20ml de savon noir pour 10L d'eau</p>
                    <p><strong>Fréquence:</strong> Appliquez tous les 7-10 jours, deux applications successives</p>
                </div>
                <div class="considerations">
                    <p><strong>Considérations environnementales:</strong> Ce traitement a un impact minimal sur les organismes non ciblés, se dégrade rapidement et convient aux zones proches de points d'eau.</p>
                </div>
            </div>
        `;
    }
    
    // Fonction pour générer des alternatives de pesticides
    function generatePesticideAlternatives(data) {
        // Cette fonction simule des alternatives aux recommandations principales
        
        return `
            <div class="alternative-card">
                <h4>Alternative 1: Solution biologique</h4>
                <p>Pour une approche 100% biologique, utilisez une préparation à base de neem (50ml/10L) combinée avec une infusion d'ail (5 gousses broyées dans 1L d'eau, puis diluée). Efficacité légèrement inférieure mais sans résidus chimiques.</p>
            </div>
            <div class="alternative-card">
                <h4>Alternative 2: Approche mécanique</h4>
                <p>Pour les petites surfaces, installez des pièges collants jaunes et des filets anti-insectes. Combinez avec des lâchers de coccinelles (prédateurs naturels) à raison de 10 par m².</p>
            </div>
            <div class="alternative-card">
                <h4>Alternative 3: Traitement conventionnel</h4>
                <p>Si l'infestation est sévère, le Lambda-cyhalothrin (15ml/10L) offre une protection rapide et efficace. À utiliser en dernier recours et en respectant scrupuleusement le délai avant récolte de 14 jours.</p>
            </div>
        `;
    }
    
    // Fonction pour générer des recommandations de fertilisants (à remplacer par l'appel API RAG)
    function generateFertilizerRecommendation(data) {
        // Cette fonction simule un appel à l'API RAG pour fertilisants
        // Dans une application réelle, appelez l'API Python RAG
        
        return `
            <div class="recommendation-card">
                <h4>Fertilisation recommandée pour ${data.crop} à ${data.region}</h4>
                <p><strong>District:</strong> ${data.district}</p>
                <p><strong>Analyse du sol:</strong> N:${data.nitrogen} kg/ha, P:${data.phosphorus} kg/ha, K:${data.potassium} kg/ha, pH:${data.pH}</p>
                <p><strong>Saison d'application:</strong> ${data.season}</p>
                <div class="treatment">
                    <p><strong>Fertilisant recommandé:</strong> Pour optimiser la croissance et le rendement de ${data.crop} dans votre région avec les niveaux de nutriments actuels, utilisez un engrais ${data.fertilizer_plant} combiné avec un amendement organique.</p>
                    <p><strong>Dosage:</strong> 300 kg/ha d'engrais NPK 15-10-15 + 2 tonnes/ha de compost mûr</p>
                    <p><strong>Application:</strong> Divisez en 3 applications : 40% au semis/plantation, 40% pendant la phase végétative, 20% pendant la phase reproductive</p>
                </div>
                <div class="considerations">
                    <p><strong>Ajustement pH:</strong> ${data.pH < 6.0 ? "Ajoutez 1.5 tonnes/ha de chaux agricole pour augmenter le pH" : data.pH > 7.5 ? "Incorporez du soufre élémentaire (250 kg/ha) pour réduire progressivement le pH" : "Le pH est optimal pour cette culture"}</p>
                </div>
            </div>
        `;
    }
    
    // Fonction pour générer des alternatives de fertilisants
    function generateFertilizerAlternatives(data) {
        // Cette fonction simule des alternatives aux recommandations principales
        
        return `
            <div class="alternative-card">
                <h4>Alternative 1: Solution 100% organique</h4>
                <p>Appliquez 4 tonnes/ha de compost enrichi (3-2-3) + 500 kg/ha de farine d'os (0-15-0) + 300 kg/ha de cendre de bois (0-2-10). Cette approche favorise la vie microbienne du sol mais peut nécessiter plus de temps pour libérer les nutriments.</p>
            </div>
            <div class="alternative-card">
                <h4>Alternative 2: Fertilisants à libération lente</h4>
                <p>Utilisez 400 kg/ha d'engrais enrobé à libération contrôlée (14-7-14) avec technologie polymère. Réduit le nombre d'applications nécessaires à une seule en début de saison. Plus coûteux mais nécessite moins de main-d'œuvre.</p>
            </div>
            <div class="alternative-card">
                <h4>Alternative 3: Biostimulants + fertilisation de précision</h4>
                <p>Combinez 250 kg/ha d'engrais NPK standard avec un programme de biostimulants à base d'extraits d'algues et d'acides humiques. Complétez avec une fertilisation foliaire ciblée pendant les phases critiques. Approche moderne visant l'efficacité maximale des nutriments.</p>
            </div>
        `;
    }
}); 