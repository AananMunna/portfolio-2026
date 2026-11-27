"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Light is always the starting theme, whatever the device prefers. Dark is an
 * opt-in that lasts for the browser session (sessionStorage), so a new visit
 * starts light again.
 *
 * Switching to dark pours paint down from the top of the screen: every part of
 * the edge runs at its own speed, so some drips race ahead and others lag
 * (random each time, no fixed pattern). Switching back to light plays the same
 * drips in reverse, climbing up. It uses the View Transitions API; browsers
 * without it fall back to a quick colour fade.
 */

const COLS = 160;
const FRAMES = 40;

/** Smooth random "speed" per column, with a few fast narrow drips. */
function makeSpeed() {
  const waves = [
    [2, 0.2],
    [5, 0.13],
    [9, 0.09],
    [16, 0.05],
  ].map(([f, a]) => ({ f, a, ph: Math.random() * Math.PI * 2 }));
  const drips = Array.from({ length: 7 }, () => ({
    c: Math.random(),
    w: 0.01 + Math.random() * 0.02,
    a: 0.35 + Math.random() * 0.6,
  }));

  const m: number[] = [];
  for (let i = 0; i <= COLS; i++) {
    const x = i / COLS;
    let v = 1;
    for (const w of waves) v += w.a * Math.sin(w.f * Math.PI * 2 * x + w.ph);
    for (const d of drips) v += d.a * Math.exp(-(((x - d.c) / d.w) ** 2));
    m.push(v);
  }
  const min = Math.min(...m);
  return m.map((v) => v / min);
}

function dripKeyframes(reverse: boolean) {
  const H = window.innerHeight;
  const speed = makeSpeed();
  const frames: string[] = [];
  for (let k = 0; k <= FRAMES; k++) {
    const t = k / FRAMES;
    const e = Math.pow(t, 1.35); // paint accelerates a little as it runs
    const pts = speed.map((m, i) => `${((i / COLS) * 100).toFixed(2)}% ${(H * 1.08 * e * m).toFixed(1)}px`);
    frames.push(`polygon(0% 0px, ${pts.join(", ")}, 100% 0px)`);
  }
  if (reverse) frames.reverse();
  return frames.map((clipPath) => ({ clipPath }));
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const toDark = root.dataset.theme !== "dark";
    const next = toDark ? "dark" : "light";

    const apply = () => {
      root.dataset.theme = next;
      try {
        sessionStorage.setItem("theme", next);
      } catch {}
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = (document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
    }).startViewTransition;

    if (!reduce && start) {
      root.classList.add("brush-paint");
      root.classList.toggle("to-light", !toDark);
      const t = start.call(document, apply);
      t.ready
        .then(() => {
          root.animate(
            { clipPath: dripKeyframes(!toDark).map((f) => f.clipPath) },
            {
              duration: 1500,
              easing: "linear",
              fill: "forwards",
              // dark paint is the "new" layer going dark, the "old" layer going light
              pseudoElement: toDark ? "::view-transition-new(root)" : "::view-transition-old(root)",
            }
          );
        })
        .catch(() => {});
      t.finished.finally(() => root.classList.remove("brush-paint", "to-light"));
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
