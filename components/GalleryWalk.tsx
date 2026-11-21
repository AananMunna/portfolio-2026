'use client';
/**
 * GalleryWalk — a long, gently curving tunnel you walk through by scrolling.
 *
 * Frames hang on BOTH walls. The camera walks forward with the page scroll, leaning towards the wall
 * of the next frame. Tap/click a frame and the camera turns to face it; its details appear on the wall.
 *
 * Built to stay light on ordinary phones:
 *  - nothing is created until the section is near the viewport (see ProjectsGallery)
 *  - renders ON DEMAND — when the page is idle the GPU does nothing
 *  - screenshots are cropped + downscaled to small textures before upload
 *  - quality tiers (pixel-ratio, AA, mipmaps, glow) + an adaptive step-down if frames get slow
 *  - falls back to the list view if WebGL is unavailable or the context is lost
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'motion/react';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  ColorManagement,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearSRGBColorSpace,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { IUniform, Texture } from 'three';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Project } from './Projectsdata';
import { S0, STEP_S, camEnd, heightSvh, isLowEnd, sLast } from './galleryLayout';

const GalleryDetail = dynamic(() => import('./GalleryDetail'), { ssr: false });

interface Props {
  projects: Project[];
  openId: number | null;
  onOpen: (id: number) => void; // opens the full case-study overlay
  onFail: () => void; // WebGL unavailable / lost → list view
  toggle: React.ReactNode;
}

/* ───────────────────────── tunnel layout ───────────────────────── */
const RP = 28; // radius of the tunnel centre-line (the corridor sweeps round to the left)
const W = 4.3; // half-width
const FLOOR_Y = -3.4;
const H1 = 3.2; // where the vault starts
const HC = 3.4; // vault rise
const HANG = W - 0.1; // frames hang just in front of the wall (avoids z-fighting with its facets)
const CARD_H = 4.3;
const CARD_Y = 0.35;
const CAM_Y = -0.7;
const TGT_Y = -0.55;
const INTRO_S = 5.5;
const VOID = new Vector3(0.012, 0.02, 0.047); // --void #03050c

/* ───────────────────────── shaders ───────────────────────── */
const CARD_VERT = /* glsl */ `
  uniform float uVel; uniform float uPhase; uniform float uBend; uniform float uOx;
  uniform float uShow; uniform float uHover;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.xy *= 1.0 + uHover * 0.018;
    float gx = p.x + uOx;
    if (abs(uBend) > 0.00001) p.z += (1.0 - cos(gx * uBend)) / uBend;   // hug the curved wall
    float v = clamp(abs(uVel), 0.0, 1.4);
    p.z += sin(gx * 0.6 + uPhase) * 0.2 * v;                              // sway with walking speed
    p.y += sin(gx * 0.5 + uPhase * 1.3) * 0.09 * v;
    p.y -= (1.0 - uShow) * 0.9;                                           // rise in
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const ART_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform vec2 uSize; uniform float uHover; uniform float uShow; uniform float uFade;
  uniform vec3 uVoid;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb * (0.86 + 0.14 * uHover);
    vec2 e = min(vUv, 1.0 - vUv) * uSize;                     // distance to the nearest edge (world units)
    float edge = 1.0 - smoothstep(0.0, 0.03, min(e.x, e.y));
    float tick = max(step(e.x, 0.06) * step(e.y, 0.34), step(e.y, 0.06) * step(e.x, 0.34)); // crop-mark corners
    c = mix(c, vec3(0.09, 0.125, 0.22), edge * 0.7 * (1.0 - tick));
    c = mix(c, vec3(0.0, 1.0, 0.533), tick * (0.62 + 0.38 * uHover));
    float d = length(vW - cameraPosition);
    c = mix(c, uVoid, smoothstep(16.0, 58.0, d) * 0.94);
    gl_FragColor = vec4(c, uShow * uFade);
  }
`;

const FLAT_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uShow; uniform float uFade; uniform float uOpacity;
  uniform vec3 uTint; uniform float uUseTint; uniform vec3 uVoid;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    vec3 rgb = mix(c.rgb, uTint, uUseTint);
    float fog = smoothstep(16.0, 58.0, length(vW - cameraPosition));
    rgb = mix(rgb, uVoid, fog * 0.94 * (1.0 - uUseTint));
    float a = c.a * uOpacity * uShow * uFade * (1.0 - fog * uUseTint);
    gl_FragColor = vec4(rgb, a);
  }
`;

const TUNNEL_VERT = /* glsl */ `
  attribute float aU; attribute float aS;
  varying vec3 vW; varying float vU; varying float vS;
  void main() {
    vU = aU; vS = aS;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const TUNNEL_FRAG = /* glsl */ `
  uniform vec3 uVoid;
  varying vec3 vW; varying float vU; varying float vS;
  float gridLine(float x) {
    float f = abs(fract(x - 0.5) - 0.5) / max(fwidth(x), 0.0001);
    return 1.0 - min(f, 1.0);
  }
  void main() {
    float F = ${FLOOR_Y.toFixed(2)};
    float fl = 1.0 - smoothstep(F + 0.02, F + 0.14, vW.y);

    // walls: deep blue-black, a phosphor baseboard line, faint cyan ribs along the vault
    vec3 wall = mix(vec3(0.016, 0.026, 0.055), vec3(0.036, 0.056, 0.108), smoothstep(F, F + 5.5, vW.y));
    float base = 1.0 - smoothstep(0.0, 0.035, abs(vW.y - (F + 0.2)));
    wall = mix(wall, vec3(0.0, 0.8, 0.42), base * 0.55);
    float rib = gridLine(vS / 5.5) * smoothstep(${(H1 - 0.2).toFixed(2)}, ${(H1 + 0.6).toFixed(2)}, vW.y);
    wall = mix(wall, vec3(0.0, 0.9, 1.0), rib * 0.26);

    // floor: dim grid + a phosphor line down the middle that leads you forward
    vec3 fc = vec3(0.028, 0.045, 0.09);
    float grid = max(gridLine(vS / 2.2), gridLine(vU / 1.4));
    fc = mix(fc, vec3(0.09, 0.125, 0.22), grid * 0.9);
    fc = mix(fc, vec3(0.0, 1.0, 0.533), (1.0 - smoothstep(0.0, 0.05, abs(vU))) * 0.5);

    vec3 c = mix(wall, fc, fl);
    float d = length(vW - cameraPosition);
    c = mix(c, uVoid, smoothstep(12.0, 56.0, d));
    gl_FragColor = vec4(c, 1.0);
  }
`;

/* ───────────────────────── helpers ───────────────────────── */
const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** point on the tunnel: s = distance walked, u = lateral offset (+ right wall), y = height */
function pt(s: number, u: number, y: number, out = new Vector3()) {
  const phi = -s / RP;
  const r = RP + u;
  return out.set(r * Math.sin(phi), y, -r * Math.cos(phi));
}

function loadOne(src: string, ms: number): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const t = setTimeout(() => resolve(null), ms);
    img.decoding = 'async';
    img.onload = () => {
      clearTimeout(t);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(t);
      resolve(null);
    };
    img.src = src;
  });
}

/** small optimised copy first (fast on mobile data); the original only if that fails */
async function loadImage(src: string, w: number) {
  const opt = `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
  return (await loadOne(opt, 9000)) ?? (await loadOne(src, 9000));
}

function tex(c: HTMLCanvasElement, mip: boolean) {
  const t = new CanvasTexture(c);
  t.generateMipmaps = mip;
  t.minFilter = mip ? LinearMipmapLinearFilter : LinearFilter;
  t.magFilter = LinearFilter;
  return t;
}

/** crop the screenshot to the frame's aspect (top-aligned for tall pages) and shrink it before it hits the GPU */
function prepArt(img: HTMLImageElement, aspect: number, maxW: number) {
  const w = Math.min(maxW, img.width);
  const h = Math.round(w / aspect);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const srcA = img.width / img.height;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (srcA > aspect) {
    sw = sh * aspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = sw / aspect;
  }
  c.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return c;
}

interface Fonts {
  syne: string;
  mono: string;
}

function makeCaption(p: Project, i: number, f: Fonts, mip: boolean) {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 240;
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'top';
  const ls = (v: string) => {
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = v;
  };
  ls('3px');
  ctx.fillStyle = '#00ff88';
  ctx.font = `400 30px ${f.mono}`;
  ctx.fillText(`${pad(i + 1)} // ${p.year}`, 4, 4);
  ls('0px');
  ctx.fillStyle = '#ccdae8';
  ctx.font = `700 66px ${f.syne}`;
  ctx.fillText(p.title.toUpperCase(), 3, 44);
  ls('2px');
  ctx.fillStyle = '#6a7f98';
  ctx.font = `400 27px ${f.mono}`;
  ctx.fillText(p.category.toUpperCase(), 4, 134);
  ctx.fillStyle = '#34496a';
  ctx.fillText(p.tags.slice(0, 3).join(' · ').toUpperCase(), 4, 176);
  return tex(c, mip);
}

function makePanel(lines: { t: string; size: number; font: 'mono' | 'syne'; color: string; gap?: number }[], f: Fonts, w = 640, h = 860) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#070b16';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#172038';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
  ctx.textBaseline = 'top';
  let y = 64;
  for (const l of lines) {
    ctx.fillStyle = l.color;
    ctx.font = l.font === 'mono' ? `400 ${l.size}px ${f.mono}` : `800 ${l.size}px ${f.syne}`;
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = l.font === 'mono' ? '3px' : '-2px';
    ctx.fillText(l.t, 52, y);
    y += l.size + (l.gap ?? 16);
  }
  return tex(c, false);
}

function makeGlow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return tex(c, false);
}

/** The tunnel shell: floor + walls + vaulted ceiling, extruded along the bending centre-line. */
function buildTunnel(sMin: number, sMax: number, steps: number) {
  const prof: [number, number][] = [[-W, FLOOR_Y], [-W, H1]];
  const K = 16;
  for (let k = 1; k < K; k++) {
    const a = Math.PI - (k / K) * Math.PI;
    prof.push([W * Math.cos(a), H1 + HC * Math.sin(a)]);
  }
  prof.push([W, H1], [W, FLOOR_Y]);
  const P = prof.length;
  const pos: number[] = [];
  const aU: number[] = [];
  const aS: number[] = [];
  const idx: number[] = [];
  const v = new Vector3();
  for (let j = 0; j <= steps; j++) {
    const s = sMin + ((sMax - sMin) * j) / steps;
    for (const [u, y] of prof) {
      pt(s, u, y, v);
      pos.push(v.x, v.y, v.z);
      aU.push(u);
      aS.push(s);
    }
  }
  for (let j = 0; j < steps; j++) {
    for (let k = 0; k < P; k++) {
      const k2 = (k + 1) % P;
      const a = j * P + k;
      const b = j * P + k2;
      const c = (j + 1) * P + k;
      const d = (j + 1) * P + k2;
      idx.push(a, b, c, b, d, c);
    }
  }
  // end wall
  const cap = new ShapeGeometry(new Shape(prof.map(([u, y]) => new Vector2(u, y))));
  const cp = cap.getAttribute('position');
  const base = pos.length / 3;
  for (let i = 0; i < cp.count; i++) {
    pt(sMax, cp.getX(i), cp.getY(i), v);
    pos.push(v.x, v.y, v.z);
    aU.push(cp.getX(i));
    aS.push(sMax);
  }
  Array.from(cap.getIndex()!.array).forEach((i) => idx.push(base + i));
  cap.dispose();

  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('aU', new Float32BufferAttribute(aU, 1));
  g.setAttribute('aS', new Float32BufferAttribute(aS, 1));
  g.setIndex(idx);
  return g;
}

/* ───────────────────────── component ───────────────────────── */
export default function GalleryWalk({ projects, openId, onOpen, onFail, toggle }: Props) {
  const N = projects.length;
  const S_END = sLast(N) + 26;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ go: (i: number) => void; fly: (i: number) => void; release: () => void } | null>(null);
  const onOpenRef = useRef(onOpen);
  const onFailRef = useRef(onFail);
  const projectsRef = useRef(projects);
  useEffect(() => {
    onOpenRef.current = onOpen;
    onFailRef.current = onFail;
    projectsRef.current = projects;
  });

  const [mobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const detailRef = useRef<number | null>(null);

  const closeDetail = useCallback(() => {
    detailRef.current = null;
    setDetail(null);
    api.current?.release();
  }, []);
  const showDetail = useCallback((i: number) => {
    detailRef.current = i;
    setDetail(i);
    api.current?.fly(i);
    try {
      navigator.vibrate?.(8);
    } catch {
      /* not supported */
    }
  }, []);

  /* the page must not scroll while a frame is being read */
  useEffect(() => {
    if (detail === null) return;
    const l = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    l?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      if (detailRef.current === null) l?.start();
    };
  }, [detail]);

  /* after the full case-study overlay closes, the parent restarts smooth-scroll — keep it frozen */
  useEffect(() => {
    if (openId === null && detailRef.current !== null) {
      const t = setTimeout(() => (window as unknown as { lenis?: { stop: () => void } }).lenis?.stop(), 60);
      return () => clearTimeout(t);
    }
  }, [openId]);

  /* ───────────────────────── the scene ───────────────────────── */
  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const pill = pillRef.current!;
    const list = projectsRef.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const low = isLowEnd();
    const dpr = window.devicePixelRatio || 1;
    let disposed = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    ColorManagement.enabled = false;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: !low && dpr < 2, // on dense screens AA is wasted work
        powerPreference: 'high-performance',
      });
    } catch {
      onFailRef.current();
      return;
    }
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.setClearColor(0x03050c, 1);
    let pr = low ? 1 : Math.min(dpr, mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(pr);

    const onLost = (e: Event) => {
      e.preventDefault();
      onFailRef.current();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost));

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, 1, 0.1, 140);
    const disposables: { dispose: () => void }[] = [];

    const tunnelGeo = buildTunnel(-16, S_END, low ? 46 : 70);
    const tunnelMat = new ShaderMaterial({
      vertexShader: TUNNEL_VERT,
      fragmentShader: TUNNEL_FRAG,
      uniforms: { uVoid: { value: VOID } },
      side: DoubleSide,
    });
    scene.add(new Mesh(tunnelGeo, tunnelMat));
    disposables.push(tunnelGeo, tunnelMat);

    const root = new Group();
    scene.add(root);

    const U = { vel: { value: 0 } };
    interface Card {
      art: Mesh | null;
      shows: IUniform[];
      fades: IUniform[];
      hovers: IUniform[];
      s: number;
      side: number;
      w: number;
      hover: number;
      fade: number;
    }
    const cards: Card[] = [];
    const glowMeshes: Mesh[] = [];

    const cs = getComputedStyle(document.documentElement);
    const fonts: Fonts = {
      syne: cs.getPropertyValue('--font-syne').trim() || 'sans-serif',
      mono: cs.getPropertyValue('--font-share-tech-mono').trim() || 'ui-monospace, monospace',
    };
    const mip = !low;
    const texW = low ? 640 : mobile ? 800 : 1100;
    const segs = low ? 6 : 14;

    let built = false;
    let dirty = true;
    const wake = () => {
      dirty = true;
    };

    const build = async () => {
      const imgs = await Promise.all(list.map((p) => loadImage(p.image, mobile ? 828 : 1200)));
      try {
        await Promise.race([
          Promise.all([document.fonts?.load(`700 40px ${fonts.syne}`), document.fonts?.load(`400 30px ${fonts.mono}`)]),
          new Promise((r) => setTimeout(r, 1500)),
        ]);
      } catch {
        /* optional */
      }
      if (disposed) return;

      const glowTex = low ? null : makeGlow();
      if (glowTex) disposables.push(glowTex);

      const mkQuad = (
        map: Texture,
        w: number,
        h: number,
        s: number,
        side: number,
        y: number,
        o: { frag: string; extra: Record<string, IUniform>; order: number; ox?: number; additive?: boolean; z?: number }
      ) => {
        const phi = -s / RP;
        const r = RP + side * HANG;
        const group = new Group();
        group.position.set(r * Math.sin(phi), y, -r * Math.cos(phi));
        group.rotation.y = side > 0 ? -phi : Math.PI - phi;
        root.add(group);
        const uniforms: Record<string, IUniform> = {
          uVel: U.vel,
          uShow: { value: 0 },
          uFade: { value: 1 },
          uPhase: { value: s * 0.9 },
          uBend: { value: side / r },
          uOx: { value: o.ox ?? 0 },
          uHover: { value: 0 },
          uTex: { value: map },
          uVoid: { value: VOID },
          uOpacity: { value: 1 },
          uTint: { value: new Vector3(0, 1, 0.533) },
          uUseTint: { value: 0 },
          ...o.extra,
        };
        const mat = new ShaderMaterial({
          vertexShader: CARD_VERT,
          fragmentShader: o.frag,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: o.additive ? AdditiveBlending : undefined,
        });
        const geo = new PlaneGeometry(w, h, segs, 1);
        const mesh = new Mesh(geo, mat);
        mesh.renderOrder = o.order;
        mesh.position.set(o.ox ?? 0, 0, o.z ?? 0);
        group.add(mesh);
        disposables.push(mat, geo);
        return { mesh, u: uniforms };
      };

      list.forEach((p, i) => {
        const img = imgs[i];
        const a = img ? img.width / img.height : 1.5;
        const w = CARD_H * clamp(a, 0.8, 1.65);
        const s = S0 + i * STEP_S;
        const side = i % 2 === 0 ? 1 : -1;

        let map: Texture;
        if (img) {
          map = tex(prepArt(img, w / CARD_H, texW), mip);
        } else {
          const c = document.createElement('canvas');
          c.width = 400;
          c.height = Math.round(400 / (w / CARD_H));
          const g = c.getContext('2d')!;
          g.fillStyle = '#0b1120';
          g.fillRect(0, 0, c.width, c.height);
          map = tex(c, false);
        }
        disposables.push(map);

        let glow: ReturnType<typeof mkQuad> | null = null;
        if (glowTex) {
          glow = mkQuad(glowTex, w * 1.8, CARD_H * 1.7, s, side, CARD_Y, {
            frag: FLAT_FRAG,
            extra: { uUseTint: { value: 1 }, uOpacity: { value: 0.1 } },
            order: 1,
            additive: true,
            z: -0.05,
          });
          glowMeshes.push(glow.mesh);
        }
        const art = mkQuad(map, w, CARD_H, s, side, CARD_Y, {
          frag: ART_FRAG,
          extra: { uSize: { value: new Vector2(w, CARD_H) } },
          order: 2,
        });
        const capTex = makeCaption(p, i, fonts, mip);
        disposables.push(capTex);
        const capW = 3.4;
        const capH = capW * (240 / 768);
        const capOx = -w / 2 + capW / 2;
        const cap = mkQuad(capTex, capW, capH, s, side, CARD_Y - CARD_H / 2 - 0.3 - capH / 2, {
          frag: FLAT_FRAG,
          extra: {},
          order: 3,
          ox: capOx,
        });
        art.mesh.userData.index = cards.length;
        const us = (k: 'uShow' | 'uFade' | 'uHover') => [glow?.u[k], art.u[k], cap.u[k]].filter(Boolean) as IUniform[];
        cards.push({
          art: art.mesh,
          shows: us('uShow'),
          fades: us('uFade'),
          hovers: [art.u.uHover, cap.u.uHover],
          s,
          side,
          w,
          hover: 0,
          fade: 1,
        });
      });

      // entrance panel (left wall) — reads like a terminal prompt
      const introTex = makePanel(
        [
          { t: '~/aanan', size: 28, font: 'mono', color: '#6a7f98', gap: 22 },
          { t: '$ ls work/', size: 34, font: 'mono', color: '#00ff88', gap: 54 },
          { t: 'THE', size: 132, font: 'syne', color: '#ccdae8', gap: 4 },
          { t: 'WORK', size: 132, font: 'syne', color: '#ccdae8', gap: 60 },
          { t: `${pad(list.length)} entries`, size: 28, font: 'mono', color: '#6a7f98', gap: 14 },
          { t: 'keep walking →', size: 28, font: 'mono', color: '#00ff88' },
        ],
        fonts
      );
      disposables.push(introTex);
      const intro = mkQuad(introTex, 3.2, 4.3, INTRO_S, -1, CARD_Y, { frag: FLAT_FRAG, extra: {}, order: 2 });
      cards.push({
        art: null,
        shows: [intro.u.uShow],
        fades: [intro.u.uFade],
        hovers: [],
        s: INTRO_S,
        side: -1,
        w: 3.2,
        hover: 0,
        fade: 1,
      });

      // far end of the tunnel
      const endTex = makePanel(
        [
          { t: '// end of tour', size: 28, font: 'mono', color: '#6a7f98', gap: 30 },
          { t: 'GOT AN', size: 96, font: 'syne', color: '#ccdae8', gap: 2 },
          { t: 'IDEA?', size: 96, font: 'syne', color: '#00ff88', gap: 40 },
          { t: 'scroll on → contact', size: 26, font: 'mono', color: '#6a7f98' },
        ],
        fonts,
        640,
        520
      );
      disposables.push(endTex);
      {
        const phi = -(S_END - 0.2) / RP;
        const g = new Group();
        g.position.copy(pt(S_END - 0.2, 0, 0.4));
        g.rotation.y = Math.PI / 2 - phi;
        const geo = new PlaneGeometry(5, 4.06);
        const mat = new ShaderMaterial({
          vertexShader: CARD_VERT,
          fragmentShader: FLAT_FRAG,
          uniforms: {
            uVel: { value: 0 }, uPhase: { value: 0 }, uBend: { value: 0 }, uOx: { value: 0 }, uShow: { value: 1 },
            uHover: { value: 0 }, uTex: { value: endTex }, uFade: { value: 1 }, uOpacity: { value: 1 },
            uTint: { value: new Vector3() }, uUseTint: { value: 0 }, uVoid: { value: VOID },
          },
          transparent: true,
          depthWrite: false,
        });
        g.add(new Mesh(geo, mat));
        root.add(g);
        disposables.push(geo, mat);
      }

      built = true;
      setReady(true);
      wake();
    };
    const failsafe = setTimeout(() => {
      if (!built && !disposed) onFailRef.current(); // never leave the visitor on a loading screen
    }, 20000);
    cleanups.push(() => clearTimeout(failsafe));
    build().catch(() => {
      if (!disposed) onFailRef.current();
    });

    /* ───────── camera rig ───────── */
    const camPos = new Vector3();
    const camTgt = new Vector3();
    const flyPos = new Vector3();
    const flyTgt = new Vector3();
    const wantPos = new Vector3();
    const wantTgt = new Vector3();
    const pc = new Vector3();
    const nrm = new Vector3();
    const rgt = new Vector3();
    const UP = new Vector3(0, 1, 0);
    const END = camEnd(list.length);
    let cur = 0;
    let target = 0;
    let vel = 0;
    let intro = 0;
    let introStarted = false;
    let visible = false;
    let flyIdx = -1;
    let flyV = 0;
    let flyTarget = 0;
    let hoverIdx = -1;
    let activeIdx = 0;
    let lastT = performance.now();
    let aspect = 1;
    let portrait = false;
    let baseFov = 64;
    let flyReady = false;
    let lean = 0;
    let yawU = 0;
    let idle = 0;
    let slow = 0;
    let frames = 0;
    let acc = 0;
    let px = 0;
    let py = 0;
    let pickPending = false;
    let touchMode = false;

    const lenis = () => (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    const scrollToY = (y: number, immediate = false) => {
      const l = lenis();
      if (l) l.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.5 });
      else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
    };
    const totalScroll = () => Math.max(1, section.offsetHeight - window.innerHeight);
    const sectionTop = () => section.getBoundingClientRect().top + window.scrollY;
    const readTarget = () => clamp(-section.getBoundingClientRect().top / totalScroll(), 0, 1);
    const artCards = () => cards.filter((c) => c.art);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      aspect = w / h;
      portrait = aspect < 0.9;
      baseFov = aspect < 0.75 ? 66 : aspect < 1.15 ? 68 : 64;
      camera.aspect = aspect;
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
      wake();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    cleanups.push(() => ro.disconnect());

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          introStarted = true;
          target = readTarget();
          wake();
        }
      },
      { rootMargin: '80px 0px', threshold: 0 }
    );
    io.observe(section);
    cleanups.push(() => io.disconnect());

    const onScroll = () => {
      if (flyTarget === 0) target = readTarget();
      wake();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    /* pointer / hover / tap */
    const ray = new Raycaster();
    const ndc = new Vector2();
    const pick = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -(((clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(artCards().map((c) => c.art!), false)[0];
      return hit ? (hit.object.userData.index as number) : -1;
    };
    const openFrame = (i: number) => {
      hoverIdx = -1;
      setHovering(false);
      flyIdx = i;
      flyTarget = 1;
      detailRef.current = i;
      setDetail(i);
      try {
        navigator.vibrate?.(8);
      } catch {
        /* not supported */
      }
      wake();
    };

    let down: { x: number; y: number } | null = null;
    let dragged = false;
    let hoverState = false;
    const onMove = (e: PointerEvent) => {
      touchMode = e.pointerType === 'touch';
      if (touchMode) return;
      px = e.clientX;
      py = e.clientY;
      pill.style.transform = `translate3d(${px}px, ${py}px, 0) translate(14px, 14px)`;
      if (down && flyTarget === 0) {
        if (Math.abs(e.clientX - down.x) > 5) dragged = true;
        if (dragged) {
          scrollToY(window.scrollY - (e.movementX || 0) * 2.4, true);
          canvas.style.cursor = 'grabbing';
        }
      }
      pickPending = true;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
      dragged = false;
    };
    const onUp = (e: PointerEvent) => {
      const wasDrag = dragged;
      const d = down;
      down = null;
      dragged = false;
      canvas.style.cursor = '';
      if (!d || wasDrag || flyTarget > 0 || !built) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;
      const i = pick(e.clientX, e.clientY);
      if (i >= 0) openFrame(i);
    };
    const onCancel = () => {
      down = null;
      dragged = false;
    };
    const onLeave = () => {
      hoverIdx = -1;
      pickPending = false;
      if (hoverState) {
        hoverState = false;
        setHovering(false);
      }
      wake();
    };
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    stage.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      stage.removeEventListener('pointerleave', onLeave);
    });

    const go = (i: number) => {
      const idx = clamp(i, 0, list.length - 1);
      scrollToY(sectionTop() + clamp((S0 + idx * STEP_S - 5.5) / END, 0, 1) * totalScroll());
    };
    api.current = {
      go,
      fly: (i) => {
        flyIdx = i;
        flyTarget = 1;
        hoverIdx = -1;
        wake();
      },
      release: () => {
        flyTarget = 0;
        target = readTarget();
        wake();
      },
    };

    const onKey = (e: KeyboardEvent) => {
      if (detailRef.current !== null || !visible) return;
      const r = section.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return;
      if (e.key === 'ArrowRight') go(activeIdx + 1);
      if (e.key === 'ArrowLeft') go(activeIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    cleanups.push(() => window.removeEventListener('keydown', onKey));

    /** a wider lens while reading lets the frame stay small inside the narrow tunnel */
    const readFov = () => (portrait ? 100 : Math.max(baseFov, 80));

    /** where the camera sits to face frame i head-on (frame parked left of centre / near the top) */
    const facePose = (i: number, outPos: Vector3, outTgt: Vector3) => {
      const c = artCards()[i];
      const phi = -c.s / RP;
      pt(c.s, c.side * HANG, CARD_Y, pc);
      nrm.set(Math.sin(phi), 0, -Math.cos(phi)).multiplyScalar(-c.side); // wall → tunnel
      const tanH = Math.tan(MathUtils.degToRad(readFov() / 2));
      const fitH = CARD_H / (2 * (portrait ? 0.3 : 0.6) * tanH);
      const fitW = c.w / (2 * (portrait ? 0.84 : 0.4) * tanH * aspect);
      const D = Math.min(2 * W - 1.0, Math.max(fitH, fitW));
      rgt.crossVectors(nrm.clone().negate(), UP).normalize();
      outTgt.copy(pc);
      outPos.copy(pc).addScaledVector(nrm, D);
      if (portrait) {
        const dy = -0.42 * tanH * D; // frame sits in the upper part; the sheet takes the rest
        outPos.y += dy * 0.4; // stay above the floor; the rest of the offset is a slight downward tilt
        outTgt.y += dy;
      } else {
        const shift = 0.46 * tanH * aspect * D;
        outPos.addScaledVector(rgt, shift);
        outTgt.addScaledVector(rgt, shift);
      }
    };

    /* ───────── render loop (renders only while something is changing) ───────── */
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!visible || !built || document.hidden) return;

      let busy = dirty;
      dirty = false;

      if (pickPending && flyTarget === 0 && !touchMode) {
        pickPending = false;
        hoverIdx = down && dragged ? -1 : pick(px, py);
        const h = hoverIdx >= 0;
        if (h !== hoverState) {
          hoverState = h;
          setHovering(h);
        }
        busy = true;
      }

      // distance walked: eased towards the scroll position (inertia)
      const prev = cur;
      if (flyTarget === 0) {
        const diff = target - cur;
        if (Math.abs(diff) > 0.00002) {
          cur += reduce ? diff : diff * (1 - Math.exp(-dt * 5.5));
          busy = true;
        } else cur = target;
      }
      const speed = ((cur - prev) * END * 7.5) / Math.max(dt * 60, 0.5);
      vel += ((reduce ? 0 : speed) - vel) * (1 - Math.exp(-dt * 8));
      if (Math.abs(vel) < 0.004) vel = 0;
      else busy = true;
      U.vel.value = clamp(vel, -1.4, 1.4);

      if (introStarted && intro < 1) {
        intro = reduce ? 1 : Math.min(1, intro + dt / 1.8);
        cards.forEach((c, i) => {
          const s = clamp(intro * (1 + cards.length * 0.12) - i * 0.12, 0, 1);
          const eased = 1 - Math.pow(1 - s, 3);
          c.shows.forEach((u) => (u.value = eased));
        });
        busy = true;
      }

      // walking camera
      const sCam = cur * END;
      const walk = clamp(Math.abs(vel) * 0.8, 0, 1);
      let nextSide = 0;
      for (const c of cards) {
        if (c.s > sCam + 1.5) {
          nextSide = c.side;
          break;
        }
      }
      const leanT = nextSide * (portrait ? 1.5 : 1.1);
      const yawT = nextSide * (portrait ? HANG * 0.95 : W * 0.85);
      if (Math.abs(leanT - lean) > 0.003 || Math.abs(yawT - yawU) > 0.003) {
        lean += (leanT - lean) * (1 - Math.exp(-dt * 1.2));
        yawU += (yawT - yawU) * (1 - Math.exp(-dt * 1.3));
        busy = true;
      }
      pt(sCam, lean + Math.sin(sCam * 0.55) * 0.18 * walk, CAM_Y + Math.sin(sCam * 2.1) * 0.035 * walk, camPos);
      pt(sCam + (portrait ? 6.5 : 9.5), yawU, TGT_Y, camTgt);

      // turn to face a frame
      if (flyV !== flyTarget) {
        flyV += (flyTarget - flyV) * (1 - Math.exp(-dt * (flyTarget ? 2.6 : 3.4)));
        if (Math.abs(flyV - flyTarget) < 0.002) flyV = flyTarget;
        busy = true;
      }
      const e = easeInOut(clamp(flyV, 0, 1));
      if (flyIdx >= 0 && flyV > 0) {
        facePose(flyIdx, wantPos, wantTgt);
        if (!flyReady || flyV < 0.03) {
          flyPos.copy(wantPos);
          flyTgt.copy(wantTgt);
          flyReady = true;
        } else {
          const k = 1 - Math.exp(-dt * 3.2);
          if (flyPos.distanceToSquared(wantPos) > 1e-5 || flyTgt.distanceToSquared(wantTgt) > 1e-5) busy = true;
          flyPos.lerp(wantPos, k);
          flyTgt.lerp(wantTgt, k);
        }
        camPos.lerp(flyPos, e);
        camTgt.lerp(flyTgt, e);
        // never let a long glide cut through the tunnel wall
        const rr = Math.hypot(camPos.x, camPos.z);
        const lim = W - 0.45;
        if (Math.abs(rr - RP) > lim) {
          const k = (RP + Math.sign(rr - RP) * lim) / rr;
          camPos.x *= k;
          camPos.z *= k;
        }
      } else flyReady = false;

      const wantFov = baseFov + (readFov() - baseFov) * e;
      if (Math.abs(camera.fov - wantFov) > 0.01) {
        camera.fov = wantFov;
        camera.updateProjectionMatrix();
      }
      camera.position.copy(camPos);
      camera.lookAt(camTgt);

      // active frame = the one just ahead of us
      const ac = artCards();
      let best = 0;
      let bd = 1e9;
      ac.forEach((c, i) => {
        const d = Math.abs(c.s - (sCam + 5.5));
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best !== activeIdx) {
        activeIdx = best;
        setActive(best);
      }

      // hover + fades (everything but the chosen frame melts away while reading)
      for (const c of cards) {
        const ai = c.art ? ac.indexOf(c) : -1;
        const th = hoverIdx === ai && ai >= 0 ? 1 : 0;
        if (Math.abs(th - c.hover) > 0.004) {
          c.hover += (th - c.hover) * (1 - Math.exp(-dt * 10));
          c.hovers.forEach((u) => (u.value = c.hover));
          busy = true;
        }
        const tf = flyIdx >= 0 && e > 0 ? (ai === flyIdx ? 1 : 1 - e * 0.94) : 1;
        if (Math.abs(tf - c.fade) > 0.004) {
          c.fade += (tf - c.fade) * (1 - Math.exp(-dt * 6));
          c.fades.forEach((u, k) => (u.value = ai === flyIdx && k === c.fades.length - 1 ? c.fade * (1 - e) : c.fade));
          busy = true;
        }
      }

      if (!busy) {
        if (++idle > 2) return; // nothing changed → skip the GPU entirely
      } else idle = 0;

      renderer.render(scene, camera);

      // step quality down once if frames are consistently slow
      if (busy && dt > 0) {
        acc += dt;
        if (++frames >= 40) {
          const avg = acc / frames;
          frames = 0;
          acc = 0;
          if (avg > 0.034) {
            slow++;
            if (slow === 1 && pr > 1) {
              pr = 1;
              renderer.setPixelRatio(1);
              resize();
            } else if (slow >= 2) glowMeshes.forEach((m) => (m.visible = false));
          } else slow = Math.max(0, slow - 0);
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const r = sectionRef.current?.getBoundingClientRect();
      if (r && r.top < -60) setMoved(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Esc / arrows while a frame is open */
  useEffect(() => {
    if (detail === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (openId !== null) return;
      if (e.key === 'Escape') closeDetail();
      if (e.key === 'ArrowRight' && detail < N - 1) showDetail(detail + 1);
      if (e.key === 'ArrowLeft' && detail > 0) showDetail(detail - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, N, openId, closeDetail, showDetail]);

  const current = projects[active] ?? projects[0];
  const reading = detail !== null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg text-fg"
      style={{ height: `${heightSvh(N, mobile)}svh` }}
      aria-label="Project gallery"
    >
      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full select-none overflow-hidden" style={{ touchAction: 'pan-y' }}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* loading veil */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-bg font-mono text-[11px] uppercase tracking-widest text-muted transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
        >
          <span>
            loading work<span className="animate-blink text-accent">_</span>
          </span>
        </div>

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-5 md:px-10 md:pt-8">
          {reading ? (
            <button
              type="button"
              onClick={closeDetail}
              className="hover-target pointer-events-auto flex min-h-10 items-center gap-2 border border-border bg-bg/80 px-3.5 font-mono text-[11px] uppercase tracking-widest text-fg active:bg-accent active:text-bg"
            >
              <ArrowLeft size={13} /> back
            </button>
          ) : (
            <div className="font-mono text-[11px] uppercase leading-relaxed tracking-widest text-accent">
              <div>{"// work"}</div>
              <div className="text-muted">~/projects · {pad(N)}</div>
            </div>
          )}
          <div className="pointer-events-auto">{toggle}</div>
        </div>

        {/* progress rail (desktop) */}
        <nav
          aria-label="Projects"
          className={`absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 md:flex ${reading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => api.current?.go(i)}
              aria-label={p.title}
              className="hover-target group flex items-center gap-3 py-1"
            >
              <span className={`h-px transition-all duration-300 ${i === active ? 'w-9 bg-accent' : 'w-4 bg-border group-hover:w-7 group-hover:bg-muted'}`} />
              <span className="font-mono text-[10px] text-accent opacity-0 transition-opacity group-hover:opacity-100">{pad(i + 1)}</span>
            </button>
          ))}
        </nav>

        {/* walking controls — sit above the site's bottom dock */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg via-bg/70 to-transparent px-3 pb-[6.25rem] pt-20 transition-opacity duration-500 md:px-10 md:pb-24 ${reading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          {!moved && (
            <div className="pointer-events-none mb-3 flex justify-center font-mono text-[10px] uppercase tracking-widest text-accent">
              <span className="animate-pulse">{mobile ? 'swipe up to walk' : 'scroll to walk'} ↓</span>
            </div>
          )}
          <div className="mx-auto flex max-w-3xl items-end justify-between gap-3">
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => api.current?.go(active - 1)}
              disabled={active === 0}
              className="hover-target flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-bg/70 text-fg transition-colors active:bg-accent active:text-bg disabled:opacity-25 md:hover:border-accent md:hover:text-accent"
            >
              <ArrowLeft size={16} />
            </button>

            <div key={current?.id} className="min-w-0 flex-1 animate-[capIn_0.45s_cubic-bezier(0.16,1,0.3,1)] text-center" aria-live="polite">
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent">
                {pad(active + 1)} / {pad(N)} {"//"} {current?.year}
              </div>
              <h3 className="mt-1 truncate font-display text-2xl font-bold uppercase leading-none tracking-tighter text-fg md:text-4xl">
                {current?.title}
              </h3>
              <button
                type="button"
                onClick={() => showDetail(active)}
                className="hover-target mt-3 inline-flex min-h-11 items-center gap-2 bg-accent px-5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg active:opacity-70"
              >
                open project <ArrowUpRight size={14} />
              </button>
            </div>

            <button
              type="button"
              aria-label="Next project"
              onClick={() => api.current?.go(active + 1)}
              disabled={active === N - 1}
              className="hover-target flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-bg/70 text-fg transition-colors active:bg-accent active:text-bg disabled:opacity-25 md:hover:border-accent md:hover:text-accent"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* details on the wall */}
        <AnimatePresence>
          {detail !== null && (
            <GalleryDetail
              key="detail"
              projects={projects}
              index={detail}
              onSelect={showDetail}
              onCase={() => onOpen(projects[detail].id)}
              onClose={closeDetail}
            />
          )}
        </AnimatePresence>

        {/* cursor label (desktop) */}
        <div
          ref={pillRef}
          className={`pointer-events-none fixed left-0 top-0 z-[70] hidden whitespace-nowrap bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-bg transition-opacity duration-150 md:block ${hovering ? 'opacity-100' : 'opacity-0'}`}
        >
          open ↵
        </div>
      </div>
    </section>
  );
}
