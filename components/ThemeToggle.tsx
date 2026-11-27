"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * HYBRID THEME TOGGLE
 * Light is always the starting theme. Dark is an opt-in for the browser session.
 *
 * The best available effect is picked automatically:
 *
 *  1. "drip"    View Transitions + animated clip-path. A REAL reveal: the new
 *               theme shows through a drippy paint front. Thick streams run
 *               faster, thin parts lag behind, random pattern on every click.
 *               light -> dark : paint falls from the top.
 *               dark -> light : exact reverse, paint climbs back up.
 *  2. "circle"  Weak devices (<=4 cores, <=4GB RAM, data-saver): cheap circular
 *               reveal growing from the toggle button (only 2 keyframes).
 *  3. "canvas"  Browsers without View Transitions: lightweight canvas paint drip.
 *  4. "instant" prefers-reduced-motion: no animation at all.
 */

const MS = 1150;
const PAINT = "#03050c"; // canvas fallback only; must equal the dark page background
const SHEEN = "rgba(255,255,255,0.09)";

let busy = false;

/* ------------------------------------------------------------------ */
/* Shared drip "physics"                                              */
/* ------------------------------------------------------------------ */

type Stream = { i: number; x: number; amp: number };
type Field = {
  xs: Float32Array;
  ys: Float32Array;
  delay: Float32Array;
  dur: Float32Array;
  streams: Stream[];
  travel: number;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** n columns across the screen. Each column gets its own start time + speed. */
function buildField(W: number, H: number, n: number): Field {
  const xs = new Float32Array(n + 1);
  const ys = new Float32Array(n + 1);
  const delay = new Float32Array(n + 1);
  const dur = new Float32Array(n + 1);

  // narrow fast streams (thick pour) + a few wide soft blobs
  const blobs: { c: number; s: number; a: number }[] = [];
  const count = clamp(Math.round(W / 150), 4, 10);
  for (let k = 0; k < count; k++)
    blobs.push({ c: rnd(0.03, 0.97) * W, s: rnd(7, 14), a: rnd(0.45, 0.95) });
  for (let k = 0; k < 4; k++)
    blobs.push({ c: rnd(0, 1) * W, s: rnd(35, 80), a: rnd(0.15, 0.3) });

  const p1 = rnd(0, 6.28),
    p2 = rnd(0, 6.28),
    p3 = rnd(0, 6.28);
  for (let i = 0; i <= n; i++) {
    const x = (i * W) / n;
    xs[i] = x;
    let g =
      0.3 +
      0.16 * Math.sin(x * 0.011 + p1) +
      0.1 * Math.sin(x * 0.027 + p2) +
      0.05 * Math.sin(x * 0.06 + p3) +
      rnd(-0.012, 0.012);
    for (const b of blobs) g += b.a * Math.exp(-(((x - b.c) / b.s) ** 2));
    g = clamp(g, 0, 1);
    // more paint => starts earlier AND moves faster
    delay[i] = (1 - g) * 0.32;
    dur[i] = 0.5 + (1 - g) * 0.18; // delay + dur <= 1
  }

  const streams: Stream[] = blobs
    .slice(0, count)
    .map((b) => ({
      i: clamp(Math.round((b.c / W) * n), 0, n),
      x: b.c,
      amp: b.a,
    }));

  return { xs, ys, delay, dur, streams, travel: H + 30 };
}

// gravity-ish easing: slow start, smooth finish
const ease = (p: number) => 0.55 * p * p + 0.45 * (p * p * (3 - 2 * p));

/** front position of every column at progress u (0 = nothing, 1 = everything covered) */
function solve(f: Field, u: number) {
  for (let i = 0; i < f.xs.length; i++) {
    const p = clamp((u - f.delay[i]) / f.dur[i], 0, 1);
    f.ys[i] = ease(p) * f.travel;
  }
}

/* ------------------------------------------------------------------ */
/* Tier 1 + 2: View Transitions reveal                                */
/* ------------------------------------------------------------------ */

function dripKeyframes(W: number, H: number, toDark: boolean) {
  const n = clamp(Math.round(W / 14), 36, 90);
  const f = buildField(W, H, n);
  const FRAMES = 26;
  const frames: { clipPath: string }[] = [];

  for (let k = 0; k <= FRAMES; k++) {
    const t = k / FRAMES;
    // dark->light plays the very same motion backwards
    solve(f, toDark ? t : 1 - t);

    // light->dark : reveal what is ABOVE the front (paint pours down)
    // dark->light : reveal what is BELOW the front (paint climbs up)
    const base = toDark ? -2 : H + 40;
    let pts = `-2px ${base}px, ${W + 2}px ${base}px`;
    for (let i = n; i >= 0; i--)
      pts += `, ${f.xs[i].toFixed(1)}px ${f.ys[i].toFixed(1)}px`;
    frames.push({ clipPath: `polygon(${pts})` });
  }
  return frames;
}

function runReveal(
  mode: "drip" | "circle",
  toDark: boolean,
  swap: () => void,
  origin: { x: number; y: number },
) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const root = document.documentElement;

  const style = document.createElement("style");
  style.textContent =
    "::view-transition-old(root),::view-transition-new(root){animation:none!important;mix-blend-mode:normal;}" +
    "::view-transition-new(root){clip-path:inset(0 0 100% 0);}"; // hidden until the animation starts
  document.head.appendChild(style);

  // A fill:forwards animation on a view-transition pseudo-element outlives its
  // transition and gets re-applied to the NEXT one (this is what made the 2nd
  // toggle stutter). Clear any leftovers before starting.
  for (const a of document.getAnimations()) {
    const pe = (a.effect as KeyframeEffect | null)?.pseudoElement;
    if (pe && pe.startsWith("::view-transition")) a.cancel();
  }

  let anim: Animation | null = null;
  const guard = window.setTimeout(() => {
    busy = false; // never leave the toggle dead if a transition stalls
  }, MS + 2500);

  const vt = (document as any).startViewTransition(swap);

  vt.ready
    .then(() => {
      let frames: Keyframe[];
      let duration = MS;
      let easing = "linear";

      if (mode === "drip") {
        frames = dripKeyframes(W, H, toDark);
      } else {
        const r = Math.hypot(
          Math.max(origin.x, W - origin.x),
          Math.max(origin.y, H - origin.y),
        );
        frames = [
          { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
          { clipPath: `circle(${r}px at ${origin.x}px ${origin.y}px)` },
        ];
        duration = 650;
        easing = "cubic-bezier(0.4, 0, 0.2, 1)";
      }

      anim = root.animate(frames, {
        duration,
        easing,
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      });
    })
    .catch(() => {});

  vt.finished.finally(() => {
    window.clearTimeout(guard);
    anim?.cancel();
    style.remove();
    busy = false;
  });
}

/* ------------------------------------------------------------------ */
/* Tier 3: canvas fallback (no View Transitions support)              */
/* ------------------------------------------------------------------ */

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  f: Field,
  W: number,
  H: number,
  u: number,
) {
  solve(f, u);
  const { xs, ys } = f;
  const last = xs.length - 1;

  // draws directly on ctx (no Path2D objects => nothing for the GC per frame)
  const trace = (moveFirst: boolean) => {
    if (moveFirst) ctx.moveTo(xs[0], ys[0]);
    ctx.lineTo((xs[0] + xs[1]) / 2, (ys[0] + ys[1]) / 2);
    for (let i = 1; i < last; i++)
      ctx.quadraticCurveTo(
        xs[i],
        ys[i],
        (xs[i] + xs[i + 1]) / 2,
        (ys[i] + ys[i + 1]) / 2,
      );
    ctx.lineTo(xs[last], ys[last]);
  };

  ctx.clearRect(0, 0, W, H);

  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(xs[0], ys[0]);
  trace(false);
  ctx.lineTo(W, -4);
  ctx.closePath();
  ctx.fillStyle = PAINT;
  ctx.fill();

  ctx.beginPath();
  trace(true);
  ctx.strokeStyle = SHEEN;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  for (const s of f.streams) {
    const y = ys[s.i];
    if (y < 10 || y > H + 6) continue;
    const r = 4.5 + s.amp * 5;
    ctx.fillStyle = PAINT;
    ctx.beginPath();
    ctx.arc(s.x, y + r * 0.3, r, 0, 6.2832);
    ctx.fill();
    ctx.fillStyle = SHEEN;
    ctx.beginPath();
    ctx.arc(s.x - r * 0.3, y + r * 0.05, r * 0.35, 0, 6.2832);
    ctx.fill();
  }
}

function runCanvas(toDark: boolean, swap: () => void) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const s = Math.min(1, Math.sqrt(1.1e6 / (W * H))); // cap pixels for weak GPUs

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(W * s));
  canvas.height = Math.max(1, Math.round(H * s));
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    zIndex: "9990",
    pointerEvents: "none",
    opacity: "1",
    transition: "opacity 200ms ease-out",
  });
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    swap();
    busy = false;
    return;
  }
  ctx.scale(s, s);

  const field = buildField(W, H, clamp(Math.round(W / 8), 60, 180));
  const root = document.documentElement;
  let swapped = false;
  const doSwap = () => {
    if (swapped) return;
    swapped = true;
    root.classList.add("theme-switching"); // no colour transitions under the paint
    swap();
  };
  let guard = 0;
  const cleanup = () => {
    window.clearTimeout(guard);
    doSwap(); // theme always ends up applied, even if frames were dropped
    root.classList.remove("theme-switching");
    canvas.remove();
    busy = false;
  };
  guard = window.setTimeout(cleanup, MS + 2500);

  // Advance by at most ~2 frames per tick: when the phone is busy repainting the
  // page, the paint slows down for a moment instead of freezing and then jumping.
  let prev = 0;
  let elapsed = 0;
  const loop = (now: number) => {
    if (prev) elapsed += Math.min(now - prev, 34);
    prev = now;
    const t = elapsed / MS;
    if (t >= 1) {
      if (toDark) {
        drawCanvas(ctx, field, W, H, 1);
        doSwap();
        requestAnimationFrame(() => {
          canvas.style.opacity = "0";
          window.setTimeout(cleanup, 220);
        });
      } else {
        cleanup();
      }
      return;
    }
    drawCanvas(ctx, field, W, H, toDark ? t : 1 - t);
    requestAnimationFrame(loop);
  };

  if (toDark) {
    document.body.appendChild(canvas);
    requestAnimationFrame(loop);
  } else {
    // start fully covered, flip to light under the paint, then peel upward
    drawCanvas(ctx, field, W, H, 1);
    document.body.appendChild(canvas);
    doSwap();
    requestAnimationFrame(() => requestAnimationFrame(loop));
  }
}

/* ------------------------------------------------------------------ */
/* Tier picker + component                                            */
/* ------------------------------------------------------------------ */

type Tier = "drip" | "circle" | "canvas" | "instant";

function pickTier(): Tier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return "instant";
  const nav = navigator as any;
  // Phones/tablets: a View Transition snapshots + masks the whole live page
  // every frame, which is what hangs mobile GPUs. The canvas paint is cheap.
  if (window.matchMedia("(pointer: coarse)").matches) return "canvas";
  const hasVT = typeof (document as any).startViewTransition === "function";
  if (!hasVT) return "canvas";
  const weak =
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true;
  return weak ? "circle" : "drip";
}

/** Toggle the theme; `from` is the element clicked (the reveal grows from it). */
export function toggleTheme(from: Element) {
  if (busy) return;
  const root = document.documentElement;
  const toDark = root.dataset.theme !== "dark";
  const next = toDark ? "dark" : "light";

  const apply = () => {
    root.dataset.theme = next;
    try {
      sessionStorage.setItem("theme", next);
    } catch {}
  };

  const tier = pickTier();
  if (tier === "instant") {
    apply();
    return;
  }

  busy = true;
  try {
    if (tier === "canvas") {
      runCanvas(toDark, apply);
    } else {
      const r = from.getBoundingClientRect();
      runReveal(tier, toDark, apply, {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      });
    }
  } catch {
    apply(); // never leave the user without a working toggle
    busy = false;
  }
}

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const toggle = (e: MouseEvent<HTMLButtonElement>) => toggleTheme(e.currentTarget);

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
