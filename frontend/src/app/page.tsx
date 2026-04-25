"use client";

import { useState, useCallback, useEffect } from "react";
import PageHeader from "./components/PageHeader";
import PredictionForm from "./components/PredictionForm";
import PredictionResult from "./components/PredictionResult";
import MitigationToggle from "./components/MitigationToggle";
import FairnessGauge from "./components/FairnessGauge";
import Toast from "./components/Toast";
import AuditDrawer from "./components/AuditDrawer";
import PredictionHistory, { type HistoryEntry } from "./components/PredictionHistory";
import ExplainPanel from "./components/ExplainPanel";
import FairnessDriftChart from "./components/FairnessDriftChart";
import StressTestPanel from "./components/StressTestPanel";
import ModelComparison from "./components/ModelComparison";
import UnlearnPanel from "./components/UnlearnPanel";
import { ShieldCheck, Database, LayoutGrid, Info, Activity, Target, Zap, BarChart3 } from "lucide-react";

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
  accuracy: number;
  f1_score: number;
  model_type: string;
  is_fair: boolean;
}

export default function Home() {
  const [useFairModel, setUseFairModel] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [fairnessLoading, setFairnessLoading] = useState(false);

  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [fairness, setFairness] = useState<FairnessData | null>(null);
  const [fairnessRace, setFairnessRace] = useState<FairnessData | null>(null);
  const [prevFairness, setPrevFairness] = useState<FairnessData | null>(null);
  const [prevFairnessRace, setPrevFairnessRace] = useState<FairnessData | null>(null);
  const [lastFeatures, setLastFeatures] = useState<Record<string, unknown>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [auditOpen, setAuditOpen] = useState(false);
  const [auditReceipt, setAuditReceipt] = useState("");
  const [auditRisk, setAuditRisk] = useState("LOW");
  const [auditLoading, setAuditLoading] = useState(false);

  const [compareBiased, setCompareBiased] = useState<FairnessData | null>(null);
  const [compareFair, setCompareFair] = useState<FairnessData | null>(null);

  interface ExplainData { model_type: string; features: string[]; weights: number[]; }
  const [explainBiased, setExplainBiased] = useState<ExplainData | null>(null);
  const [explainFair, setExplainFair] = useState<ExplainData | null>(null);

  const showError = (msg: string) => setToast(msg);

  const modelType = useFairModel ? "fair" : "biased";

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
      showError("Backend unavailable — ensure API is running");
    } finally {
      setFairnessLoading(false);
    }
  }, [fairness, fairnessRace]);

  const fetchAllMetrics = useCallback(async () => {
    try {
      const [b, f] = await Promise.all([
        fetch(`${API_BASE}/api/fairness`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sensitive_feature: "sex", model_type: "biased" }) }).then(r => r.json()),
        fetch(`${API_BASE}/api/fairness`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sensitive_feature: "sex", model_type: "fair" }) }).then(r => r.json()),
      ]);
      setCompareBiased(b);
      setCompareFair(f);
    } catch {}

    try {
      const [b, f] = await Promise.all([
        fetch(`${API_BASE}/api/explain?model_type=biased`).then(r => r.json()),
        fetch(`${API_BASE}/api/explain?model_type=fair`).then(r => r.json()),
      ]);
      setExplainBiased(b);
      setExplainFair(f);
    } catch {}
  }, []);

  useEffect(() => {
    fetchFairness("biased");
    fetchAllMetrics();
  }, []);

  const handleUnlearnComplete = async () => {
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
      setHistory(prev => [{
        id: prev.length + 1,
        model: data.model_used,
        outcome: data.prediction_label,
        confidence: data.probability,
        sex: String(formData.sex ?? ""),
        race: String(formData.race ?? ""),
        age: Number(formData.age ?? 0),
        occupation: String(formData.occupation ?? ""),
      }, ...prev]);

      if (!fairness) fetchFairness(modelType);
    } catch {
      showError("Prediction failed — check backend connection");
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRequestAudit = async () => {
    if (!prediction) { showError("No prediction to audit"); return; }
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction: prediction.prediction,
          probability: prediction.probability,
          model_used: modelType,
          applicant_features: lastFeatures,
          fairness_score: fairness?.disparate_impact_ratio,
          regulatory_framework: "EU AI Act"
        }),
      });
      const data = await res.json();
      setAuditReceipt(data.audit_receipt);
      setAuditRisk(data.risk_level);
      setAuditOpen(true);
    } catch {
      showError("Failed to generate Gemini audit");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      <PageHeader 
        title="Sentinel AI Governance" 
        subtitle="Real-time Bias Mitigation & Monitoring Dashboard"
      />

      <main className="flex-1 overflow-y-auto p-8 space-y-12 bg-background/50">
        
        {/* SECTION 1: GLOBAL GOVERNANCE OVERVIEW */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <LayoutGrid size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-foreground">Governance Overview</h2>
                <p className="text-xs text-muted">Core fairness metrics and mitigation status</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MitigationToggle
              isActive={useFairModel}
              onToggle={handleToggle}
              loading={fairnessLoading}
            />
            
            <div className="glass-card p-6 flex flex-col items-center justify-center relative group">
              <FairnessGauge
                value={fairness?.disparate_impact_ratio ?? 0}
                label="DIR — Sex"
                isFair={fairness?.is_fair ?? false}
                prevValue={prevFairness?.disparate_impact_ratio}
              />
            </div>

            <div className="glass-card p-6 flex flex-col items-center justify-center relative group">
              <FairnessGauge
                value={fairnessRace?.disparate_impact_ratio ?? 0}
                label="DIR — Race"
                isFair={fairnessRace?.is_fair ?? false}
                prevValue={prevFairnessRace?.disparate_impact_ratio}
              />
            </div>

            <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative group">
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-2">
                Demographic Parity Diff
              </p>
              <p className="text-3xl font-bold text-foreground">
                {(fairness?.demographic_parity_difference ?? 0).toFixed(4)}
              </p>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-1000 shadow-[0_0_8px_var(--accent)]"
                  style={{ width: `${Math.min((fairness?.demographic_parity_difference ?? 0) * 100 * 2, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PREDICTION WORKSPACE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Database size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-foreground">Prediction Workspace</h2>
                <p className="text-xs text-muted">Sequential analysis flow: Entry → Importance → Outcome</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {/* 1. Form */}
            <div className="glass-card p-8 border-l-4 border-accent h-full">
               <PredictionForm onSubmit={handlePredict} loading={predictionLoading} />
            </div>

            {/* 2. Feature Importance */}
            <ExplainPanel
              biased={explainBiased}
              fair={useFairModel ? explainFair : null}
            />

            {/* 3. Prediction Result */}
            <div className="glass-card p-8 flex flex-col items-center justify-center bg-accent/5 h-full min-h-[400px]">
              {prediction ? (
                <PredictionResult
                  prediction={prediction.prediction}
                  predictionLabel={prediction.prediction_label}
                  probability={prediction.probability}
                  modelUsed={prediction.model_used}
                  onRequestAudit={handleRequestAudit}
                />
              ) : (
                <div className="text-center py-12">
                  <Zap size={32} className="text-muted/30 mx-auto mb-4 animate-pulse" />
                  <h4 className="text-foreground font-medium mb-1">Awaiting Prediction</h4>
                  <p className="text-xs text-muted max-w-[200px] mx-auto">Submit applicant data to see outcomes and bias risk.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="glass-card p-8">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-6">Performance & Bias Benchmarking</h3>
              <ModelComparison biasedData={compareBiased} fairData={compareFair} />
            </div>
          </div>
        </section>

        {/* SECTION 3: ROBUSTNESS & BIAS MITIGATION */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Activity size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-foreground">Robustness & Mitigation</h2>
                <p className="text-xs text-muted">Adversarial stress testing and demographic pattern erasure</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <StressTestPanel
                lastFeatures={lastFeatures}
                modelUsed={modelType}
              />
              <UnlearnPanel
                modelUsed={modelType}
                onUnlearnComplete={handleUnlearnComplete}
              />
          </div>
        </section>

        {/* SECTION 4: REAL-TIME FAIRNESS MONITORING */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <BarChart3 size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-foreground">Real-time Fairness Monitor</h2>
                <p className="text-xs text-muted">Tracking Disparate Impact Ratio across sessions</p>
             </div>
          </div>
          <div className="glass-card p-8 h-[400px]">
             <FairnessDriftChart
              currentDir={fairness?.disparate_impact_ratio ?? null}
              isFairModel={useFairModel}
              historyTrigger={history.length}
            />
          </div>
        </section>

        {/* SECTION 5: LOGS & HISTORY */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <ShieldCheck size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-foreground">Prediction Records</h2>
                <p className="text-xs text-muted">Historical audit trail of all gateway interactions</p>
             </div>
          </div>
          <div className="glass-card overflow-hidden">
             <PredictionHistory entries={history} />
          </div>
        </section>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <AuditDrawer
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
        auditReceipt={auditReceipt}
        riskLevel={auditRisk}
        modelUsed={modelType}
      />

      {auditLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] flex items-center justify-center">
           <div className="glass-card p-8 flex flex-col items-center gap-4 border-accent/20">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-foreground">Gemini is analyzing decision ethics...</p>
           </div>
        </div>
      )}
    </div>
  );
}



