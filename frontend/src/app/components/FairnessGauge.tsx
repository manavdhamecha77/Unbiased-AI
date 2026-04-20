"use client";

interface FairnessGaugeProps {
  value: number;
  label: string;
  isFair: boolean;
  prevValue?: number;
}

export default function FairnessGauge({ value, label, isFair, prevValue }: FairnessGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const safeValue = isNaN(value) || value == null ? 0 : value;
  const clampedValue = Math.min(Math.max(safeValue, 0), 1);
  const offset = circumference - clampedValue * circumference;

  const color = isFair ? "var(--success)" : "var(--danger)";
  const glowColor = isFair ? "var(--success-glow)" : "var(--danger-glow)";

  const delta = prevValue != null && !isNaN(prevValue) ? safeValue - prevValue : null;
  const deltaStr = delta != null ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%` : null;
  const deltaColor = delta != null && delta > 0 ? "var(--success)" : "var(--danger)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--card-border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease", filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {(clampedValue * 100).toFixed(1)}%
          </span>
          {deltaStr && (
            <span className="text-[11px] font-semibold animate-fade-in" style={{ color: deltaColor }}>
              {deltaStr} {delta! > 0 ? "↑" : "↓"}
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted">{label}</p>
        <p className="text-xs font-semibold mt-1 px-3 py-1 rounded-full" style={{ background: glowColor, color }}>
          {isFair ? "✓ COMPLIANT" : "✗ NON-COMPLIANT"}
        </p>
      </div>
    </div>
  );
}
