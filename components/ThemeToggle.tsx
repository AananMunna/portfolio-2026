"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * VENOM THEME TOGGLE
 * Light is always the starting theme. Dark is an opt-in for the browser session.
 *
 * A black, glossy symbiote bulges out of the button, whips curling tendrils
 * across the screen, sheds heavy droplets, then the body floods the rest. The
 * page flips theme underneath it.
 *
 *  1. "venom"   View Transitions + animated clip-path. The NEW theme is revealed
 *               through the venom shape, so text and content stay visible while
 *               the goo flows beneath them. A small canvas draws the glossy rim,
 *               tips and droplets on exactly the same moving outline.
 *  2. "canvas"  Browsers without View Transitions: the goo covers the screen,
 *               the theme swaps under it, then it fades away.
 *  3. "instant" prefers-reduced-motion: no animation at all.
 *
 * light -> dark : black venom.   dark -> light : pale "anti-venom".
 *
 * Performance notes: every vertex moves along a straight ray, so ~26 keyframes
 * interpolate exactly; all geometry is precomputed before the click is handled;
 * the canvas is pixel-capped and uses one Path2D per frame; CSS transitions are
 * disabled while the theme swaps so the new snapshot is captured clean.
 */

const MS = 1000;

let busy = false;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/* Venom field (polar, around the button)                             */
/* ------------------------------------------------------------------ */

type Drop = {
  ts: number; // seconds after start
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type Field = {
  n: number;
  th: Float32Array; // base angle of each vertex
  bend: Float32Array; // how much each vertex curls with distance
  delay: Float32Array;
  dur: Float32Array;
  tips: { i: number; r: number }[];
  drops: Drop[];
  R: number;
  ox: number;
  oy: number;
};

type Finger = { c: number; w: number; a: number; curl: number; main: boolean };

// heavy, viscous start; smooth, quick finish
const ease = (p: number) => 0.45 * p * p + 0.55 * (p * p * (3 - 2 * p));

function buildField(
  W: number,
  H: number,
  ox: number,
  oy: number,
  coarse: boolean,
): Field {
  const R =
    Math.max(
      Math.hypot(ox, oy),
      Math.hypot(W - ox, oy),
      Math.hypot(ox, H - oy),
      Math.hypot(W - ox, H - oy),
    ) + 80;
  const ref = R * 0.65; // px -> radians at a typical tendril distance

  // constant-width tendrils (long) + thin side branches + a few fat lumps
  const fingers: Finger[] = [];
  const mainCount = coarse ? 9 : 13;
  for (let k = 0; k < mainCount; k++)
    fingers.push({
      c: rnd(0, TAU),
      w: rnd(9, 20) / ref,
      a: rnd(0.6, 1),
      curl: rnd(-0.32, 0.32),
      main: true,
    });
  const thinCount = coarse ? 6 : 12;
  for (let k = 0; k < thinCount; k++)
    fingers.push({
      c: rnd(0, TAU),
      w: rnd(4, 8) / ref,
      a: rnd(0.35, 0.6),
      curl: rnd(-0.5, 0.5),
      main: false,
    });
  for (let k = 0; k < 4; k++)
    fingers.push({
      c: rnd(0, TAU),
      w: rnd(0.25, 0.5),
      a: rnd(0.12, 0.25),
      curl: 0,
      main: false,
    });

  // adaptive sampling: coarse everywhere, dense across every thin tendril
  const angles: number[] = [];
  const base = coarse ? 40 : 56;
  for (let i = 0; i < base; i++) angles.push((i / base) * TAU);
  for (const f of fingers) {
    if (f.w > 0.1) continue;
    const per = f.main ? 14 : 9;
    for (let k = 0; k < per; k++) {
      const t = (k / (per - 1) - 0.5) * 4.6 * f.w;
      angles.push((f.c + t + TAU) % TAU);
    }
  }
  angles.sort((a, b) => a - b);

  const n = angles.length;
  const th = new Float32Array(n);
  const bend = new Float32Array(n);
  const delay = new Float32Array(n);
  const dur = new Float32Array(n);

  const p1 = rnd(0, 6.28),
    p2 = rnd(0, 6.28),
    p3 = rnd(0, 6.28);

  for (let i = 0; i < n; i++) {
    const a = angles[i];
    th[i] = a;
    let g =
      0.26 +
      0.09 * Math.sin(a * 3 + p1) +
      0.06 * Math.sin(a * 7 + p2) +
      0.03 * Math.sin(a * 15 + p3);
    let b = 0;
    for (const f of fingers) {
      let d = Math.abs(a - f.c);
      d = Math.min(d, TAU - d);
      const wgt = Math.exp(-((d / f.w) ** 2));
      g += f.a * wgt;
      b += f.curl * wgt;
    }
    g = clamp(g, 0, 1);
    delay[i] = (1 - g) * 0.46; // more venom => starts earlier ...
    dur[i] = 0.5 + (1 - g) * 0.04; // ... delay + dur <= 1
    bend[i] = b;
  }

  const tips: Field["tips"] = [];
  const drops: Drop[] = [];
  for (const f of fingers) {
    if (!f.main) continue;
    let best = 0;
    let bd = 9;
    for (let i = 0; i < n; i++) {
      let d = Math.abs(th[i] - f.c);
      d = Math.min(d, TAU - d);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    tips.push({ i: best, r: 5 + f.a * 6 });
  }

  const f0: Field = { n, th, bend, delay, dur, tips, drops, R, ox, oy };

  // a few droplets tear off the tendrils and fall
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const dn = coarse ? 4 : 9;
  for (let k = 0; k < dn; k++) {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const u = rnd(0.28, 0.62);
    outline(f0, u, xs, ys);
    const x = xs[tip.i];
    const y = ys[tip.i];
    if (x < 10 || x > W - 10 || y < 10 || y > H - 10) continue;
    const ang = Math.atan2(y - oy, x - ox);
    const sp = rnd(40, 140);
    drops.push({
      ts: u * (MS / 1000),
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - rnd(0, 60),
      r: rnd(3.5, 7),
    });
  }
  return f0;
}

/** outline at progress u (0..1) into xs/ys */
function outline(f: Field, u: number, xs: Float32Array, ys: Float32Array) {
  const r0 = 14 * Math.min(1, u * 12); // starts as a button-sized blob
  for (let i = 0; i < f.n; i++) {
    const p = clamp((u - f.delay[i]) / f.dur[i], 0, 1);
    const r = Math.max(ease(p) * f.R, r0);
    const a = f.th[i] + f.bend[i] * Math.min(1, r / f.R) * 1.1;
    xs[i] = f.ox + Math.cos(a) * r;
    ys[i] = f.oy + Math.sin(a) * r;
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

type Look = { goo: string; sheen: string; shade: string; spec: string };

const LOOK_DARK: Look = {
  goo: "#030208",
  sheen: "rgba(170,150,255,0.38)",
  shade: "rgba(110,70,255,0.16)",
  spec: "rgba(255,255,255,0.75)",
};
const LOOK_LIGHT: Look = {
  goo: "#f3f3f9",
  sheen: "rgba(255,255,255,0.95)",
  shade: "rgba(20,20,70,0.2)",
  spec: "rgba(20,20,70,0.35)",
};

function gooPath(f: Field, xs: Float32Array, ys: Float32Array) {
  const n = f.n;
  const p = new Path2D();
  p.moveTo((xs[n - 1] + xs[0]) / 2, (ys[n - 1] + ys[0]) / 2);
  for (let i = 0; i < n; i++) {
    const j = i + 1 === n ? 0 : i + 1;
    p.quadraticCurveTo(xs[i], ys[i], (xs[i] + xs[j]) / 2, (ys[i] + ys[j]) / 2);
  }
  p.closePath();
  return p;
}

function drawGoo(
  ctx: CanvasRenderingContext2D,
  f: Field,
  xs: Float32Array,
  ys: Float32Array,
  W: number,
  H: number,
  look: Look,
  tsec: number,
  fill: boolean,
  coarse: boolean,
) {
  ctx.clearRect(0, 0, W, H);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const path = gooPath(f, xs, ys);

  if (fill) {
    ctx.fillStyle = look.goo;
    ctx.fill(path);
  }
  if (!coarse) {
    ctx.strokeStyle = look.shade; // soft depth halo
    ctx.lineWidth = 30;
    ctx.stroke(path);
  }
  ctx.strokeStyle = look.goo; // solid wet rim
  ctx.lineWidth = 14;
  ctx.stroke(path);
  ctx.save();
  ctx.translate(-2.5, -2.5);
  ctx.strokeStyle = look.sheen; // glossy highlight
  ctx.lineWidth = 2;
  ctx.stroke(path);
  ctx.restore();

  // heavy blobs at the tip of every tendril
  for (const t of f.tips) {
    const x = xs[t.i];
    const y = ys[t.i];
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    if (Math.hypot(x - f.ox, y - f.oy) < 16) continue;
    ctx.fillStyle = look.goo;
    ctx.beginPath();
    ctx.arc(x, y, t.r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = look.spec;
    ctx.beginPath();
    ctx.arc(x - t.r * 0.32, y - t.r * 0.34, t.r * 0.24, 0, TAU);
    ctx.fill();
  }

  // droplets in free fall
  for (const d of f.drops) {
    const dt = tsec - d.ts;
    if (dt < 0 || dt > 0.45) continue;
    const x = d.x + d.vx * dt;
    const y = d.y + d.vy * dt + 0.5 * 2600 * dt * dt;
    if (y > H + 20) continue;
    const r = d.r * (1 - dt / 0.6);
    ctx.fillStyle = look.goo;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.85, r * (1 + dt * 0.9), 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = look.spec;
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, TAU);
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
  const ctx = canvas.getContext("2d", { alpha: true });
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

  const FRAMES = coarse ? 22 : 28;
  const field = buildField(W, H, origin.x, origin.y, coarse);
  const n = field.n;
  const frames = buildFrames(field, FRAMES);

  const keyframes: Keyframe[] = [];
  for (let k = 0; k <= FRAMES; k++) {
    let pts = "";
    for (let i = 0; i < n; i++)
      pts += `${i ? "," : ""}${frames.xs[k][i].toFixed(0)}px ${frames.ys[k][i].toFixed(0)}px`;
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

  const { canvas, ctx } = makeCanvas(W, H, coarse ? 0.55e6 : 1.0e6);
  const look = toDark ? LOOK_DARK : LOOK_LIGHT;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);

  let anim: Animation | null = null;
  let raf = 0;
  let done = false;
  let guard = 0;

  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(guard);
    cancelAnimationFrame(raf);
    anim?.cancel();
    canvas.remove();
    style.remove();
    root.classList.remove("theme-switching");
    busy = false;
  };
  guard = window.setTimeout(finish, MS + 2500);

  const vt = (document as any).startViewTransition(() => {
    root.classList.add("theme-switching"); // clean snapshot, no colour fades
    swap();
  });

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

      // rim drawn on exactly the same interpolated outline as the browser
      const loop = () => {
        if (done) return;
        const t = clamp(Number(anim?.currentTime ?? 0) / MS, 0, 1);
        const pos = t * FRAMES;
        const k = Math.min(Math.floor(pos), FRAMES - 1);
        const m = pos - k;
        const ax = frames.xs[k],
          bx = frames.xs[k + 1],
          ay = frames.ys[k],
          by = frames.ys[k + 1];
        for (let i = 0; i < n; i++) {
          xs[i] = ax[i] + (bx[i] - ax[i]) * m;
          ys[i] = ay[i] + (by[i] - ay[i]) * m;
        }
        drawGoo(ctx, field, xs, ys, W, H, look, t * (MS / 1000), false, coarse);
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
  coarse: boolean,
) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const { canvas, ctx } = makeCanvas(W, H, 0.8e6);
  if (!ctx) {
    swap();
    busy = false;
    return;
  }

  const field = buildField(W, H, origin.x, origin.y, true);
  const xs = new Float32Array(field.n);
  const ys = new Float32Array(field.n);
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
    drawGoo(ctx, field, xs, ys, W, H, look, elapsed / 1000, true, coarse);
    if (t >= 1) {
      doSwap();
      canvas.style.transition = "opacity 240ms ease-out";
      requestAnimationFrame(() => {
        canvas.style.opacity = "0";
        window.setTimeout(cleanup, 260);
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
  const nav = navigator as any;
  const coarse =
    window.matchMedia("(pointer: coarse)").matches ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4;

  busy = true;
  try {
    if (tier === "venom") runVenom(toDark, apply, origin, coarse);
    else runCanvas(toDark, apply, origin, coarse);
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
