"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { API_BASE } from "../../lib/api";

interface StressTestPanelProps {
  lastFeatures: Record<string, unknown> | null;
  modelUsed: string;
}

export default function StressTestPanel({ lastFeatures, modelUsed }: StressTestPanelProps) {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!lastFeatures || Object.keys(lastFeatures).length === 0) {
      setError("Run a prediction first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lastFeatures, model_type: modelUsed }),
      });
      const data = await res.json();
      if (data.detail) throw new Error(data.detail);
      setResult(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Robustness Probe</h3>
          <h4 className="text-sm font-bold text-foreground">Stress Testing</h4>
        </div>
        <button
          onClick={handleTest}
          disabled={loading || !lastFeatures || Object.keys(lastFeatures).length === 0}
          className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-danger/20"
          title="Run Adversarial Test"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldAlert size={16} />
          )}
        </button>
      </div>

      <p className="text-[11px] text-muted leading-relaxed mb-4">
        Probe model stability with gender-swapped inputs.
      </p>

      {error && <p className="text-[10px] text-danger bg-danger/5 p-2 rounded border border-danger/10">{error}</p>}

      {!result && !error && (
        <div className="mt-auto pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted italic">Click icon to probe current features</p>
        </div>
      )}

      {result && (
        <div className="mt-auto space-y-4 animate-fade-in">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[10px] text-muted font-bold uppercase">Stability</span>
            {result.is_stable ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                <CheckCircle size={12} /> STABLE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-danger">
                <AlertTriangle size={12} /> BIASED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-white/5">
              <p className="text-[9px] text-muted uppercase font-bold mb-1">Orig ({result.original_value})</p>
              <p className={`text-xs font-bold ${result.original_prediction.prediction === 1 ? 'text-success' : 'text-danger'}`}>
                {result.original_prediction.prediction_label}
              </p>
            </div>
            <div className="p-2 rounded bg-white/5">
              <p className="text-[9px] text-muted uppercase font-bold mb-1">Swap ({result.perturbed_value})</p>
              <p className={`text-xs font-bold ${result.perturbed_prediction.prediction === 1 ? 'text-success' : 'text-danger'}`}>
                {result.perturbed_prediction.prediction_label}
              </p>
            </div>
          </div>

          {!result.is_stable && (
            <div className="p-2 rounded bg-danger/10 border border-danger/20">
              <p className="text-[9px] text-danger leading-tight">
                Decision flipped on {result.perturbed_feature} swap.
                <strong className="block mt-1">Vulnerability Detected.</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

