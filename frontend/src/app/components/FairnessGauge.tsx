"use client";

interface FairnessGaugeProps {
  value: number;
  label: string;
  isFair: boolean;
  prevValue?: number;
}

export default function FairnessGauge({ value, label, isFair, prevValue }: FairnessGaugeProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const safeValue = isNaN(value) || value == null ? 0 : value;
  const clampedValue = Math.min(Math.max(safeValue, 0), 1);
  const offset = circumference - clampedValue * circumference;

  const color = isFair ? "var(--success)" : "var(--danger)";
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 5px ${color}44)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-foreground tracking-tighter">
            {(clampedValue * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-muted uppercase font-bold tracking-widest">{label}</p>
        <p className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded uppercase border ${
          isFair ? "bg-success/5 text-success border-success/20" : "bg-danger/5 text-danger border-danger/20"
        }`}>
          {isFair ? "Compliant" : "Critical"}
        </p>
      </div>
    </div>
  );
}

