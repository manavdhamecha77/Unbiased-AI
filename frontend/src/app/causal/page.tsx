"use client";

import { useState } from "react";
import PageHeader from "../components/PageHeader";
import DagModal from "../components/DagModal";
import Image from "next/image";
import { GitBranch, Info, Maximize2, ShieldCheck, Target, ArrowRight } from "lucide-react";

import { API_BASE } from "../../lib/api";

export default function CausalDiscovery() {
  const [dagModalOpen, setDagModalOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      <PageHeader 
        title="Causal Discovery" 
        subtitle="Uncovering structural dependencies and sensitive attribute pathways"
      />

      <main className="flex-1 overflow-y-auto p-8 space-y-12 bg-background/50">
        
        {/* SECTION 1: THE CAUSAL GRAPH */}
        <section className="space-y-6">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <GitBranch size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Structural Causal Model (SCM)</h2>
                    <p className="text-xs text-muted">Directed Acyclic Graph (DAG) for the Adult Census dataset</p>
                </div>
              </div>
              <button 
                onClick={() => setDagModalOpen(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-all flex items-center gap-2"
              >
                <Maximize2 size={14} />
                FULLSCREEN VIEW
              </button>
           </div>

           <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8">
                 <div className="glass-card p-8 bg-sidebar/30 relative group flex items-center justify-center min-h-[600px] border-2 border-dashed border-white/5">
                    <Image
                       width={800}
                       height={500}
                      src={`${API_BASE}/static/causal_dag.png`}
                      alt="Causal DAG"
                      className="max-w-full max-h-[500px] object-contain opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer p-4"
                      onClick={() => setDagModalOpen(true)}
                    />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                       <div className="p-3 bg-background/80 backdrop-blur-md rounded-xl border border-white/10 text-[10px] text-muted max-w-xs leading-relaxed">
                          <Info size={12} className="inline mr-1 text-accent" />
                          This DAG represents the causal assumptions used by the <strong>DoWhy</strong> framework to estimate the effects of sensitive attributes.
                       </div>
                    </div>
                 </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                 <div className="glass-card p-6 border-l-4 border-warning">
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                       <ShieldCheck size={16} className="text-warning" />
                       Pathway Identification
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                       Our engine identifies direct and indirect pathways from sensitive attributes (Sex, Race) to the target variable (Income).
                    </p>
                    <div className="mt-4 space-y-3">
                       <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted uppercase">Sex → Income</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-danger/10 text-danger font-bold">DIRECT</span>
                       </div>
                       <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted uppercase">Race → Edu → Income</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-warning/10 text-warning font-bold">INDIRECT</span>
                       </div>
                    </div>
                 </div>

                 <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                       <Target size={16} className="text-accent" />
                       Causal Estimands
                    </h3>
                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between text-[10px] font-bold text-muted uppercase mb-1">
                             <span>Average Treatment Effect (ATE)</span>
                             <span className="text-accent">0.142</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-accent w-[42%]" />
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between text-[10px] font-bold text-muted uppercase mb-1">
                             <span>Controlled Direct Effect</span>
                             <span className="text-accent">0.089</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-accent w-[28%]" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="glass-card p-6 bg-accent/5 border border-accent/20">
                    <h4 className="text-xs font-bold text-foreground mb-2">Why Causal Inference?</h4>
                    <p className="text-[11px] text-muted leading-relaxed mb-4">
                       Correlation-based fairness metrics can be misleading. Sentinel uses causal graphs to distinguish between &quot;fair&quot; and &quot;unfair&quot; variance.
                    </p>
                    <button className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                       READ WHITE PAPER <ArrowRight size={12} />
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION 2: COUNTERFACTUAL ENGINE */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <ShieldCheck size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-foreground">Counterfactual Reasoning</h2>
                <p className="text-xs text-muted">Generating alternative realities to test decision robustness</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
                   <Target size={24} />
                </div>
                <h4 className="text-sm font-bold mb-2">Interventional Robustness</h4>
                <p className="text-[11px] text-muted">Testing if $P(Income | do(Sex))$ remains stable across demographics.</p>
             </div>
             <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                   <GitBranch size={24} />
                </div>
                <h4 className="text-sm font-bold mb-2">Path-Specific Fairness</h4>
                <p className="text-[11px] text-muted">Ensuring no information flows through discriminatory sensitive edges.</p>
             </div>
             <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
                   <ShieldCheck size={24} />
                </div>
                <h4 className="text-sm font-bold mb-2">Causal Audit Trail</h4>
                <p className="text-[11px] text-muted">Mathematically proving non-discrimination in every single prediction.</p>
             </div>
          </div>
        </section>
      </main>

      <DagModal
        isOpen={dagModalOpen}
        onClose={() => setDagModalOpen(false)}
        imageUrl={`${API_BASE}/static/causal_dag.png`}
      />
    </div>
  );
}
