"use client";

interface FairnessGaugeProps {
  value: number;
  label: string;
  isFair: boolean;
}

export default function FairnessGauge({ value, label, isFair }: FairnessGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), 1);
  const offset = circumference - clampedValue * circumference;

  const color = isFair ? "var(--success)" : "var(--danger)";
  const glowColor = isFair ? "var(--success-glow)" : "var(--danger-glow)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--card-border)"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease",
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {(clampedValue * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted">{label}</p>
        <p
          className="text-xs font-semibold mt-1 px-3 py-1 rounded-full"
          style={{
            background: glowColor,
            color: color,
          }}
        >
          {isFair ? "✓ COMPLIANT" : "✗ NON-COMPLIANT"}
        </p>
      </div>
    </div>
  );
}
