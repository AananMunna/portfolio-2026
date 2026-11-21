'use client';

/**
 * ProjectsGallery — the "walk through the tunnel" projects section.
 * Reads from the same data as the original section (Projectsdata) and opens the same
 * ProjectDetail overlay. The 3D scene is only loaded when the section is about to be seen,
 * and devices that can't run it smoothly get the list view instead.
 */
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projects } from './Projectsdata';
import ProjectDetail from './Projectdetail';
import { artUrl, heightSvh, webglOK } from './galleryLayout';

const GalleryWalk = dynamic(() => import('./GalleryWalk'), { ssr: false });

type Mode = 'gallery' | 'list';
const pad = (n: number) => String(n).padStart(2, '0');
type LenisLike = { stop: () => void; start: () => void; scrollTo: (y: number, o?: object) => void };
const getLenis = () => (window as unknown as { lenis?: LenisLike }).lenis;

function ViewToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="tablist" aria-label="Projects view" className="inline-flex border border-border bg-bg/80 font-mono text-[11px] uppercase tracking-widest">
      {(['gallery', 'list'] as const).map((m) => (
        <button
          key={m}
          role="tab"
          type="button"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`hover-target min-h-10 px-3.5 transition-colors ${mode === m ? 'bg-accent text-bg' : 'text-muted active:text-fg md:hover:text-fg'}`}
        >
          {m === 'gallery' ? '3d' : 'list'}
        </button>
      ))}
    </div>
  );
}

function ProjectList({ onOpen, toggle }: { onOpen: (id: number) => void; toggle: React.ReactNode }) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const move = (e: PointerEvent) => {
      if (previewRef.current) previewRef.current.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 110}px, 0)`;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const hovered = projects.find((p) => p.id === hoverId);

  return (
    <section className="relative bg-bg px-4 pb-32 pt-20 text-fg md:px-10 md:pb-28 md:pt-24">
      <div className="mb-8 flex items-start justify-between md:mb-12">
        <div className="font-mono text-[11px] uppercase leading-relaxed tracking-widest text-accent">
          <div>{"// work"}</div>
          <div className="text-muted">~/projects · {pad(projects.length)}</div>
        </div>
        {toggle}
      </div>

      <ul className="border-b border-border">
        {projects.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: Math.min(i, 3) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-border"
          >
            <button
              type="button"
              onClick={() => onOpen(p.id)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverId(p.id)}
              onPointerLeave={() => setHoverId(null)}
              className="hover-target group flex w-full items-center gap-4 py-4 text-left active:bg-surface md:grid md:grid-cols-[4rem_1fr_16rem_6rem_2rem] md:gap-5 md:py-7"
            >
              <span className="relative h-14 w-20 shrink-0 overflow-hidden border border-border md:hidden">
                <Image src={p.image} alt="" fill sizes="80px" className="object-cover object-top" />
              </span>
              <span className="hidden font-mono text-xs tracking-widest text-accent md:block">{pad(i + 1)}</span>
              <span className="min-w-0 flex-1 md:flex-none">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-accent md:hidden">
                  {pad(i + 1)} {"//"} {p.year}
                </span>
                <span className="block truncate font-display text-2xl font-bold uppercase leading-none tracking-tighter text-fg transition-transform duration-500 md:text-5xl md:group-hover:translate-x-3 md:group-hover:text-accent">
                  {p.title}
                </span>
                <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-widest text-muted md:hidden">{p.category}</span>
              </span>
              <span className="hidden font-mono text-xs uppercase tracking-widest text-muted md:block">{p.category}</span>
              <span className="hidden font-mono text-xs tracking-widest text-muted md:block">{p.year}</span>
              <ArrowUpRight className="shrink-0 text-muted transition-colors md:group-hover:text-accent" size={20} />
            </button>
          </motion.li>
        ))}
      </ul>

      <div ref={previewRef} className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block" style={{ willChange: 'transform' }}>
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative h-[200px] w-[320px] overflow-hidden border border-border"
            >
              <Image src={hovered.image} alt="" fill sizes="320px" className="object-cover object-top" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function ProjectsGallery() {
  const [mode, setMode] = useState<Mode>('gallery');
  const [near, setNear] = useState(false); // mount the 3D scene only when the section is close
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);
  const wasOpen = useRef(false);

  const selectedIndex = selectedId === null ? -1 : projects.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? projects[selectedIndex] : null;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!webglOK() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMode('list');
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // freeze the page behind the case-study overlay, restore the exact scroll afterwards
  useEffect(() => {
    const lenis = getLenis();
    if (selected) {
      if (!wasOpen.current) savedScrollY.current = window.scrollY;
      wasOpen.current = true;
      lenis?.stop();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      lenis?.start();
      lenis?.scrollTo(savedScrollY.current, { immediate: true, force: true });
    }
  }, [selected]);

  useEffect(() => () => getLenis()?.start(), []);

  // warm the browser cache with the small images while the visitor is still reading the page
  useEffect(() => {
    const m = window.matchMedia('(max-width: 767px)').matches;
    const run = () => projects.forEach((p) => void (new window.Image().src = artUrl(p.image, m)));
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback;
    if (ric) ric(run);
    else setTimeout(run, 1500);
  }, []);

  const open = useCallback((id: number) => setSelectedId(id), []);
  const close = useCallback(() => setSelectedId(null), []);
  const fail = useCallback(() => setMode('list'), []);

  const changeMode = useCallback((m: Mode) => {
    setMode(m);
    const top = (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    requestAnimationFrame(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    });
  }, []);

  const toggle = <ViewToggle mode={mode} onChange={changeMode} />;
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

  return (
    <div ref={rootRef}>
      {mode === 'gallery' ? (
        near ? (
          <GalleryWalk projects={projects} openId={selectedId} onOpen={open} onFail={fail} toggle={toggle} />
        ) : (
          <div className="bg-bg" style={{ height: `${heightSvh(projects.length, mobile)}svh` }} aria-hidden suppressHydrationWarning />
        )
      ) : (
        <ProjectList onOpen={open} toggle={toggle} />
      )}

      <AnimatePresence>
        {selected && (
          <ProjectDetail
            key="gallery-project-detail"
            project={selected}
            index={selectedIndex}
            total={projects.length}
            prev={projects[selectedIndex - 1] ?? null}
            next={projects[selectedIndex + 1] ?? null}
            onClose={close}
            onNavigate={setSelectedId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
