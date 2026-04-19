"""
Model Service — loads trained models and makes predictions.
Handles both the Biased and Fair (reweighed) Logistic Regression models.
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path

from app.config import MODEL_DIR
from app.schemas import PredictionRequest, PredictionResponse

# Feature columns expected by the model (must match training order)
CATEGORICAL_COLS = [
    "workclass", "education", "marital_status", "occupation",
    "relationship", "race", "sex", "native_country",
]

NUMERICAL_COLS = [
    "age", "education_num", "capital_gain", "capital_loss", "hours_per_week",
]

FEATURE_COLS = NUMERICAL_COLS + CATEGORICAL_COLS

LABEL_MAP = {0: "<=50K (Low Income)", 1: ">50K (High Income)"}


def _load_model(model_type: str):
    """Load the serialized model from disk."""
    model_path = MODEL_DIR / f"model_{model_type}.joblib"
    encoder_path = MODEL_DIR / "label_encoder.joblib"
    scaler_path = MODEL_DIR / "scaler.joblib"

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
    scaler = joblib.load(scaler_path)
    return model, encoder, scaler


def _preprocess(req: PredictionRequest, encoder, scaler) -> np.ndarray:
    """Transform raw request features into the format the model expects."""
    data = {
        "age": [req.age],
        "workclass": [req.workclass],
        "education": [req.education],
        "education_num": [req.education_num],
        "marital_status": [req.marital_status],
        "occupation": [req.occupation],
        "relationship": [req.relationship],
        "race": [req.race],
        "sex": [req.sex],
        "capital_gain": [req.capital_gain],
        "capital_loss": [req.capital_loss],
        "hours_per_week": [req.hours_per_week],
        "native_country": [req.native_country],
    }
    df = pd.DataFrame(data)

    # Encode categoricals
    for col in CATEGORICAL_COLS:
        df[col] = encoder[col].transform(df[col].astype(str))

    # Scale numericals
    df[NUMERICAL_COLS] = scaler.transform(df[NUMERICAL_COLS])

    # Reorder columns to match training
    return df[FEATURE_COLS].values


def get_prediction(req: PredictionRequest) -> PredictionResponse:
    """Run inference using the selected model."""
    model_type = req.model_type.lower()
    if model_type not in ("biased", "fair"):
        model_type = "biased"

    model, encoder, scaler = _load_model(model_type)
    X = _preprocess(req, encoder, scaler)

    prediction = int(model.predict(X)[0])
    probability = float(model.predict_proba(X)[0][prediction])

    return PredictionResponse(
        prediction=prediction,
        prediction_label=LABEL_MAP[prediction],
        probability=round(probability, 4),
        model_used=model_type,
    )
