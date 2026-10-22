"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode, RefObject } from "react";
import { IoLogoCss3 } from "react-icons/io5";
import {
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiFramer,
  SiRedux,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiVercel,
} from "react-icons/si";
import {
  Globe,
  Network,
  RefreshCw,
  KeyRound,
  Binary,
  Terminal,
  Database,
  ShieldCheck,
  Layers,
  Smartphone,
  Check,
} from "lucide-react";

/* ════════════════════════════════════════════════════════
   A bonsai that holds the skills and explains the software
   lifecycle out loud.

   Roots     → fundamentals / what happens behind the scenes
   Trunk     → backend
   Branches  → frontend
   Blossoms  → shipping

   Performance: all motion is CSS transform/opacity on a few
   static layers; no JS animation loop, no SVG filters.
   Responsive: wide screens show labelled tags, phones show
   icon tokens (tap one and the bonsai tells you about it).
   ════════════════════════════════════════════════════════ */

type StageId = "roots" | "trunk" | "branches" | "blossoms";

type Skill = {
  id: string;
  label: string;
  icon: ElementType;
  color: string;
  level: number; // 0-100 → EDIT to your honest numbers
  stage: StageId;
  x: number;
  y: number;
  note: string;
  behind?: string;
  tie?: [number, number];
  d: number;
};

const STAGES: {
  id: StageId;
  n: number;
  name: string;
  sub: string;
  color: string;
  ink: string;
}[] = [
  {
    id: "roots",
    n: 1,
    name: "Roots",
    sub: "Fundamentals",
    color: "#c9a273",
    ink: "#8a6a3c",
  },
  {
    id: "trunk",
    n: 2,
    name: "Trunk",
    sub: "Backend",
    color: "#8fbf7a",
    ink: "#3f7a2f",
  },
  {
    id: "branches",
    n: 3,
    name: "Branches",
    sub: "Frontend",
    color: "#a3e635",
    ink: "#4a7a0c",
  },
  {
    id: "blossoms",
    n: 4,
    name: "Blossoms",
    sub: "Shipping",
    color: "#f4a7b9",
    ink: "#b4506f",
  },
];

/* What the bonsai says, stage by stage */
const NARRATION: string[] = [
  "I start underground. These roots are the fundamentals: how HTTP, DNS, the event loop, databases and security really work.",
  "My trunk is the backend. Node.js, Express, REST and MongoDB carry every request, and I know what runs underneath them.",
  "My branches are the frontend. HTML, CSS, TypeScript, React and Next.js reach out to the people using the product.",
  "My blossoms are shipping. Git, CI/CD and deploys turn finished work into something real users can open.",
  "Roots to blossoms: that is the whole software lifecycle, understood end to end. Select any skill to see how I use it.",
];

const RAW: Omit<Skill, "d">[] = [
  /* ROOTS */
  {
    id: "http",
    label: "HTTP / HTTPS",
    icon: Globe,
    color: "#2f6f8f",
    level: 88,
    stage: "roots",
    x: 162,
    y: 795,
    note: "How a request really travels: methods, status codes, headers, caching, cookies and TLS.",
    behind: "Every API I write is just a conversation in this protocol.",
  },
  {
    id: "dns",
    label: "DNS & TCP/IP",
    icon: Network,
    color: "#6b5b95",
    level: 80,
    stage: "roots",
    x: 307,
    y: 795,
    note: "What happens between typing a URL and the first byte: DNS lookup, TCP handshake, TLS negotiation.",
  },
  {
    id: "loop",
    label: "Event Loop",
    icon: RefreshCw,
    color: "#b5651d",
    level: 85,
    stage: "roots",
    x: 452,
    y: 795,
    note: "Why Node.js serves thousands of connections on one thread: call stack, task queues, non-blocking I/O.",
    behind: "V8 compiles my JavaScript; libuv does the waiting.",
  },
  {
    id: "auth",
    label: "Auth & JWT",
    icon: KeyRound,
    color: "#a0522d",
    level: 85,
    stage: "roots",
    x: 597,
    y: 795,
    note: "Sessions vs tokens, password hashing, refresh flows and role-based access.",
  },
  {
    id: "dsa",
    label: "DS & Algo",
    icon: Binary,
    color: "#3d6b4f",
    level: 78,
    stage: "roots",
    x: 162,
    y: 872,
    note: "Picking the right structure (maps, trees, queues) and thinking in complexity, so code stays fast at scale.",
  },
  {
    id: "linux",
    label: "Linux & CLI",
    icon: Terminal,
    color: "#44403c",
    level: 80,
    stage: "roots",
    x: 307,
    y: 872,
    note: "Processes, permissions, ports, logs, SSH and shell scripting.",
  },
  {
    id: "dbi",
    label: "DB Internals",
    icon: Database,
    color: "#1f6f5c",
    level: 78,
    stage: "roots",
    x: 452,
    y: 872,
    note: "Indexes, query plans, transactions and schema design: why a query is slow, and how to fix it.",
  },
  {
    id: "sec",
    label: "Web Security",
    icon: ShieldCheck,
    color: "#a33a3a",
    level: 82,
    stage: "roots",
    x: 597,
    y: 872,
    note: "CORS, XSS, CSRF, input validation, rate limiting and secret handling.",
  },

  /* TRUNK */
  {
    id: "node",
    label: "Node.js",
    icon: SiNodedotjs,
    color: "#3c873a",
    level: 88,
    stage: "trunk",
    x: 200,
    y: 640,
    tie: [326, 640],
    note: "JavaScript on the server: file I/O, streams, child processes, scalable services.",
    behind:
      "Underneath it is V8 + libuv + C++ bindings. I work with streams and buffers, not magic.",
  },
  {
    id: "express",
    label: "Express",
    icon: SiExpress,
    color: "#333333",
    level: 85,
    stage: "trunk",
    x: 200,
    y: 685,
    tie: [338, 685],
    note: "Routing, middleware, error handling and clean project structure.",
    behind:
      "Express is a thin layer over Node's http module: request → middleware chain → response.",
  },
  {
    id: "api",
    label: "REST API",
    icon: Layers,
    color: "#4f46e5",
    level: 85,
    stage: "trunk",
    x: 545,
    y: 640,
    tie: [386, 640],
    note: "Resource-oriented endpoints, validation, pagination, versioning and consistent error shapes.",
  },
  {
    id: "mongo",
    label: "MongoDB",
    icon: SiMongodb,
    color: "#2f8f3f",
    level: 82,
    stage: "trunk",
    x: 545,
    y: 685,
    tie: [404, 685],
    note: "Document modelling, indexes and aggregation pipelines.",
    behind: "Data sits on disk as BSON, and indexes are B-trees.",
  },

  /* BRANCHES */
  {
    id: "html",
    label: "HTML5",
    icon: SiHtml5,
    color: "#E34F26",
    level: 100,
    stage: "branches",
    x: 110,
    y: 493,
    note: "Semantic, accessible markup that search engines and screen readers understand.",
  },
  {
    id: "css",
    label: "CSS3",
    icon: IoLogoCss3,
    color: "#1572B6",
    level: 95,
    stage: "branches",
    x: 255,
    y: 493,
    note: "Layout with Grid and Flexbox, animation, custom properties, modern CSS.",
  },
  {
    id: "tw",
    label: "Tailwind",
    icon: SiTailwindcss,
    color: "#0891b2",
    level: 92,
    stage: "branches",
    x: 110,
    y: 532,
    note: "Utility-first styling and design tokens for consistent UI.",
  },
  {
    id: "resp",
    label: "Responsive",
    icon: Smartphone,
    color: "#db2777",
    level: 95,
    stage: "branches",
    x: 255,
    y: 532,
    note: "Mobile-first layouts that feel right from a phone to a wide monitor.",
  },
  {
    id: "js",
    label: "JavaScript",
    icon: SiJavascript,
    color: "#b89b00",
    level: 98,
    stage: "branches",
    x: 520,
    y: 435,
    note: "Modern ES features, async patterns, closures, modules.",
    behind:
      "I know how the engine runs it: scope chain, event loop, garbage collection.",
  },
  {
    id: "ts",
    label: "TypeScript",
    icon: SiTypescript,
    color: "#3178C6",
    level: 85,
    stage: "branches",
    x: 650,
    y: 435,
    note: "Typed code, shared types between frontend and backend, safer refactors.",
  },
  {
    id: "redux",
    label: "Redux",
    icon: SiRedux,
    color: "#764ABC",
    level: 83,
    stage: "branches",
    x: 100,
    y: 322,
    note: "Predictable global state with Redux Toolkit.",
  },
  {
    id: "fm",
    label: "Framer Motion",
    icon: SiFramer,
    color: "#0055FF",
    level: 87,
    stage: "branches",
    x: 258,
    y: 322,
    note: "Purposeful animation: scroll reveals, gestures, layout transitions.",
  },
  {
    id: "react",
    label: "React",
    icon: SiReact,
    color: "#1c9bc7",
    level: 95,
    stage: "branches",
    x: 320,
    y: 112,
    note: "Component architecture, hooks, performance and clean data flow.",
    behind: "Rendering is state → virtual tree → diff → minimal DOM updates.",
  },
  {
    id: "next",
    label: "Next.js",
    icon: SiNextdotjs,
    color: "#111111",
    level: 90,
    stage: "branches",
    x: 445,
    y: 112,
    note: "App Router, server components, SSR/SSG, API routes and SEO.",
  },

  /* BLOSSOMS */
  {
    id: "git",
    label: "Git",
    icon: SiGit,
    color: "#F05032",
    level: 90,
    stage: "blossoms",
    x: 520,
    y: 200,
    note: "Branching strategies, clean history, rebasing and conflict resolution.",
  },
  {
    id: "github",
    label: "GitHub",
    icon: SiGithub,
    color: "#24292f",
    level: 92,
    stage: "blossoms",
    x: 648,
    y: 200,
    note: "Pull requests, code review, issues and project boards.",
  },
  {
    id: "cicd",
    label: "CI/CD",
    icon: SiGithubactions,
    color: "#2088FF",
    level: 80,
    stage: "blossoms",
    x: 520,
    y: 236,
    note: "Automated lint, test and build pipelines on every push.",
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: SiVercel,
    color: "#111111",
    level: 85,
    stage: "blossoms",
    x: 648,
    y: 236,
    note: "Production deploys, preview builds, environment config, domains and monitoring.",
  },
];

/* Entrance timing (seconds). The whole tree finishes in ~2.3s. */
const BASE_DELAY: Record<StageId, [number, number]> = {
  roots: [0.45, 0.035],
  trunk: [0.95, 0.05],
  branches: [1.4, 0.04],
  blossoms: [1.8, 0.05],
};
const counters: Partial<Record<StageId, number>> = {};
const SKILLS: Skill[] = RAW.map((s) => {
  const i = (counters[s.stage] = (counters[s.stage] ?? -1) + 1);
  const [base, step] = BASE_DELAY[s.stage];
  return { ...s, d: +(base + i * step).toFixed(3) };
});

/* ════════════════════════════════════════════════════════
   Drawing helpers (deterministic → same on server & client)
   ════════════════════════════════════════════════════════ */
const VB = { w: 760, h: 1000 };
const VIEWBOX = `0 0 ${VB.w} ${VB.h}`;
const TRUNK_X = 380;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P = [number, number];
const f = (n: number) => n.toFixed(1);
const poly = (pts: P[]) => pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L");
const blob = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
const pct = (x: number, y: number) =>
  ({
    "--ox": `${((x / VB.w) * 100).toFixed(2)}%`,
    "--oy": `${((y / VB.h) * 100).toFixed(2)}%`,
  }) as CSSProperties;

function sample(pts: P[], per = 8): P[] {
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  const out: P[] = [];
  for (let i = 1; i < p.length - 2; i++) {
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (k: 0 | 1) =>
        0.5 *
        (2 * p[i][k] +
          (-p[i - 1][k] + p[i + 1][k]) * t +
          (2 * p[i - 1][k] - 5 * p[i][k] + 4 * p[i + 1][k] - p[i + 2][k]) * t2 +
          (-p[i - 1][k] + 3 * p[i][k] - 3 * p[i + 1][k] + p[i + 2][k]) * t3);
      out.push([c(0), c(1)]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Tapered, gently bumpy limb: outline, bark grain and an edge line (for deadwood) */
function buildLimb(
  pts: P[],
  w0: number,
  w1: number,
  seed: number,
  flare = 1.6,
) {
  const s = sample(pts);
  const r = rng(seed);
  const n = s.length;
  const L: P[] = [];
  const R: P[] = [];
  const gA: P[] = [];
  const gB: P[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = s[Math.max(0, i - 1)];
    const b = s[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy;
    const ny = dx;
    const w = (w1 + (w0 - w1) * Math.pow(1 - t, flare)) / 2;
    const wl = w * (1 + (r() - 0.5) * 0.14);
    const wr = w * (1 + (r() - 0.5) * 0.14);
    L.push([s[i][0] + nx * wl, s[i][1] + ny * wl]);
    R.push([s[i][0] - nx * wr, s[i][1] - ny * wr]);
    gA.push([s[i][0] + nx * w * 0.5, s[i][1] + ny * w * 0.5]);
    gB.push([s[i][0] - nx * w * 0.32, s[i][1] - ny * w * 0.32]);
  }
  return {
    d: `M${poly(L)} L${poly([...R].reverse())} Z`,
    grain: [`M${poly(gA)}`, `M${poly(gB)}`],
    edge: gA,
  };
}

/* An old, twisting trunk */
const TRUNK = buildLimb(
  [
    [380, 748],
    [372, 690],
    [350, 625],
    [352, 565],
    [385, 515],
    [405, 465],
    [395, 410],
    [370, 360],
    [365, 310],
    [380, 255],
    [385, 200],
    [380, 140],
  ],
  84,
  12,
  11,
  1.7,
);
/* Shari: a ribbon of pale, exposed deadwood running up the trunk */
const SHARI = `M${poly(TRUNK.edge.slice(Math.floor(TRUNK.edge.length * 0.16), Math.floor(TRUNK.edge.length * 0.52)))}`;
/* Jin: a bare, pointed deadwood branch */
const JIN = buildLimb(
  [
    [394, 428],
    [364, 410],
    [340, 388],
    [326, 366],
  ],
  12,
  1.5,
  31,
  1,
);

const BRANCHES = [
  {
    id: "l1",
    delay: 0.85,
    ox: 352,
    oy: 590,
    limb: buildLimb(
      [
        [352, 590],
        [300, 590],
        [245, 566],
        [200, 546],
      ],
      26,
      6,
      21,
      1,
    ),
  },
  {
    id: "r1",
    delay: 1.0,
    ox: 402,
    oy: 470,
    limb: buildLimb(
      [
        [402, 470],
        [460, 468],
        [530, 456],
        [590, 448],
      ],
      22,
      5,
      22,
      1,
    ),
  },
  {
    id: "l2",
    delay: 1.15,
    ox: 368,
    oy: 345,
    limb: buildLimb(
      [
        [368, 345],
        [320, 342],
        [260, 336],
        [200, 332],
      ],
      18,
      4,
      23,
      1,
    ),
  },
  {
    id: "r2",
    delay: 1.25,
    ox: 373,
    oy: 280,
    limb: buildLimb(
      [
        [373, 280],
        [440, 272],
        [520, 252],
        [590, 240],
      ],
      16,
      4,
      24,
      1,
    ),
  },
];

/* Nebari: surface roots flaring over the soil */
const NEBARI = [
  [
    [372, 744],
    [330, 736],
    [290, 740],
    [252, 750],
  ],
  [
    [376, 746],
    [340, 742],
    [310, 750],
    [284, 760],
  ],
  [
    [388, 744],
    [430, 735],
    [470, 739],
    [508, 749],
  ],
  [
    [384, 746],
    [420, 743],
    [450, 751],
    [476, 761],
  ],
  [
    [380, 748],
    [372, 756],
    [364, 764],
    [356, 770],
  ],
].map((pts, i) => buildLimb(pts as P[], 20, 3, 40 + i, 1));

/* Roots */
const ROOT_BASE: P = [380, 754];
const quad = (a: P, c: P, b: P, t: number): P => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];
const ROOTS = SKILLS.filter((s) => s.stage === "roots").map((s, i) => {
  const r = rng(100 + i * 7);
  const end: P = [s.x, s.y - 17];
  const ctrl: P = [
    ROOT_BASE[0] + (end[0] - ROOT_BASE[0]) * 0.78,
    ROOT_BASE[1] + (end[1] - ROOT_BASE[1]) * 0.12 + (r() - 0.5) * 14,
  ];
  const hairs = [0.5, 0.78]
    .map((t) => {
      const p = quad(ROOT_BASE, ctrl, end, t);
      const dir = r() > 0.5 ? 1 : -1;
      const q: P = [p[0] + dir * (14 + r() * 22), p[1] + 10 + r() * 24];
      const c: P = [p[0] + dir * 6, p[1] + 4 + r() * 10];
      return `M${f(p[0])} ${f(p[1])}Q${f(c[0])} ${f(c[1])} ${f(q[0])} ${f(q[1])}`;
    })
    .join("");
  return {
    id: s.id,
    d: `M${ROOT_BASE[0]} ${ROOT_BASE[1]}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(end[0])} ${f(end[1])}`,
    hairs,
    delay: 0.12 + i * 0.05,
  };
});

/* ── Foliage: flat, cloud-pruned pine pads made of needle tufts ── */
type PadDef = {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  ox: number;
  oy: number;
  seed: number;
  tufts: number;
  delay: number;
  flowers?: boolean;
};
const PAD_DEFS: PadDef[] = [
  {
    id: "l1",
    cx: 190,
    cy: 515,
    rx: 165,
    ry: 74,
    ox: 240,
    oy: 556,
    seed: 1,
    tufts: 78,
    delay: 1.15,
  },
  {
    id: "r1",
    cx: 585,
    cy: 435,
    rx: 150,
    ry: 54,
    ox: 500,
    oy: 462,
    seed: 2,
    tufts: 62,
    delay: 1.3,
  },
  {
    id: "l2",
    cx: 185,
    cy: 322,
    rx: 150,
    ry: 54,
    ox: 270,
    oy: 336,
    seed: 3,
    tufts: 62,
    delay: 1.45,
  },
  {
    id: "crown",
    cx: 380,
    cy: 112,
    rx: 180,
    ry: 62,
    ox: 380,
    oy: 150,
    seed: 4,
    tufts: 78,
    delay: 1.55,
  },
  {
    id: "r2",
    cx: 590,
    cy: 218,
    rx: 150,
    ry: 68,
    ox: 480,
    oy: 262,
    seed: 5,
    tufts: 70,
    delay: 1.65,
    flowers: true,
  },
];
// lightest → darkest
const NEEDLE_TONES = ["#b3df93", "#84c670", "#58a65a", "#3f8449", "#2b6139"];

function makePad(p: PadDef) {
  const r = rng(p.seed * 977);
  const ryT = p.ry * 0.58;
  const ryB = p.ry * 0.44;
  const pt = (scale = 1) => {
    const ang = r() * Math.PI * 2;
    const wob = 1 + 0.08 * Math.sin(ang * 6 + p.seed);
    const rad = Math.sqrt(r()) * wob * scale;
    const sy = Math.sin(ang);
    return {
      x: p.cx + Math.cos(ang) * rad * p.rx,
      y: p.cy + sy * rad * (sy < 0 ? ryT : ryB),
    };
  };
  // dense dark body so the pad reads as one soft, flat cloud
  let body = "";
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2 + r() * 0.25;
    const sy = Math.sin(a);
    body += blob(
      p.cx + Math.cos(a) * p.rx * 0.76,
      p.cy + sy * (sy < 0 ? ryT : ryB) * 0.7,
      p.rx * (0.17 + r() * 0.07),
      p.ry * (0.34 + r() * 0.1),
    );
  }
  for (let k = 0; k < 3; k++)
    body += blob(
      p.cx + (r() - 0.5) * p.rx * 0.8,
      p.cy + (r() - 0.5) * p.ry * 0.4,
      p.rx * 0.45,
      p.ry * 0.5,
    );
  const shade = blob(p.cx, p.cy + ryB * 0.5, p.rx * 0.86, ryB * 0.75);

  const tones = NEEDLE_TONES.map(() => "");
  for (let i = 0; i < p.tufts; i++) {
    const q = pt();
    const score =
      ((q.y - (p.cy - ryT)) / (ryT + ryB)) * 0.7 +
      ((q.x - p.cx) / p.rx) * 0.12 +
      r() * 0.35;
    const idx = Math.min(4, Math.max(0, Math.floor(score * 5)));
    const len = 10 + r() * 6;
    const base = -Math.PI / 2 + (r() - 0.5) * 0.5;
    for (let k = 0; k < 8; k++) {
      const a = base + (k / 7 - 0.5) * Math.PI * 1.1 + (r() - 0.5) * 0.15;
      tones[idx] +=
        `M${f(q.x)} ${f(q.y)}l${f(Math.cos(a) * len)} ${f(Math.sin(a) * len)}`;
    }
  }
  let pink = "";
  let white = "";
  let centre = "";
  if (p.flowers) {
    for (let i = 0; i < 16; i++) {
      const q = pt(0.9);
      const s = 3.6 + r() * 1.8;
      if (r() > 0.7) white += blob(q.x, q.y, s, s);
      else pink += blob(q.x, q.y, s, s);
      centre += blob(q.x, q.y, s * 0.32, s * 0.32);
    }
  }
  return { body, shade, tones, pink, white, centre };
}
const PADS = PAD_DEFS.map((d) => ({ def: d, ...makePad(d) }));

/* Soil + moss */
const SOIL = (() => {
  const r = rng(555);
  const cols = ["#5a4332", "#241811", "#6b5a48", "#3a2a1d"];
  const out = cols.map(() => "");
  for (let i = 0; i < 70; i++) {
    const y = 748 + r() * 158;
    const k = (y - 738) / 180;
    const left = 64 + k * 36;
    const right = 696 - k * 36;
    const x = left + r() * (right - left);
    const rad = 1 + r() * 2.6;
    out[Math.floor(r() * 4)] += blob(x, y, rad, rad);
  }
  return out.map((d, i) => ({ d, fill: cols[i] }));
})();
const MOSS = (() => {
  const r = rng(808);
  let a = "";
  let b = "";
  for (let i = 0; i < 46; i++) {
    const x = 66 + r() * 628;
    const u = (x - 380) / 320;
    const y = 738 - 19 * (1 - u * u) + (r() - 0.5) * 5;
    const s = blob(x, y, 5 + r() * 6, 2.5 + r() * 2.4);
    if (r() > 0.5) a += s;
    else b += s;
  }
  return { a, b };
})();

/* ════════════════════════════════════════════════════════
   Static drawing: rendered once, never re-rendered
   ════════════════════════════════════════════════════════ */
const Layer = ({
  cls,
  style,
  children,
}: {
  cls: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <div className={`bz-layer ${cls}`} style={style} aria-hidden="true">
    <svg viewBox={VIEWBOX}>{children}</svg>
  </div>
);

const Limb = ({
  id,
  limb,
  outline = true,
}: {
  id: string;
  limb: ReturnType<typeof buildLimb>;
  outline?: boolean;
}) => (
  <>
    <defs>
      <linearGradient id={`bark-${id}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#a68059" />
        <stop offset="0.5" stopColor="#7a5a3c" />
        <stop offset="1" stopColor="#4d3825" />
      </linearGradient>
    </defs>
    <path
      d={limb.d}
      fill={`url(#bark-${id})`}
      stroke={outline ? "#34230f" : "none"}
      strokeOpacity={0.55}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
    {limb.grain.map((g, i) => (
      <path
        key={i}
        d={g}
        fill="none"
        stroke="#3e2a18"
        strokeOpacity={0.38}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray={i ? "10 12 4 9" : "16 10 5 12"}
      />
    ))}
  </>
);

const TreeStatic = memo(function TreeStatic() {
  return (
    <>
      {/* backdrop, pot and soil */}
      <Layer cls="bz-rise" style={{ "--delay": "0s" } as CSSProperties}>
        <defs>
          <linearGradient id="bz-soil" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#4d3929" />
            <stop offset="1" stopColor="#291c13" />
          </linearGradient>
          <linearGradient id="bz-glaze" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#262a33" />
            <stop offset="0.5" stopColor="#15171c" />
            <stop offset="1" stopColor="#0f1013" />
          </linearGradient>
          <radialGradient id="bz-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f5e6b8" stopOpacity="0.11" />
            <stop offset="1" stopColor="#f5e6b8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={380} cy={400} r={380} fill="url(#bz-glow)" />
        <circle
          cx={380}
          cy={380}
          r={250}
          fill="none"
          stroke="rgba(245,230,184,.07)"
          strokeWidth={1.5}
        />
        <ellipse cx={380} cy={968} rx={300} ry={11} fill="rgba(0,0,0,.4)" />
        <rect x={70} y={940} width={620} height={16} rx={6} fill="#101114" />
        <rect x={120} y={954} width={38} height={8} rx={3} fill="#101114" />
        <rect x={602} y={954} width={38} height={8} rx={3} fill="#101114" />
        <path
          d="M44 724 L716 724 L668 928 L92 928 Z"
          fill="url(#bz-glaze)"
          stroke="#15171c"
          strokeWidth={16}
          strokeLinejoin="round"
        />
        <path
          d="M54 736 L100 918"
          stroke="rgba(255,255,255,.14)"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        <rect x={30} y={710} width={700} height={22} rx={9} fill="#1d2026" />
        <path
          d="M42 713 L718 713"
          stroke="#c2a35e"
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d="M56 738 Q220 710 380 720 Q540 710 704 738 L660 914 L100 914 Z"
          fill="url(#bz-soil)"
        />
        {SOIL.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} opacity={0.8} />
        ))}
      </Layer>

      {/* roots, drawn in with a small stroke animation */}
      <div className="bz-vis" aria-hidden="true">
        <svg
          viewBox={VIEWBOX}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {ROOTS.map((r) => (
            <g key={r.id} fill="none" strokeLinecap="round" stroke="#b58d5f">
              <path
                className="bz-rp"
                pathLength={1}
                d={r.d}
                strokeWidth={6}
                style={{ "--delay": `${r.delay}s` } as CSSProperties}
              />
              <path
                className="bz-rp"
                pathLength={1}
                d={r.hairs}
                strokeWidth={1.6}
                strokeOpacity={0.7}
                style={{ "--delay": `${r.delay + 0.35}s` } as CSSProperties}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* trunk grows up from the soil, with deadwood details */}
      <Layer
        cls="bz-up"
        style={
          {
            ...pct(TRUNK_X, 748),
            "--delay": "0.45s",
            "--dur": "0.9s",
          } as CSSProperties
        }
      >
        <Limb id="trunk" limb={TRUNK} />
        <path
          d={SHARI}
          fill="none"
          stroke="#d7ccb4"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.9}
        />
        <path
          d={SHARI}
          fill="none"
          stroke="#9c8d6e"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity={0.7}
        />
        <path
          d={JIN.d}
          fill="#d7ccb4"
          stroke="#8a7a5c"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </Layer>

      {/* surface roots (nebari) */}
      <Layer cls="bz-rise" style={{ "--delay": "0.55s" } as CSSProperties}>
        {NEBARI.map((n, i) => (
          <Limb key={i} id={`neb${i}`} limb={n} />
        ))}
      </Layer>

      {/* branches grow out from the trunk */}
      {BRANCHES.map((b) => (
        <Layer
          key={b.id}
          cls="bz-grow"
          style={
            {
              ...pct(b.ox, b.oy),
              "--delay": `${b.delay}s`,
              "--dur": "0.5s",
            } as CSSProperties
          }
        >
          <Limb id={b.id} limb={b.limb} />
        </Layer>
      ))}

      {/* moss + stones */}
      <Layer cls="bz-rise" style={{ "--delay": "0.6s" } as CSSProperties}>
        <path d={MOSS.a} fill="#5c9a46" />
        <path d={MOSS.b} fill="#46803a" />
        <ellipse cx={150} cy={734} rx={15} ry={8} fill="#8d8a85" />
        <ellipse cx={144} cy={731} rx={6} ry={3} fill="#a9a6a0" />
        <ellipse cx={618} cy={735} rx={11} ry={6} fill="#7d7a75" />
      </Layer>

      {/* foliage pads: pop out of the branch tips, then sway gently */}
      {PADS.map((p) => (
        <div
          key={p.def.id}
          className="bz-layer bz-bloom"
          style={
            {
              ...pct(p.def.ox, p.def.oy),
              "--delay": `${p.def.delay}s`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <svg viewBox={VIEWBOX}>
            <path d={p.shade} fill="#173a22" />
            <path d={p.body} fill="#1f4a2a" />
            {[4, 3, 2, 1, 0].map((i) => (
              <path
                key={i}
                d={p.tones[i]}
                fill="none"
                stroke={NEEDLE_TONES[i]}
                strokeWidth={1.3}
                strokeLinecap="round"
              />
            ))}
            {p.pink && (
              <path
                d={p.pink}
                fill="#f6b8c8"
                stroke="#e58ca6"
                strokeWidth={0.8}
              />
            )}
            {p.white && (
              <path
                d={p.white}
                fill="#fff3f5"
                stroke="#e58ca6"
                strokeWidth={0.8}
              />
            )}
            {p.centre && <path d={p.centre} fill="#f7d774" />}
          </svg>
        </div>
      ))}
    </>
  );
});

/* ════════════════════════════════════════════════════════
   CSS: only transform / opacity are animated (plus one small
   stroke-dashoffset on the roots)
   ════════════════════════════════════════════════════════ */
const CSS = `
.bz{--e:cubic-bezier(.22,1,.36,1);container-type:inline-size}
.bz-layer,.bz-vis{position:absolute;inset:0;pointer-events:none}
.bz-layer{opacity:0}
.bz-layer>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.bz-rp{stroke-dasharray:1;stroke-dashoffset:1}

.bz[data-on] .bz-rise{animation:bz-rise .55s var(--e) var(--delay) both}
.bz[data-on] .bz-rp{animation:bz-draw .7s var(--e) var(--delay) forwards}
.bz[data-on] .bz-up{transform-origin:var(--ox) var(--oy);animation:bz-up var(--dur) var(--e) var(--delay) both}
.bz[data-on] .bz-grow{transform-origin:var(--ox) var(--oy);animation:bz-grow var(--dur) var(--e) var(--delay) both}
.bz[data-on] .bz-bloom{transform-origin:var(--ox) var(--oy);animation:bz-bloom .6s cubic-bezier(.34,1.3,.64,1) var(--delay) both}
.bz[data-on] .bz-bloom>svg{transform-origin:var(--ox) var(--oy);animation:bz-sway 8s ease-in-out calc(var(--delay) + 1.2s) infinite alternate}
@keyframes bz-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes bz-draw{to{stroke-dashoffset:0}}
@keyframes bz-up{from{opacity:1;transform:scale(.7,.01)}to{opacity:1;transform:none}}
@keyframes bz-grow{from{opacity:1;transform:scale(.01)}to{opacity:1;transform:none}}
@keyframes bz-bloom{from{opacity:0;transform:scale(.3)}40%{opacity:1}to{opacity:1;transform:none}}
@keyframes bz-sway{from{transform:rotate(-.6deg)}to{transform:rotate(.6deg)}}

/* skill tags: labelled pills on wide screens, icon tokens on phones */
.bz-chip{position:absolute;transform:translate(-50%,-50%);transition:opacity .25s ease}
.bz-pop{opacity:0}
.bz[data-on] .bz-pop{animation:bz-pop .35s cubic-bezier(.34,1.5,.64,1) var(--d) both}
@keyframes bz-pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
.bz-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45em;white-space:nowrap;
  font-size:max(10.5px,1.65cqw);line-height:1;padding:.55em .85em;color:#2a1f15;cursor:pointer;font-weight:600;
  background:linear-gradient(#f6eddb,#eadcc0);border:1px solid rgba(60,40,20,.3);
  border-radius:8px 12px 9px 11px/11px 8px 12px 9px;
  box-shadow:0 2px 0 rgba(0,0,0,.28),0 6px 14px rgba(0,0,0,.35);
  transform:rotate(var(--tilt));transition:transform .18s var(--e),box-shadow .18s;
  -webkit-tap-highlight-color:transparent}
.bz-btn:hover,.bz-btn:focus-visible{transform:scale(1.08) rotate(0deg);outline:none}
.bz-btn:active{transform:scale(.96)}
.bz-btn[data-sel]{box-shadow:0 0 0 2px var(--c),0 8px 18px rgba(0,0,0,.45)}
.bz-btn svg{color:var(--c);flex-shrink:0;width:1.25em;height:1.25em}
@container (max-width:599px){
  .bz-btn{width:9.4cqw;height:9.4cqw;padding:0;border-radius:50%;font-size:0;gap:0}
  .bz-btn svg{width:56%;height:56%}
  .bz-lab{display:none}
}
.bz[data-stage="roots"] .bz-chip:not([data-stage="roots"]),
.bz[data-stage="trunk"] .bz-chip:not([data-stage="trunk"]),
.bz[data-stage="branches"] .bz-chip:not([data-stage="branches"]),
.bz[data-stage="blossoms"] .bz-chip:not([data-stage="blossoms"]){opacity:.3}
.bz-tiegrp{transition:opacity .25s ease}
.bz[data-stage]:not([data-stage="trunk"]) .bz-tiegrp{opacity:.25}
.bz-tie{opacity:0}
.bz[data-on] .bz-tie{animation:bz-fade .4s ease var(--d) both}
@keyframes bz-fade{from{opacity:0}to{opacity:1}}

/* petals drifting down from the blossoms */
.bz-petal{position:absolute;width:1.1cqw;height:.75cqw;border-radius:50%;background:#f6b8c8;opacity:0;pointer-events:none}
.bz[data-on] .bz-petal{animation:bz-fall 9s linear var(--d) infinite}
@keyframes bz-fall{0%{opacity:0;transform:translate(0,0)}10%{opacity:.9}70%{opacity:.9}100%{opacity:0;transform:translate(-4cqw,40cqw)}}

/* the bonsai's speech bubble */
.bz-bubble{opacity:0;transform:translateY(8px);transition:opacity .5s ease .7s,transform .5s cubic-bezier(.22,1,.36,1) .7s}
.bz-bubble[data-on]{opacity:1;transform:none}
.bz-card{position:relative;display:flex;flex-direction:column;min-height:206px;padding:20px 20px 14px;color:#2a1f15;
  background:linear-gradient(#f6eddb,#eadcc0);border:1px solid rgba(60,40,20,.3);
  border-radius:16px 20px 17px 19px/19px 16px 20px 17px;box-shadow:0 2px 0 rgba(0,0,0,.28),0 14px 34px rgba(0,0,0,.4)}
@media (min-width:640px){.bz-card{min-height:164px;padding:22px 26px 16px}}
.bz-tail{position:absolute;top:-9px;left:50%;width:18px;height:18px;margin-left:-9px;transform:rotate(45deg);
  background:#f6eddb;border-left:1px solid rgba(60,40,20,.3);border-top:1px solid rgba(60,40,20,.3)}
.bz-w{opacity:0;animation:bz-fade .25s ease forwards;animation-delay:calc(var(--i) * 26ms)}
.bz-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font:700 11px/1 ui-monospace,monospace;color:#2a1f15;cursor:pointer;border:0;opacity:.55;
  transition:transform .15s ease,opacity .15s ease,box-shadow .15s ease;-webkit-tap-highlight-color:transparent}
.bz-dot:hover{opacity:.9}
.bz-dot[data-act]{opacity:1;transform:scale(1.12);box-shadow:0 0 0 2px #2a1f15}

@media (prefers-reduced-motion:reduce){
  .bz *,.bz-w{animation:none!important}
  .bz-layer,.bz-pop,.bz-tie,.bz-w{opacity:1!important}
  .bz-rp{stroke-dashoffset:0!important}
  .bz-petal{display:none}
  .bz-bubble{transition:none}
}
`;

/* ════════════════════════════════════════════════════════
   Pieces
   ════════════════════════════════════════════════════════ */
function useInViewOnce(ref: RefObject<HTMLElement | null>, threshold: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

const Chip = memo(function Chip({
  skill,
  index,
  selected,
  onSelect,
}: {
  skill: Skill;
  index: number;
  selected: boolean;
  onSelect: (s: Skill | null) => void;
}) {
  const Icon = skill.icon;
  const tilt = (((index * 37) % 7) - 3) * 0.6;
  return (
    <div
      className="bz-chip"
      data-stage={skill.stage}
      style={{
        left: `${(skill.x / VB.w) * 100}%`,
        top: `${(skill.y / VB.h) * 100}%`,
      }}
    >
      <div className="bz-pop" style={{ "--d": `${skill.d}s` } as CSSProperties}>
        <button
          type="button"
          className="bz-btn font-mono"
          data-sel={selected ? "1" : undefined}
          aria-label={`${skill.label}, ${skill.level}% proficiency`}
          style={
            { "--c": skill.color, "--tilt": `${tilt}deg` } as CSSProperties
          }
          onMouseEnter={() => onSelect(skill)}
          onMouseLeave={() => onSelect(null)}
          onFocus={() => onSelect(skill)}
          onBlur={() => onSelect(null)}
          onClick={() => onSelect(skill)}
        >
          <Icon />
          <span className="bz-lab">{skill.label}</span>
        </button>
      </div>
    </div>
  );
});

/* The bonsai talks: narration per stage, or the detail of a hovered/tapped skill */
function Bubble({
  on,
  step,
  skill,
  onStep,
}: {
  on: boolean;
  step: number;
  skill: Skill | null;
  onStep: (i: number) => void;
}) {
  const stage = skill ? STAGES.find((s) => s.id === skill.stage)! : null;
  const words = NARRATION[step].split(" ");
  return (
    <div
      className="bz-bubble relative mx-auto mt-5 w-full max-w-[680px]"
      data-on={on ? "1" : undefined}
    >
      <div className="bz-card" aria-live="polite">
        <span className="bz-tail" aria-hidden="true" />
        {skill && stage ? (
          <div
            key={skill.id}
            className="bz-w"
            style={{ "--i": 0 } as CSSProperties}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <skill.icon size={22} style={{ color: skill.color }} />
              <span className="font-display text-lg font-bold leading-none">
                {skill.label}
              </span>
              <span
                className="font-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ color: stage.ink }}
              >
                {stage.name} · {stage.sub}
              </span>
              <span className="ml-auto flex items-center gap-2 font-mono text-[11px]">
                <span className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${skill.level}%`, background: stage.ink }}
                  />
                </span>
                {skill.level}%
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed sm:text-[15px]">
              {skill.note}
            </p>
            {skill.behind && (
              <p className="mt-1.5 text-[13px] italic leading-relaxed text-[#6b5640] sm:text-[14px]">
                Behind the scenes: {skill.behind}
              </p>
            )}
          </div>
        ) : (
          <p
            key={step}
            className="text-[15px] font-medium leading-[1.65] sm:text-[16px]"
          >
            {words.map((w, i) => (
              <span
                key={i}
                className="bz-w"
                style={{ "--i": i } as CSSProperties}
              >
                {w}{" "}
              </span>
            ))}
          </p>
        )}

        <div className="mt-auto flex items-center justify-center gap-2.5 pt-3">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="bz-dot"
              style={{ background: s.color }}
              data-act={!skill && step === i ? "1" : undefined}
              aria-label={`${s.name}: ${s.sub}`}
              onClick={() => onStep(i)}
            >
              {s.n}
            </button>
          ))}
          <button
            type="button"
            className="bz-dot"
            style={{ background: "#2a1f15", color: "#f6eddb" }}
            data-act={!skill && step === 4 ? "1" : undefined}
            aria-label="The whole lifecycle"
            onClick={() => onStep(4)}
          >
            <Check size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════════ */
export default function TechSkills() {
  const treeRef = useRef<HTMLDivElement>(null);
  const on = useInViewOnce(treeRef, 0.3);

  const [selected, setSelected] = useState<Skill | null>(null);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  const onSelect = useCallback((s: Skill | null) => setSelected(s), []);
  const onStep = useCallback((i: number) => {
    setAuto(false);
    setSelected(null);
    setStep(i);
  }, []);

  // the bonsai walks through the lifecycle by itself, once
  useEffect(() => {
    if (!on || !auto || step >= 4) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(4, s + 1)),
      step === 0 ? 4800 : 4400,
    );
    return () => clearTimeout(t);
  }, [on, auto, step]);

  const activeStage: StageId | undefined = selected
    ? selected.stage
    : step < 4
      ? STAGES[step].id
      : undefined;

  return (
    <section
      id="tech-skills"
      className="relative z-20 mx-auto max-w-7xl bg-bg px-4 py-16 sm:px-8 sm:py-24"
    >
      {/* Section header */}
      <header className="mb-12 border-b border-fg/10 pb-8 sm:mb-16 sm:pb-10">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Technical Stack
            </p>

            <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
              Skill <span className="text-accent">Bonsai</span>
            </h2>
          </div>

          <div className="flex flex-col gap-5 md:col-span-5 md:pb-1">
            <p className="max-w-md text-sm leading-6 text-muted sm:text-base sm:leading-7">
              From fundamentals to shipping — a living map of how I understand
              and build software, root to blossom.
            </p>
          </div>
        </div>
      </header>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h2 className="sr-only">Skill Bonsai</h2>

      {/* The tree */}
      <div
        ref={treeRef}
        className="bz relative mx-auto w-full max-w-[680px]"
        data-on={on ? "1" : undefined}
        data-stage={on ? activeStage : undefined}
        style={{ aspectRatio: `${VB.w} / ${VB.h}` }}
      >
        <TreeStatic />

        <div className="absolute inset-0">
          {/* dashed strings tying the backend tags to the trunk */}
          <svg
            viewBox={VIEWBOX}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <g className="bz-tiegrp">
              {SKILLS.filter((s) => s.tie).map((s) => {
                const [tx, ty] = s.tie!;
                const fromX = s.x < TRUNK_X ? s.x + 68 : s.x - 68;
                return (
                  <g
                    key={s.id}
                    className="bz-tie"
                    style={{ "--d": `${s.d + 0.1}s` } as CSSProperties}
                  >
                    <path
                      d={`M${fromX} ${s.y}Q${(fromX + tx) / 2} ${s.y - 7} ${tx} ${ty}`}
                      fill="none"
                      stroke="#c9a273"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeDasharray="3 5"
                    />
                    <circle cx={tx} cy={ty} r={3} fill="#c9a273" />
                  </g>
                );
              })}
            </g>
          </svg>

          {SKILLS.map((s, i) => (
            <Chip
              key={s.id}
              skill={s}
              index={i}
              selected={selected?.id === s.id}
              onSelect={onSelect}
            />
          ))}

          {[
            { l: 68, t: 24, d: 4.2 },
            { l: 77, t: 26, d: 6.4 },
            { l: 84, t: 25, d: 8.6 },
          ].map((p, i) => (
            <span
              key={i}
              className="bz-petal"
              style={
                {
                  left: `${p.l}%`,
                  top: `${p.t}%`,
                  "--d": `${p.d}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* The bonsai speaks */}
      <Bubble on={on} step={step} skill={selected} onStep={onStep} />
    </section>
  );
}
