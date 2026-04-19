"use client";

interface MitigationToggleProps {
  isActive: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export default function MitigationToggle({ isActive, onToggle, loading }: MitigationToggleProps) {
  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${!isActive ? "text-danger" : "text-muted-dark"}`}>
          Biased Model
        </span>
        <button
          id="mitigation-toggle"
          onClick={onToggle}
          disabled={loading}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 cursor-pointer disabled:opacity-50 ${
            isActive ? "bg-success" : "bg-danger"
          }`}
          aria-label={isActive ? "Switch to biased model" : "Activate Sentinel fairness"}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
              isActive ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isActive ? "text-success" : "text-muted-dark"}`}>
          Fair Model
        </span>
      </div>
      <p className="text-xs text-muted text-center max-w-xs">
        {isActive
          ? "Sentinel Active — AIF360 Reweighing applied for equitable predictions"
          : "Raw model active — predictions may contain demographic bias"}
      </p>
      {isActive && (
        <div className="flex items-center gap-2 text-xs text-success animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Governance Layer Enabled
        </div>
      )}
    </div>
  );
}
