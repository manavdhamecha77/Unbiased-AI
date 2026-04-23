"use client";

interface RegulatoryToggleProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RegulatoryToggle({ value, onChange }: RegulatoryToggleProps) {
  const frameworks = ["EU AI Act", "GDPR", "US Fair Lending"];

  return (
    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Regulatory Policy Engine</h3>
          <p className="text-[10px] text-muted uppercase tracking-wider">Select compliance framework</p>
        </div>
      </div>
      
      <div className="flex bg-card/50 p-1 rounded-xl border border-card-border">
        {frameworks.map((fw) => (
          <button
            key={fw}
            onClick={() => onChange(fw)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              value === fw
                ? "bg-accent text-white shadow-lg"
                : "text-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            {fw}
          </button>
        ))}
      </div>
    </div>
  );
}
