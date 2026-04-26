"use client";

import { Info } from "lucide-react";

interface MitigationToggleProps {
  isActive: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export default function MitigationToggle({ isActive, onToggle, loading }: MitigationToggleProps) {
  return (
    <div className="glass-card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] text-muted uppercase font-bold tracking-widest">Biased vs Fair</h3>
        <Info size={14} className="text-muted-dark" />
      </div>
      
      <div 
        className="relative group cursor-pointer"
        onClick={!loading ? onToggle : undefined}
      >
        <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
          isActive 
            ? "border-success/30 bg-success/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
            : "border-danger/30 bg-danger/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
        }`}>
          <div>
            <div className={`text-xs font-bold uppercase tracking-tight mb-1 ${isActive ? "text-success" : "text-danger"}`}>
               {isActive ? "Fair Model Active" : "Biased Model Active"}
            </div>
            <p className="text-[10px] text-muted-dark font-medium leading-tight">
              {isActive ? "AIF360 Reweighing enabled" : "Raw demographic data used"}
            </p>
          </div>
          <div className={`w-10 h-6 rounded-full relative transition-colors ${isActive ? "bg-success" : "bg-danger"}`}>
             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? "right-1" : "left-1"}`} />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
         <p className="text-[10px] text-muted leading-relaxed">
           {isActive 
             ? "Sentinel Governance Layer is applying real-time bias mitigation." 
             : "Model is currently operating without fairness interventions."}
         </p>
      </div>
    </div>
  );
}

