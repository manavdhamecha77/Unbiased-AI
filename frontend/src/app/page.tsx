"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import PredictionForm from "./components/PredictionForm";
import PredictionResult from "./components/PredictionResult";
import MitigationToggle from "./components/MitigationToggle";
import FairnessGauge from "./components/FairnessGauge";
import AuditDrawer from "./components/AuditDrawer";
import Toast from "./components/Toast";
import DagModal from "./components/DagModal";
import PredictionHistory, { type HistoryEntry } from "./components/PredictionHistory";
import ExplainPanel from "./components/ExplainPanel";
import RegulatoryToggle from "./components/RegulatoryToggle";
import FairnessDriftChart from "./components/FairnessDriftChart";
import StressTestPanel from "./components/StressTestPanel";
import ModelComparison from "./components/ModelComparison";
import UnlearnPanel from "./components/UnlearnPanel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PredictionData {
  prediction: number;
  prediction_label: string;
  probability: number;
  model_used: string;
}

interface FairnessData {
  disparate_impact_ratio: number;
  demographic_parity_difference: number;
  accuracy: number;
  f1_score: number;
  model_type: string;
  is_fair: boolean;
}

interface AuditData {
  audit_receipt: string;
  risk_level: string;
  model_used: string;
}

export default function Home() {
  const [useFairModel, setUseFairModel] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [fairnessLoading, setFairnessLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  const [regulatoryFramework, setRegulatoryFramework] = useState("EU AI Act");
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [fairness, setFairness] = useState<FairnessData | null>(null);
  const [fairnessRace, setFairnessRace] = useState<FairnessData | null>(null);
  const [prevFairness, setPrevFairness] = useState<FairnessData | null>(null);
  const [prevFairnessRace, setPrevFairnessRace] = useState<FairnessData | null>(null);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dagModalOpen, setDagModalOpen] = useState(false);
  const [lastFeatures, setLastFeatures] = useState<Record<string, unknown>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [compareBiased, setCompareBiased] = useState<FairnessData | null>(null);
  const [compareFair, setCompareFair] = useState<FairnessData | null>(null);

  interface ExplainData { model_type: string; features: string[]; weights: number[]; }
  const [explainBiased, setExplainBiased] = useState<ExplainData | null>(null);
  const [explainFair, setExplainFair] = useState<ExplainData | null>(null);

  const showError = (msg: string) => setToast(msg);

  const modelType = useFairModel ? "fair" : "biased";

  // Fetch fairness metrics whenever model changes
  const fetchFairness = useCallback(async (model: string) => {
    setFairnessLoading(true);
    try {
      const [sexRes, raceRes] = await Promise.all([
        fetch(`${API_BASE}/api/fairness`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensitive_feature: "sex", model_type: model }),
        }),
        fetch(`${API_BASE}/api/fairness`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensitive_feature: "race", model_type: model }),
        }),
      ]);
      const [sexData, raceData] = await Promise.all([sexRes.json(), raceRes.json()]);
      setPrevFairness(fairness);
      setPrevFairnessRace(fairnessRace);
      setFairness(sexData);
      setFairnessRace(raceData);
    } catch {
      showError("Backend unavailable — run: uvicorn app.main:app --reload --port 8000");
    } finally {
      setFairnessLoading(false);
    }
  }, []);

  // Abstracting comparison fetch to reuse after unlearning
  const fetchAllMetrics = useCallback(async () => {
    Promise.all([
      fetch(`${API_BASE}/api/fairness`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sensitive_feature: "sex", model_type: "biased" }) }).then(r => r.json()),
      fetch(`${API_BASE}/api/fairness`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sensitive_feature: "sex", model_type: "fair" }) }).then(r => r.json()),
    ]).then(([b, f]) => { setCompareBiased(b); setCompareFair(f); }).catch(() => {});

    Promise.all([
      fetch(`${API_BASE}/api/explain?model_type=biased`).then(r => r.json()),
      fetch(`${API_BASE}/api/explain?model_type=fair`).then(r => r.json()),
    ]).then(([b, f]) => { setExplainBiased(b); setExplainFair(f); }).catch(() => {});
  }, []);

  // Fetch biased model fairness on mount so the dashboard isn't blank
  useEffect(() => {
    fetchFairness("biased");
    fetchAllMetrics();
  }, [fetchFairness, fetchAllMetrics]);

  const handleUnlearnComplete = async () => {
    // Re-fetch all metrics so gauges and charts update
    await fetchFairness(modelType);
    await fetchAllMetrics();
  };

  const handleToggle = async () => {
    const newModel = !useFairModel;
    setUseFairModel(newModel);
    await fetchFairness(newModel ? "fair" : "biased");
  };

  const handlePredict = async (formData: Record<string, unknown>) => {
    setPredictionLoading(true);
    setLastFeatures(formData);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, model_type: modelType }),
      });
      const data = await res.json();
      if (data.detail) { showError(`Prediction failed: ${data.detail}`); return; }
      setPrediction(data);
      setHistory(prev => [...prev, {
        id: prev.length + 1,
        model: data.model_used,
        outcome: data.prediction_label,
        confidence: data.probability,
        sex: String(formData.sex ?? ""),
        race: String(formData.race ?? ""),
        age: Number(formData.age ?? 0),
        occupation: String(formData.occupation ?? ""),
      }]);

      // Also fetch fairness
      if (!fairness) {
        fetchFairness(modelType);
      }
    } catch {
      showError("Backend unavailable — run: uvicorn app.main:app --reload --port 8000");
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRequestAudit = async () => {
    if (!prediction) return;
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction: prediction.prediction,
          probability: prediction.probability,
          model_used: prediction.model_used,
          applicant_features: lastFeatures,
          fairness_score: fairness?.disparate_impact_ratio ?? null,
          regulatory_framework: regulatoryFramework,
        }),
      });
      const data = await res.json();
      if (data.detail) { showError(`Audit failed: ${data.detail}`); return; }
      setAudit(data);
      setDrawerOpen(true);
    } catch {
      showError("Audit unavailable — check your GEMINI_API_KEY in backend/.env");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero banner */}
        <section className="text-center space-y-3 py-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-foreground">Trustworthy AI </span>
            <span className="text-accent">Governance</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Detect bias in ML predictions, apply real-time mitigation with AIF360 Reweighing,
            and generate Gemini-powered audit trails — all in one dashboard.
          </p>
        </section>

        {/* Regulatory Engine */}
        <section className="flex justify-center">
          <div className="w-full max-w-3xl">
            <RegulatoryToggle value={regulatoryFramework} onChange={setRegulatoryFramework} />
          </div>
        </section>

        {/* Toggle + Gauges row */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MitigationToggle
            isActive={useFairModel}
            onToggle={handleToggle}
            loading={fairnessLoading}
          />

          {/* Sex DIR gauge */}
          <div className="glass-card p-6 flex items-center justify-center">
            {fairnessLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full shimmer bg-card-border" />
                <div className="w-20 h-3 rounded shimmer bg-card-border" />
                <div className="w-24 h-5 rounded-full shimmer bg-card-border" />
              </div>
            ) : fairness ? (
              <FairnessGauge
                value={fairness.disparate_impact_ratio ?? 0}
                label="DIR — Sex"
                isFair={fairness.is_fair}
                prevValue={prevFairness?.disparate_impact_ratio}
              />
            ) : (
              <div className="text-center text-muted text-sm">
                <p className="text-2xl mb-2">♀♂</p>
                <p>Sex fairness will<br />appear here</p>
              </div>
            )}
          </div>

          {/* Race DIR gauge */}
          <div className="glass-card p-6 flex items-center justify-center">
            {fairnessLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full shimmer bg-card-border" />
                <div className="w-20 h-3 rounded shimmer bg-card-border" />
                <div className="w-24 h-5 rounded-full shimmer bg-card-border" />
              </div>
            ) : fairnessRace ? (
              <FairnessGauge
                value={fairnessRace.disparate_impact_ratio ?? 0}
                label="DIR — Race"
                isFair={fairnessRace.is_fair}
                prevValue={prevFairnessRace?.disparate_impact_ratio}
              />
            ) : (
              <div className="text-center text-muted text-sm">
                <p className="text-2xl mb-2">📊</p>
                <p>Race fairness will<br />appear here</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 flex items-center justify-center">
            {fairnessLoading ? (
              <div className="w-full space-y-3">
                <div className="w-32 h-3 rounded shimmer bg-card-border mx-auto" />
                <div className="w-24 h-10 rounded shimmer bg-card-border mx-auto" />
                <div className="w-full h-2 rounded-full shimmer bg-card-border" />
              </div>
            ) : fairness ? (
              <div className="text-center space-y-3 animate-fade-in">
                <p className="text-xs text-muted uppercase tracking-wider font-medium">
                  Demographic Parity Diff
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {(fairness.demographic_parity_difference ?? 0).toFixed(4)}
                </p>
                <p className="text-xs text-muted">
                  Lower is better · Measures prediction rate gap between groups
                </p>
                <div
                  className="h-2 rounded-full mt-2 overflow-hidden"
                  style={{ background: "var(--card-border)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((fairness.demographic_parity_difference ?? 0) * 100 * 2, 100)}%`,
                      background: (fairness.demographic_parity_difference ?? 0) < 0.1
                        ? "var(--success)"
                        : fairness.demographic_parity_difference < 0.3
                        ? "var(--warning)"
                        : "var(--danger)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted text-sm">
                <p className="text-2xl mb-2">⚖️</p>
                <p>Demographic parity will<br />appear here</p>
              </div>
            )}
          </div>
        </section>

        {/* Prediction form + result */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PredictionForm onSubmit={handlePredict} loading={predictionLoading} />
          </div>

          <div className="space-y-6">
            {prediction ? (
              <PredictionResult
                prediction={prediction.prediction}
                predictionLabel={prediction.prediction_label}
                probability={prediction.probability}
                modelUsed={prediction.model_used}
                onRequestAudit={handleRequestAudit}
                auditLoading={auditLoading}
              />
            ) : (
              <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[200px] text-center text-muted text-sm">
                <p className="text-3xl mb-3">🔮</p>
                <p className="font-medium text-foreground mb-1">No prediction yet</p>
                <p>Fill in the applicant data and click &quot;Run Prediction&quot;</p>
              </div>
            )}

            <ExplainPanel
              biased={explainBiased}
              fair={useFairModel ? explainFair : null}
            />

            <StressTestPanel
              lastFeatures={lastFeatures}
              modelUsed={modelType}
            />

            <UnlearnPanel
              modelUsed={modelType}
              onUnlearnComplete={handleUnlearnComplete}
            />

            {/* Causal DAG — click to expand */}
            <button
              onClick={() => setDagModalOpen(true)}
              className="glass-card p-4 space-y-2 w-full text-left group hover:border-accent/50 transition-colors cursor-pointer"
            >
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
                </svg>
                Causal DAG
                <span className="ml-auto text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">click to expand ↗</span>
              </h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}/static/causal_dag.png`}
                alt="Causal DAG"
                className="w-full rounded-lg border border-card-border opacity-80 group-hover:opacity-100 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </button>
          </div>
        </section>

        {/* Analytics: Model Comparison and Drift */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <ModelComparison biasedData={compareBiased} fairData={compareFair} />
          <FairnessDriftChart
            currentDir={fairness?.disparate_impact_ratio ?? null}
            isFairModel={useFairModel}
            historyTrigger={history.length}
          />
        </section>

        {/* Prediction History */}
        <PredictionHistory entries={history} />
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-6 text-center text-xs text-muted">
        <p>
          Sentinel AI Governance Platform · Built with Next.js, FastAPI, AIF360, and Gemini 2.5 Flash
        </p>
      </footer>

      {/* Audit Drawer */}
      {audit && (
        <AuditDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          auditReceipt={audit.audit_receipt}
          riskLevel={audit.risk_level}
          modelUsed={audit.model_used}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* DAG Modal */}
      <DagModal
        isOpen={dagModalOpen}
        onClose={() => setDagModalOpen(false)}
        imageUrl={`${API_BASE}/static/causal_dag.png`}
      />
    </div>
  );
}
