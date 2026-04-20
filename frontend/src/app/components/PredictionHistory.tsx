"use client";

export interface HistoryEntry {
  id: number;
  model: string;
  outcome: string;
  confidence: number;
  sex: string;
  race: string;
  age: number;
  occupation: string;
}

interface PredictionHistoryProps {
  entries: HistoryEntry[];
}

export default function PredictionHistory({ entries }: PredictionHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="glass-card p-5 space-y-3 animate-fade-in">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
        Prediction History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted border-b border-card-border">
              <th className="text-left pb-2 font-medium">#</th>
              <th className="text-left pb-2 font-medium">Model</th>
              <th className="text-left pb-2 font-medium">Outcome</th>
              <th className="text-left pb-2 font-medium">Conf.</th>
              <th className="text-left pb-2 font-medium">Sex</th>
              <th className="text-left pb-2 font-medium">Race</th>
              <th className="text-left pb-2 font-medium">Age</th>
              <th className="text-left pb-2 font-medium">Occupation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {entries.map((e) => (
              <tr key={e.id} className="text-foreground/80 hover:text-foreground transition-colors">
                <td className="py-2 text-muted">{e.id}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    e.model === "fair"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}>
                    {e.model === "fair" ? "Fair" : "Biased"}
                  </span>
                </td>
                <td className="py-2">
                  <span className={e.outcome.includes(">50K") ? "text-success" : "text-warning"}>
                    {e.outcome.includes(">50K") ? "↑ >50K" : "↓ ≤50K"}
                  </span>
                </td>
                <td className="py-2 text-muted">{(e.confidence * 100).toFixed(1)}%</td>
                <td className="py-2">{e.sex}</td>
                <td className="py-2">{e.race}</td>
                <td className="py-2">{e.age}</td>
                <td className="py-2 max-w-[100px] truncate">{e.occupation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
