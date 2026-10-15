'use client';

import { AnimatePresence, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { projects, type Project } from './Projectsdata';
import ProjectDetail from './Projectdetail';

// The WebGL world is client-only and heavy — load it lazily.
const ProjectsWorld = dynamic(() => import('./ProjectsWorld'), {
  ssr: false,
  loading: () => <div className="h-[100svh] w-full bg-bg" />,
});

const N = projects.length;
const pad = (n: number) => String(n).padStart(2, '0');

/* ───────── Simple stacked list (mobile / reduced-motion) ───────── */
function ProjectList({ onOpen }: { onOpen: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {projects.map((p: Project, i) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onOpen(p.id)}
          className="group overflow-hidden rounded-2xl border border-border bg-surface text-left hover-target"
        >
          <div className="relative aspect-[16/10] w-full">
            <Image src={p.image} alt={p.title} fill sizes="100vw" className="object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-border bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent backdrop-blur-md">
              {pad(i + 1)} / {pad(N)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted">{p.category}</p>
              <h3 className="font-display text-3xl font-bold uppercase tracking-tighter text-fg">{p.title}</h3>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
              <ArrowRight size={16} className="-rotate-45" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function Projects() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<'pending' | 'world' | 'list'>('pending');
  const reduced = useReducedMotion();
  const savedScrollY = useRef(0);
  const wasOpen = useRef(false);

  const selectedIndex = selectedId === null ? -1 : projects.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? projects[selectedIndex] : null;

  /* WebGL available + user hasn't asked for reduced motion → immersive world, else plain list */
  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      ok = false;
    }
    // one-time client capability check (WebGL + reduced-motion) — cannot be known during SSR
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(ok && !reduced ? 'world' : 'list');
  }, [reduced]);

  /* pause page smooth-scroll while the detail view is open, restore position after */
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

  return (
    <>
      {mode === 'world' && <ProjectsWorld projects={projects} onOpen={open} />}

      {mode === 'pending' && <div className="h-[100svh] w-full bg-bg" />}

      {mode === 'list' && (
        <section className="relative z-20 bg-bg" aria-label="Selected projects">
          <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-8">
            <div className="flex items-end justify-between border-b border-border pb-8">
              <h2 className="font-display text-4xl font-bold uppercase tracking-tighter sm:text-6xl">
                Selected <span className="text-accent italic">Works</span>
              </h2>
              <span className="hidden font-mono text-xs uppercase tracking-widest text-muted sm:block">
                ({pad(N)} Projects)
              </span>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 pb-32 pt-10 sm:px-8">
            <ProjectList onOpen={open} />
          </div>
        </section>
      )}

      <AnimatePresence>
        {selected && (
          <ProjectDetail
            key="project-detail"
            project={selected}
            index={selectedIndex}
            total={N}
            prev={projects[selectedIndex - 1] ?? null}
            next={projects[selectedIndex + 1] ?? null}
            onClose={close}
            onNavigate={setSelectedId}
          />
        )}
      </AnimatePresence>
    </>
  );
}