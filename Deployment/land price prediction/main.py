# main.py
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os
from model import predict_price
from regions import regions_dict

# Créer application FastAPI
app = FastAPI(
    title="FarmWise API",
    description="Estimation des prix de terrains agricoles",
    version="1.0.0"
)

# Initialiser templates
templates = Jinja2Templates(directory="templates")

# Servir fichiers statiques
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Préparer la liste pour le template (tri alphabétique)
regions_list = [{"region": region, "region_encoded": code} for region, code in sorted(regions_dict.items())]

        


# Types de culture (à adapter selon tes besoins)
cultures_list = [
    {"TypedeCulture": 0, "description": "Aucune culture"},
    {"TypedeCulture": 1, "description": "Céréales"},
    {"TypedeCulture": 2, "description": "Oliviers"},
    {"TypedeCulture": 3, "description": "Fruits"},
    {"TypedeCulture": 4, "description": "Légumes"},
    {"TypedeCulture": 5, "description": "Vignes"}
]

# Route principale pour afficher le formulaire
@app.get("/", response_class=HTMLResponse)
async def show_form(request: Request):
    return templates.TemplateResponse(
        "form.html", 
        {
            "request": request, 
            "regions": regions_list, 
            "cultures": cultures_list
        }
    )

# Endpoint JSON pour API
@app.post("/api/predict/")
async def predict_land_price_api(
    region_encoded: int,
    Surface_m2: float,
    Proximiteplage: int,
    TitreFoncier: int,
    EauDisponible: int,
    electricite: int,
    Cloture: int,
    NbArbres: int,
    TypedeCulture: int,
    Irrigation: int,
    batiment: int,
    route: int
):
    try:
        # Convertir en dict adapté à model
        input_data = {
            'region_encoded': region_encoded,
            'Surface(m2)': Surface_m2,
            'Proximiteplage': Proximiteplage,
            'TitreFoncier': TitreFoncier,
            'EauDisponible': EauDisponible,
            'electricite': electricite,
            'Cloture': Cloture,
            'NbArbres': NbArbres,
            'TypedeCulture': TypedeCulture,
            'Irrigation': Irrigation,
            'batiment': batiment,
            'route': route,
        }
        price = predict_price(input_data)
        return {"predicted_price_TND": price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint pour formulaire HTML
@app.post("/predict/", response_class=HTMLResponse)
async def predict_form(
    request: Request,
    region_encoded: int = Form(...),
    surface_m2: float = Form(...),
    proximiteplage: int = Form(0),
    titre_foncier: int = Form(0),
    eau_disponible: int = Form(0),
    electricite: int = Form(0),
    cloture: int = Form(0),
    nb_arbres: int = Form(...),
    typede_culture: int = Form(...),
    irrigation: int = Form(0),
    batiment: int = Form(0),
    route: int = Form(0),
):
    try:
        input_data = {
            'region_encoded': region_encoded,
            'Surface(m2)': surface_m2,
            'Proximiteplage': proximiteplage,
            'TitreFoncier': titre_foncier,
            'EauDisponible': eau_disponible,
            'electricite': electricite,
            'Cloture': cloture,
            'NbArbres': nb_arbres,
            'TypedeCulture': typede_culture,
            'Irrigation': irrigation,
            'batiment': batiment,
            'route': route,
        }
        price = predict_price(input_data)
        
        # Récupérer le nom de la région
        region_name = next((region for region, code in regions_dict.items() if code == region_encoded), f"Région {region_encoded}")
        
        # Récupérer le nom du type de culture
        culture_name = next((c["description"] for c in cultures_list if c["TypedeCulture"] == typede_culture), f"Type {typede_culture}")
        
        # Données pour le résultat
        result_data = {
            "request": request, 
            "predicted_price_TND": price,
            "region": region_name,
            "surface_m2": surface_m2,
            "nb_arbres": nb_arbres,
            "culture": culture_name,
            # Données binaires pour l'affichage
            "commodites": {
                "proximiteplage": proximiteplage == 1,
                "titre_foncier": titre_foncier == 1,
                "eau_disponible": eau_disponible == 1,
                "electricite": electricite == 1,
                "cloture": cloture == 1,
                "irrigation": irrigation == 1,
                "batiment": batiment == 1,
                "route": route == 1
            }
        }
        
        return templates.TemplateResponse("result.html", result_data)
    
    except Exception as e:
        print(f"Erreur lors de la prédiction: {e}")
        # En cas d'erreur, rediriger vers le formulaire avec message d'erreur
        return templates.TemplateResponse(
            "form.html", 
            {
                "request": request, 
                "error": str(e),
                "regions": regions_list, 
                "cultures": cultures_list
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)