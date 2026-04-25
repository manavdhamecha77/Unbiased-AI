"use client";

const frameworks = [
  { id: "EU AI Act", icon: "🇪🇺" },
  { id: "GDPR", icon: "🛡️" },
  { id: "US Fair Lending", icon: "🇺🇸" },
];

export default function RegulatoryToggle({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {frameworks.map((fw) => (
          <button
            key={fw.id}
            onClick={() => onChange(fw.id)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              value === fw.id
                ? "bg-accent text-white border-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:border-white/10"
            }`}
          >
            <span>{fw.icon}</span>
            {fw.id}
          </button>
        ))}
      </div>
    </div>
  );
}

