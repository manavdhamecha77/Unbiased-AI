"use client";

import { useState } from "react";

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
    if (!lastFeatures) {
      setError("Please run a prediction first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/stress`, {
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
    <div className="glass-card p-6 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Adversarial Stress Test
          </h3>
          <p className="text-xs text-muted mt-1">Probe model with perturbed inputs (e.g., gender-swap) to ensure decision stability.</p>
        </div>
        <button
          onClick={handleTest}
          disabled={loading || !lastFeatures || Object.keys(lastFeatures).length === 0}
          className="px-4 py-2 bg-danger/10 text-danger text-xs font-semibold rounded hover:bg-danger/20 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Testing..." : "Run Stress Test"}
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {result && (
        <div className="mt-4 bg-card-border/50 p-4 rounded-xl border border-card-border space-y-3 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-card-border">
            <span className="text-sm text-muted">Stability Result</span>
            {result.is_stable ? (
              <span className="px-2 py-1 text-[10px] font-bold bg-success/20 text-success rounded-full">STABLE</span>
            ) : (
              <span className="px-2 py-1 text-[10px] font-bold bg-danger/20 text-danger rounded-full">FAILED</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted uppercase">Original ({result.original_value})</p>
              <p className={`text-lg font-bold ${result.original_prediction.prediction === 1 ? 'text-success' : 'text-danger'}`}>
                {result.original_prediction.prediction_label}
              </p>
            </div>
            <div className="space-y-1 border-l border-card-border pl-4">
              <p className="text-xs text-muted uppercase">Perturbed ({result.perturbed_value})</p>
              <p className={`text-lg font-bold ${result.perturbed_prediction.prediction === 1 ? 'text-success' : 'text-danger'}`}>
                {result.perturbed_prediction.prediction_label}
              </p>
            </div>
          </div>

          {!result.is_stable && (
            <p className="text-xs text-danger/80 mt-2 bg-danger/10 p-2 rounded border border-danger/20">
              Warning: The model altered its decision solely based on flipping {result.perturbed_feature} from {result.original_value} to {result.perturbed_value}. This indicates high bias risk and low adversarial robustness.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
