'use client';

/**
 * ProjectsWorld — a full-screen, premium WebGL project gallery.
 *
 * Void-black stage, phosphor grid floor, and project cards that follow a ring around you
 * (cards bend with the ring so they feel like one continuous wall). The focused card glows and
 * reflects on the floor, the rest recede. Rotation velocity adds a soft wave to the panels.
 *
 * What makes it feel fast
 *  - Render-on-demand: the frame loop sleeps when nothing moves → ~0 CPU/GPU at rest.
 *  - Transparent canvas over a pure CSS backdrop (no sky / water shaders).
 *  - Light geometry (32×1 segments), ~12 draw calls, pixel ratio capped at 1.5.
 *  - Canvas textures hold only the screenshot + browser chrome; all text is crisp HTML on top.
 *
 * What makes it feel premium
 *  - One orchestrated intro: camera dollies in, ring swings into place, cards rise in sequence.
 *  - Frame-rate independent damping everywhere (scroll, drag, fling, parallax, velocity wave).
 *  - Mouse parallax (camera drifts with the cursor) + floor reflections + hover cursor feedback.
 *  - Direction-free masked title reveal, animated progress segments.
 *  - prefers-reduced-motion: skips intro / wave / parallax.
 *
 * Input: vertical scroll (page-pinned), horizontal drag / swipe, trackpad horizontal swipe,
 *        ← → keys (anywhere while the section is on screen), prev/next buttons,
 *        progress segments, click a card (focused card opens, others focus).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

export interface WorldProject {
  id: number;
  title: string;
  category: string;
  image: string;
  year: string;
  tags: string[];
  tagline: string;
  link: string;
}

interface Props {
  projects: WorldProject[];
  onOpen: (id: number) => void;
}

/* ───────────────────────── layout constants ───────────────────────── */
const RADIUS = 12;
const STEP = THREE.MathUtils.degToRad(38); // angle between neighbouring cards
const CARD_W = 7.2;
const CARD_H = 4.5; // 16:10
const CARD_Y = 0.3;
const FLOOR_Y = -2.3;
const BEND = 1 / RADIUS; // cards hug the ring
const SCROLL_VH_PER_CARD = 60;
const FOV = 55;
const PITCH = -0.05;
const INTRO_MS = 2200;

/* ───────────────────────── shaders ───────────────────────── */
const CARD_VERT = /* glsl */ `
  uniform float uVel; uniform float uPhase; uniform float uBend; uniform float uShow;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float x = p.x;
    p.z += (1.0 - cos(x * uBend)) / uBend;          // follow the ring
    float v = clamp(abs(uVel), 0.0, 1.2);            // soft wave while moving
    p.z += sin(x * 0.6 + uPhase) * 0.3 * v;
    p.y += sin(x * 0.5 + uPhase * 1.7) * 0.12 * v;
    p.y -= (1.0 - uShow) * 0.9;                      // rise in during intro
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const RBOX = /* glsl */ `
  float rbox(vec2 uv, float r, float aspect) {
    vec2 hs = vec2(aspect, 1.0) * 0.5;
    vec2 q = abs(uv - 0.5) * vec2(aspect, 1.0) - (hs - r);
    return length(max(q, 0.0)) - r;
  }
`;

const CARD_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uFocus; uniform float uAspect; uniform float uShow;
  varying vec2 vUv;
  ${RBOX}
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;
    c *= mix(0.36, 1.0, uFocus);                       // recede when not focused
    float d = rbox(vUv, 0.03, uAspect);
    float alpha = (1.0 - smoothstep(0.0, 0.006, d)) * uShow;
    float b = smoothstep(-0.010, -0.002, d);           // hairline border
    vec3 border = mix(vec3(0.090, 0.125, 0.220), vec3(0.0, 1.0, 0.533), uFocus);
    c = mix(c, border, b * 0.9);
    gl_FragColor = vec4(c, alpha);
  }
`;

const REFL_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uFocus; uniform float uAspect; uniform float uShow;
  varying vec2 vUv;
  ${RBOX}
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb * mix(0.36, 1.0, uFocus);
    float d = rbox(vUv, 0.03, uAspect);
    float a = 1.0 - smoothstep(0.0, 0.006, d);
    float fade = pow(1.0 - vUv.y, 2.4);                // strongest near the floor
    gl_FragColor = vec4(c, a * fade * mix(0.08, 0.26, uFocus) * uShow);
  }
`;

const FLOOR_VERT = /* glsl */ `
  varying vec2 vP; varying vec3 vW;
  void main() {
    vP = position.xy;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const FLOOR_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uShow;
  varying vec2 vP; varying vec3 vW;
  float grid(vec2 p, float s) {
    vec2 q = p / s;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float d = length(vW.xz - cameraPosition.xz);
    float l = grid(vP, 1.5) * 0.5 + grid(vP, 7.5) * 0.5;
    float fade = (1.0 - smoothstep(8.0, 55.0, d)) * smoothstep(1.5, 7.0, d);
    gl_FragColor = vec4(uColor, l * fade * 0.34 * uShow);
  }
`;

/* ───────────────────────── canvas textures ───────────────────────── */
const TEX_W = 1440;
const TEX_H = 900;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  if ('letterSpacing' in ctx) (ctx as any).letterSpacing = `${px}px`;
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s;
  const ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y, iw, ih); // anchor to the top of the screenshot
  ctx.restore();
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** The card is a single browser window: chrome strip + full-bleed screenshot. Text lives in the HTML HUD. */
function paintCard(
  canvas: HTMLCanvasElement,
  p: WorldProject,
  index: number,
  total: number,
  img: HTMLImageElement | null,
  monoFamily: string
) {
  const ctx = canvas.getContext('2d')!;
  const ACCENT = '#00ff88';
  const SUB = '#6a7f98';
  const LINE = '#172038';
  const strip = 60;

  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  if (img) {
    drawCover(ctx, img, 0, strip, TEX_W, TEX_H - strip);
  } else {
    // placeholder while the screenshot loads
    const g = ctx.createLinearGradient(0, strip, TEX_W, TEX_H);
    g.addColorStop(0, '#0a1020');
    g.addColorStop(1, '#0d1628');
    ctx.fillStyle = g;
    ctx.fillRect(0, strip, TEX_W, TEX_H - strip);
    const glow = ctx.createRadialGradient(TEX_W / 2, TEX_H / 2, 0, TEX_W / 2, TEX_H / 2, 520);
    glow.addColorStop(0, 'rgba(0,255,136,0.08)');
    glow.addColorStop(1, 'rgba(0,255,136,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, strip, TEX_W, TEX_H - strip);
  }

  // chrome strip
  ctx.fillStyle = '#0c1424';
  ctx.fillRect(0, 0, TEX_W, strip);
  ctx.fillStyle = LINE;
  ctx.fillRect(0, strip - 2, TEX_W, 2);

  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(38 + i * 26, strip / 2, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // address pill
  ctx.fillStyle = '#080d1a';
  roundRect(ctx, TEX_W / 2 - 280, 11, 560, 36, 18);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = SUB;
  ctx.font = `400 19px ${monoFamily}`;
  setSpacing(ctx, 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hostOf(p.link), TEX_W / 2, strip / 2 + 1);

  // counter
  ctx.fillStyle = ACCENT;
  ctx.font = `500 20px ${monoFamily}`;
  setSpacing(ctx, 2);
  ctx.textAlign = 'right';
  ctx.fillText(`${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`, TEX_W - 34, strip / 2 + 1);
  ctx.textAlign = 'left';
  setSpacing(ctx, 0);
}

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ───────────────────────── component ───────────────────────── */
export default function ProjectsWorld({ projects, onOpen }: Props) {
  const N = projects.length;
  const MAX_ANGLE = (N - 1) * STEP;

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ go: (i: number) => void; step: (d: number) => void } | null>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);
  const markTouched = useCallback(() => {
    if (!touchedRef.current) {
      touchedRef.current = true;
      setTouched(true);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current!;
    const sticky = stickyRef.current!;
    const canvas = canvasRef.current!;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    /* — renderer (transparent: the CSS background shows through) — */
    THREE.ColorManagement.enabled = false;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    camera.rotation.order = 'YXZ';

    const uVel = { value: 0 };
    const floorShow = { value: 0 };
    const disposables: { dispose: () => void }[] = [];

    const ring = new THREE.Group();
    scene.add(ring);

    /* — grid floor (rotates with the ring so movement reads clearly) — */
    const floorGeo = new THREE.PlaneGeometry(240, 240, 1, 1);
    const floorMat = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color('#00ff88') }, uShow: floorShow },
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    floor.renderOrder = 0;
    floor.frustumCulled = false;
    ring.add(floor);
    disposables.push(floorGeo, floorMat);

    /* — cards — */
    const cardGeo = new THREE.PlaneGeometry(CARD_W, CARD_H, 32, 1);
    const glowGeo = new THREE.PlaneGeometry(CARD_W * 1.25, 2.6);
    const glowTex = makeGlowTexture();
    disposables.push(cardGeo, glowGeo, glowTex);

    const cs = getComputedStyle(document.body);
    const monoFamily = (cs.getPropertyValue('--font-share-tech-mono') || '').trim() || 'monospace';
    const monoStack = `${monoFamily}, "Courier New", monospace`;

    const canvases: HTMLCanvasElement[] = [];
    const textures: THREE.CanvasTexture[] = [];
    const images: (HTMLImageElement | null)[] = projects.map(() => null);
    const cardMeshes: THREE.Mesh[] = [];
    const reflMeshes: THREE.Mesh[] = [];
    const focusU: { value: number }[] = [];
    const showU: { value: number }[] = [];
    const glowMats: THREE.MeshBasicMaterial[] = [];

    /* — render-on-demand plumbing (defined early so loaders can wake the loop) — */
    let running = false;
    let raf = 0;
    let visible = true;
    let seen = false; // section is mostly on screen (gate for the intro)
    let ready = false; // first screenshot decoded (or timeout)
    let last = performance.now();
    let lastInput = performance.now();
    let introOn = reduce;
    let introStart = 0;
    let introT = reduce ? 1 : 0;

    const wake = () => {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      lastInput = performance.now();
      wake();
    };
    const tryIntro = () => {
      if (introOn || !ready || !seen) return;
      introOn = true;
      introStart = performance.now();
      wake();
    };

    const repaint = (i: number) => {
      paintCard(canvases[i], projects[i], i, N, images[i], monoStack);
      textures[i].needsUpdate = true;
    };

    projects.forEach((p, i) => {
      const a = i * STEP;
      const holder = new THREE.Group();
      holder.position.set(Math.sin(a) * RADIUS, 0, -Math.cos(a) * RADIUS);
      holder.rotation.y = -a; // face the centre
      ring.add(holder);

      const cv = document.createElement('canvas');
      cv.width = TEX_W;
      cv.height = TEX_H;
      canvases.push(cv);
      paintCard(cv, p, i, N, null, monoStack);
      const tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = maxAniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      textures.push(tex);

      const focus = { value: i === 0 ? 1 : 0 };
      const show = { value: reduce ? 1 : 0 };
      focusU.push(focus);
      showU.push(show);

      const uniforms = {
        uTex: { value: tex },
        uVel,
        uPhase: { value: i },
        uBend: { value: BEND },
        uFocus: focus,
        uShow: show,
        uAspect: { value: CARD_W / CARD_H },
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader: CARD_VERT,
        fragmentShader: CARD_FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms,
      });
      const card = new THREE.Mesh(cardGeo, mat);
      card.position.y = CARD_Y;
      card.renderOrder = 3;
      card.userData.index = i;
      holder.add(card);
      cardMeshes.push(card);

      // floor reflection (mirrored copy that fades out with distance from the floor)
      const rmat = new THREE.ShaderMaterial({
        vertexShader: CARD_VERT,
        fragmentShader: REFL_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms,
      });
      const refl = new THREE.Mesh(cardGeo, rmat);
      refl.position.y = 2 * FLOOR_Y - CARD_Y;
      refl.scale.y = -1;
      refl.renderOrder = 2;
      holder.add(refl);
      reflMeshes.push(refl);

      // pool of phosphor light under the card
      const gmat = new THREE.MeshBasicMaterial({
        map: glowTex,
        color: new THREE.Color('#00ff88'),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glowMesh = new THREE.Mesh(glowGeo, gmat);
      glowMesh.rotation.x = -Math.PI / 2;
      glowMesh.position.set(0, FLOOR_Y + 0.02, 0.4);
      glowMesh.renderOrder = 1;
      holder.add(glowMesh);
      glowMats.push(gmat);

      disposables.push(mat, rmat, gmat, tex);

      loadImage(p.image).then((img) => {
        images[i] = img;
        if (img) {
          repaint(i);
          lastInput = performance.now() - 900; // a single frame is enough
          wake();
        }
        if (i === 0) {
          ready = true;
          tryIntro();
        }
      });
    });

    // never let a slow image block the intro
    const readyTimer = window.setTimeout(() => {
      ready = true;
      tryIntro();
    }, 1100);

    // repaint once webfonts are ready (URL pill uses the mono face)
    document.fonts?.ready.then(() => {
      projects.forEach((_, i) => repaint(i));
      lastInput = performance.now() - 900;
      wake();
    });

    /* — sizing — */
    let baseZ = 0;
    let baseY = 0.2;
    const resize = () => {
      const w = Math.max(1, sticky.clientWidth);
      const h = Math.max(1, sticky.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const landscape = camera.aspect > 1;
      const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const fracW = landscape ? 0.62 : 0.9;
      const fracH = landscape ? 0.58 : 0.5;
      const distW = CARD_W / (fracW * 2 * tan * camera.aspect);
      const distH = CARD_H / (fracH * 2 * tan);
      const dist = Math.max(distW, distH);
      baseZ = Math.max(-(RADIUS - 3), dist - RADIUS);
      // keep the card in the free band between heading and HUD
      const viewH = 2 * tan * dist;
      const shift = landscape ? 0.065 : 0.15;
      baseY = CARD_Y - shift * viewH + Math.abs(PITCH) * dist;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      lastInput = performance.now() - 900;
      wake();
    });
    ro.observe(sticky);

    /* — interaction state — */
    let drag = 0; // manual offset added to the scroll-driven angle
    let cur = 0; // smoothed angle actually shown
    let prevCur = 0;
    let scrollAngle = 0;
    let dragging = false;
    let dragMoved = 0;
    let downT = 0;
    let lastX = 0;
    let lastMoveT = 0;
    let flingV = 0;
    let pxT = 0; // pointer parallax target (-1..1)
    let pyT = 0;
    let px = 0;
    let py = 0;
    let hovering = false;

    const kDrag = () => (2.2 * STEP) / Math.max(320, sticky.clientWidth);

    const goTo = (i: number) => {
      const total = scrollAngle + drag;
      drag += clamp(i, 0, N - 1) * STEP - total;
      markTouched();
      kick();
    };
    const stepBy = (d: number) => {
      const total = scrollAngle + drag;
      const nearest = Math.round(total / STEP);
      drag += clamp(nearest + d, 0, N - 1) * STEP - total;
      markTouched();
      kick();
    };
    api.current = { go: goTo, step: stepBy };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -(((cy - r.top) / r.height) * 2 - 1));
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(cardMeshes, false)[0];
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragMoved = 0;
      lastX = e.clientX;
      downT = lastMoveT = performance.now();
      flingV = 0;
      canvas.style.cursor = '';
      canvas.setPointerCapture(e.pointerId);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !reduce) {
        const r = canvas.getBoundingClientRect();
        pxT = ((e.clientX - r.left) / r.width) * 2 - 1;
        pyT = -(((e.clientY - r.top) / r.height) * 2 - 1);
      }
      if (!dragging) {
        if (e.pointerType === 'mouse') {
          const h = !!pick(e.clientX, e.clientY);
          if (h !== hovering) {
            hovering = h;
            canvas.style.cursor = h ? 'pointer' : '';
          }
        }
        kick();
        return;
      }
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragMoved += Math.abs(dx);
      const now = performance.now();
      drag -= dx * kDrag();
      flingV = (-dx * kDrag()) / Math.max(1, now - lastMoveT);
      lastMoveT = now;
      if (dragMoved > 6) markTouched();
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      const now = performance.now();
      if (dragMoved < 6 && now - downT < 450) {
        const hit = pick(e.clientX, e.clientY);
        if (hit) {
          const i = hit.object.userData.index as number;
          markTouched();
          if (i === Math.round(cur / STEP)) onOpenRef.current(projects[i].id);
          else goTo(i);
        }
      } else if (now - lastMoveT < 80) {
        drag += flingV * 140; // a little inertia
      }
      kick();
    };
    const onLeave = () => {
      pxT = pyT = 0;
      if (hovering) {
        hovering = false;
        canvas.style.cursor = '';
      }
      kick();
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) {
        e.preventDefault();
        drag += e.deltaX * 0.0016;
        markTouched();
        kick();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        stepBy(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        stepBy(-1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenRef.current(projects[clamp(Math.round(cur / STEP), 0, N - 1)].id);
      }
    };
    // ← → work anywhere while the gallery fills the screen (no need to focus the canvas first)
    const onWinKey = (e: KeyboardEvent) => {
      if (e.target === canvas || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const r = sticky.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.3 || r.bottom < window.innerHeight * 0.7) return;
      stepBy(e.key === 'ArrowRight' ? 1 : -1);
    };
    const onScroll = () => kick();

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('keydown', onKey);
    window.addEventListener('keydown', onWinKey);
    window.addEventListener('scroll', onScroll, { passive: true });

    /* — loop (sleeps when idle) — */
    let lastActive = 0;

    function tick(now: number) {
      const rawDt = Math.max(1e-3, (now - last) / 1000);
      const dt = Math.min(0.05, rawDt);
      last = now;

      // intro (one orchestrated moment)
      if (introOn && introT < 1) introT = clamp((now - introStart) / INTRO_MS, 0, 1);
      const e = 1 - Math.pow(1 - introT, 4);

      // scroll → angle
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - sticky.clientHeight);
      const prog = clamp(-rect.top / scrollable, 0, 1);
      const sAngle = prog * MAX_ANGLE;
      if (Math.abs(sAngle - scrollAngle) > 1e-4) lastInput = now;
      scrollAngle = sAngle;

      drag = clamp(drag, -scrollAngle - STEP * 0.18, MAX_ANGLE - scrollAngle + STEP * 0.18);

      // settle onto the nearest card when idle
      let residual = 0;
      if (!dragging && now - lastInput > 450) {
        const total = scrollAngle + drag;
        const snapped = clamp(Math.round(total / STEP), 0, N - 1) * STEP;
        residual = Math.abs(snapped - total);
        drag += (snapped - total) * Math.min(1, dt * 5);
      }

      const target = clamp(scrollAngle + drag, 0, MAX_ANGLE);
      cur += (target - cur) * (1 - Math.exp(-dt * 7));

      // velocity (normalised ~ -1..1) drives the wave
      const angVel = (cur - prevCur) / rawDt;
      prevCur = cur;
      const vTarget = reduce ? 0 : clamp(angVel / 3.2, -1.2, 1.2);
      uVel.value += (vTarget - uVel.value) * (1 - Math.exp(-dt * 9));

      // pointer parallax (damped)
      const kp = 1 - Math.exp(-dt * 4.5);
      px += (pxT - px) * kp;
      py += (pyT - py) * kp;

      camera.position.set(px * 0.32, baseY + py * 0.12, baseZ + (1 - e) * 6);
      camera.rotation.y = -px * 0.018;
      camera.rotation.x = PITCH + (1 - e) * 0.12;
      ring.rotation.y = cur - (1 - e) * 0.5;
      floorShow.value = clamp(introT * 2, 0, 1);

      // focus → dim / glow, intro → staggered rise
      const pos = cur / STEP;
      for (let i = 0; i < N; i++) {
        const f = 1 - THREE.MathUtils.smoothstep(Math.abs(pos - i), 0.05, 0.95);
        const s1 = clamp(introT * 1.7 - i * 0.14, 0, 1);
        const show = 1 - Math.pow(1 - s1, 3);
        focusU[i].value = f;
        showU[i].value = show;
        glowMats[i].opacity = 0.42 * f * show;
        const s = 0.92 + 0.08 * f;
        cardMeshes[i].scale.setScalar(s);
        reflMeshes[i].scale.set(s, -s, s);
      }

      const idx = clamp(Math.round(pos), 0, N - 1);
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }

      renderer.render(scene, camera);

      const busy =
        dragging ||
        (introOn && introT < 1) ||
        now - lastInput < 700 ||
        residual > 2e-4 ||
        Math.abs(target - cur) > 2e-4 ||
        Math.abs(uVel.value) > 2e-3 ||
        Math.abs(pxT - px) > 1e-3 ||
        Math.abs(pyT - py) > 1e-3;
      if (busy && visible) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        raf = 0;
        uVel.value = 0;
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        seen = entry.intersectionRatio > 0.4;
        if (visible) {
          lastInput = performance.now() - 900;
          wake();
          tryIntro();
        }
      },
      { threshold: [0, 0.4] }
    );
    io.observe(sticky);
    wake();

    return () => {
      window.clearTimeout(readyTimer);
      cancelAnimationFrame(raf);
      running = false;
      visible = false;
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', onWinKey);
      window.removeEventListener('scroll', onScroll);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const current = projects[active];

  return (
    <section
      ref={sectionRef}
      aria-label="Selected projects"
      className="relative z-20 bg-bg"
      style={{ height: `calc(100svh + ${(N - 1) * SCROLL_VH_PER_CARD}svh)` }}
    >
      <div ref={stickyRef} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-bg">
        {/* stage: void + phosphor haze + vignette (pure CSS — free to render) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 50% 44%, rgba(0,255,136,0.08), transparent 70%), radial-gradient(ellipse 90% 70% at 50% 40%, var(--void3), var(--void) 75%)',
          }}
        />

        {/* ghost index */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[12%] flex justify-center overflow-hidden">
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="select-none font-display text-[clamp(12rem,32vw,28rem)] font-bold leading-none tracking-tighter text-transparent"
            style={{ WebkitTextStroke: '1px rgba(0,255,136,0.09)' }}
          >
            {pad(active + 1)}
          </motion.span>
        </div>

        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label="Interactive project gallery. Use the left and right arrow keys to browse, Enter to open the selected project."
          className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing"
        />

        {/* edge vignette over the canvas so cards melt into the void */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 52%, rgba(3,5,12,0.8))' }}
        />
        {/* bottom fade that carries the HUD */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
          style={{ background: 'linear-gradient(to top, rgba(3,5,12,0.96) 12%, rgba(3,5,12,0.6) 55%, transparent)' }}
        />

        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="pointer-events-none absolute left-4 top-24 z-10 sm:left-8 lg:left-16"
        >
          <h2 className="font-display text-3xl font-bold uppercase tracking-tighter text-fg sm:text-5xl">
            Selected <span className="italic text-accent">Works</span>
          </h2>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">({pad(N)} Projects)</p>
        </motion.div>

        {/* interaction hint */}
        <div
          className={`pointer-events-none absolute right-4 top-24 z-10 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-opacity duration-700 sm:right-8 sm:flex lg:right-16 ${touched ? 'opacity-0' : 'opacity-100'}`}
        >
          <span>Drag</span>
          <span className="h-3 w-px bg-border" />
          <span>Scroll</span>
          <span className="h-3 w-px bg-border" />
          <span>← →</span>
        </div>
        <div
          className={`pointer-events-none absolute inset-x-0 top-[58%] z-10 flex justify-center transition-opacity duration-700 sm:hidden ${touched ? 'opacity-0' : 'opacity-100'}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Swipe ← → to explore</span>
        </div>

        {/* HUD */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 sm:px-8 sm:pb-8 lg:px-16">
          <div className="mx-auto max-w-7xl">
            {/* progress segments — the active one stretches */}
            <div className="mb-4 flex items-center gap-2 sm:mb-5">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Go to ${p.title}`}
                  aria-current={i === active}
                  onClick={() => api.current?.go(i)}
                  className={`hover-target group flex items-center py-3 transition-[flex-grow] duration-700 ease-out ${
                    i === active ? 'grow-[4]' : 'grow'
                  } basis-0`}
                >
                  <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-border">
                    <span
                      className="absolute inset-0 origin-left rounded-full bg-accent shadow-[0_0_10px_var(--phosphor)] transition-transform duration-700 ease-out"
                      style={{ transform: `scaleX(${i === active ? 1 : i < active ? 1 : 0})`, opacity: i === active ? 1 : 0.35 }}
                    />
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              {/* project info */}
              <div className="relative min-h-[132px] min-w-0 flex-1 sm:min-h-[150px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={active}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                    className="min-w-0"
                  >
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                      className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted"
                    >
                      <span className="text-accent">{pad(active + 1)}</span> / {pad(N)} &nbsp;·&nbsp; {current.category}{' '}
                      &nbsp;·&nbsp; {current.year}
                    </motion.p>

                    <span className="mt-2 block overflow-hidden pb-1">
                      <motion.span
                        initial={{ y: '105%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, ease: EASE_OUT }}
                        className="block truncate font-display text-4xl font-bold uppercase leading-[1.02] tracking-tighter text-fg sm:text-6xl lg:text-7xl"
                      >
                        {current.title}
                      </motion.span>
                    </span>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
                      className="mt-2 line-clamp-2 max-w-xl text-sm text-muted sm:text-base"
                    >
                      {current.tagline}
                    </motion.p>

                    <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                      {current.tags.slice(0, 4).map((t, ti) => (
                        <motion.span
                          key={t}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.18 + ti * 0.05, ease: EASE_OUT }}
                          className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
                        >
                          {t}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* controls */}
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous project"
                  onClick={() => api.current?.step(-1)}
                  disabled={active === 0}
                  className="hover-target flex h-12 w-12 items-center justify-center rounded-full border border-border text-fg transition-all duration-300 hover:border-accent hover:bg-accent hover:text-bg active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Next project"
                  onClick={() => api.current?.step(1)}
                  disabled={active === N - 1}
                  className="hover-target flex h-12 w-12 items-center justify-center rounded-full border border-border text-fg transition-all duration-300 hover:border-accent hover:bg-accent hover:text-bg active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(current.id)}
                  className="hover-target group flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-all duration-300 hover:bg-white hover:shadow-[0_0_40px_-8px_var(--phosphor)] active:scale-95 sm:flex-none sm:px-7"
                >
                  View Project
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* keyboard / screen-reader access to every project */}
      <ul className="sr-only">
        {projects.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onOpen(p.id)}>
              Open project {p.title} — {p.category}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}