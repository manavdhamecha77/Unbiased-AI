"use client";

import { useState } from "react";

interface UnlearnPanelProps {
  modelUsed: string;
  onUnlearnComplete: () => void;
}

export default function UnlearnPanel({ modelUsed, onUnlearnComplete }: UnlearnPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ original_accuracy: number; new_accuracy: number; original_dir: number; new_dir: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnlearn = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("http://localhost:8000/api/unlearn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_type: modelUsed,
          feature: "sex",
          value: "Female",
          learning_rate: 0.5,
          epochs: 50
        }),
      });
      const data = await res.json();
      if (data.detail) {
        setError(data.detail);
      } else {
        setResult(data);
        onUnlearnComplete();
      }
    } catch (e) {
      setError("Failed to execute unlearning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Machine Unlearning
        </h3>
        <p className="text-sm text-muted mt-1">
          Gradient Ascent on the "Female" subset to force the model to forget specific demographic patterns.
        </p>
      </div>

      <button
        onClick={handleUnlearn}
        disabled={loading}
        className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        {loading ? "Unlearning..." : `Unlearn "Female" from ${modelUsed} model`}
      </button>

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-black/20 border border-card-border space-y-2 animate-fade-in">
          <p className="text-sm text-success font-medium">✓ Unlearning Complete</p>
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div>
              <span className="text-muted block text-xs uppercase tracking-wide">Accuracy</span>
              <span className="text-foreground font-mono">{result.original_accuracy.toFixed(3)} → {result.new_accuracy.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted block text-xs uppercase tracking-wide">Fairness (DIR)</span>
              <span className="text-foreground font-mono">{result.original_dir.toFixed(3)} → {result.new_dir.toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
