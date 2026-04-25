"""
/api/unlearn — Machine Unlearning via Gradient Ascent
"""

from fastapi import APIRouter, HTTPException
from app.schemas import UnlearnRequest, UnlearnResponse
from app.services.unlearn_service import unlearn_demographic

router = APIRouter()

@router.post("/unlearn", response_model=UnlearnResponse)
async def unlearn(req: UnlearnRequest):
    try:
        return unlearn_demographic(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
