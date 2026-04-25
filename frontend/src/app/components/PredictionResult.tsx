"use client";

import { ShieldCheck } from "lucide-react";

interface PredictionResultProps {
  prediction: number;
  predictionLabel: string;
  probability: number;
  modelUsed: string;
  onRequestAudit: () => void;
  auditLoading: boolean;
}

export default function PredictionResult({
  prediction,
  predictionLabel,
  probability,
  modelUsed,
  onRequestAudit,
  auditLoading,
}: PredictionResultProps) {
  const isHighIncome = prediction === 1;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full animate-fade-in">
      <div className="relative">
         <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-2xl relative z-10 ${
           isHighIncome ? "bg-success/10 text-success border-2 border-success/30" : "bg-danger/10 text-danger border-2 border-danger/30"
         }`}>
           {isHighIncome ? "💰" : "📉"}
         </div>
         <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${
           isHighIncome ? "bg-success" : "bg-danger"
         }`} />
      </div>

      <div className="text-center space-y-1">
        <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Prediction Outcome</p>
        <p className="text-3xl font-black text-foreground tracking-tighter">{predictionLabel}</p>
        <p className="text-xs text-muted">
          Probability: <span className="text-foreground font-bold">{(probability * 100).toFixed(1)}%</span>
        </p>
      </div>

      <div className="w-full space-y-3 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
            <span className="text-[9px] text-muted uppercase font-bold">Model Path</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modelUsed === 'fair' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {modelUsed === "fair" ? "SENTINEL-FAIR" : "BIASED-RAW"}
            </span>
        </div>
        
        <button
          id="request-audit-btn"
          onClick={onRequestAudit}
          disabled={auditLoading}
          className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
        >
          {auditLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              Run Gemini Audit
            </>
          )}
        </button>
      </div>
    </div>
  );
}

