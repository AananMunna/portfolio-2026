"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Light is always the starting theme, whatever the device prefers. Dark is an
 * opt-in that lasts for the browser session (sessionStorage), so a new visit
 * starts light again.
 *
 * Switching "paints" the new theme over the old one from top to bottom, like a
 * brush stroke. It uses the View Transitions API (see .brush-paint in
 * globals.css); browsers without it fall back to a quick colour fade.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";

    const apply = () => {
      root.dataset.theme = next;
      try {
        sessionStorage.setItem("theme", next);
      } catch {}
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = (document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }).startViewTransition;

    if (!reduce && start) {
      root.classList.add("brush-paint");
      const t = start.call(document, apply);
      t.finished.finally(() => root.classList.remove("brush-paint"));
      return;
    }

    root.classList.add("theme-anim");
    apply();
    window.setTimeout(() => root.classList.remove("theme-anim"), 350);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark and light mode"
      title="Toggle theme"
      className={`hover-target pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border hairline text-fg transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      <Sun size={16} strokeWidth={1.75} className="theme-sun" />
      <Moon size={16} strokeWidth={1.75} className="theme-moon" />
    </button>
  );
}
