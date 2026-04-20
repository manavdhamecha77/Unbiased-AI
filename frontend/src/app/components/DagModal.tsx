"use client";

interface DagModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export default function DagModal({ isOpen, onClose, imageUrl }: DagModalProps) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-12 z-50 flex flex-col glass-card animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Causal DAG</h2>
            <p className="text-xs text-muted mt-0.5">Sensitive attribute pathways to income prediction</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-foreground cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Causal DAG" className="max-w-full max-h-full rounded-lg" />
        </div>
        <div className="px-6 py-3 border-t border-card-border flex gap-6 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Sensitive attribute path</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-500 inline-block" /> Normal causal path</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Outcome variable</span>
        </div>
      </div>
    </>
  );
}
