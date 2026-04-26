"use client";

import { useState } from "react";
import PageHeader from "../components/PageHeader";
import ReactMarkdown from "react-markdown";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Share2
} from "lucide-react";

import { API_BASE } from "../../lib/api";

export default function AuditsPage() {
  const [selectedAudit, setSelectedAudit] = useState<string | null>("AUD-2024-001");
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState("LOW");

  const audits = [
    { id: "AUD-2024-001", date: "Oct 26, 2024", dir: 0.98, framework: "EU AI Act", status: "Compliant" },
    { id: "AUD-2023-015", date: "Sep 10, 2023", dir: 0.85, framework: "GDPR", status: "Flagged" },
    { id: "AUD-2023-009", date: "Jun 22, 2023", dir: 0.92, framework: "US Fair Lending", status: "Compliant" },
    { id: "AUD-2023-002", date: "Jan 15, 2023", dir: 0.78, framework: "EU AI Act", status: "Critical" },
  ];

  const generateAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction: 1,
          probability: 0.85,
          model_used: "fair",
          applicant_features: { age: 35, education: "Bachelors", sex: "Female", race: "Black" },
          fairness_score: 0.95,
          regulatory_framework: "EU AI Act"
        }),
      });
      const data = await res.json();
      setAuditResult(data.audit_receipt);
      setRiskLevel(data.risk_level);
      setSelectedAudit("NEW-GEN-AUDIT");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadPdf = () => {
    const content = auditResult || "Significant bias detected in 'Sex' attribute...";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Sentinel Audit Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 30px; }
            .report { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h1>🛡️ Sentinel Compliance Audit</h1>
          <div class="meta">Report ID: ${selectedAudit} | Date: ${new Date().toLocaleDateString()}</div>
          <div class="report" id="content"></div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(content)});
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadJson = () => {
    const data = {
      id: selectedAudit,
      date: new Date().toISOString(),
      content: auditResult || "Default Placeholder Content",
      risk: riskLevel
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel_audit_${selectedAudit}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      <PageHeader 
        title="Compliance and Audit Center" 
        subtitle="Regulatory Reporting & Verification"
      />

      <main className="flex-1 overflow-y-auto p-8 bg-background/30">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="col-span-12 xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Audit Report Center</h1>
              <button 
                onClick={generateAudit}
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50"
              >
                 {loading ? "Analyzing..." : "Generate New Gemini Audit"}
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="stat-card">
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Audit Score</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-foreground">92</span>
                    <span className="text-muted text-sm mb-1">/100</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-success w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
               </div>

               <div className="stat-card">
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Framework Alignment</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="text-success" size={24} />
                    <span className="text-lg font-semibold">95% Compliant</span>
                  </div>
                  <p className="text-[10px] text-muted mt-2">Verified against EU AI Act v1.2</p>
               </div>

               <div className="stat-card border-danger/20">
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Top Risk Factors</p>
                  <div className="flex items-center gap-2 mt-2 text-danger">
                    <AlertTriangle size={24} />
                    <span className="text-lg font-semibold">Gender Bias in Hiring</span>
                  </div>
                  <p className="text-[10px] text-danger/80 mt-2">3 Critical Findings Detected</p>
               </div>
            </div>

            {/* Table Section */}
            <div className="glass-card overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold">Detailed Audit Logs</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-muted uppercase tracking-widest border-b border-white/5">
                        <th className="px-6 py-4 font-bold">Audit Run ID</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">DIR Score</th>
                        <th className="px-6 py-4 font-bold">Regulatory Framework</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {audits.map((audit) => (
                        <tr 
                          key={audit.id} 
                          className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedAudit === audit.id ? "bg-accent/5" : ""}`}
                          onClick={() => setSelectedAudit(audit.id)}
                        >
                          <td className="px-6 py-4 font-mono text-xs text-accent">{audit.id}</td>
                          <td className="px-6 py-4 text-muted">{audit.date}</td>
                          <td className="px-6 py-4 font-semibold">{audit.dir.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="bg-white/5 px-2 py-1 rounded text-[10px]">{audit.framework}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`flex items-center gap-1.5 text-xs font-medium ${
                               audit.status === "Compliant" ? "text-success" : 
                               audit.status === "Flagged" ? "text-warning" : "text-danger"
                             }`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                 audit.status === "Compliant" ? "bg-success" : 
                                 audit.status === "Flagged" ? "bg-warning" : "bg-danger"
                               }`} />
                               {audit.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="text-[11px] font-bold text-muted hover:text-foreground border border-white/10 px-3 py-1 rounded-lg transition-all hover:bg-white/5">
                                View Report
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>

          {/* Right Panel: Audit View & Export */}
          <div className="col-span-12 xl:col-span-4 space-y-8">
            <div className="glass-card p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Gemini Audit Receipt View</h3>
                <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                   <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              
              {/* Document View */}
              <div className="flex-1 bg-white p-8 rounded-lg shadow-2xl shadow-black/50 text-slate-900 space-y-6 min-h-[500px] overflow-y-auto">
                <div className="border-b border-slate-200 pb-4">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                     </div>
                     <span className="text-xs font-bold uppercase tracking-tighter">Sentinel Governance</span>
                   </div>
                   <h2 className="text-xl font-bold">Compliance Audit Report</h2>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Report ID: {selectedAudit}</p>
                </div>

                <div className="space-y-4 prose prose-sm max-w-none prose-slate">
                   {auditResult ? (
                     <ReactMarkdown>{auditResult}</ReactMarkdown>
                   ) : (
                     <>
                        <p className="text-xs leading-relaxed text-slate-700">
                          Significant bias detected in <strong className="text-slate-900">&quot;Sex&quot;</strong> attribute, mitigated to acceptable range through AIF360 reweighing intervention.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 bg-slate-50 rounded border border-slate-100">
                              <p className="text-[9px] text-slate-500 uppercase font-bold">Pre-Mitigation DIR</p>
                              <p className="text-lg font-bold text-danger">0.32</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded border border-slate-100">
                              <p className="text-[9px] text-slate-500 uppercase font-bold">Post-Mitigation DIR</p>
                              <p className="text-lg font-bold text-success">0.98</p>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                           <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3">Mitigation Recommendations</h4>
                           <ul className="space-y-2">
                              {[
                                "Implement AIF360 Reweighing on monthly retraining cycles",
                                "Review Education feature correlation with Gender parity",
                                "Increase Female subset training data representation"
                              ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5" />
                                  {item}
                                </li>
                              ))}
                           </ul>
                        </div>
                     </>
                   )}
                </div>

                <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100 italic text-[9px] text-slate-400">
                   <p>Generated by Sentinel v2.5 (Gemini-Flash 2.5)</p>
                   <p>Timestamp: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Export Panel */}
              {auditResult && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4 animate-fade-in">
                  <h4 className="text-[10px] font-bold uppercase text-muted tracking-widest">Export Panel</h4>
                  <div className="grid grid-cols-1 gap-2">
                     <button 
                      onClick={handleDownloadPdf}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all"
                     >
                       <Download size={14} /> Download PDF
                     </button>
                     <button 
                      onClick={handleDownloadJson}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all"
                     >
                       <Share2 size={14} /> Export JSON
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
