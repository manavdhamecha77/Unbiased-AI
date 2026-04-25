"""
Fairness Service — computes Disparate Impact Ratio and
Demographic Parity Difference on the test dataset.
"""

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score
from fairlearn.metrics import demographic_parity_difference

from app.config import MODEL_DIR, DATA_DIR
from app.schemas import FairnessRequest, FairnessResponse


def compute_fairness_metrics(req: FairnessRequest) -> FairnessResponse:
    """
    Load the test dataset, run the specified model, and compute fairness metrics.

    Disparate Impact Ratio (DIR):
        = P(ŷ=1 | unprivileged) / P(ŷ=1 | privileged)
        Fair if DIR ≥ 0.8 (the "80% rule")
    """
    model_type = req.model_type.lower()
    if model_type not in ("biased", "fair"):
        model_type = "biased"

    # Load artifacts
    model = joblib.load(MODEL_DIR / f"model_{model_type}.joblib")
    X_test = joblib.load(DATA_DIR / "X_test.joblib")
    y_test = joblib.load(DATA_DIR / "y_test.joblib")
    sensitive_test = joblib.load(DATA_DIR / "sensitive_test.joblib")

    # Predictions
    y_pred = model.predict(X_test)

    # Select the sensitive feature column — stored as dict of numpy arrays
    sensitive_col = sensitive_test[req.sensitive_feature]

    # ----- Disparate Impact Ratio -----
    groups = np.unique(sensitive_col)
    selection_rates = {}
    for g in groups:
        mask = sensitive_col == g
        if mask.sum() == 0:
            continue
        selection_rates[g] = y_pred[mask].mean()

    rates = list(selection_rates.values())
    if not rates or max(rates) == 0:
        dir_value = 1.0
    else:
        dir_value = min(rates) / max(rates)

    # Guard against NaN/inf from edge cases
    if not np.isfinite(dir_value):
        dir_value = 0.0

    # ----- Demographic Parity Difference -----
    dpd = demographic_parity_difference(
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=sensitive_col,
    )

    dpd_value = float(abs(dpd))
    if not np.isfinite(dpd_value):
        dpd_value = 0.0

    # ----- Performance Metrics -----
    acc_value = float(accuracy_score(y_test, y_pred))
    f1_value = float(f1_score(y_test, y_pred))

    return FairnessResponse(
        disparate_impact_ratio=round(dir_value, 4),
        demographic_parity_difference=round(dpd_value, 4),
        accuracy=round(acc_value, 4),
        f1_score=round(f1_value, 4),
        model_type=model_type,
        is_fair=dir_value >= 0.8,
    )
