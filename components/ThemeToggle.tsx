"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * VENOM THEME TOGGLE
 * Light is always the starting theme. Dark is an opt-in for the browser session.
 *
 * Click the button and a black, glossy symbiote oozes out of it. Thick tendrils
 * shoot ahead, the body follows, and the whole page flips theme underneath it.
 *
 *  1. "venom"   View Transitions + animated clip-path. The NEW theme is revealed
 *               through the venom shape, so every piece of text and content is
 *               always visible; the goo flows beneath it. A canvas draws the
 *               glossy rim, tendrils and droplets exactly on the moving front.
 *  2. "canvas"  Browsers without View Transitions: the goo covers the screen,
 *               the theme swaps under it, then it fades away.
 *  3. "instant" prefers-reduced-motion: no animation at all.
 *
 * light -> dark : black venom.   dark -> light : pale "anti-venom".
 */

const MS = 1500;

let busy = false;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ------------------------------------------------------------------ */
/* Venom "physics" (polar field around the button)                    */
/* ------------------------------------------------------------------ */

type Tip = { i: number; amp: number };
type Field = {
  n: number;
  cos: Float32Array;
  sin: Float32Array;
  delay: Float32Array;
  dur: Float32Array;
  tips: Tip[];
  R: number;
  ox: number;
  oy: number;
};

function buildField(
  W: number,
  H: number,
  n: number,
  ox: number,
  oy: number,
): Field {
  const cos = new Float32Array(n);
  const sin = new Float32Array(n);
  const delay = new Float32Array(n);
  const dur = new Float32Array(n);

  // long thin tendrils that shoot ahead + a few wide lumps
  const fingers: { c: number; w: number; a: number }[] = [];
  const count = Math.round(rnd(12, 18));
  for (let k = 0; k < count; k++)
    fingers.push({ c: rnd(0, 6.2832), w: rnd(0.025, 0.07), a: rnd(0.5, 1) });
  for (let k = 0; k < 5; k++)
    fingers.push({ c: rnd(0, 6.2832), w: rnd(0.25, 0.5), a: rnd(0.15, 0.3) });

  const p1 = rnd(0, 6.28),
    p2 = rnd(0, 6.28),
    p3 = rnd(0, 6.28);

  for (let i = 0; i < n; i++) {
    const th = (i / n) * 6.2832;
    cos[i] = Math.cos(th);
    sin[i] = Math.sin(th);
    let g =
      0.28 +
      0.1 * Math.sin(th * 3 + p1) +
      0.06 * Math.sin(th * 7 + p2) +
      0.03 * Math.sin(th * 15 + p3);
    for (const f of fingers) {
      let d = Math.abs(th - f.c);
      d = Math.min(d, 6.2832 - d);
      g += f.a * Math.exp(-((d / f.w) ** 2));
    }
    g = clamp(g, 0, 1);
    delay[i] = (1 - g) * 0.42; // more venom => starts earlier ...
    dur[i] = 0.54 + (1 - g) * 0.04; // ... and runs faster (delay+dur <= 1)
  }

  const tips: Tip[] = fingers
    .slice(0, count)
    .map((f) => ({
      i: Math.round((f.c / 6.2832) * n) % n,
      amp: f.a,
    }));

  const R =
    Math.max(
      Math.hypot(ox, oy),
      Math.hypot(W - ox, oy),
      Math.hypot(ox, H - oy),
      Math.hypot(W - ox, H - oy),
    ) + 80;

  return { n, cos, sin, delay, dur, tips, R, ox, oy };
}

// slow, heavy start (thick liquid), smooth finish
const ease = (p: number) => 0.5 * p * p + 0.5 * (p * p * (3 - 2 * p));

/** one frame of the outline at progress u (0..1): xs/ys of every column */
function outline(f: Field, u: number, xs: Float32Array, ys: Float32Array) {
  for (let i = 0; i < f.n; i++) {
    const p = clamp((u - f.delay[i]) / f.dur[i], 0, 1);
    const r = ease(p) * f.R;
    xs[i] = f.ox + f.cos[i] * r;
    ys[i] = f.oy + f.sin[i] * r;
  }
}

type Frames = { xs: Float32Array[]; ys: Float32Array[] };

function buildFrames(f: Field, count: number): Frames {
  const xs: Float32Array[] = [];
  const ys: Float32Array[] = [];
  for (let k = 0; k <= count; k++) {
    const x = new Float32Array(f.n);
    const y = new Float32Array(f.n);
    outline(f, k / count, x, y);
    xs.push(x);
    ys.push(y);
  }
  return { xs, ys };
}

/* ------------------------------------------------------------------ */
/* Drawing the glossy goo                                             */
/* ------------------------------------------------------------------ */

type Look = { goo: string; sheen: string; shade: string };

const LOOK_DARK: Look = {
  goo: "#04030a",
  sheen: "rgba(190,170,255,0.42)",
  shade: "rgba(120,80,255,0.18)",
};
const LOOK_LIGHT: Look = {
  goo: "#f4f4fa",
  sheen: "rgba(255,255,255,0.95)",
  shade: "rgba(20,20,60,0.22)",
};

function tracePath(
  ctx: CanvasRenderingContext2D,
  xs: Float32Array,
  ys: Float32Array,
  n: number,
) {
  ctx.moveTo((xs[n - 1] + xs[0]) / 2, (ys[n - 1] + ys[0]) / 2);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ctx.quadraticCurveTo(xs[i], ys[i], (xs[i] + xs[j]) / 2, (ys[i] + ys[j]) / 2);
  }
  ctx.closePath();
}

function drawGoo(
  ctx: CanvasRenderingContext2D,
  f: Field,
  xs: Float32Array,
  ys: Float32Array,
  W: number,
  H: number,
  look: Look,
  fill: boolean,
) {
  ctx.clearRect(0, 0, W, H);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (fill) {
    ctx.beginPath();
    tracePath(ctx, xs, ys, f.n);
    ctx.fillStyle = look.goo;
    ctx.fill();
  }

  // soft violet shade (depth) -> solid goo rim -> glossy highlight
  ctx.beginPath();
  tracePath(ctx, xs, ys, f.n);
  ctx.strokeStyle = look.shade;
  ctx.lineWidth = 34;
  ctx.stroke();
  ctx.strokeStyle = look.goo;
  ctx.lineWidth = 15;
  ctx.stroke();
  ctx.save();
  ctx.translate(-2.5, -2.5);
  ctx.strokeStyle = look.sheen;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // heavy droplets at the tip of every tendril
  for (const t of f.tips) {
    const x = xs[t.i];
    const y = ys[t.i];
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    if (Math.hypot(x - f.ox, y - f.oy) < 12) continue;
    const r = 6 + t.amp * 7;
    ctx.fillStyle = look.goo;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.2832);
    ctx.fill();
    ctx.fillStyle = look.sheen;
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.28, 0, 6.2832);
    ctx.fill();
  }
}

function makeCanvas(W: number, H: number, cap: number) {
  const s = Math.min(1, Math.sqrt(cap / (W * H)));
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
    zIndex: "2147483000",
    pointerEvents: "none",
  });
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.scale(s, s);
  return { canvas, ctx };
}

/* ------------------------------------------------------------------ */
/* Tier 1: View Transitions (new theme revealed through the venom)    */
/* ------------------------------------------------------------------ */

function runVenom(
  toDark: boolean,
  swap: () => void,
  origin: { x: number; y: number },
  coarse: boolean,
) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const root = document.documentElement;

  const n = coarse ? 96 : 150;
  const FRAMES = coarse ? 32 : 44;
  const field = buildField(W, H, n, origin.x, origin.y);
  const frames = buildFrames(field, FRAMES);

  const keyframes: Keyframe[] = [];
  for (let k = 0; k <= FRAMES; k++) {
    let pts = "";
    for (let i = 0; i < n; i++)
      pts += `${i ? "," : ""}${frames.xs[k][i].toFixed(1)}px ${frames.ys[k][i].toFixed(1)}px`;
    keyframes.push({ clipPath: `polygon(${pts})` });
  }

  const style = document.createElement("style");
  style.textContent =
    "::view-transition-old(root),::view-transition-new(root){animation:none!important;mix-blend-mode:normal;}" +
    `::view-transition-new(root){clip-path:circle(0px at ${origin.x}px ${origin.y}px);}`;
  document.head.appendChild(style);

  // leftover fill:forwards animations leak into the NEXT transition
  for (const a of document.getAnimations()) {
    const pe = (a.effect as KeyframeEffect | null)?.pseudoElement;
    if (pe && pe.startsWith("::view-transition")) a.cancel();
  }

  const { canvas, ctx } = makeCanvas(W, H, coarse ? 0.8e6 : 1.6e6);
  const look = toDark ? LOOK_DARK : LOOK_LIGHT;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);

  let anim: Animation | null = null;
  let raf = 0;
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(guard);
    cancelAnimationFrame(raf);
    anim?.cancel();
    canvas.remove();
    style.remove();
    busy = false;
  };
  const guard = window.setTimeout(finish, MS + 2500);

  const vt = (document as any).startViewTransition(swap);

  vt.ready
    .then(() => {
      anim = root.animate(keyframes, {
        duration: MS,
        easing: "linear",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      });
      if (!ctx) return;
      document.body.appendChild(canvas);

      // draw the rim on exactly the same interpolated outline as the browser
      const loop = () => {
        if (done) return;
        const t = clamp(Number(anim?.currentTime ?? 0) / MS, 0, 1);
        const pos = t * FRAMES;
        const k = Math.min(Math.floor(pos), FRAMES - 1);
        const m = pos - k;
        for (let i = 0; i < n; i++) {
          xs[i] = frames.xs[k][i] + (frames.xs[k + 1][i] - frames.xs[k][i]) * m;
          ys[i] = frames.ys[k][i] + (frames.ys[k + 1][i] - frames.ys[k][i]) * m;
        }
        drawGoo(ctx, field, xs, ys, W, H, look, false);
        if (t < 1) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })
    .catch(() => {});

  vt.finished.finally(finish);
}

/* ------------------------------------------------------------------ */
/* Tier 2: canvas fallback (no View Transitions support)              */
/* ------------------------------------------------------------------ */

function runCanvas(
  toDark: boolean,
  swap: () => void,
  origin: { x: number; y: number },
) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const { canvas, ctx } = makeCanvas(W, H, 1.1e6);
  if (!ctx) {
    swap();
    busy = false;
    return;
  }

  const n = 96;
  const field = buildField(W, H, n, origin.x, origin.y);
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const look = toDark ? LOOK_DARK : LOOK_LIGHT;
  const root = document.documentElement;

  let swapped = false;
  const doSwap = () => {
    if (swapped) return;
    swapped = true;
    root.classList.add("theme-switching");
    swap();
  };
  let guard = 0;
  const cleanup = () => {
    window.clearTimeout(guard);
    doSwap();
    root.classList.remove("theme-switching");
    canvas.remove();
    busy = false;
  };
  guard = window.setTimeout(cleanup, MS + 2500);

  document.body.appendChild(canvas);
  let prev = 0;
  let elapsed = 0;
  const loop = (now: number) => {
    if (prev) elapsed += Math.min(now - prev, 34);
    prev = now;
    const t = elapsed / MS;
    outline(field, Math.min(t, 1), xs, ys);
    drawGoo(ctx, field, xs, ys, W, H, look, true);
    if (t >= 1) {
      doSwap();
      canvas.style.transition = "opacity 260ms ease-out";
      requestAnimationFrame(() => {
        canvas.style.opacity = "0";
        window.setTimeout(cleanup, 280);
      });
      return;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ */
/* Tier picker + component                                            */
/* ------------------------------------------------------------------ */

type Tier = "venom" | "canvas" | "instant";

function pickTier(): Tier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return "instant";
  return typeof (document as any).startViewTransition === "function"
    ? "venom"
    : "canvas";
}

/** Toggle the theme; `from` is the element clicked (the venom oozes out of it). */
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

  const r = from.getBoundingClientRect();
  const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

  busy = true;
  try {
    if (tier === "venom") {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      runVenom(toDark, apply, origin, coarse);
    } else {
      runCanvas(toDark, apply, origin);
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
