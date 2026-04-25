"""
Unlearn Service — Approximate machine unlearning via Gradient Ascent.
"""

import joblib
import numpy as np
from pathlib import Path
from sklearn.metrics import accuracy_score

from app.config import MODEL_DIR, DATA_DIR
from app.schemas import UnlearnRequest, UnlearnResponse
from app.services.fairness_service import compute_fairness_metrics
from app.schemas import FairnessRequest

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def unlearn_demographic(req: UnlearnRequest) -> UnlearnResponse:
    """
    Performs gradient ascent on the specified model to "forget" a demographic.
    For sklearn LogisticRegression, we manually update the weights using gradient ascent.
    """
    model_type = req.model_type.lower()
    if model_type not in ("biased", "fair"):
        model_type = "biased"

    # Load artifacts
    model_path = MODEL_DIR / f"model_{model_type}.joblib"
    model = joblib.load(model_path)
    X_test = joblib.load(DATA_DIR / "X_test.joblib")
    y_test = joblib.load(DATA_DIR / "y_test.joblib")
    sensitive_test = joblib.load(DATA_DIR / "sensitive_test.joblib")

    # Get original metrics before unlearning
    orig_preds = model.predict(X_test)
    orig_acc = accuracy_score(y_test, orig_preds)
    
    fairness_req = FairnessRequest(sensitive_feature=req.feature, model_type=model_type)
    orig_fairness = compute_fairness_metrics(fairness_req)

    # 1. Identify the forget set
    sensitive_col = sensitive_test[req.feature]
    forget_mask = sensitive_col == req.value
    
    if not forget_mask.any():
        raise ValueError(f"No samples found for {req.feature} == {req.value}")

    X_forget = X_test[forget_mask]
    y_forget = y_test[forget_mask]

    # 2. Gradient Ascent Loop
    lr = req.learning_rate
    
    for _ in range(req.epochs):
        # Forward pass on forget set
        z = np.dot(X_forget, model.coef_.T) + model.intercept_
        preds = sigmoid(z)
        
        # Gradient of log-loss (Binary Cross Entropy)
        # grad w.r.t coef: (preds - y) * X
        # Since we want to unlearn (increase loss), we do Gradient ASCENT -> add gradient
        grad_coef = np.dot((preds.ravel() - y_forget), X_forget) / len(y_forget)
        grad_intercept = np.mean(preds.ravel() - y_forget)
        
        # Update weights (Ascent)
        model.coef_ += lr * grad_coef
        model.intercept_ += lr * grad_intercept

    # Save the modified model back to disk
    joblib.dump(model, model_path)

    # Get new metrics
    new_preds = model.predict(X_test)
    new_acc = accuracy_score(y_test, new_preds)
    new_fairness = compute_fairness_metrics(fairness_req)

    return UnlearnResponse(
        message=f"Successfully unlearned {req.feature}={req.value} from {model_type} model.",
        original_accuracy=round(orig_acc, 4),
        new_accuracy=round(new_acc, 4),
        original_dir=orig_fairness.disparate_impact_ratio,
        new_dir=new_fairness.disparate_impact_ratio
    )
