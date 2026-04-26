"use client";

import PageHeader from "../components/PageHeader";
import { Settings, Shield, Bell, Key } from "lucide-react";
import { API_BASE } from "../../lib/api";

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure Governance Parameters"
      />

      <main className="flex-1 overflow-y-auto p-8 bg-background/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white shadow-xl shadow-accent/20">
                <Settings size={32} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-foreground">Global Settings</h1>
                <p className="text-muted">Manage your API keys, model thresholds, and notifications.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <Key className="text-accent" size={18} />
                   <h3 className="font-bold">API Configuration</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest">Gemini API Key</label>
                      <input type="password" value="************************" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest">FastAPI Endpoint</label>
                      <input type="text" value={API_BASE} readOnly className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
                   </div>
                </div>
                <button className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold w-full">Save API Settings</button>
             </div>

             <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <Shield className="text-success" size={18} />
                   <h3 className="font-bold">Fairness Thresholds</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] text-muted uppercase font-bold tracking-widest">Disparate Impact (80% Rule)</label>
                         <span className="text-[10px] font-bold text-accent">0.80</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value="0.8" className="w-full accent-accent" />
                   </div>
                   <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] text-muted uppercase font-bold tracking-widest">Demographic Parity Tolerance</label>
                         <span className="text-[10px] font-bold text-accent">0.10</span>
                      </div>
                      <input type="range" min="0" max="0.5" step="0.01" value="0.1" className="w-full accent-accent" />
                   </div>
                </div>
                <button className="bg-white/5 text-foreground border border-white/5 px-4 py-2 rounded-lg text-xs font-bold w-full hover:bg-white/10 transition-all">Reset to Defaults</button>
             </div>

             <div className="glass-card p-6 space-y-4 col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                   <Bell className="text-warning" size={18} />
                   <h3 className="font-bold">Governance Notifications</h3>
                </div>
                <div className="space-y-3">
                   {[
                     "Alert on fairness drift below threshold",
                     "Email weekly compliance reports",
                     "Notify on critical model inaccuracies",
                     "Slack integration for audit verification"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-sm font-medium">{item}</span>
                        <div className="w-10 h-5 bg-accent rounded-full relative">
                           <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
