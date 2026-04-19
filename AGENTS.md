# AGENTS.md — Sentinel AI Governance Platform

> **Project Codename:** Sentinel
> **Tagline:** Trustworthy, Explainable, and Compliant AI Governance for Enterprise.
> **Dataset:** Adult Census Income (UCI ML Repository)
> **Stack:** Next.js (Frontend) + FastAPI (Backend) + Scikit-Learn + AIF360 + Fairlearn + Gemini 2.5 Flash + DoWhy

---

## 🏗️ Project Structure

```
Unbiased-AI/
├── AGENTS.md                    # This file — agentic reference
├── README.md                    # Project overview
│
├── backend/                     # FastAPI backend (Python 3.10+)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment config (loads .env)
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── predict.py       # POST /api/predict
│   │   │   ├── fairness.py      # POST /api/fairness
│   │   │   ├── audit.py         # POST /api/audit
│   │   │   └── causal.py        # GET  /api/causal/dag
│   │   └── services/
│   │       ├── model_service.py     # Model loading & inference
│   │       ├── fairness_service.py  # Disparate Impact & Demographic Parity
│   │       └── gemini_service.py    # Gemini 2.5 Flash audit receipt generation
│   ├── train.py                 # Training script (biased + fair models)
│   ├── generate_causal_dag.py   # DoWhy causal DAG visualization
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variable template
│   ├── models/                  # Serialized models (.joblib)
│   ├── data/                    # Dataset + test splits
│   └── static/                  # Static assets (causal_dag.png)
│
└── frontend/                    # Next.js 15 app (TypeScript + Tailwind)
    ├── AGENTS.md                # Next.js specific agent rules
    ├── src/
    │   └── app/                 # App Router pages & components
    ├── public/                  # Static frontend assets
    ├── package.json
    └── tsconfig.json
```

---

## 🎯 MVP Components

| Component | Description | Status |
|-----------|-------------|--------|
| **Prediction UI** | Form where user inputs dummy applicant data | 🔲 TODO |
| **Governance View** | Toggle switching API between Biased → Fair model | 🔲 TODO |
| **Live Fairness Metric** | Gauge showing Disparate Impact Ratio improving | 🔲 TODO |
| **Audit Receipt Drawer** | Gemini-generated explanation in a slide-out panel | 🔲 TODO |
| **Causal DAG** | Static image showing sensitive attribute pathways | 🔲 TODO |

---

## 📅 3-Day Roadmap

### Day 1: The Foundation (Data & Model)
- [x] Initialize Next.js frontend + FastAPI backend
- [ ] Download and preprocess Adult Census dataset
- [ ] Train `Model_Biased` (raw Logistic Regression)
- [ ] Train `Model_Fair` (AIF360 Reweighing + Logistic Regression)
- [ ] Implement `/api/predict` endpoint serving both models
- [ ] Test predictions end-to-end

### Day 2: The Governance Logic (Gemini & Audit)
- [ ] Implement Fairness Calculator (`/api/fairness`)
  - Disparate Impact Ratio (80% rule)
  - Demographic Parity Difference
- [ ] Integrate Gemini 2.5 Flash (`/api/audit`)
  - Audit Receipt prompt engineering
  - Risk level classification
- [ ] Generate Causal DAG with DoWhy/matplotlib (`/api/causal/dag`)
- [ ] Test all endpoints via Swagger UI

### Day 3: The UI & Polish (The "Wow" Factor)
- [ ] Build the Prediction Form (applicant data input)
- [ ] Build the Mitigation Toggle (Biased ↔ Fair switch)
- [ ] Build the Fairness Gauge (real-time DIR visualization)
- [ ] Build the Audit Receipt Drawer (Gemini explanation)
- [ ] Add Causal DAG modal/section
- [ ] Polish UI: animations, dark theme, micro-interactions
- [ ] Record Demo Video

---

## 🔑 Key Design Decisions

### Why Adult Census over COMPAS?
- Larger dataset (48,842 rows) → more dramatic fairness gaps
- Well-understood features → easier to explain in 2-minute demo
- Clear sensitive attributes (sex, race) → clean narrative

### Why AIF360 Reweighing over Adversarial Debiasing?
- **Instant convergence** — no neural network training needed
- **Mathematically sound** — assigns sample weights based on group distributions
- **Easy to explain** — "We reweight underrepresented groups so the model treats them fairly"
- **Deterministic** — same results every time, no convergence issues

### Why Static Causal DAG?
- Real-time causal inference is computationally expensive
- Pre-computed PNG is sufficient for the demo
- Focus time on the frontend UI instead

### Model Architecture
- **Logistic Regression** — simple, interpretable, fast
- Both models share the same feature encoding/scaling pipeline
- The only difference: `Model_Fair` uses AIF360-computed sample weights during training

---

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Set up virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train models (run once)
python train.py

# Generate causal DAG (run once)
python generate_causal_dag.py

# Start API server
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend

# Install dependencies (already done by create-next-app)
npm install

# Start dev server
npm run dev
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/predict` | Returns prediction from biased or fair model |
| `POST` | `/api/fairness` | Computes DIR and DPD for the selected model |
| `POST` | `/api/audit` | Generates Gemini audit receipt |
| `GET`  | `/api/causal/dag` | Returns causal DAG image URL |
| `GET`  | `/health` | Health check |

---

## 🎬 Demo Narrative (2-Minute Video)

1. **The Hook:** "Traditional AI models operate as black boxes, often hiding discriminatory logic behind accuracy metrics."
2. **The Demo:** "Here is our income prediction model. It currently has a Disparate Impact Ratio of ~0.35 — meaning it disproportionately predicts low income for women."
3. **The Intervention:** "By clicking 'Activate Sentinel,' our Governance Layer applies AIF360 Reweighing in real-time."
4. **The Result:** "Fairness score is now within 0.95 of parity, and Gemini has generated an audit trail explaining the fairness logic."
5. **The Pitch:** "Sentinel: Trustworthy, Explainable, and Compliant AI Governance for Enterprise."

---

## ⚠️ Critical Rules for Agents

1. **Do NOT over-engineer the backend.** Keep the code modular but simple.
2. **Focus 60% of time on Frontend UI** — that's what the jury judges.
3. **Use Tailwind CSS** for styling (already initialized with the project).
4. **Dark mode by default** — premium, sleek, professional aesthetic.
5. **All API calls go through `http://localhost:8000`** from the frontend.
6. **Sensitive attributes are `sex` and `race`** — always use these for fairness calculations.
7. **The 80% rule**: Disparate Impact Ratio ≥ 0.8 = FAIR, < 0.8 = UNFAIR.
8. **Never commit `.env` files** — only `.env.example`.
9. **Pre-compute the Causal DAG** — don't try to run DoWhy in real-time.
10. **GEMINI_API_KEY must be set in `backend/.env`** before the audit endpoint works.

---

## 📦 Key Dependencies

### Backend (Python)
| Package | Purpose |
|---------|---------|
| `fastapi` | API framework |
| `scikit-learn` | Logistic Regression models |
| `aif360` | Reweighing algorithm for bias mitigation |
| `fairlearn` | Demographic parity metric computation |
| `google-genai` | Gemini 2.5 Flash integration |
| `dowhy` | Causal inference (DAG generation) |
| `joblib` | Model serialization |
| `pandas` / `numpy` | Data processing |

### Frontend (TypeScript)
| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router) |
| `tailwindcss` | Utility-first CSS |
| React state | Model toggle & real-time metrics |
