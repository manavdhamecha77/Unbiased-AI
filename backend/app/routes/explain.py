"""
/api/explain — Returns top feature importances from the logistic regression coefficients.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from app.config import MODEL_DIR

router = APIRouter()

FEATURE_COLS = [
    "age", "education_num", "capital_gain", "capital_loss", "hours_per_week",
    "workclass", "education", "marital_status", "occupation",
    "relationship", "race", "sex", "native_country",
]

class ExplainResponse(BaseModel):
    model_type: str
    features: list[str]
    weights: list[float]  # absolute, normalised 0-1


@router.get("/explain")
def explain(model_type: str = "biased", top_n: int = 6):
    try:
        model = joblib.load(MODEL_DIR / f"model_{model_type}.joblib")
        coefs = model.coef_[0]  # shape (n_features,)
        abs_coefs = np.abs(coefs)
        top_idx = np.argsort(abs_coefs)[::-1][:top_n]
        top_features = [FEATURE_COLS[i] for i in top_idx]
        top_weights_raw = [float(abs_coefs[i]) for i in top_idx]
        max_w = max(top_weights_raw) or 1.0
        top_weights = [round(w / max_w, 4) for w in top_weights_raw]
        return ExplainResponse(model_type=model_type, features=top_features, weights=top_weights)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model not trained yet. Run python train.py")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
