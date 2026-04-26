"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted font-medium mt-1 uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/5 border border-accent/10">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_var(--success)]" />
          <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">System Online</span>
        </div>
      </div>
    </header>
  );
}
