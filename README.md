# 🛡️ Sentinel — AI Governance Platform

> **Trustworthy, Explainable, and Compliant AI Governance for Enterprise.**

Sentinel is a full-stack platform that detects, mitigates, and audits bias in machine learning models. It demonstrates how a simple Logistic Regression model trained on the [Adult Census Income](https://archive.ics.uci.edu/ml/datasets/adult) dataset can produce discriminatory outcomes  and how fairness interventions fix them in real-time.

---

## 🎯 What It Does

| Feature                        | Description                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| **Prediction UI**        | Input applicant data and get income predictions from biased or fair models                   |
| **Mitigation Toggle**    | Switch between the raw (biased) model and the AIF360 reweighed (fair) model                  |
| **Live Fairness Gauge**  | See the Disparate Impact Ratio improve from ~0.35 → ~0.95 in real-time                      |
| **Gemini Audit Receipt** | AI-generated compliance report explaining why a decision was fair or unfair                  |
| **Causal DAG**           | Pre-computed causal graph showing how sensitive attributes (sex, race) influence predictions |

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌─────────────────────────────────┐
│   Next.js Frontend  │  HTTP   │       FastAPI Backend           │
│   (TypeScript +     │ ◄─────► │                                 │
│    Tailwind CSS)    │         │  POST /api/predict    → Model   │
│                     │         │  POST /api/fairness   → Metrics │
│  • Prediction Form  │         │  POST /api/audit      → Gemini  │
│  • Fairness Gauge   │         │  GET  /api/causal/dag → DAG     │
│  • Audit Drawer     │         │                                 │
│  • Mitigation Toggle│         │  Models: Logistic Regression    │
└─────────────────────┘         │  Fairness: AIF360 Reweighing   │
                                │  Audit: Gemini 2.5 Flash          │
                                └─────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/apikey) (for the audit endpoint)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train both models (downloads dataset automatically)
python train.py

# Generate causal DAG visualization
python generate_causal_dag.py

# Set up environment variables
cp .env.example .env
# Edit .env → add your GEMINI_API_KEY

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the frontend calls the backend at `http://localhost:8000`.

---

## 📡 API Endpoints

| Method   | Path                | Description                                                     |
| -------- | ------------------- | --------------------------------------------------------------- |
| `POST` | `/api/predict`    | Returns prediction from biased or fair model                    |
| `POST` | `/api/fairness`   | Computes Disparate Impact Ratio & Demographic Parity Difference |
| `POST` | `/api/audit`      | Generates a Gemini-powered audit receipt                        |
| `GET`  | `/api/causal/dag` | Returns the pre-computed causal DAG image URL                   |
| `GET`  | `/health`         | Health check                                                    |

---

## 🔬 How Fairness Mitigation Works

### The Problem

A Logistic Regression model trained on raw Adult Census data has a **Disparate Impact Ratio of ~0.35** for the `sex` attribute — meaning women are disproportionately predicted to earn ≤50K. This violates the **EEOC 80% rule** (DIR must be ≥ 0.8).

### The Solution

[AIF360&#39;s Reweighing](https://aif360.readthedocs.io/) algorithm computes sample weights that compensate for group imbalances:

1. Calculate the expected proportion of positive outcomes for each group
2. Assign higher weights to underrepresented positive cases
3. Retrain the model with these weights

The result: **DIR improves to ~0.95** while maintaining comparable accuracy.

---

## 🛠️ Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Frontend         | Next.js 15 · TypeScript · Tailwind CSS |
| Backend          | FastAPI · Python 3.10+                  |
| ML Models        | Scikit-Learn (Logistic Regression)       |
| Bias Mitigation  | AIF360 (Reweighing)                      |
| Fairness Metrics | Fairlearn                                |
| Explainability   | Gemini 2.5 Flash                           |
| Causal Analysis  | DoWhy · Matplotlib                      |
| Serialization    | Joblib                                   |

---

## 📁 Project Structure

```
Unbiased-AI/
├── AGENTS.md                        # Agentic reference & roadmap
├── README.md                        # This file
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── config.py                # Environment config
│   │   ├── schemas.py               # Pydantic models
│   │   ├── routes/                  # API route handlers
│   │   │   ├── predict.py
│   │   │   ├── fairness.py
│   │   │   ├── audit.py
│   │   │   └── causal.py
│   │   └── services/                # Business logic
│   │       ├── model_service.py
│   │       ├── fairness_service.py
│   │       └── gemini_service.py
│   ├── train.py                     # Model training pipeline
│   ├── generate_causal_dag.py       # Causal DAG generator
│   └── requirements.txt
└── frontend/                        # Next.js 15 app
    └── src/app/                     # App Router
```

---

## 📄 License

MIT
