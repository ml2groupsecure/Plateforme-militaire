#!/usr/bin/env python3
"""
API FastAPI pour la prédiction de récidive criminelle
Charge et utilise le modèle best_recidivism_model.joblib
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any
import os
import sys
import asyncio
from pathlib import Path

from senegal_radar import has_cached_result, render_map_html, run_radar

# Windows: éviter crash UnicodeEncodeError quand la console n'est pas en UTF-8
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
except Exception:
    pass
app = FastAPI(
    title="Recidivism Prediction API",
    description="API de prédiction de récidive criminelle avec ML",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes depuis le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables globales pour le modèle
model = None
feature_names = ['Region_Name', 'Age', 'Ethnie', 'Profession', 'Ville_Actuelle', 'Type_Crime_Initial', 'Plateforme_Principale']

# Encodeurs par défaut (à ajuster selon votre entraînement)
ENCODERS = {
    'Region_Name': {
        'Dakar': 0, 'Thiès': 1, 'Saint-Louis': 2, 'Diourbel': 3, 
        'Louga': 4, 'Tambacounda': 5, 'Kolda': 6, 'Ziguinchor': 7,
        'Fatick': 8, 'Kaolack': 9, 'Kaffrine': 10, 'Kédougou': 11,
        'Matam': 12, 'Sédhiou': 13
    },
    'Ethnie': {
        'Wolof': 0, 'Pulaar': 1, 'Serer': 2, 'Diola': 3, 
        'Mandingue': 4, 'Soninke': 5, 'Autre': 6
    },
    'Profession': {
        'Étudiant': 0, 'Commerçant': 1, 'Artisan': 2, 'Employé': 3,
        'Fonctionnaire': 4, 'Chômeur': 5, 'Retraité': 6, 'Autre': 7
    },
    'Ville_Actuelle': {
        'Dakar': 0, 'Pikine': 1, 'Guédiawaye': 2, 'Rufisque': 3,
        'Thiès': 4, 'Saint-Louis': 5, 'Kaolack': 6, 'Ziguinchor': 7,
        'Autre': 8
    },
    'Type_Crime_Initial': {
        'Vol': 0, 'Agression': 1, 'Escroquerie': 2, 'Trafic': 3,
        'Violence': 4, 'Cybercriminalité': 5, 'Autre': 6
    },
    'Plateforme_Principale': {
        'Facebook': 0, 'WhatsApp': 1, 'Instagram': 2, 'Twitter': 3,
        'TikTok': 4, 'Telegram': 5, 'Autre': 6, 'Aucune': 7
    }
}

class CriminalProfile(BaseModel):
    Region_Name: str
    Age: int
    Ethnie: str
    Profession: str
    Ville_Actuelle: str
    Type_Crime_Initial: str
    Plateforme_Principale: str

class PredictionResponse(BaseModel):
    recidive_probability: float
    risk_level: str
    confidence: float
    factors: Dict[str, float]
    status: str = "success"

def load_model():
    """Charge le modèle joblib (optionnel).

    IMPORTANT:
    - L’API doit pouvoir démarrer même si le modèle est absent/incompatible,
      car d’autres fonctionnalités (ex: Radar IA) ne dépendent pas du modèle.
    """
    global model
    model_path = Path(__file__).parent / "best_recidivism_model.joblib"

    if not model_path.exists():
        print(f"[WARN] Modele non trouve: {model_path}. Demarrage en mode demonstration.")
        model = None
        return False

    try:
        import warnings

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model = joblib.load(model_path)
        print(f"[OK] Modele charge: {type(model).__name__}")
        return True
    except Exception as e:
        print(f"[WARN] Erreur chargement modele: {str(e)[:400]}")
        print("Mode demonstration actif - predictions simulees")
        model = None
        return False

def encode_features(profile: CriminalProfile) -> np.ndarray:
    """Encode les features catégorielles selon les encodeurs utilisés lors de l'entraînement"""
    features = []
    
    # Encoder chaque feature dans l'ordre attendu par le modèle
    features.append(ENCODERS['Region_Name'].get(profile.Region_Name, 0))
    features.append(profile.Age / 100.0)  # Normalisation de l'âge
    features.append(ENCODERS['Ethnie'].get(profile.Ethnie, 6))
    features.append(ENCODERS['Profession'].get(profile.Profession, 7))
    features.append(ENCODERS['Ville_Actuelle'].get(profile.Ville_Actuelle, 8))
    features.append(ENCODERS['Type_Crime_Initial'].get(profile.Type_Crime_Initial, 6))
    features.append(ENCODERS['Plateforme_Principale'].get(profile.Plateforme_Principale, 7))
    
    return np.array([features])

def calculate_risk_level(probability: float) -> str:
    """Détermine le niveau de risque basé sur la probabilité"""
    if probability < 0.25:
        return "low"
    elif probability < 0.5:
        return "medium"
    elif probability < 0.75:
        return "high"
    else:
        return "critical"

def calculate_feature_importance(profile: CriminalProfile) -> Dict[str, float]:
    """Calcule l'importance des features pour cette prédiction (approximative)"""
    factors = {}
    
    # Facteurs de risque basés sur le domaine d'expertise
    factors['age'] = min(abs(profile.Age - 25) / 25.0, 1.0) * 0.2
    factors['profession'] = 0.3 if profile.Profession == 'Chômeur' else 0.1
    factors['crime_type'] = 0.25 if profile.Type_Crime_Initial in ['Trafic', 'Violence'] else 0.15
    factors['platform'] = 0.2 if profile.Plateforme_Principale in ['Facebook', 'Instagram', 'TikTok'] else 0.1
    
    return factors

def simulate_prediction(profile: CriminalProfile) -> float:
    """Simule une prédiction basée sur des règles heuristiques"""
    import random
    
    # Base de risque selon l'âge
    age_risk = 0.4 if 18 <= profile.Age <= 35 else 0.2
    
    # Facteur profession
    prof_risk = 0.3 if profile.Profession == 'Chômeur' else 0.1
    
    # Facteur type de crime
    crime_risk = 0.35 if profile.Type_Crime_Initial in ['Trafic', 'Violence'] else 0.15
    
    # Ajouter un peu d'aléatoire pour simuler la variabilité
    base_risk = (age_risk + prof_risk + crime_risk) / 3
    random_factor = random.uniform(-0.1, 0.1)
    
    return max(0.0, min(1.0, base_risk + random_factor))

@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage de l'API (modèle optionnel)."""
    try:
        success = load_model()
        if not success:
            print("[INFO] API demarree en mode demonstration (sans modele IA)")
    except Exception as e:
        # Ne jamais empêcher l'API de démarrer à cause du modèle
        print(f"[WARN] Initialisation modele ignoree (erreur): {e}")

@app.get("/")
async def root():
    """Point d'entrée de l'API"""
    return {
        "message": "API de prédiction de récidive criminelle",
        "status": "active",
        "model_loaded": model is not None,
        "features": feature_names
    }

@app.get("/health")
async def health_check():
    """Vérification de santé de l'API"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "features_count": len(feature_names),
        "radar_senegal_enabled": True,
    }


# ============================================================
# Radar Sénégal (scraping + Groq + carte)
# ============================================================

@app.get("/senegal-radar/alerts")
async def senegal_radar_alerts(refresh: bool = False):
    """Retourne les alertes détectées via le pipeline Radar Sénégal.

    IMPORTANT: on exécute le pipeline (scraping + Groq) dans un thread
    pour ne pas bloquer l'event loop FastAPI.

    - refresh=false (défaut): utilise un cache en mémoire (TTL ~ 10min)
    - refresh=true: force un nouveau scraping + analyse
    """
    try:
        return await asyncio.to_thread(run_radar, refresh)
    except RuntimeError as e:
        # ex: GROQ_API_KEY manquant
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Radar Sénégal: {str(e)}")


@app.get("/senegal-radar/map", response_class=HTMLResponse)
async def senegal_radar_map(refresh: bool = False):
    """Retourne une page HTML (Folium) affichant la carte des alertes."""
    try:
        # Si on ne force pas un refresh et que le cache est vide, on évite de bloquer l'iframe
        # (le 1er run peut être long: scraping + appel Groq). L'utilisateur peut cliquer "Forcer analyse".
        if not refresh and not has_cached_result():
            return HTMLResponse(
                content=(
                    "<html><head><meta charset='utf-8'/><title>Radar Sénégal</title></head>"
                    "<body style='font-family:Arial,sans-serif;padding:24px'>"
                    "<h2>Radar Sénégal</h2>"
                    "<p>La carte n'est pas encore disponible: aucune analyse n'a été générée.</p>"
                    "<p>Retournez sur l'application et cliquez <b>Forcer analyse</b>, puis rechargez la carte.</p>"
                    "</body></html>"
                )
            )

        data = await asyncio.to_thread(run_radar, refresh)
        html = render_map_html(data.get("alerts", []))
        return HTMLResponse(content=html)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Radar Sénégal: {str(e)}")

@app.get("/encoders")
async def get_encoders():
    """Retourne les encodeurs disponibles"""
    return {
        "encoders": ENCODERS,
        "status": "success"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_recidivism(profile: CriminalProfile):
    """
    Prédiction de récidive basée sur le profil criminel
    """
    if model is None:
        # Mode simulation si le modèle n'est pas disponible
        recidive_prob = simulate_prediction(profile)
        risk_level = calculate_risk_level(recidive_prob)
        factors = calculate_feature_importance(profile)
        confidence = 0.65  # Confiance réduite en mode simulation
        
        return PredictionResponse(
            recidive_probability=float(recidive_prob),
            risk_level=risk_level,
            confidence=float(confidence),
            factors=factors,
            status="demo_mode"
        )
    
    try:
        # Encoder les features
        features = encode_features(profile)
        
        # Faire la prédiction
        if hasattr(model, 'predict_proba'):
            # Classification avec probabilités
            probabilities = model.predict_proba(features)[0]
            # Prendre la probabilité de récidive (classe 1)
            recidive_prob = probabilities[1] if len(probabilities) > 1 else probabilities[0]
        elif hasattr(model, 'predict'):
            # Régression ou classification binaire
            prediction = model.predict(features)[0]
            recidive_prob = prediction if 0 <= prediction <= 1 else sigmoid(prediction)
        else:
            raise ValueError("Type de modèle non supporté")
        
        # Calculer les métriques dérivées
        risk_level = calculate_risk_level(recidive_prob)
        factors = calculate_feature_importance(profile)
        
        # Simuler une confiance basée sur la cohérence des données
        confidence = min(0.95, 0.7 + 0.25 * (1 - abs(recidive_prob - 0.5) * 2))
        
        return PredictionResponse(
            recidive_probability=float(recidive_prob),
            risk_level=risk_level,
            confidence=float(confidence),
            factors=factors
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors de la prédiction: {str(e)}"
        )

@app.post("/batch_predict")
async def batch_predict(profiles: list[CriminalProfile]):
    """Prédiction en lot pour plusieurs profils"""
    if model is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé")
    
    results = []
    for profile in profiles:
        try:
            # Réutiliser la logique de prédiction individuelle
            features = encode_features(profile)
            
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(features)[0]
                recidive_prob = probabilities[1] if len(probabilities) > 1 else probabilities[0]
            else:
                prediction = model.predict(features)[0]
                recidive_prob = prediction if 0 <= prediction <= 1 else sigmoid(prediction)
            
            results.append({
                "recidive_probability": float(recidive_prob),
                "risk_level": calculate_risk_level(recidive_prob),
                "confidence": min(0.95, 0.7 + 0.25 * (1 - abs(recidive_prob - 0.5) * 2)),
                "factors": calculate_feature_importance(profile)
            })
        except Exception as e:
            results.append({
                "error": str(e),
                "recidive_probability": 0.0,
                "risk_level": "unknown",
                "confidence": 0.0,
                "factors": {}
            })
    
    return {"results": results, "count": len(results)}


def sigmoid(x):
    """Fonction sigmoid pour normaliser les prédictions"""
    return 1 / (1 + np.exp(-x))


if __name__ == "__main__":
    import uvicorn
    import sys
    
    # Fix encoding for Windows
    if sys.platform == "win32":
        import os
        os.system('chcp 65001 >nul')
    
    print("Demarrage de l'API de prediction de recidive...")
    print("Endpoint principal: http://localhost:8000/predict")
    print("Documentation: http://localhost:8000/docs")
    
    host = os.getenv("PYTHON_API_HOST", "0.0.0.0")
    port = int(os.getenv("PYTHON_API_PORT", "8000"))

    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,
        log_level="info",
    )
