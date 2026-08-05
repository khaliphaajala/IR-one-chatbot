"use client";

import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

const themes = [
  { id: "glassmorphism", label: "Glassmorphism" },
  { id: "minimalist", label: "Minimalist" },
  { id: "cyberpunk", label: "Cyberpunk" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-md border border-border-theme opacity-50" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-bg-tertiary transition-colors border border-border-theme flex items-center justify-center text-text-secondary"
        aria-label="Select theme"
        title="Change UI Theme"
      >
        <Palette size={18} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-40 bg-bg-secondary border border-border-theme rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full text-left px-3 py-2 text-sm rounded-sm transition-colors",
                  theme === t.id
                    ? "bg-bg-tertiary text-accent font-medium"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
