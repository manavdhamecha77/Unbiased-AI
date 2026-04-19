"""
Gemini Service — generates Audit Receipts using Gemini 2.5 Flash.
"""

from google import genai
from app.config import GEMINI_API_KEY
from app.schemas import AuditRequest, AuditResponse

# Lazy-initialized Gemini client (avoids crash when API key is missing)
_client = None


def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not set. Copy backend/.env.example to backend/.env "
                "and add your key."
            )
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

AUDIT_PROMPT_TEMPLATE = """
You are an AI Governance Auditor for "Sentinel", an enterprise fairness platform.

A machine learning model has made the following prediction. Analyze it for potential bias
and generate a formal **Audit Receipt**.

## Prediction Context
- **Model Used**: {model_used}
- **Prediction**: {prediction} ({prediction_label})
- **Confidence**: {probability:.1%}
- **Fairness Score (DIR)**: {fairness_score}

## Applicant Features
{features_formatted}

## Instructions
Generate an audit receipt with the following sections:
1. **Decision Summary** — One-line summary of the prediction.
2. **Bias Risk Assessment** — Assess whether sensitive attributes (race, sex) may have
   influenced the decision. Rate risk as LOW / MEDIUM / HIGH.
3. **Fairness Analysis** — If the model is "biased", explain what disparate impact means
   and why the score is low. If "fair", explain the reweighing mitigation applied.
4. **Recommendation** — Actionable next step (e.g., "Switch to the Fair model" or
   "Decision compliant with 80% rule").
5. **Compliance Status** — Whether this decision meets the EEOC 80% rule standard.

Keep the tone professional and suitable for an enterprise compliance report.
Format the output in clean Markdown.
"""


async def generate_audit_receipt(req: AuditRequest) -> AuditResponse:
    """Call Gemini 2.5 Flash to generate a human-readable audit receipt."""
    features_formatted = "\n".join(
        f"- **{k}**: {v}" for k, v in req.applicant_features.items()
    )

    prediction_label = "<=50K (Low Income)" if req.prediction == 0 else ">50K (High Income)"

    prompt = AUDIT_PROMPT_TEMPLATE.format(
        model_used=req.model_used,
        prediction=req.prediction,
        prediction_label=prediction_label,
        probability=req.probability,
        fairness_score=req.fairness_score or "N/A",
        features_formatted=features_formatted,
    )

    response = _get_client().models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    audit_text = response.text

    # Determine risk level from the audit text (simple heuristic)
    risk_level = "MEDIUM"
    if req.model_used == "fair":
        risk_level = "LOW"
    elif req.fairness_score and req.fairness_score < 0.8:
        risk_level = "HIGH"

    return AuditResponse(
        audit_receipt=audit_text,
        model_used=req.model_used,
        risk_level=risk_level,
    )
