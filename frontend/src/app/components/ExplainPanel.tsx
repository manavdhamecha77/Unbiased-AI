"use client";

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
    <div className="glass-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Feature Importance</h3>
      <div className="text-center text-muted text-sm py-4">
        <p className="text-2xl mb-2">📊</p>
        <p>Start the backend to see<br />feature importance weights</p>
      </div>
    </div>
  );

  const isFair = !!fair;

  return (
    <div className="glass-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Feature Importance
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
          isFair ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        }`}>
          {isFair ? "Fair Model" : "Biased Model"}
        </span>
      </div>

      <div className="space-y-2.5">
        {active.features.map((feat, i) => {
          const w = active.weights[i];
          // highlight sensitive attributes
          const isSensitive = feat === "sex" || feat === "race";
          const barColor = isSensitive
            ? "var(--danger)"
            : isFair
            ? "var(--success)"
            : "var(--accent)";

          return (
            <div key={feat} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={`font-medium ${isSensitive ? "text-danger" : "text-foreground"}`}>
                  {FEATURE_LABELS[feat] ?? feat}
                  {isSensitive && (
                    <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-danger/10 text-danger font-bold">SENSITIVE</span>
                  )}
                </span>
                <span className="text-muted">{(w * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${w * 100}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted">
        Based on logistic regression coefficients · Sensitive attributes highlighted in red
      </p>
    </div>
  );
}
