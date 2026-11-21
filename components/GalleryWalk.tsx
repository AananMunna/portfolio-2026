'use client';
/**
 * GalleryWalk — a long, gently curving white gallery TUNNEL.
 *
 * Studied from the reference video:
 *  - a room/tunnel with a wall on BOTH sides, a vaulted white ceiling and a grey floor
 *  - paintings hang on both walls, each with a small serif caption underneath
 *  - scrolling walks the camera forward along the tunnel (like walking), the far end
 *    dissolves into white haze; frames sway slightly with scroll speed
 *  - hovering a frame shows a black "OPEN THE PROJECT" pill that follows the cursor
 *  - clicking turns the camera to face that frame; the frame settles on the wall and its
 *    details appear next to it, with a "Get the collection" strip to hop to another frame
 *  - bottom-centre "YOU ARE WALKING PAST / TITLE / ENTER →", arrows, GALLERY | LIST toggle
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import * as THREE from 'three';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, Plus } from 'lucide-react';
import type { Project } from './Projectsdata';

interface Props {
  projects: Project[];
  openId: number | null;
  onOpen: (id: number) => void; // opens the full case-study overlay
  toggle: React.ReactNode;
}

/* ───────────────────────── tunnel layout ───────────────────────── */
const RP = 28; // radius of the tunnel centre-line (the corridor sweeps round to the left)
const W = 4.3; // half-width of the tunnel
const FLOOR_Y = -3.4;
const H1 = 3.2; // where the vault starts
const HC = 3.4; // vault rise
const HANG = W - 0.1; // frames hang just in front of the wall (avoids z-fighting with its facets)
const CARD_H = 4.3;
const CARD_Y = 0.35;
const CAM_Y = -0.7;
const TGT_Y = -0.55;
const S0 = 11; // first frame, distance along the tunnel
const STEP_S = 6.2; // distance between consecutive frames (they alternate walls)
const INTRO_S = 5.5;
const LOOK_AHEAD = 9.5;
const VH_PER_UNIT = 9.5; // scroll length per unit walked

/* ───────────────────────── shaders ───────────────────────── */
const CARD_VERT = /* glsl */ `
  uniform float uVel; uniform float uPhase; uniform float uBend; uniform float uOx;
  uniform float uShow; uniform float uHover;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.xy *= 1.0 + uHover * 0.02;
    float gx = p.x + uOx;
    // hug the (curved) wall
    if (abs(uBend) > 0.00001) p.z += (1.0 - cos(gx * uBend)) / uBend;
    // soft cloth-like sway driven by walking speed
    float v = clamp(abs(uVel), 0.0, 1.4);
    p.z += sin(gx * 0.6 + uPhase) * 0.2 * v;
    p.y += sin(gx * 0.5 + uPhase * 1.3) * 0.09 * v;
    p.y -= (1.0 - uShow) * 0.9;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const ART_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform vec4 uUv; uniform float uHover; uniform float uShow; uniform float uFade;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vec2 uv = vUv * uUv.xy + uUv.zw;
    vec3 c = texture2D(uTex, uv).rgb;
    c *= 1.0 + uHover * 0.04;
    float d = length(vW - cameraPosition);
    c = mix(c, vec3(0.97), smoothstep(22.0, 70.0, d) * 0.55);
    gl_FragColor = vec4(c, uShow * uFade);
  }
`;

const FLAT_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uShow; uniform float uFade; uniform float uOpacity;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    float d = length(vW - cameraPosition);
    vec3 rgb = mix(c.rgb, vec3(0.97), smoothstep(22.0, 70.0, d) * 0.55);
    gl_FragColor = vec4(rgb, c.a * uOpacity * uShow * uFade);
  }
`;

const TUNNEL_VERT = /* glsl */ `
  attribute float aU;
  varying vec3 vW; varying float vU;
  void main() {
    vU = aU;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const TUNNEL_FRAG = /* glsl */ `
  varying vec3 vW; varying float vU;
  void main() {
    float fl = 1.0 - smoothstep(${FLOOR_Y.toFixed(2)} + 0.02, ${FLOOR_Y.toFixed(2)} + 0.12, vW.y);
    // soft cove: grey at the base of the walls fading up to bright white
    vec3 wall = mix(vec3(0.80, 0.80, 0.82), vec3(0.995, 0.995, 0.99), smoothstep(${FLOOR_Y.toFixed(2)}, ${(FLOOR_Y + 5.2).toFixed(2)}, vW.y));
    // gentle ceiling falloff towards the vault crown
    wall *= 1.0 - smoothstep(${H1.toFixed(2)}, ${(H1 + HC).toFixed(2)}, vW.y) * 0.07;
    vec3 floorC = mix(vec3(0.74, 0.74, 0.76), vec3(0.82, 0.82, 0.835), smoothstep(0.0, ${W.toFixed(2)}, abs(vU)));
    vec3 c = mix(wall, floorC, fl);
    float d = length(vW - cameraPosition);
    c = mix(c, vec3(0.99), smoothstep(20.0, 72.0, d) * 0.7);
    gl_FragColor = vec4(c, 1.0);
  }
`;

/* ───────────────────────── helpers ───────────────────────── */
const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif';
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** point on the tunnel: s = distance walked, u = lateral offset (+ right wall), y = height */
function pt(s: number, u: number, y: number, out = new THREE.Vector3()) {
  const phi = -s / RP;
  const r = RP + u;
  return out.set(r * Math.sin(phi), y, -r * Math.cos(phi));
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function canvasTex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.anisotropy = 4;
  return t;
}

function makeCaption(p: Project, mono: string) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 320;
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#161616';
  ctx.font = `400 74px ${SERIF}`;
  ctx.fillText(p.title, 8, 8);
  ctx.fillStyle = '#5c5c5c';
  ctx.font = `italic 400 58px ${SERIF}`;
  ctx.fillText(p.category, 8, 104);
  ctx.fillStyle = '#8a8a8a';
  ctx.font = `400 34px ${mono}`;
  if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '3px';
  ctx.fillText([p.year, ...p.tags.slice(0, 3)].join('  ·  ').toUpperCase(), 8, 196);
  return canvasTex(c);
}

function makePanel(lines: { text: string; size: number; font?: string; color?: string; gap?: number }[], mono: string) {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ecebe7';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.textBaseline = 'top';
  let y = 80;
  for (const l of lines) {
    ctx.fillStyle = l.color ?? '#161616';
    ctx.font = `${l.font === 'mono' ? '400' : '800'} ${l.size}px ${l.font === 'mono' ? mono : 'Impact, "Arial Narrow", Arial, sans-serif'}`;
    if ('letterSpacing' in ctx)
      (ctx as unknown as { letterSpacing: string }).letterSpacing = l.font === 'mono' ? '6px' : '0px';
    ctx.fillText(l.text, 64, y);
    y += l.size + (l.gap ?? 18);
  }
  return canvasTex(c);
}

function makeShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, 'rgba(20,20,30,0.5)');
  g.addColorStop(0.55, 'rgba(20,20,30,0.16)');
  g.addColorStop(1, 'rgba(20,20,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return canvasTex(c);
}

function placeholder(p: Project) {
  const c = document.createElement('canvas');
  c.width = 960;
  c.height = 600;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 960, 600);
  g.addColorStop(0, '#d9dde6');
  g.addColorStop(1, '#bcc4d4');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 960, 600);
  ctx.fillStyle = '#2a3142';
  ctx.font = `600 72px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText(p.title, 480, 320);
  return c;
}

/** The tunnel shell: floor + walls + vaulted ceiling, extruded along the bending centre-line. */
function buildTunnel(sMin: number, sMax: number, sEnd: number) {
  const prof: [number, number][] = [[-W, FLOOR_Y], [-W, H1]];
  const K = 22;
  for (let k = 1; k < K; k++) {
    const a = Math.PI - (k / K) * Math.PI;
    prof.push([W * Math.cos(a), H1 + HC * Math.sin(a)]);
  }
  prof.push([W, H1], [W, FLOOR_Y]);
  const P = prof.length;
  const n = 110;
  const pos: number[] = [];
  const aU: number[] = [];
  const idx: number[] = [];
  const v = new THREE.Vector3();
  for (let j = 0; j <= n; j++) {
    const s = sMin + ((sMax - sMin) * j) / n;
    for (const [u, y] of prof) {
      pt(s, u, y, v);
      pos.push(v.x, v.y, v.z);
      aU.push(u);
    }
  }
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < P; k++) {
      const k2 = (k + 1) % P;
      const a = j * P + k;
      const b = j * P + k2;
      const c = (j + 1) * P + k;
      const d = (j + 1) * P + k2;
      idx.push(a, b, c, b, d, c);
    }
  }
  // end wall (closes the far end of the tunnel)
  const shape = new THREE.Shape(prof.map(([u, y]) => new THREE.Vector2(u, y)));
  const cap = new THREE.ShapeGeometry(shape);
  const cp = cap.getAttribute('position');
  const base = pos.length / 3;
  for (let i = 0; i < cp.count; i++) {
    pt(sEnd, cp.getX(i), cp.getY(i), v);
    pos.push(v.x, v.y, v.z);
    aU.push(cp.getX(i));
  }
  Array.from(cap.getIndex()!.array).forEach((i) => idx.push(base + i));
  cap.dispose();

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aU', new THREE.Float32BufferAttribute(aU, 1));
  g.setIndex(idx);
  return g;
}

/* ───────────────────────── component ───────────────────────── */
export default function GalleryWalk({ projects, openId, onOpen, toggle }: Props) {
  const N = projects.length;
  const S_LAST = S0 + (N - 1) * STEP_S;
  const S_CAM_END = S_LAST + 6;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ go: (i: number) => void; fly: (i: number) => void; release: () => void } | null>(null);
  const onOpenRef = useRef(onOpen);
  const projectsRef = useRef(projects);
  useEffect(() => {
    onOpenRef.current = onOpen;
    projectsRef.current = projects;
  });

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

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const pill = pillRef.current!;
    const list = projectsRef.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let disposed = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    THREE.ColorManagement.enabled = false;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0xfbfbfa, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 160);
    const disposables: { dispose: () => void }[] = [];

    /* tunnel */
    const tunnelGeo = buildTunnel(-16, S_LAST + 26, S_LAST + 26);
    const tunnelMat = new THREE.ShaderMaterial({
      vertexShader: TUNNEL_VERT,
      fragmentShader: TUNNEL_FRAG,
      side: THREE.DoubleSide,
    });
    scene.add(new THREE.Mesh(tunnelGeo, tunnelMat));
    disposables.push(tunnelGeo, tunnelMat);

    const shadowTex = makeShadow();
    disposables.push(shadowTex);
    const root = new THREE.Group();
    scene.add(root);

    const U = { vel: { value: 0 } };
    interface Card {
      art: THREE.Mesh | null;
      shows: THREE.IUniform[];
      fades: THREE.IUniform[];
      hovers: THREE.IUniform[];
      s: number;
      side: number;
      w: number;
      hover: number;
      fade: number;
    }
    const cards: Card[] = [];

    const monoFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-share-tech-mono').trim() ||
      'ui-monospace, monospace';

    const build = async () => {
      const imgs = await Promise.all(list.map((p) => loadImage(p.image)));
      try {
        await document.fonts?.load(`400 30px ${monoFamily}`);
      } catch {
        /* optional */
      }
      if (disposed) return;

      /** one textured quad hanging on a wall */
      const addQuad = (
        tex: THREE.Texture,
        w: number,
        h: number,
        s: number,
        side: number,
        y: number,
        opts: { art?: { uv: THREE.Vector4 }; opacity?: number; ox?: number; order: number }
      ) => {
        const phi = -s / RP;
        const r = RP + side * HANG;
        const group = new THREE.Group();
        group.position.set(r * Math.sin(phi), y, -r * Math.cos(phi));
        group.rotation.y = side > 0 ? -phi : Math.PI - phi;
        root.add(group);
        const shared: Record<string, THREE.IUniform> = {
          uVel: U.vel,
          uShow: { value: 0 },
          uFade: { value: 1 },
          uPhase: { value: s * 0.9 },
          uBend: { value: side / r },
          uOx: { value: opts.ox ?? 0 },
          uHover: { value: 0 },
          uTex: { value: tex },
          uOpacity: { value: opts.opacity ?? 1 },
        };
        if (opts.art) shared.uUv = { value: opts.art.uv };
        const mat = new THREE.ShaderMaterial({
          vertexShader: CARD_VERT,
          fragmentShader: opts.art ? ART_FRAG : FLAT_FRAG,
          uniforms: shared,
          transparent: true,
          depthWrite: false,
        });
        const geo = new THREE.PlaneGeometry(w, h, 40, 1);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = opts.order;
        mesh.position.x = opts.ox ?? 0;
        group.add(mesh);
        disposables.push(mat, geo);
        return { mesh, shared };
      };

      list.forEach((p, i) => {
        const img = imgs[i];
        const a = img ? img.width / img.height : 1.5;
        const w = CARD_H * clamp(a, 0.8, 1.65);
        const s = S0 + i * STEP_S;
        const side = i % 2 === 0 ? 1 : -1;

        // artwork texture + crop (keep the top of tall screenshots)
        let tex: THREE.Texture;
        const uv = new THREE.Vector4(1, 1, 0, 0);
        if (img) {
          tex = new THREE.Texture(img);
          const cardA = w / CARD_H;
          if (a > cardA) {
            const rx = cardA / a;
            uv.set(rx, 1, (1 - rx) / 2, 0);
          } else {
            const ry = a / cardA;
            uv.set(1, ry, 0, 1 - ry);
          }
        } else {
          tex = new THREE.CanvasTexture(placeholder(p));
        }
        tex.anisotropy = maxAniso;
        tex.needsUpdate = true;
        disposables.push(tex);

        const sh = addQuad(shadowTex, w * 1.28, CARD_H * 1.3, s, side, CARD_Y - 0.12, { opacity: 0.55, order: 1 });
        const art = addQuad(tex, w, CARD_H, s, side, CARD_Y, { art: { uv }, order: 2 });
        const capTex = makeCaption(p, monoFamily);
        disposables.push(capTex);
        const capW = 3.5;
        const capH = capW * (320 / 1024);
        const capOx = -w / 2 + capW / 2;
        const cap = addQuad(capTex, capW, capH, s, side, CARD_Y - CARD_H / 2 - 0.32 - capH / 2, {
          ox: capOx,
          order: 3,
        });
        art.mesh.userData.index = cards.length;
        cards.push({
          art: art.mesh,
          shows: [sh.shared.uShow, art.shared.uShow, cap.shared.uShow],
          fades: [sh.shared.uFade, art.shared.uFade, cap.shared.uFade],
          hovers: [art.shared.uHover, cap.shared.uHover],
          s,
          side,
          w,
          hover: 0,
          fade: 1,
        });
      });

      // entrance panel (grey title card on the left wall, like the video)
      const introTex = makePanel(
        [
          { text: 'SELECTED WORK', size: 34, font: 'mono', color: '#7a7a7a', gap: 40 },
          { text: 'THE', size: 150 },
          { text: 'PROJECT', size: 150 },
          { text: 'GALLERY', size: 150, gap: 50 },
          { text: `${pad(list.length)} PROJECTS`, size: 34, font: 'mono', color: '#7a7a7a' },
        ],
        monoFamily
      );
      disposables.push(introTex);
      const intro = addQuad(introTex, 3.3, 4.4, INTRO_S, -1, 0.3, { order: 2 });
      cards.push({
        art: null,
        shows: [intro.shared.uShow],
        fades: [intro.shared.uFade],
        hovers: [],
        s: INTRO_S,
        side: -1,
        w: 3,
        hover: 0,
        fade: 1,
      });

      setReady(true);
    };
    build();

    /* ───────── camera rig ───────── */
    const camPos = new THREE.Vector3();
    const camTgt = new THREE.Vector3();
    const flyPos = new THREE.Vector3();
    const flyTgt = new THREE.Vector3();
    const wantPos = new THREE.Vector3();
    const wantTgt = new THREE.Vector3();
    const pc = new THREE.Vector3();
    const nrm = new THREE.Vector3();
    const rgt = new THREE.Vector3();
    const UP = new THREE.Vector3(0, 1, 0);
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
    let flyReady = false;
    let baseFov = 64;
    let lean = 0;
    let yawU = 0;

    const lenis = () => (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    const scrollToY = (y: number, immediate = false) => {
      const l = lenis();
      if (l) l.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.6 });
      else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
    };
    const totalScroll = () => Math.max(1, section.offsetHeight - window.innerHeight);
    const sectionTop = () => section.getBoundingClientRect().top + window.scrollY;
    const artCards = () => cards.filter((c) => c.art);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      aspect = w / h;
      camera.aspect = aspect;
      baseFov = aspect < 0.75 ? 76 : aspect < 1.15 ? 70 : 64;
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    cleanups.push(() => ro.disconnect());

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) introStarted = true;
      },
      { rootMargin: '120px 0px', threshold: 0 }
    );
    io.observe(section);
    cleanups.push(() => io.disconnect());

    /* pointer / hover / click */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -(((clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const meshes = artCards().map((c) => c.art!);
      const hit = ray.intersectObjects(meshes, false)[0];
      return hit ? (hit.object.userData.index as number) : -1;
    };

    let down: { x: number; y: number } | null = null;
    let dragged = false;
    let hoverState = false;

    const onMove = (e: PointerEvent) => {
      pill.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(14px, 14px)`;
      if (down && e.pointerType !== 'touch' && flyTarget === 0) {
        if (Math.abs(e.clientX - down.x) > 5) dragged = true;
        if (dragged) {
          scrollToY(window.scrollY - (e.movementX || 0) * 2.4, true);
          canvas.style.cursor = 'grabbing';
        }
      }
      if (flyTarget > 0 || e.pointerType === 'touch') return;
      hoverIdx = dragged ? -1 : pick(e.clientX, e.clientY);
      const h = hoverIdx >= 0;
      if (h !== hoverState) {
        hoverState = h;
        setHovering(h);
      }
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
      if (!d || wasDrag || flyTarget > 0) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;
      const i = pick(e.clientX, e.clientY);
      if (i >= 0) {
        hoverIdx = -1;
        hoverState = false;
        setHovering(false);
        flyIdx = i;
        flyTarget = 1;
        detailRef.current = i;
        setDetail(i);
      }
    };
    const onLeave = () => {
      hoverIdx = -1;
      hoverState = false;
      setHovering(false);
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    stage.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointerleave', onLeave);
    });

    const go = (i: number) => {
      const idx = clamp(i, 0, list.length - 1);
      const sTarget = S0 + idx * STEP_S - 5.5;
      scrollToY(sectionTop() + clamp(sTarget / S_CAM_END, 0, 1) * totalScroll());
    };
    api.current = {
      go,
      fly: (i) => {
        flyIdx = i;
        flyTarget = 1;
        hoverIdx = -1;
      },
      release: () => {
        flyTarget = 0;
      },
    };

    const onKey = (e: KeyboardEvent) => {
      if (detailRef.current !== null) return; // the panel handles its own keys
      if (!visible) return;
      const r = section.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return;
      if (e.key === 'ArrowRight') go(activeIdx + 1);
      if (e.key === 'ArrowLeft') go(activeIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    cleanups.push(() => window.removeEventListener('keydown', onKey));

    /** a wider lens while reading a frame lets the frame stay small inside the narrow tunnel */
    const readFov = () => (aspect < 0.9 ? 100 : Math.max(baseFov, 80));

    /** where the camera sits to face frame i head-on (frame parked left of centre / near the top) */
    const facePose = (i: number, outPos: THREE.Vector3, outTgt: THREE.Vector3) => {
      const c = artCards()[i];
      const phi = -c.s / RP;
      pt(c.s, c.side * HANG, CARD_Y, pc);
      // normal pointing from the wall into the tunnel
      nrm.set(Math.sin(phi), 0, -Math.cos(phi)).multiplyScalar(-c.side);
      const portrait = aspect < 0.9;
      const tanH = Math.tan(THREE.MathUtils.degToRad(readFov() / 2));
      const fitH = CARD_H / (2 * (portrait ? 0.3 : 0.6) * tanH);
      const fitW = c.w / (2 * (portrait ? 0.84 : 0.4) * tanH * aspect);
      const D = Math.min(2 * W - 1.0, Math.max(fitH, fitW));
      rgt.crossVectors(nrm.clone().negate(), UP).normalize(); // screen-right while facing the wall
      outTgt.copy(pc);
      outPos.copy(pc).addScaledVector(nrm, D);
      if (portrait) {
        const dy = -0.4 * tanH * D; // card in the upper part of the screen
        outPos.y += dy;
        outTgt.y += dy;
      } else {
        const shift = 0.46 * tanH * aspect * D; // card left of centre
        outPos.addScaledVector(rgt, shift);
        outTgt.addScaledVector(rgt, shift);
      }
    };

    /* ───────── render loop ───────── */
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!visible || cards.length === 0) return;

      // scroll → distance walked (smoothed → inertia)
      const rect = section.getBoundingClientRect();
      if (flyTarget === 0) target = clamp(-rect.top / totalScroll(), 0, 1);
      const prev = cur;
      if (flyTarget === 0) cur += (target - cur) * (reduce ? 1 : 1 - Math.exp(-dt * 5.5));
      const speed = ((cur - prev) * S_CAM_END * 7.5) / Math.max(dt * 60, 0.5);
      vel += ((reduce ? 0 : speed) - vel) * (1 - Math.exp(-dt * 8));
      U.vel.value = clamp(vel, -1.4, 1.4);

      // intro
      if (introStarted && intro < 1) intro = reduce ? 1 : Math.min(1, intro + dt / 1.8);
      cards.forEach((c, i) => {
        const s = clamp(intro * (1 + cards.length * 0.12) - i * 0.12, 0, 1);
        const eased = 1 - Math.pow(1 - s, 3);
        c.shows.forEach((u) => (u.value = eased));
      });

      // walking camera
      const sCam = cur * S_CAM_END;
      const walk = clamp(Math.abs(vel) * 0.8, 0, 1);
      // drift gently towards the wall of the next frame so it feels like a visitor, not a rail
      let nextSide = 0;
      for (const c of cards) {
        if (c.s > sCam + 1.5) {
          nextSide = c.side;
          break;
        }
      }
      lean += (nextSide * 1.1 - lean) * (1 - Math.exp(-dt * 1.2));
      yawU += (nextSide * W * 0.85 - yawU) * (1 - Math.exp(-dt * 1.3));
      pt(sCam, lean + Math.sin(sCam * 0.55) * 0.18 * walk, CAM_Y + Math.sin(sCam * 2.1) * 0.035 * walk, camPos);
      pt(sCam + LOOK_AHEAD, yawU, TGT_Y, camTgt);

      // turn to face a frame
      flyV += (flyTarget - flyV) * (1 - Math.exp(-dt * (flyTarget ? 2.6 : 3.4)));
      if (Math.abs(flyV - flyTarget) < 0.002) flyV = flyTarget;
      const e = easeInOut(clamp(flyV, 0, 1));
      if (flyIdx >= 0 && flyV > 0) {
        facePose(flyIdx, wantPos, wantTgt);
        if (!flyReady || flyV < 0.03) {
          flyPos.copy(wantPos);
          flyTgt.copy(wantTgt);
          flyReady = true;
        } else {
          const k = 1 - Math.exp(-dt * 3.2);
          flyPos.lerp(wantPos, k);
          flyTgt.lerp(wantTgt, k);
        }
        camPos.lerp(flyPos, e);
        camTgt.lerp(flyTgt, e);
      } else {
        flyReady = false;
      }
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
      cards.forEach((c) => {
        const ai = c.art ? ac.indexOf(c) : -1;
        c.hover += ((hoverIdx === ai && ai >= 0 ? 1 : 0) - c.hover) * (1 - Math.exp(-dt * 10));
        c.hovers.forEach((u) => (u.value = c.hover));
        const tf = flyIdx >= 0 && e > 0 ? (ai === flyIdx ? 1 : 1 - e * 0.94) : 1;
        c.fade += (tf - c.fade) * (1 - Math.exp(-dt * 6));
        c.fades.forEach((u, k) => (u.value = ai === flyIdx && k === 2 ? c.fade * (1 - e) : c.fade));
      });

      renderer.render(scene, camera);
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
      if (r && r.top < -80) setMoved(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Esc / arrows while a frame is open */
  useEffect(() => {
    if (detail === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (openId !== null) return; // the full case study is on top
      if (e.key === 'Escape') closeDetail();
      if (e.key === 'ArrowRight' && detail < N - 1) showDetail(detail + 1);
      if (e.key === 'ArrowLeft' && detail > 0) showDetail(detail - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, N, openId, closeDetail, showDetail]);

  const current = projects[active] ?? projects[0];
  const reading = detail !== null;
  const shown = detail !== null ? projects[detail] : null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#fbfbfa] text-[#111]"
      style={{ height: `${100 + S_CAM_END * VH_PER_UNIT}vh` }}
      aria-label="Project gallery"
    >
      <div ref={stageRef} className="sticky top-0 h-screen w-full select-none overflow-hidden" style={{ touchAction: 'pan-y' }}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        <div
          className={`pointer-events-none absolute inset-0 bg-[#fbfbfa] transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-5 pt-24 md:px-10 md:pt-8">
          <div className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-black/45">
            {reading ? (
              <button
                type="button"
                onClick={closeDetail}
                className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full bg-white/85 px-3.5 py-2 text-black backdrop-blur transition-opacity hover:opacity-60"
              >
                <ArrowLeft size={12} /> Back to the gallery
              </button>
            ) : (
              <>
                <div>Selected work</div>
                <div className="text-black/30">The gallery — {new Date().getFullYear()}</div>
                <div
                  className={`mt-3 hidden text-black/35 transition-opacity duration-500 md:block ${moved ? 'opacity-0' : 'opacity-100'}`}
                >
                  Scroll or drag to walk forward
                  <br />
                  Click a frame to look closer
                </div>
              </>
            )}
          </div>
          <div className="pointer-events-auto">{toggle}</div>
        </div>

        {/* walking chrome (hidden while reading a frame) */}
        <div className={`transition-opacity duration-500 ${reading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
          <div className="pointer-events-none absolute bottom-6 left-5 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-black/45 md:bottom-8 md:left-10">
            <span className="text-black">{pad(active + 1)}</span> / {pad(N)}
            <div className="mt-2 h-px w-24 bg-black/10">
              <div className="h-px bg-black transition-all duration-500" style={{ width: `${((active + 1) / N) * 100}%` }} />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center px-6 text-center md:bottom-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-black/40">You are walking past</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="mt-2 flex flex-col items-center"
              >
                <h3 className="font-sans text-2xl font-extrabold uppercase leading-none tracking-tight text-black md:text-3xl">
                  {current?.title}
                </h3>
                <button
                  type="button"
                  onClick={() => showDetail(active)}
                  className="pointer-events-auto mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-black/55 transition-colors hover:text-black"
                >
                  Enter the project →
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-6 right-5 z-10 flex gap-2 md:bottom-8 md:right-10">
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => api.current?.go(active - 1)}
              disabled={active === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white/70 text-black backdrop-blur transition-colors hover:bg-black hover:text-white disabled:opacity-30"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => api.current?.go(active + 1)}
              disabled={active === N - 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white/70 text-black backdrop-blur transition-colors hover:bg-black hover:text-white disabled:opacity-30"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* details on the wall */}
        <AnimatePresence>
          {shown && detail !== null && (
            <DetailPanel
              key="panel"
              projects={projects}
              index={detail}
              onSelect={showDetail}
              onCase={() => onOpen(shown.id)}
            />
          )}
        </AnimatePresence>

        {/* cursor pill */}
        <div
          ref={pillRef}
          className={`pointer-events-none fixed left-0 top-0 z-[70] hidden whitespace-nowrap rounded-full bg-black px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white transition-opacity duration-200 md:block ${hovering ? 'opacity-100' : 'opacity-0'}`}
        >
          Open the project
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── details panel ───────────────────────── */
function DetailPanel({
  projects,
  index,
  onSelect,
  onCase,
}: {
  projects: Project[];
  index: number;
  onSelect: (i: number) => void;
  onCase: () => void;
}) {
  const p = projects[index];
  const rows: { name: string; body: React.ReactNode }[] = [
    { name: 'Overview', body: <p>{p.overview}</p> },
    { name: 'The problem', body: <p>{p.problem}</p> },
    { name: 'The solution', body: <p>{p.solution}</p> },
    {
      name: 'Key features',
      body: (
        <ul className="space-y-3">
          {p.features.map((f) => (
            <li key={f.title}>
              <span className="font-medium text-black">{f.title}.</span> {f.desc}
            </li>
          ))}
        </ul>
      ),
    },
  ];
  if (p.challenges?.length) {
    rows.push({
      name: 'Challenges',
      body: (
        <ul className="space-y-3">
          {p.challenges.map((c) => (
            <li key={c.challenge}>
              <span className="font-medium text-black">{c.challenge}</span> {c.solution}
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="absolute inset-x-0 bottom-0 top-[46%] z-20 overflow-y-auto px-5 pb-10 pt-2 md:inset-y-0 md:left-[50%] md:right-0 md:top-0 md:px-0 md:pb-12 md:pl-6 md:pr-12 md:pt-28"
      style={{ overscrollBehavior: 'contain' }}
      data-lenis-prevent
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-xl"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40">
            {pad(index + 1)} / {pad(projects.length)} · {p.year} · {p.status}
          </div>
          <h2 className="mt-3 font-serif text-4xl leading-none text-black md:text-5xl">{p.title}</h2>
          <p className="mt-2 font-serif text-xl italic text-black/55">{p.category}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-black/65">{p.description}</p>

          <dl className="mt-6 grid grid-cols-[6rem_1fr] gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <dt className="text-black/35">Role</dt>
            <dd className="text-black">{p.role}</dd>
            <dt className="text-black/35">Type</dt>
            <dd className="text-black">{p.type}</dd>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-sm border border-black/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-black/70"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 bg-black px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-white transition-opacity hover:opacity-80 sm:flex-none"
            >
              Live site <ArrowUpRight size={14} />
            </a>
            <a
              href={p.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 border border-black/20 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-black transition-colors hover:bg-black hover:text-white"
            >
              <Github size={14} /> Code
            </a>
            <button
              type="button"
              onClick={onCase}
              className="flex items-center justify-center gap-2 border border-black/20 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-black transition-colors hover:bg-black hover:text-white"
            >
              Full case study
            </button>
          </div>

          <Accordion rows={rows} />

          <div className="mt-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40">Get the collection</div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2" data-lenis-prevent>
              {projects.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => i !== index && onSelect(i)}
                  aria-label={q.title}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden border transition-all duration-300 ${i === index ? 'border-black' : 'border-black/10 opacity-60 hover:opacity-100'}`}
                >
                  <Image src={q.image} alt="" fill sizes="96px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  );
}

function Accordion({ rows }: { rows: { name: string; body: React.ReactNode }[] }) {
  const [section, setSection] = useState<string | null>('Overview');
  return (
    <div className="mt-8 border-t border-black/10">
      {rows.map((r) => {
        const open = section === r.name;
        return (
          <div key={r.name} className="border-b border-black/10">
            <button
              type="button"
              onClick={() => setSection(open ? null : r.name)}
              className="flex w-full items-center justify-between py-3.5 text-left font-mono text-[11px] uppercase tracking-[0.25em] text-black"
              aria-expanded={open}
            >
              {r.name}
              <Plus size={14} className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-sm leading-relaxed text-black/60">{r.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
