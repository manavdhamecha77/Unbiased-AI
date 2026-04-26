"use client";

import { API_BASE } from "../../lib/api";

export default function Header() {
  return (
    <header className="w-full border-b border-card-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Sentinel
            </h1>
            <p className="text-[10px] text-muted uppercase tracking-widest font-medium">
              AI Governance Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`${API_BASE}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            API Docs ↗
          </a>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Backend connected" />
        </div>
      </div>
    </header>
  );
}
