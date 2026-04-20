# Sentinel — Codebase Documentation

> AI Governance Platform for bias detection, mitigation, and audit trail generation.
> Dataset: Adult Census Income (UCI ML Repository)
> Stack: Next.js 15 + FastAPI + Scikit-Learn + AIF360 + Fairlearn + Gemini 2.5 Flash

---

## Project Structure

```
Unbiased-AI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Env config (.env loader)
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── predict.py       # POST /api/predict
│   │   │   ├── fairness.py      # POST /api/fairness
│   │   │   ├── audit.py         # POST /api/audit
│   │   │   └── causal.py        # GET  /api/causal/dag
│   │   └── services/
│   │       ├── model_service.py     # Model loading & inference
│   │       ├── fairness_service.py  # DIR & DPD computation
│   │       └── gemini_service.py    # Gemini 2.5 Flash audit generation
│   ├── train.py                 # Training pipeline (biased + fair models)
│   ├── generate_causal_dag.py   # Static causal DAG PNG generator
│   └── requirements.txt
│
└── frontend/
    └── src/app/
        ├── page.tsx             # Main dashboard page
        ├── layout.tsx           # Root layout + metadata
        ├── globals.css          # Design tokens + animations
        └── components/
            ├── Header.tsx
            ├── MitigationToggle.tsx
            ├── FairnessGauge.tsx
            ├── PredictionForm.tsx
            ├── PredictionResult.tsx
            └── AuditDrawer.tsx
```

---

## Backend

### Entry Point — `app/main.py`

FastAPI application with:
- CORS middleware allowing `http://localhost:3000`
- Static file serving at `/static` (for causal DAG image)
- Four routers mounted under `/api`
- `GET /health` health check endpoint

### Config — `app/config.py`

Loads environment variables from `backend/.env` using `python-dotenv`.

Exports:
- `GEMINI_API_KEY` — required for the audit endpoint
- `MODEL_DIR` — path to `backend/models/`
- `DATA_DIR` — path to `backend/data/`
- `STATIC_DIR` — path to `backend/static/`

### Schemas — `app/schemas.py`

Pydantic models for all request/response contracts:

| Schema | Purpose |
|--------|---------|
| `PredictionRequest` | 13 applicant features + `model_type` (`biased`/`fair`) |
| `PredictionResponse` | `prediction` (0/1), `prediction_label`, `probability`, `model_used` |
| `FairnessRequest` | `sensitive_feature` (default: `sex`), `model_type` |
| `FairnessResponse` | `disparate_impact_ratio`, `demographic_parity_difference`, `is_fair` |
| `AuditRequest` | prediction context + applicant features + optional fairness score |
| `AuditResponse` | `audit_receipt` (markdown), `risk_level`, `model_used` |

---

### Routes

#### `POST /api/predict` — `routes/predict.py`

Accepts a `PredictionRequest`, delegates to `model_service.get_prediction()`.
Returns a `PredictionResponse`.
Raises HTTP 503 if models haven't been trained yet.

#### `POST /api/fairness` — `routes/fairness.py`

Accepts a `FairnessRequest`, delegates to `fairness_service.compute_fairness_metrics()`.
Returns a `FairnessResponse` with DIR and DPD computed over the test set.

#### `POST /api/audit` — `routes/audit.py`

Accepts an `AuditRequest`, delegates to `gemini_service.generate_audit_receipt()`.
Returns a `AuditResponse` with a Gemini-generated markdown audit receipt.

#### `GET /api/causal/dag` — `routes/causal.py`

Returns a JSON object with `dag_image_url` pointing to `/static/causal_dag.png`.
The image is served via FastAPI's `StaticFiles` mount.

---

### Services

#### `services/model_service.py`

Loads serialized `.joblib` artifacts from `models/`:
- `model_biased.joblib` or `model_fair.joblib`
- `label_encoder.joblib` — dict of `LabelEncoder` per categorical column
- `scaler.joblib` — `StandardScaler` for numerical columns

`get_prediction(req)`:
1. Loads the requested model + encoder + scaler
2. Builds a DataFrame from the request
3. Encodes categoricals, scales numericals
4. Runs `model.predict()` and `model.predict_proba()`
5. Returns `PredictionResponse`

Feature columns (must match training order):
- Numerical: `age`, `education_num`, `capital_gain`, `capital_loss`, `hours_per_week`
- Categorical: `workclass`, `education`, `marital_status`, `occupation`, `relationship`, `race`, `sex`, `native_country`

#### `services/fairness_service.py`

`compute_fairness_metrics(req)`:
1. Loads model + test artifacts (`X_test.joblib`, `y_test.joblib`, `sensitive_test.joblib`)
2. Runs predictions on the full test set
3. Computes **Disparate Impact Ratio (DIR)**:
   - Groups predictions by sensitive attribute value
   - `DIR = min(selection_rate) / max(selection_rate)`
   - Fair if `DIR >= 0.8` (EEOC 80% rule)
4. Computes **Demographic Parity Difference (DPD)** via `fairlearn.metrics.demographic_parity_difference`
5. Returns `FairnessResponse`

#### `services/gemini_service.py`

Uses `google-genai` SDK with lazy client initialization (avoids crash when key is missing).

`generate_audit_receipt(req)`:
1. Formats a structured prompt with prediction context, applicant features, and fairness score
2. Calls `gemini-2.5-flash` via `client.models.generate_content()`
3. Determines `risk_level` heuristically:
   - `fair` model → LOW
   - `biased` model + DIR < 0.8 → HIGH
   - otherwise → MEDIUM
4. Returns `AuditResponse` with markdown audit receipt

Prompt sections generated by Gemini:
1. Decision Summary
2. Bias Risk Assessment (LOW / MEDIUM / HIGH)
3. Fairness Analysis
4. Recommendation
5. Compliance Status (EEOC 80% rule)

---

### Training Script — `train.py`

Full pipeline to produce all model artifacts. Run once with `python train.py`.

Steps:
1. Downloads Adult Census dataset from UCI (if not cached at `data/adult.csv`)
2. Cleans data: drops `fnlwgt`, drops NaN rows, binarizes income target (`>50K` → 1)
3. Encodes all categorical columns with `LabelEncoder`, scales numericals with `StandardScaler`
4. 80/20 train/test split (stratified)
5. Trains **Model_Biased**: plain `LogisticRegression` on raw data
6. Trains **Model_Fair**: AIF360 `Reweighing` on `sex` attribute → `LogisticRegression` with computed sample weights
7. Saves artifacts:
   - `models/model_biased.joblib`
   - `models/model_fair.joblib`
   - `models/label_encoder.joblib`
   - `models/scaler.joblib`
   - `data/X_test.joblib`
   - `data/y_test.joblib`
   - `data/sensitive_test.joblib`
8. Prints fairness summary (male/female selection rates + DIR) for both models

AIF360 Reweighing config:
- Privileged group: `sex = Male`
- Unprivileged group: `sex = Female`
- Favorable label: `1` (>50K)

---

### Causal DAG Generator — `generate_causal_dag.py`

Generates a static PNG visualization of the causal graph using `matplotlib`.
Run once with `python generate_causal_dag.py`. Output: `static/causal_dag.png`.

Graph nodes: `Age`, `Education`, `Sex (Sensitive)`, `Race (Sensitive)`, `Occupation`, `Hours/Week`, `Marital Status`, `Income (Outcome)`

Visual encoding:
- Red nodes/edges → sensitive attribute paths (`sex`, `race`)
- Blue node → outcome variable (`Income`)
- Dark nodes → standard features
- Dark background (`#0f172a`) matching the frontend theme

---

## Frontend

### Design System — `globals.css`

CSS custom properties (dark theme by default):

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#030712` | Page background |
| `--foreground` | `#f9fafb` | Primary text |
| `--card` | `#0f172a` | Card backgrounds |
| `--card-border` | `#1e293b` | Card borders |
| `--accent` | `#3b82f6` | Blue accent (buttons, highlights) |
| `--danger` | `#ef4444` | Red (biased model, high risk) |
| `--success` | `#22c55e` | Green (fair model, compliant) |
| `--warning` | `#f59e0b` | Amber (medium risk) |
| `--muted` | `#94a3b8` | Secondary text |

Utility classes:
- `.glass-card` — frosted glass card with `backdrop-filter: blur(12px)`
- `.animate-fade-in` — fade + slide up on mount
- `.animate-slide-in-right` — slide in from right (used by AuditDrawer)
- `.animate-pulse-glow` — pulsing blue glow
- `.shimmer` — loading shimmer effect

Font: Inter (via `next/font/google`), weights 300–800.

---

### Page — `page.tsx`

Main dashboard. All state lives here and is passed down as props.

State:
| State | Type | Purpose |
|-------|------|---------|
| `useFairModel` | `boolean` | Which model is active |
| `prediction` | `PredictionData \| null` | Latest prediction result |
| `fairness` | `FairnessData \| null` | Latest fairness metrics |
| `audit` | `AuditData \| null` | Latest Gemini audit receipt |
| `drawerOpen` | `boolean` | AuditDrawer visibility |
| `lastFeatures` | `Record<string, unknown>` | Form data for audit context |
| `*Loading` | `boolean` | Per-request loading flags |

API calls:
- `handlePredict(formData)` → `POST /api/predict` → sets `prediction`, triggers fairness fetch if not loaded
- `handleToggle()` → flips `useFairModel` → `POST /api/fairness` with new model type
- `handleRequestAudit()` → `POST /api/audit` with prediction + features + fairness score → opens drawer

Layout:
1. `<Header />` — sticky top bar
2. Hero banner — title + description
3. 3-column row: `MitigationToggle` | `FairnessGauge` (DIR) | DPD metric card
4. 2/3 + 1/3 grid: `PredictionForm` | `PredictionResult` + Causal DAG image
5. Footer
6. `AuditDrawer` (conditionally rendered, fixed overlay)

---

### Components

#### `Header.tsx`

Sticky top bar with:
- Sentinel logo (shield SVG) + name + tagline
- Link to `http://localhost:8000/docs` (Swagger UI)
- Green pulsing dot indicating backend connection

#### `MitigationToggle.tsx`

Props: `isActive`, `onToggle`, `loading`

Toggle switch between Biased ↔ Fair model.
- Red when biased, green when fair
- Shows "Governance Layer Enabled" badge with pulse when active
- Disabled during fairness fetch

#### `FairnessGauge.tsx`

Props: `value` (0–1), `label`, `isFair`

SVG circular gauge:
- Animates `stroke-dashoffset` over 1s on value change
- Green + glow when `isFair`, red + glow when not
- Shows percentage in center
- COMPLIANT / NON-COMPLIANT badge below

#### `PredictionForm.tsx`

Props: `onSubmit`, `loading`

13-field form with default values pre-filled (35yo Male, Private, Bachelors, Exec-managerial).

Fields:
- Dropdowns: `workclass`, `education`, `marital_status`, `occupation`, `relationship`, `race`, `sex`
- Number inputs: `age`, `education_num`, `capital_gain`, `capital_loss`, `hours_per_week`
- `race` and `sex` fields are labeled with a red "SENSITIVE" badge

Submits the form data object directly to `onSubmit`.

#### `PredictionResult.tsx`

Props: `prediction`, `predictionLabel`, `probability`, `modelUsed`, `onRequestAudit`, `auditLoading`

Displays:
- Up/down arrow icon (green for >50K, amber for <=50K)
- Prediction label + confidence percentage
- Model badge (Biased/Fair)
- "Generate Audit" button → triggers `onRequestAudit`

#### `AuditDrawer.tsx`

Props: `isOpen`, `onClose`, `auditReceipt`, `riskLevel`, `modelUsed`

Slide-in panel from the right:
- Backdrop overlay with blur
- Header: title, "Generated by Gemini 2.5 Flash", risk level badge (color-coded), close button
- Model badge
- Scrollable content area rendering the raw markdown audit receipt as `whitespace-pre-wrap`
- Footer disclaimer

Risk level colors: HIGH → red, MEDIUM → amber, LOW → green

---

## API Reference

| Method | Path | Request Body | Response |
|--------|------|-------------|----------|
| `GET` | `/health` | — | `{ status, service }` |
| `POST` | `/api/predict` | `PredictionRequest` | `PredictionResponse` |
| `POST` | `/api/fairness` | `FairnessRequest` | `FairnessResponse` |
| `POST` | `/api/audit` | `AuditRequest` | `AuditResponse` |
| `GET` | `/api/causal/dag` | — | `{ dag_image_url, description }` |
| `GET` | `/static/causal_dag.png` | — | PNG image |

---

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Add GEMINI_API_KEY
python train.py                 # One-time: trains models, saves artifacts
python generate_causal_dag.py   # One-time: generates causal_dag.png
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                     # Runs on http://localhost:3000
```

---

## Dependencies

### Backend (`requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.115.12 | API framework |
| `uvicorn[standard]` | 0.34.2 | ASGI server |
| `scikit-learn` | 1.6.1 | Logistic Regression, preprocessing |
| `pandas` | 2.2.3 | Data manipulation |
| `numpy` | 2.2.5 | Numerical ops |
| `fairlearn` | 0.12.0 | Demographic parity metric |
| `aif360` | 0.6.1 | Reweighing bias mitigation |
| `dowhy` | 0.11.1 | Causal inference (DAG) |
| `google-genai` | 1.14.0 | Gemini 2.5 Flash |
| `python-dotenv` | 1.1.0 | `.env` loading |
| `pydantic` | 2.11.1 | Schema validation |
| `joblib` | 1.4.2 | Model serialization |
| `matplotlib` | 3.10.1 | Causal DAG visualization |

### Frontend (`package.json`)

| Package | Purpose |
|---------|---------|
| `next` 15 | React framework (App Router) |
| `react` / `react-dom` | UI library |
| `tailwindcss` | Utility-first CSS |
| `typescript` | Type safety |

---

## Environment Variables

`backend/.env` (copy from `.env.example`):

```
GEMINI_API_KEY=your_gemini_api_key_here
```

The audit endpoint (`/api/audit`) will return HTTP 500 if this key is missing.
