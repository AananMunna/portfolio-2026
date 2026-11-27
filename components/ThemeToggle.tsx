"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Light is always the starting theme, whatever the device prefers. Dark is an
 * opt-in that lasts for the browser session (sessionStorage).
 *
 * The switch is a band of paint that falls over the screen (rising back up when
 * you return to light). It is ONE element whose only animated property is
 * `transform`, so it runs on the GPU compositor with no layout or repaint, and
 * the page underneath changes theme once, while the band covers it. The ragged
 * edge is random each time, so no two switches look the same.
 */

const DARK_BG = "#03050c";
const LIGHT_BG = "#fbfbfd";
const MS = 760;

/** Ragged edge: smooth wave with a few long drips. Returns path points along x. */
function edgePath(w: number, y0: number, maxDrip: number, minDrip: number) {
  const steps = 26;
  const dx = w / steps;
  const drips = Array.from({ length: 6 }, () => ({
    c: Math.random() * steps,
    w: 0.7 + Math.random() * 1.1,
    a: 0.45 + Math.random() * 0.55,
  }));
  const ph = Math.random() * 6.28;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    let v = 0.35 + 0.2 * Math.sin(i * 0.55 + ph) + 0.12 * Math.sin(i * 1.3 + ph * 2);
    for (const d of drips) v += d.a * Math.exp(-(((i - d.c) / d.w) ** 2));
    v = Math.max(0, Math.min(1, v));
    pts.push([i * dx, y0 + minDrip + v * (maxDrip - minDrip)]);
  }
  return pts;
}

function smooth(pts: [number, number][]) {
  let d = `L ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function runPaint(toDark: boolean, swap: () => void) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const B = Math.round(H * 1.7); // band height
  const lead = 150; // how far the leading drips hang
  const NS = "http://www.w3.org/2000/svg";

  // Leading edge = long drips (bottom edge when falling). Trailing edge = short ragged.
  const leadPts = edgePath(W, 0, B - 6, B - lead).reverse(); // right -> left
  const trailPts = edgePath(W, 0, 46, 8); // left -> right
  const d =
    `M 0 ${trailPts[0][1]} ${smooth(trailPts)} L ${W} ${leadPts[0][1]} ${smooth(leadPts)} Z`;

  const wrap = document.createElement("div");
  wrap.setAttribute("aria-hidden", "true");
  Object.assign(wrap.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: `${B}px`,
    zIndex: "9990",
    pointerEvents: "none",
    willChange: "transform",
    // when rising, flip the shape so the drippy edge still leads
    transform: `translate3d(0, ${toDark ? -B : H}px, 0) ${toDark ? "" : "scaleY(-1)"}`,
  });
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${W} ${B}`);
  svg.setAttribute("preserveAspectRatio", "none");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", toDark ? DARK_BG : LIGHT_BG);
  svg.appendChild(path);
  wrap.appendChild(svg);
  document.body.appendChild(wrap);

  const from = toDark ? -B : H;
  const to = toDark ? H + 4 : -B - 4;
  const flip = toDark ? "" : " scaleY(-1)";
  const anim = wrap.animate(
    [
      { transform: `translate3d(0, ${from}px, 0)${flip}` },
      { transform: `translate3d(0, ${to}px, 0)${flip}` },
    ],
    { duration: MS, easing: "cubic-bezier(0.55, 0, 0.45, 1)", fill: "forwards" }
  );
  // halfway through, the band covers the whole screen: swap the theme unseen
  window.setTimeout(swap, MS * 0.5);
  anim.onfinish = () => wrap.remove();
  anim.oncancel = () => wrap.remove();
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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    runPaint(toDark, apply);
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
