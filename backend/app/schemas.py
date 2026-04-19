"""
Pydantic schemas for request / response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------
class PredictionRequest(BaseModel):
    """Features for an Adult Census prediction."""
    age: int = Field(..., ge=17, le=90, description="Applicant age")
    workclass: str = Field(..., description="Type of employer")
    education: str = Field(..., description="Highest level of education")
    education_num: int = Field(..., ge=1, le=16, description="Education numeric rank")
    marital_status: str = Field(..., description="Marital status")
    occupation: str = Field(..., description="Occupation category")
    relationship: str = Field(..., description="Relationship status")
    race: str = Field(..., description="Race (sensitive attribute)")
    sex: str = Field(..., description="Sex (sensitive attribute)")
    capital_gain: float = Field(0, ge=0)
    capital_loss: float = Field(0, ge=0)
    hours_per_week: int = Field(40, ge=1, le=99)
    native_country: str = Field("United-States")
    model_type: str = Field("biased", description="'biased' or 'fair'")


class PredictionResponse(BaseModel):
    prediction: int = Field(..., description="0 = <=50K, 1 = >50K")
    prediction_label: str
    probability: float
    model_used: str


# ---------------------------------------------------------------------------
# Fairness
# ---------------------------------------------------------------------------
class FairnessRequest(BaseModel):
    """Compute fairness metrics over a batch of predictions."""
    sensitive_feature: str = Field("sex", description="Column name of the sensitive attribute")
    model_type: str = Field("biased", description="'biased' or 'fair'")


class FairnessResponse(BaseModel):
    disparate_impact_ratio: float
    demographic_parity_difference: float
    model_type: str
    is_fair: bool = Field(..., description="True if DIR ≥ 0.8 (80% rule)")


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------
class AuditRequest(BaseModel):
    prediction: int
    probability: float
    model_used: str
    applicant_features: dict
    fairness_score: Optional[float] = None


class AuditResponse(BaseModel):
    audit_receipt: str
    model_used: str
    risk_level: str
