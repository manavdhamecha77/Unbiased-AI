"use client";

import { useState } from "react";
import { Eraser, RotateCcw, ZapOff } from "lucide-react";

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
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Knowledge Erasure</h3>
          <h4 className="text-sm font-bold text-foreground">Machine Unlearning</h4>
        </div>
        <div className="p-2 rounded-lg bg-warning/10 text-warning border border-warning/20">
           <ZapOff size={16} />
        </div>
      </div>

      <p className="text-[11px] text-muted leading-relaxed mb-4">
        Apply gradient ascent to strip biased demographic patterns from the active model.
      </p>

      <button
        onClick={handleUnlearn}
        disabled={loading}
        className="mt-auto w-full py-2.5 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-30 cursor-pointer"
      >
        {loading ? (
            <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
            <>
                <Eraser size={14} />
                Unlearn "Female" Patterns
            </>
        )}
      </button>

      {error && <p className="text-[10px] text-danger mt-2 bg-danger/5 p-2 rounded">{error}</p>}
      
      {result && (
        <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/10 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-success text-[10px] font-bold">
            <RotateCcw size={12} /> SYNCED SUCCESS
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted block text-[9px] uppercase font-bold tracking-wider mb-1">Accuracy</span>
              <span className="text-foreground text-xs font-mono">{result.original_accuracy.toFixed(2)} → {result.new_accuracy.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase font-bold tracking-wider mb-1">Fairness</span>
              <span className="text-foreground text-xs font-mono">{result.original_dir.toFixed(2)} → {result.new_dir.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

