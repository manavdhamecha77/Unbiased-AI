"use client";

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
    <div className="glass-card p-6 animate-fade-in space-y-4">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
        Prediction Result
      </h3>

      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: isHighIncome ? "var(--success-glow)" : "var(--warning)",
            color: isHighIncome ? "var(--success)" : "#fff",
          }}
        >
          {isHighIncome ? "↑" : "↓"}
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{predictionLabel}</p>
          <p className="text-sm text-muted">
            Confidence: <span className="text-foreground font-medium">{(probability * 100).toFixed(1)}%</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-card-border">
        <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
          Model: {modelUsed === "fair" ? "Fair (Reweighed)" : "Biased (Raw)"}
        </span>
        <button
          id="request-audit-btn"
          onClick={onRequestAudit}
          disabled={auditLoading}
          className="text-xs px-4 py-2 rounded-lg bg-white/5 border border-card-border hover:bg-white/10 transition-colors text-foreground font-medium disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {auditLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Generate Audit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
