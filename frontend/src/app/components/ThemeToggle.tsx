"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-muted hover:text-foreground flex items-center gap-2 text-xs font-bold w-full"
    >
      {isLight ? (
        <>
          <Sun size={14} className="text-warning" />
          LIGHT MODE
        </>
      ) : (
        <>
          <Moon size={14} className="text-accent" />
          DARK MODE
        </>
      )}
    </button>
  );
}
