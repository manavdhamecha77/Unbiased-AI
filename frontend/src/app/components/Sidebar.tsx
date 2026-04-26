"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  GitBranch
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Audits", href: "/audits", icon: ShieldCheck },
  { name: "Causal Discovery", href: "/causal", icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Sentinel
          </h1>
          <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">
            Governance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto space-y-4">
        <ThemeToggle />
        
        <div className="glass-card p-3 text-[10px] text-muted text-center">
          <p>© 2026 Sentinel AI v2.5</p>
        </div>
      </div>
    </aside>
  );
}
