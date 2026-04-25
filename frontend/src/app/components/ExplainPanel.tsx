"use client";

import { BarChart, Info } from "lucide-react";

interface ExplainData {
  model_type: string;
  features: string[];
  weights: number[];
}

interface ExplainPanelProps {
  biased: ExplainData | null;
  fair: ExplainData | null;
}

const FEATURE_LABELS: Record<string, string> = {
  capital_gain: "Capital Gain",
  education_num: "Education Level",
  age: "Age",
  hours_per_week: "Hours/Week",
  capital_loss: "Capital Loss",
  relationship: "Relationship",
  occupation: "Occupation",
  marital_status: "Marital Status",
  sex: "Sex",
  race: "Race",
  workclass: "Workclass",
  education: "Education",
  native_country: "Country",
};

export default function ExplainPanel({ biased, fair }: ExplainPanelProps) {
  const active = fair ?? biased;

  if (!active) return (
    <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
      <div className="p-4 bg-white/5 rounded-full mb-2">
        <BarChart size={32} className="text-muted/30" />
      </div>
      <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]">Feature Importance</h3>
      <p className="text-[11px] text-muted max-w-[200px]">Waiting for model weights to initialize from the backend.</p>
    </div>
  );

  const isFair = !!fair;

  return (
    <div className="glass-card p-8 h-full flex flex-col animate-fade-in min-h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Impact Analysis</h3>
          <h4 className="text-sm font-bold text-foreground">Feature Importance</h4>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-lg font-bold border ${
          isFair ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
        }`}>
          {isFair ? "MITIGATED" : "BIASED"}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-5">
        {active.features.slice(0, 8).map((feat, i) => {
          const w = active.weights[i];
          const isSensitive = feat === "sex" || feat === "race";
          const barColor = isSensitive
            ? "var(--danger)"
            : isFair
            ? "var(--success)"
            : "var(--accent)";

          return (
            <div key={feat} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className={`text-[11px] font-bold tracking-tight ${isSensitive ? "text-danger" : "text-foreground"}`}>
                  {FEATURE_LABELS[feat] ?? feat}
                  {isSensitive && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 rounded bg-danger/10 text-danger font-black border border-danger/10">SENSITIVE</span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-muted">{(w * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                  style={{ 
                    width: `${w * 100}%`, 
                    background: barColor,
                    boxShadow: isSensitive ? '0 0 10px rgba(244,63,94,0.3)' : 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-[10px] text-muted flex items-center gap-2">
          <Info size={12} className="text-accent" />
          Weights normalized from Logistic Regression coefficients.
        </p>
      </div>
    </div>
  );
}

