'use client';

/**
 * ProjectsGallery — the "walk through a white gallery" projects section.
 * Reads from the same single source of truth as the original section (Projectsdata),
 * and opens the same ProjectDetail overlay, so nothing is duplicated.
 */
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projects } from './Projectsdata';
import ProjectDetail from './Projectdetail';
import GalleryWalk from './GalleryWalk';

type Mode = 'gallery' | 'list';
const pad = (n: number) => String(n).padStart(2, '0');

function ViewToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const base =
    'rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors duration-300';
  return (
    <div
      role="tablist"
      aria-label="Projects view"
      className="inline-flex items-center rounded-full border border-black/10 bg-white/70 p-0.5 backdrop-blur"
    >
      {(['gallery', 'list'] as const).map((m) => (
        <button
          key={m}
          role="tab"
          type="button"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`${base} ${mode === m ? 'bg-black text-white' : 'text-black/45 hover:text-black'}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function ProjectList({
  onOpen,
  toggle,
}: {
  onOpen: (id: number) => void;
  toggle: React.ReactNode;
}) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (previewRef.current)
        previewRef.current.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 110}px, 0)`;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const hovered = projects.find((p) => p.id === hoverId);

  return (
    <section className="relative min-h-screen bg-[#fafaf9] px-5 pb-24 pt-28 text-[#111] md:px-10 md:pt-24">
      <div className="mb-10 flex items-start justify-between">
        <div className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-black/45">
          <div>Selected work</div>
          <div className="text-black/30">The index — {projects.length} projects</div>
        </div>
        {toggle}
      </div>

      <ul className="border-b border-black/10">
        {projects.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-black/10"
          >
            <button
              type="button"
              onClick={() => onOpen(p.id)}
              onPointerEnter={() => setHoverId(p.id)}
              onPointerLeave={() => setHoverId(null)}
              className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-6 text-left md:grid-cols-[4rem_1fr_16rem_6rem_2rem] md:py-8"
            >
              <span className="font-mono text-[11px] tracking-[0.25em] text-black/35">{pad(i + 1)}</span>
              <span className="font-sans text-3xl font-extrabold uppercase leading-none tracking-tight transition-transform duration-500 group-hover:translate-x-3 md:text-5xl">
                {p.title}
              </span>
              <span className="col-start-2 font-serif text-base italic text-black/55 md:col-start-auto md:text-lg">
                {p.category}
              </span>
              <span className="hidden font-mono text-[11px] tracking-[0.25em] text-black/40 md:block">{p.year}</span>
              <ArrowUpRight
                className="col-start-3 row-start-1 text-black/30 transition-all duration-300 group-hover:rotate-12 group-hover:text-black md:col-start-auto md:row-start-auto"
                size={20}
              />
            </button>
          </motion.li>
        ))}
      </ul>

      {/* hover preview that follows the cursor */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
        style={{ willChange: 'transform' }}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[200px] w-[320px] overflow-hidden rounded-sm shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]"
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);
  const wasOpen = useRef(false);

  const selectedIndex = selectedId === null ? -1 : projects.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? projects[selectedIndex] : null;

  // freeze the page behind the detail overlay, restore the exact scroll afterwards
  useEffect(() => {
    const lenis = (window as any).lenis;
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

  useEffect(() => {
    return () => {
      (window as any).lenis?.start();
    };
  }, []);

  const open = useCallback((id: number) => setSelectedId(id), []);
  const close = useCallback(() => setSelectedId(null), []);

  const changeMode = useCallback((m: Mode) => {
    setMode(m);
    const top = (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    requestAnimationFrame(() => {
      const lenis = (window as any).lenis;
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    });
  }, []);

  const toggle = <ViewToggle mode={mode} onChange={changeMode} />;

  return (
    <div ref={rootRef}>
      {mode === 'gallery' ? (
        <GalleryWalk
          projects={projects.map(({ id, title, category, image, year, tags, tagline }) => ({
            id,
            title,
            category,
            image,
            year,
            tags,
            tagline,
          }))}
          openId={selectedId}
          onOpen={open}
          toggle={toggle}
        />
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
