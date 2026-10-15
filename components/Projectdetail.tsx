'use client';

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ExternalLink, Github, X } from 'lucide-react';
import type { Project } from './Projectsdata';

/* ───────── helpers ───────── */
const pad = (n: number) => String(n).padStart(2, '0');
const EASE = [0.16, 1, 0.3, 1] as const;

const STACK: Record<string, { label: string; group: 'Frontend' | 'Backend' | 'Database' | 'Other' }> = {
  react: { label: 'React', group: 'Frontend' },
  tailwind: { label: 'Tailwind CSS', group: 'Frontend' },
  express: { label: 'Express.js', group: 'Backend' },
  mongodb: { label: 'MongoDB', group: 'Database' },
};
const GROUP_ORDER = ['Frontend', 'Backend', 'Database', 'Other'] as const;

function groupStack(tags: string[]) {
  const map = new Map<string, string[]>();
  for (const t of tags) {
    const s = STACK[t.toLowerCase()] ?? { label: t, group: 'Other' as const };
    map.set(s.group, [...(map.get(s.group) ?? []), s.label]);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/* ───────── scroll-root context so whileInView works inside the overlay ───────── */
const RootCtx = createContext<RefObject<HTMLElement | null> | null>(null);

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const root = useContext(RootCtx);
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ root: root ?? undefined, once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{n}</span>
      <span className="h-px w-8 bg-accent/40" />
      <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">{children}</h2>
    </div>
  );
}

const btnPrimary =
  'hover-target group inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-all duration-300 hover:bg-white hover:shadow-[0_0_40px_-8px_var(--phosphor)]';
const btnGhost =
  'hover-target group inline-flex items-center justify-center gap-2.5 rounded-full border border-border px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-fg transition-all duration-300 hover:border-accent/60 hover:bg-[var(--phosphorA)] hover:text-accent';
const iconBtn =
  'hover-target flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg transition-all duration-300 hover:border-accent hover:bg-accent hover:text-bg disabled:pointer-events-none disabled:opacity-30';

/* ───────── component ───────── */
interface Props {
  project: Project;
  index: number;
  total: number;
  prev: Project | null;
  next: Project | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
}

export default function ProjectDetail({ project, index, total, prev, next, onClose, onNavigate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const [stuck, setStuck] = useState(false);

  const { scrollY, scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });
  useMotionValueEvent(scrollY, 'change', (v) => setStuck(v > 460));

  // back to top whenever we switch project
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [project.id]);

  // focus the dialog on open, restore focus on close
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    return () => prevFocus?.focus?.({ preventScroll: true });
  }, []);

  // keyboard: Esc closes, ← → switch project
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && next) onNavigate(next.id);
      else if (e.key === 'ArrowLeft' && prev) onNavigate(prev.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate, next, prev]);

  const stack = groupStack(project.tags);
  const host = hostOf(project.link);

  const details: [string, string][] = [
    ['Year', project.year],
    ['Role', project.role],
    ['Type', project.type],
  ];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} project details`}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.99 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-0 z-[90] bg-bg"
    >
      {/* reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 z-40 h-[2px] origin-left bg-accent shadow-[0_0_12px_var(--phosphor)]"
      />

      {/* the whole overlay scrolls as ONE container — wheel works anywhere */}
      <div ref={scrollRef} data-lenis-prevent="true" className="absolute inset-0 overflow-y-auto overscroll-contain scroll-smooth">
        <RootCtx.Provider value={scrollRef}>
          {/* ── sticky top bar ── */}
          <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/75 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
              <button type="button" onClick={onClose} className="hover-target group flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted transition-colors hover:text-accent">
                <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="hidden sm:inline">All works</span>
              </button>

              <div
                className={`pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 transition-all duration-300 md:flex ${
                  stuck ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{pad(index + 1)}</span>
                <span className="font-display text-sm font-bold uppercase tracking-tight">{project.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover-target hidden items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-bg transition-all duration-300 hover:bg-white sm:flex ${
                    stuck ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  Live site <ExternalLink size={13} />
                </a>
                <button type="button" aria-label="Previous project" disabled={!prev} onClick={() => prev && onNavigate(prev.id)} className={iconBtn}>
                  <ArrowLeft size={16} />
                </button>
                <button type="button" aria-label="Next project" disabled={!next} onClick={() => next && onNavigate(next.id)} className={iconBtn}>
                  <ArrowRight size={16} />
                </button>
                <button ref={closeRef} type="button" aria-label="Close project" onClick={onClose} className={`${iconBtn} group`}>
                  <X size={16} className="transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </header>

          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {/* ── hero ── */}
            <section className="relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    'linear-gradient(var(--dim) 1px, transparent 1px), linear-gradient(90deg, var(--dim) 1px, transparent 1px)',
                  backgroundSize: '64px 64px',
                  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)',
                  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)',
                }}
              />
              <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

              <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-8 sm:pt-20">
                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.25em]">
                  <span className="text-accent">
                    {pad(index + 1)} / {pad(total)}
                  </span>
                  <span className="h-px w-8 bg-border" />
                  <span className="text-muted">{project.category}</span>
                </div>

                <h1 className="font-display text-[clamp(3.25rem,11vw,9.5rem)] font-bold uppercase leading-[0.88] tracking-tighter text-fg">
                  {project.title}
                </h1>

                <p className="mt-6 max-w-2xl text-xl leading-snug text-fg/70 sm:text-2xl">{project.tagline}</p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                    View live site <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                    <Github size={16} /> Source code
                  </a>
                </div>

                {/* meta strip */}
                <dl className="mt-14 grid grid-cols-2 border-y border-border sm:grid-cols-4">
                  {[...details, ['Status', project.status] as [string, string]].map(([k, v], i) => (
                    <div key={k} className={`py-5 ${i % 2 === 1 ? 'pl-5' : ''} ${i > 0 ? 'sm:border-l sm:border-border sm:pl-6' : ''} ${i >= 2 ? 'border-t border-border sm:border-t-0' : ''}`}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{k}</dt>
                      <dd className="mt-1.5 flex items-center gap-2 text-sm font-medium text-fg sm:text-base">
                        {k === 'Status' && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                          </span>
                        )}
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* browser frame */}
                <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_0_140px_-40px_rgba(0,255,136,0.35)]">
                  <div className="flex items-center gap-3 border-b border-border bg-[var(--void3)] px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-target mx-auto flex max-w-sm flex-1 items-center justify-center gap-2 truncate rounded-md border border-border bg-bg/60 px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:text-accent"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="truncate">{host}</span>
                    </a>
                    <span className="w-[42px]" aria-hidden />
                  </div>
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={project.image}
                      alt={`${project.title} screenshot`}
                      fill
                      priority
                      sizes="(min-width:1280px) 1216px, 100vw"
                      className="object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── body ── */}
            <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-6 sm:px-8 lg:grid-cols-12 lg:gap-16">
              <div className="space-y-20 lg:col-span-8">
                <Reveal>
                  <SectionLabel n="01">Overview</SectionLabel>
                  <p className="text-2xl font-medium leading-snug text-fg/90 sm:text-3xl">{project.overview}</p>
                </Reveal>

                <Reveal>
                  <SectionLabel n="02">The story</SectionLabel>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-surface p-6">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--amber)]">Problem</p>
                      <p className="leading-relaxed text-fg/75">{project.problem}</p>
                    </div>
                    <div className="rounded-2xl border border-accent/25 bg-[var(--phosphorA)] p-6">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Solution</p>
                      <p className="leading-relaxed text-fg/85">{project.solution}</p>
                    </div>
                  </div>
                </Reveal>

                <div>
                  <Reveal>
                    <SectionLabel n="03">Key features</SectionLabel>
                  </Reveal>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {project.features.map((f, i) => (
                      <Reveal key={f.title} delay={(i % 2) * 0.06}>
                        <div className="group h-full rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent/40 hover:bg-[var(--dimmer)]">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="font-mono text-[11px] tracking-widest text-muted">{pad(i + 1)}</span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-accent transition-colors duration-300 group-hover:border-accent/50 group-hover:bg-accent/10">
                              <Check size={14} />
                            </span>
                          </div>
                          <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-fg">{f.title}</h3>
                          <p className="text-sm leading-relaxed text-fg/65">{f.desc}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>

                {project.challenges && project.challenges.length > 0 && (
                  <div>
                    <Reveal>
                      <SectionLabel n="04">Challenges &amp; learnings</SectionLabel>
                    </Reveal>
                    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
                      {project.challenges.map((c) => (
                        <Reveal key={c.challenge}>
                          <div className="grid gap-4 p-6 md:grid-cols-2 md:gap-8">
                            <div>
                              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--amber)]">Challenge</p>
                              <p className="leading-relaxed text-fg/85">{c.challenge}</p>
                            </div>
                            <div>
                              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">How I solved it</p>
                              <p className="leading-relaxed text-fg/65">{c.solution}</p>
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── sticky sidebar ── */}
              <aside className="lg:col-span-4">
                <div className="space-y-4 lg:sticky lg:top-24">
                  <Reveal>
                    <div className="rounded-2xl border border-border bg-surface p-6">
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Links</p>
                      <div className="flex flex-col gap-3">
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                          Live site <ExternalLink size={15} />
                        </a>
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                          <Github size={15} /> GitHub repo
                        </a>
                      </div>
                      <p className="mt-4 truncate font-mono text-[11px] text-muted">{host}</p>
                    </div>
                  </Reveal>

                  <Reveal delay={0.05}>
                    <div className="rounded-2xl border border-border bg-surface p-6">
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Details</p>
                      <ul className="space-y-3 font-mono text-xs">
                        {[...details, ['Status', project.status] as [string, string]].map(([k, v]) => (
                          <li key={k} className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                            <span className="text-muted">{k}</span>
                            <span className="text-right text-fg">{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>

                  <Reveal delay={0.1}>
                    <div className="rounded-2xl border border-border bg-surface p-6">
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Tech stack</p>
                      <div className="space-y-4">
                        {stack.map(({ group, items }) => (
                          <div key={group}>
                            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text3 text-[var(--text3)]">{group}</p>
                            <div className="flex flex-wrap gap-2">
                              {items.map((t) => (
                                <span key={t} className="rounded-full border border-border bg-bg px-3 py-1 font-mono text-[11px] text-fg/85 transition-colors hover:border-accent/50 hover:text-accent">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </aside>
            </div>

            {/* ── next project ── */}
            {next && (
              <button
                type="button"
                onClick={() => onNavigate(next.id)}
                className="hover-target group relative block w-full overflow-hidden border-t border-border text-left"
              >
                <Image
                  src={next.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover object-top opacity-[0.12] transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-25"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/40" />
                <div className="relative mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 py-20 sm:px-8 sm:py-28">
                  <div className="min-w-0">
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                      Next project — {pad(index + 2)} / {pad(total)}
                    </p>
                    <p className="truncate font-display text-[clamp(2.5rem,9vw,7rem)] font-bold uppercase leading-none tracking-tighter text-fg transition-colors duration-300 group-hover:text-accent">
                      {next.title}
                    </p>
                    <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">{next.category}</p>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg sm:h-20 sm:w-20">
                    <ArrowRight size={26} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            )}

            {!next && (
              <div className="border-t border-border">
                <div className="mx-auto flex max-w-7xl justify-center px-4 py-20 sm:px-8">
                  <button type="button" onClick={onClose} className={btnGhost}>
                    <ArrowLeft size={16} /> Back to all works
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </RootCtx.Provider>
      </div>
    </motion.div>
  );
}