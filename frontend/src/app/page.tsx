"use client";

import { useState, useCallback } from "react";
import Header from "./components/Header";
import PredictionForm from "./components/PredictionForm";
import PredictionResult from "./components/PredictionResult";
import MitigationToggle from "./components/MitigationToggle";
import FairnessGauge from "./components/FairnessGauge";
import AuditDrawer from "./components/AuditDrawer";

const API_BASE = "http://localhost:8000";

interface PredictionData {
  prediction: number;
  prediction_label: string;
  probability: number;
  model_used: string;
}

interface FairnessData {
  disparate_impact_ratio: number;
  demographic_parity_difference: number;
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

  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [fairness, setFairness] = useState<FairnessData | null>(null);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastFeatures, setLastFeatures] = useState<Record<string, unknown>>({});

  const modelType = useFairModel ? "fair" : "biased";

  // Fetch fairness metrics whenever model changes
  const fetchFairness = useCallback(async (model: string) => {
    setFairnessLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/fairness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensitive_feature: "sex", model_type: model }),
      });
      const data = await res.json();
      setFairness(data);
    } catch (err) {
      console.error("Fairness error:", err);
    } finally {
      setFairnessLoading(false);
    }
  }, []);

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
      setPrediction(data);

      // Also fetch fairness
      if (!fairness) {
        fetchFairness(modelType);
      }
    } catch (err) {
      console.error("Prediction error:", err);
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
        }),
      });
      const data = await res.json();
      setAudit(data);
      setDrawerOpen(true);
    } catch (err) {
      console.error("Audit error:", err);
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

        {/* Toggle + Gauges row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MitigationToggle
            isActive={useFairModel}
            onToggle={handleToggle}
            loading={fairnessLoading}
          />

          <div className="glass-card p-6 flex items-center justify-center">
            {fairnessLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span className="text-xs text-muted">Computing metrics...</span>
              </div>
            ) : fairness ? (
              <FairnessGauge
                value={fairness.disparate_impact_ratio}
                label="Disparate Impact Ratio"
                isFair={fairness.is_fair}
              />
            ) : (
              <div className="text-center text-muted text-sm">
                <p className="text-2xl mb-2">📊</p>
                <p>Toggle model or run a prediction<br />to see fairness metrics</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 flex items-center justify-center">
            {fairness ? (
              <div className="text-center space-y-3 animate-fade-in">
                <p className="text-xs text-muted uppercase tracking-wider font-medium">
                  Demographic Parity Diff
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {fairness.demographic_parity_difference.toFixed(4)}
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
                      width: `${Math.min(fairness.demographic_parity_difference * 100 * 2, 100)}%`,
                      background: fairness.demographic_parity_difference < 0.1
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

            {/* Causal DAG preview */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
                </svg>
                Causal DAG
              </h3>
              <p className="text-xs text-muted">
                Shows how sensitive attributes (race, sex) causally influence income predictions.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}/static/causal_dag.png`}
                alt="Causal DAG showing sensitive attribute pathways"
                className="w-full rounded-lg border border-card-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        </section>
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
    </div>
  );
}
