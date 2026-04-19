"""
/api/predict — Returns predictions from the Biased or Fair model.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import PredictionRequest, PredictionResponse
from app.services.model_service import get_prediction

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest):
    """
    Accept applicant features, return income prediction from the
    selected model (biased or fair).
    """
    try:
        result = get_prediction(req)
        return result
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Model not trained yet. Run `python train.py` first. ({exc})",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
