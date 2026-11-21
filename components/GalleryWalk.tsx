'use client';
/**
 * GalleryWalk — a white, curved museum corridor you "walk" through with scroll.
 *
 * Studied from the reference video:
 *  - a sticky full-screen stage; page scroll drives the camera along the curved wall
 *  - frames hang on a cylindrical wall, each with a small serif caption underneath
 *  - the camera looks along the wall, so near frames are big/cropped and far ones recede
 *  - frames sway/bend with scroll velocity (soft "cloth" wobble) and settle when idle
 *  - hovering a frame shows a black "OPEN THE PROJECT" pill that follows the cursor
 *  - clicking flies the camera to the frame, others fade, then the detail view opens
 *  - bottom-centre "YOU ARE WALKING PAST / TITLE / ENTER →", bottom-right arrows + hint,
 *    top-right GALLERY | LIST toggle
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface GalleryProject {
  id: number;
  title: string;
  category: string;
  image: string;
  year: string;
  tags: string[];
  tagline: string;
}

interface Props {
  projects: GalleryProject[];
  openId: number | null;
  onOpen: (id: number) => void;
  toggle: React.ReactNode;
}

/* ───────────────────────── layout constants ───────────────────────── */
const R = 15; // radius of the card ring
const WALL_R = R + 0.35; // the wall sits just behind the cards
const FLOOR_Y = -2.7;
const CARD_H = 3.4;
const CARD_Y = 0.15;
const GAP = 2.6; // arc gap between frames (room for captions)
const SCROLL_VH = 62; // scroll length per frame
const RC = R - 8.6; // radius the camera travels on
const LEAD = 0.28; // camera sits this far "behind" the focused frame (radians)
const LOOK = 0.28; // camera looks this far "ahead" of the focused frame (radians)
const CAM_Y = -0.35;
const TGT_Y = -0.45;

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
    // hug the cylindrical wall
    p.z += (1.0 - cos(gx * uBend)) / uBend;
    // soft cloth-like sway driven by scroll velocity
    float v = clamp(abs(uVel), 0.0, 1.4);
    p.z += sin(gx * 0.6 + uPhase) * 0.22 * v;
    p.y += sin(gx * 0.5 + uPhase * 1.3) * 0.10 * v;
    // intro rise
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
    c = mix(c, vec3(0.955), smoothstep(18.0, 40.0, d) * 0.55);
    gl_FragColor = vec4(c, uShow * uFade);
  }
`;

const FLAT_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uShow; uniform float uFade; uniform float uOpacity;
  varying vec2 vUv; varying vec3 vW;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    gl_FragColor = vec4(c.rgb, c.a * uOpacity * uShow * uFade);
  }
`;

const WORLD_VERT = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const WALL_FRAG = /* glsl */ `
  varying vec3 vW;
  void main() {
    float t = smoothstep(${FLOOR_Y.toFixed(1)}, 1.6, vW.y);
    vec3 c = mix(vec3(0.86, 0.86, 0.87), vec3(0.992, 0.992, 0.99), t);
    gl_FragColor = vec4(c, 1.0);
  }
`;

const FLOOR_FRAG = /* glsl */ `
  varying vec3 vW;
  void main() {
    float r = length(vW.xz);
    float k = smoothstep(2.0, ${WALL_R.toFixed(1)}, r);
    vec3 c = mix(vec3(0.80, 0.80, 0.815), vec3(0.86, 0.86, 0.87), k);
    gl_FragColor = vec4(c, 1.0);
  }
`;

/* ───────────────────────── helpers ───────────────────────── */
const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function makeCaption(p: GalleryProject, mono: string) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 320;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
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
  const meta = [p.year, ...p.tags.slice(0, 3)].join('  ·  ').toUpperCase();
  ctx.fillText(meta, 8, 196);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

function makeShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, 'rgba(20,20,30,0.55)');
  g.addColorStop(0.55, 'rgba(20,20,30,0.18)');
  g.addColorStop(1, 'rgba(20,20,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

function placeholder(p: GalleryProject) {
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

/* ───────────────────────── component ───────────────────────── */
export default function GalleryWalk({ projects, openId, onOpen, toggle }: Props) {
  const N = projects.length;
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
  const [hovering, setHovering] = useState(false);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);

  /* keep the 3D camera in sync with the detail overlay (open / navigate / close) */
  useEffect(() => {
    if (openId === null) api.current?.release();
    else {
      const idx = projectsRef.current.findIndex((p) => p.id === openId);
      if (idx >= 0) api.current?.fly(idx);
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
    renderer.setClearColor(0xfafaf9, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);

    /* wall + floor */
    const wallGeo = new THREE.CylinderGeometry(WALL_R, WALL_R, 18, 96, 1, true);
    const wallMat = new THREE.ShaderMaterial({
      vertexShader: WORLD_VERT,
      fragmentShader: WALL_FRAG,
      side: THREE.BackSide,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = FLOOR_Y + 9;
    scene.add(wall);

    const floorGeo = new THREE.CircleGeometry(WALL_R + 0.2, 96);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.ShaderMaterial({ vertexShader: WORLD_VERT, fragmentShader: FLOOR_FRAG });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = FLOOR_Y;
    scene.add(floor);

    const shadowTex = makeShadow();
    const root = new THREE.Group();
    scene.add(root);

    interface Card {
      group: THREE.Group;
      art: THREE.Mesh;
      uniforms: THREE.IUniform[];
      shared: Record<string, THREE.IUniform>;
      theta: number;
      w: number;
      hover: number;
    }
    const cards: Card[] = [];
    const disposables: { dispose: () => void }[] = [wallGeo, wallMat, floorGeo, floorMat, shadowTex];

    /* shared per-frame uniforms */
    const U = {
      vel: { value: 0 },
      show: { value: 0 },
      fade: { value: 1 },
    };

    const monoFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-share-tech-mono').trim() ||
      'ui-monospace, monospace';

    const build = async () => {
      const imgs = await Promise.all(list.map((p) => loadImage(p.image)));
      try {
        await document.fonts?.load(`400 30px ${monoFamily}`);
      } catch {
        /* font is optional */
      }
      if (disposed) return;

      // arc-length layout: wider frames take more room
      const widths = imgs.map((img) => {
        const a = img ? img.width / img.height : 1.5;
        return CARD_H * clamp(a, 0.8, 1.65);
      });
      let cursor = 0;
      const centers = widths.map((w) => {
        const c = cursor + w / 2;
        cursor += w + GAP;
        return c;
      });

      list.forEach((p, i) => {
        const img = imgs[i];
        const w = widths[i];
        const theta = -(centers[i] - centers[0]) / R;
        const group = new THREE.Group();
        group.position.set(R * Math.sin(theta), CARD_Y, -R * Math.cos(theta));
        group.rotation.y = -theta;
        root.add(group);

        const phase = i * 1.7;
        const mk = (extra: Record<string, THREE.IUniform>, frag: string, ox: number) => {
          const shared: Record<string, THREE.IUniform> = {
            uVel: U.vel,
            uShow: { value: 0 },
            uFade: { value: 1 },
            uPhase: { value: phase },
            uBend: { value: 1 / R },
            uOx: { value: ox },
            uHover: { value: 0 },
            ...extra,
          };
          const mat = new THREE.ShaderMaterial({
            vertexShader: CARD_VERT,
            fragmentShader: frag,
            uniforms: shared,
            transparent: true,
            depthWrite: false,
          });
          disposables.push(mat);
          return { mat, shared };
        };

        // soft shadow
        const shGeo = new THREE.PlaneGeometry(w * 1.28, CARD_H * 1.3, 24, 1);
        const sh = mk({ uTex: { value: shadowTex }, uOpacity: { value: 0.55 } }, FLAT_FRAG, 0);
        const shMesh = new THREE.Mesh(shGeo, sh.mat);
        shMesh.position.set(0, -0.12, -0.04);
        shMesh.renderOrder = 1;
        group.add(shMesh);

        // artwork
        let tex: THREE.Texture;
        let uvv = new THREE.Vector4(1, 1, 0, 0);
        if (img) {
          tex = new THREE.Texture(img);
          const imgA = img.width / img.height;
          const cardA = w / CARD_H;
          if (imgA > cardA) {
            const rx = cardA / imgA;
            uvv.set(rx, 1, (1 - rx) / 2, 0);
          } else {
            const ry = imgA / cardA;
            uvv.set(1, ry, 0, 1 - ry); // keep the top of tall screenshots
          }
        } else {
          tex = new THREE.CanvasTexture(placeholder(p));
          uvv = new THREE.Vector4(1, 1, 0, 0);
        }
        tex.anisotropy = maxAniso;
        tex.needsUpdate = true;
        disposables.push(tex);

        const artGeo = new THREE.PlaneGeometry(w, CARD_H, 48, 1);
        const art = mk({ uTex: { value: tex }, uUv: { value: uvv } }, ART_FRAG, 0);
        const artMesh = new THREE.Mesh(artGeo, art.mat);
        artMesh.renderOrder = 2;
        artMesh.userData.index = i;
        group.add(artMesh);

        // caption
        const capTex = makeCaption(p, monoFamily);
        disposables.push(capTex);
        const capW = 3.9;
        const capH = capW * (320 / 1024);
        const capGeo = new THREE.PlaneGeometry(capW, capH, 16, 1);
        const capOx = -w / 2 + capW / 2;
        const cap = mk({ uTex: { value: capTex }, uOpacity: { value: 1 } }, FLAT_FRAG, capOx);
        const capMesh = new THREE.Mesh(capGeo, cap.mat);
        capMesh.position.set(capOx, -CARD_H / 2 - 0.32 - capH / 2, 0.01);
        capMesh.renderOrder = 3;
        group.add(capMesh);

        disposables.push(shGeo, artGeo, capGeo);
        cards.push({
          group,
          art: artMesh,
          uniforms: [sh.shared.uShow, art.shared.uShow, cap.shared.uShow],
          shared: { fadeS: sh.shared.uFade, fadeA: art.shared.uFade, fadeC: cap.shared.uFade, hover: art.shared.uHover, hoverC: cap.shared.uHover },
          theta,
          w,
          hover: 0,
        });
      });
      setReady(true);
    };
    build();

    /* ───────── camera rig ───────── */
    const camPos = new THREE.Vector3();
    const camTgt = new THREE.Vector3();
    const flyPos = new THREE.Vector3();
    const flyTgt = new THREE.Vector3();
    const flyN = new THREE.Vector3();
    let cur = 0;
    let target = 0;
    let vel = 0;
    let intro = 0;
    let introStarted = false;
    let visible = false;
    let flyIdx = -1;
    let flyV = 0;
    let flyTarget = 0;
    let opened = false;
    let hoverIdx = -1;
    let activeIdx = 0;
    let lastT = performance.now();
    let aspect = 1;

    const lenis = () => (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    const scrollToY = (y: number, immediate = false) => {
      const l = lenis();
      if (l) l.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.5 });
      else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
    };
    const totalScroll = () => Math.max(1, section.offsetHeight - window.innerHeight);
    const sectionTop = () => section.getBoundingClientRect().top + window.scrollY;

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 0.75 ? 74 : aspect < 1.15 ? 64 : 52;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    cleanups.push(() => ro.disconnect());

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !introStarted) introStarted = true;
      },
      { rootMargin: '120px 0px', threshold: 0 }
    );
    io.observe(section);
    cleanups.push(() => io.disconnect());

    const psiAt = (f: number) => {
      if (cards.length < 2) return cards[0]?.theta ?? 0;
      const k = Math.min(Math.floor(f), cards.length - 2);
      const fr = f - k;
      return cards[k].theta + (cards[k + 1].theta - cards[k].theta) * fr;
    };

    /* pointer / hover / click */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -(((clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(cards.map((c) => c.art), false)[0];
      return hit ? (hit.object.userData.index as number) : -1;
    };

    let down: { x: number; y: number; id: number } | null = null;
    let dragged = false;
    let hoverState = false;

    const onMove = (e: PointerEvent) => {
      pill.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(14px, 14px)`;
      if (down && e.pointerType !== 'touch') {
        const dx = e.clientX - down.x;
        if (Math.abs(dx) > 5) dragged = true;
        if (dragged) {
          // drag the corridor: horizontal drag maps onto page scroll
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
      down = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragged = false;
    };
    const flyTo = (i: number) => {
      if (flyTarget > 0 || i < 0 || i >= cards.length) return;
      flyIdx = i;
      flyTarget = 1;
      opened = false;
      setHovering(false);
      hoverState = false;
      hoverIdx = -1;
    };
    const onUp = (e: PointerEvent) => {
      const wasDrag = dragged;
      const d = down;
      down = null;
      dragged = false;
      canvas.style.cursor = '';
      if (!d || wasDrag) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;
      const i = pick(e.clientX, e.clientY);
      if (i >= 0) flyTo(i);
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
      const y = sectionTop() + (list.length > 1 ? idx / (list.length - 1) : 0) * totalScroll();
      scrollToY(y);
    };
    api.current = {
      go,
      fly: (i) => {
        flyIdx = i;
        flyTarget = 1;
        opened = true;
      },
      release: () => {
        flyTarget = 0;
        opened = false;
      },
    };

    const onKey = (e: KeyboardEvent) => {
      if (!visible || flyTarget > 0) return;
      const r = section.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return;
      if (e.key === 'ArrowRight') go(activeIdx + 1);
      if (e.key === 'ArrowLeft') go(activeIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    cleanups.push(() => window.removeEventListener('keydown', onKey));

    /* ───────── render loop ───────── */
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!visible || cards.length === 0) return;

      // scroll progress (smoothed → inertia)
      const rect = section.getBoundingClientRect();
      target = clamp(-rect.top / totalScroll(), 0, 1);
      const prev = cur;
      cur += (target - cur) * (reduce ? 1 : 1 - Math.exp(-dt * 5.5));
      const speed = (cur - prev) * (cards.length - 1) * 38;
      vel += ((reduce ? 0 : speed) - vel) * (1 - Math.exp(-dt * 8));
      U.vel.value = clamp(vel, -1.4, 1.4);

      // intro
      if (introStarted && intro < 1) intro = reduce ? 1 : Math.min(1, intro + dt / 1.9);
      const lastIdx = cards.length - 1;
      cards.forEach((c, i) => {
        const s = clamp(intro * (1 + lastIdx * 0.16) - i * 0.16, 0, 1);
        const eased = 1 - Math.pow(1 - s, 3);
        c.uniforms.forEach((u) => (u.value = eased));
      });

      // fly (click → zoom to frame)
      flyV += (flyTarget - flyV) * (1 - Math.exp(-dt * (flyTarget ? 3.2 : 4.2)));
      if (Math.abs(flyV - flyTarget) < 0.0015) flyV = flyTarget;
      const e = easeInOut(clamp(flyV, 0, 1));
      if (flyTarget === 1 && flyV > 0.94 && !opened && flyIdx >= 0) {
        opened = true;
        onOpenRef.current(projectsRef.current[flyIdx].id);
      }

      // base camera from scroll
      const f = cur * (cards.length - 1);
      const psi = psiAt(f);
      const phi = psi + LEAD;
      camPos.set(RC * Math.sin(phi), CAM_Y, -RC * Math.cos(phi));
      const th = psi - LOOK;
      camTgt.set(R * Math.sin(th), TGT_Y, -R * Math.cos(th));

      if (flyIdx >= 0 && e > 0) {
        const c = cards[flyIdx];
        const ct = c.theta;
        flyN.set(-Math.sin(ct), 0, Math.cos(ct));
        const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const D = Math.max(CARD_H / (2 * 0.6 * tanH), c.w / (2 * 0.62 * tanH * aspect));
        flyTgt.set(R * Math.sin(ct), CARD_Y, -R * Math.cos(ct));
        flyPos.copy(flyTgt).addScaledVector(flyN, D);
        camPos.lerp(flyPos, e);
        camTgt.lerp(flyTgt, e);
      }
      camera.position.copy(camPos);
      camera.lookAt(camTgt);

      // active frame + per-card hover/fade
      const ai = clamp(Math.round(f), 0, lastIdx);
      if (ai !== activeIdx) {
        activeIdx = ai;
        setActive(ai);
      }
      cards.forEach((c, i) => {
        c.hover += ((hoverIdx === i ? 1 : 0) - c.hover) * (1 - Math.exp(-dt * 10));
        c.shared.hover.value = c.hover;
        c.shared.hoverC.value = c.hover;
        const fade = i === flyIdx ? 1 : 1 - e * 0.96;
        c.shared.fadeS.value = fade;
        c.shared.fadeA.value = fade;
        c.shared.fadeC.value = i === flyIdx ? 1 - e : fade;
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
  }, []);

  /* hide the hint once the visitor has scrolled a little */
  useEffect(() => {
    const onScroll = () => {
      const r = sectionRef.current?.getBoundingClientRect();
      if (r && r.top < -80) setMoved(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const current = projects[active] ?? projects[0];
  const openActive = useCallback(() => {
    if (current) api.current?.fly(active);
    // fly() marks it as opened; fire the open callback directly for the caption button
    if (current) onOpenRef.current(current.id);
  }, [active, current]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#fafaf9] text-[#111]"
      style={{ height: `${100 + (N - 1) * SCROLL_VH}vh` }}
      aria-label="Project gallery"
    >
      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden select-none" style={{ touchAction: 'pan-y' }}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* loading veil */}
        <div
          className={`pointer-events-none absolute inset-0 bg-[#fafaf9] transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-5 pt-24 md:px-10 md:pt-8">
          <div className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-black/45">
            <div>Selected work</div>
            <div className="text-black/30">The gallery — {new Date().getFullYear()}</div>
            <div
              className={`mt-3 hidden text-black/35 transition-opacity duration-500 md:block ${moved ? 'opacity-0' : 'opacity-100'}`}
            >
              Scroll or drag to walk round
              <br />
              Click a frame to look closer
            </div>
          </div>
          <div className="pointer-events-auto">{toggle}</div>
        </div>

        {/* counter */}
        <div className="pointer-events-none absolute bottom-6 left-5 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-black/45 md:bottom-8 md:left-10">
          <span className="text-black">{pad(active + 1)}</span> / {pad(N)}
          <div className="mt-2 h-px w-24 bg-black/10">
            <div
              className="h-px bg-black transition-all duration-500"
              style={{ width: `${((active + 1) / N) * 100}%` }}
            />
          </div>
        </div>

        {/* centre caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center px-6 text-center md:bottom-8">
          <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-black/40">You are walking past</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 flex flex-col items-center"
            >
              <h3 className="font-sans text-2xl font-extrabold uppercase leading-none tracking-tight text-black md:text-3xl">
                {current?.title}
              </h3>
              <button
                type="button"
                onClick={openActive}
                className="pointer-events-auto mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-black/55 transition-colors hover:text-black"
              >
                Enter the project →
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* arrows + hint */}
        <div className="absolute bottom-6 right-5 z-10 flex flex-col items-end gap-3 md:bottom-8 md:right-10">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => api.current?.go(active - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white/70 text-black backdrop-blur transition-colors hover:bg-black hover:text-white disabled:opacity-30"
              disabled={active === 0}
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => api.current?.go(active + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white/70 text-black backdrop-blur transition-colors hover:bg-black hover:text-white disabled:opacity-30"
              disabled={active === N - 1}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

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
