"""
Sentinel AI Governance — FastAPI Server
========================================
Serves predictions from both the Biased and Fair models,
computes fairness metrics, generates Gemini audit receipts,
and exposes the causal DAG visualization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import predict, fairness, audit, causal, explain, stress, unlearn

app = FastAPI(
    title="Sentinel AI Governance API",
    description="Bias detection, mitigation, and audit-trail generation for ML models.",
    version="0.1.0",
)


# CORS — allow the Next.js frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static files (causal DAG images, etc.)

app.mount("/static", StaticFiles(directory="static"), name="static")


# Routers

app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(fairness.router, prefix="/api", tags=["Fairness"])
app.include_router(audit.router, prefix="/api", tags=["Audit"])
app.include_router(causal.router, prefix="/api", tags=["Causal"])
app.include_router(explain.router, prefix="/api", tags=["Explain"])
app.include_router(stress.router, prefix="/api", tags=["Stress"])
app.include_router(unlearn.router, prefix="/api", tags=["Unlearn"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "sentinel-api"}
