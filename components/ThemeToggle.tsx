"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Dark/light switch. The theme lives on <html data-theme="...">, set before
 * first paint by the inline script in app/layout.tsx, so there is no flash and
 * no React state to keep in sync. The icons swap through CSS (see globals.css).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.classList.add("theme-anim");
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-anim"), 400);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark and light mode"
      title="Toggle theme"
      className={`hover-target pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      <Sun size={16} strokeWidth={1.75} className="theme-sun" />
      <Moon size={16} strokeWidth={1.75} className="theme-moon" />
    </button>
  );
}
