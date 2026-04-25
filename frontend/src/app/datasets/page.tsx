"use client";

import PageHeader from "../components/PageHeader";
import { Database, Table, FileCode, Search } from "lucide-react";

export default function DatasetsPage() {
  const datasets = [
    { name: "Adult Census Income", rows: "48,842", features: "14", type: "Tabular", status: "Loaded" },
    { name: "COMPAS Recidivism", rows: "7,214", features: "53", type: "Tabular", status: "Not Loaded" },
    { name: "German Credit", rows: "1,000", features: "20", type: "Tabular", status: "Not Loaded" },
  ];

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      <PageHeader 
        title="Dataset Management" 
        subtitle="Source Data & Feature Engineering"
      />

      <main className="flex-1 overflow-y-auto p-8 bg-background/30">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Active Datasets</h1>
            <button className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
               <Database size={16} /> Import New Dataset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {datasets.map((ds) => (
               <div key={ds.name} className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                       <Table size={20} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ds.status === 'Loaded' ? 'bg-success/10 text-success' : 'bg-white/5 text-muted'}`}>
                       {ds.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{ds.name}</h3>
                    <p className="text-xs text-muted">UCI Machine Learning Repository</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Rows</p>
                      <p className="text-sm font-mono">{ds.rows}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Features</p>
                      <p className="text-sm font-mono">{ds.features}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-white/5 text-xs font-bold border border-white/5 hover:bg-white/10 transition-all">
                    Explore Data
                  </button>
               </div>
             ))}
          </div>

          <div className="glass-card p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Feature Engineering Pipeline</h3>
                <div className="flex items-center gap-2 text-xs text-muted">
                   <Search size={14} /> Filter Features
                </div>
             </div>
             <div className="space-y-3">
                {["age", "workclass", "education", "marital_status", "occupation", "race", "sex"].map((f) => (
                  <div key={f} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-accent" />
                       <span className="text-sm font-mono font-bold">{f}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted">
                       <span>Type: Categorical</span>
                       <span>Missing: 0.0%</span>
                       <FileCode size={14} className="cursor-pointer hover:text-foreground" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
