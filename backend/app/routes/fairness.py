"""
/api/fairness — Compute Disparate Impact Ratio and Demographic Parity.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import FairnessRequest, FairnessResponse
from app.services.fairness_service import compute_fairness_metrics

router = APIRouter()


@router.post("/fairness", response_model=FairnessResponse)
async def fairness(req: FairnessRequest):
    """
    Evaluate fairness metrics of the chosen model on the test dataset.
    """
    try:
        result = compute_fairness_metrics(req)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
