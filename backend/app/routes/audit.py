"""
/api/audit — Generate a Gemini-powered Audit Receipt.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import AuditRequest, AuditResponse
from app.services.gemini_service import generate_audit_receipt

router = APIRouter()


@router.post("/audit", response_model=AuditResponse)
async def audit(req: AuditRequest):
    """
    Send prediction context to Gemini 2.5 Flash and receive
    a human-readable audit receipt explaining the model's decision.
    """
    try:
        result = await generate_audit_receipt(req)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
