"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FairnessData {
  disparate_impact_ratio: number;
  demographic_parity_difference: number;
  accuracy: number;
  f1_score: number;
  model_type: string;
}

interface ModelComparisonProps {
  biasedData: FairnessData | null;
  fairData: FairnessData | null;
}

export default function ModelComparison({ biasedData, fairData }: ModelComparisonProps) {
  if (!biasedData || !fairData) return null;

  const data = [
    {
      name: "Accuracy",
      "Biased": biasedData.accuracy,
      "Fair": fairData.accuracy,
    },
    {
      name: "F1 Score",
      "Biased": biasedData.f1_score,
      "Fair": fairData.f1_score,
    },
    {
      name: "Fairness (DIR)",
      "Biased": biasedData.disparate_impact_ratio,
      "Fair": fairData.disparate_impact_ratio,
    },
  ];

  return (
    <div className="glass-card p-6 w-full animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-foreground">Model Comparison</h3>
        <p className="text-sm text-muted">Performance vs. Fairness Trade-off</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--muted)" tick={{ fill: "var(--muted)" }} />
            <YAxis stroke="var(--muted)" tick={{ fill: "var(--muted)" }} domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--card-border)", borderRadius: "8px" }}
              itemStyle={{ color: "var(--foreground)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="Biased" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Fair" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
