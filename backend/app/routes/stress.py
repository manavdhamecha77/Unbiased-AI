from fastapi import APIRouter, HTTPException
from app.schemas import PredictionRequest, StressTestResponse
from app.services.model_service import get_prediction

router = APIRouter()

@router.post("/stress", response_model=StressTestResponse)
async def stress_test(req: PredictionRequest):
    """
    Run adversarial stress test by flipping the sensitive attribute (sex)
    and returning if the decision changes.
    """
    try:
        # 1. Original Prediction
        orig_resp = get_prediction(req)
        
        # 2. Perturb feature (e.g., sex)
        perturbed_req = req.model_copy()
        original_sex = req.sex
        
        # Simple heuristic to flip sex
        if original_sex.lower().strip() == "male":
            perturbed_sex = "Female"
        else:
            perturbed_sex = "Male"
            
        perturbed_req.sex = perturbed_sex
        
        # 3. Perturbed Prediction
        pert_resp = get_prediction(perturbed_req)
        
        # 4. Compare
        is_stable = orig_resp.prediction == pert_resp.prediction
        
        return StressTestResponse(
            original_prediction=orig_resp,
            perturbed_prediction=pert_resp,
            is_stable=is_stable,
            perturbed_feature="sex",
            original_value=original_sex,
            perturbed_value=perturbed_sex
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
