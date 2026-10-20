'use client';

import {
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, X } from 'lucide-react';
import { projects, type Project } from './Projectsdata';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, '0');
const EASE = [0.16, 1, 0.3, 1] as const;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

/** Optional fields — add any of these to a project in Projectsdata to light up extra sections. */
type Extra = {
  client?: string;
  timeline?: string;
  gallery?: string[];
  results?: { value: number; suffix?: string; label: string; desc?: string }[];
};

const STACK: Record<
  string,
  { label: string; group: 'Frontend' | 'Backend' | 'Database' | 'Other' }
> = {
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
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
    group: g,
    items: map.get(g)!,
  }));
}

const tagLabel = (t: string) => STACK[t.toLowerCase()]?.label ?? t;

/* -------------------------------------------------------------------------- */
/*  Smooth scroll for the overlay's own scroll container                      */
/*                                                                            */
/*  The overlay scrolls inside its own element (not the window), and it is    */
/*  marked data-lenis-prevent so the site-wide Lenis ignores it — that's why  */
/*  it used to scroll natively. This hook gives it the same eased feel.       */
/* -------------------------------------------------------------------------- */

function useSmoothScroll(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let target = el.scrollTop;
    let current = el.scrollTop;
    let raf = 0;
    let running = false;
    let last = 0;

    const max = () => Math.max(0, el.scrollHeight - el.clientHeight);

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      // frame-rate independent easing (~90ms time constant)
      current += (target - current) * (1 - Math.exp(-dt / 90));
      if (Math.abs(target - current) < 0.4) {
        current = target;
        running = false;
      }
      el.scrollTop = current;
      if (running) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      e.preventDefault();

      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 32;
      else if (e.deltaMode === 2) dy *= el.clientHeight;

      if (!running) {
        current = el.scrollTop;
        target = el.scrollTop;
      }
      target = Math.min(max(), Math.max(0, target + dy));

      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    // keep in sync when scrolled by keyboard, scrollbar drag, scrollTo(), etc.
    const onScroll = () => {
      if (!running) {
        target = el.scrollTop;
        current = el.scrollTop;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
    };
  }, [ref, enabled]);
}

/* -------------------------------------------------------------------------- */
/*  Reveal primitives                                                         */
/* -------------------------------------------------------------------------- */

const RootCtx = createContext<RefObject<HTMLElement | null> | null>(null);

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const root = useContext(RootCtx);
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ root: root ?? undefined, once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Image block: a curtain slides down to reveal it, with a gentle settle-zoom. */
function ClipReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const root = useContext(RootCtx);
  const reduced = useReducedMotion();
  const viewport = {
    root: root ?? undefined,
    once: true,
    margin: '0px 0px -10% 0px',
  };

  return (
    <motion.div
      className={`relative overflow-hidden bg-fg/5 ${className}`}
      initial={{ clipPath: reduced ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={viewport}
      transition={{ duration: 1.1, delay, ease: CURTAIN_EASE }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduced ? 1 : 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={viewport}
        transition={{ duration: 1.6, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const root = useContext(RootCtx);
  const reduced = useReducedMotion();
  const inView = useInView(ref, {
    root: root ?? undefined,
    once: true,
    margin: '0px 0px -10% 0px',
  });
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section primitives                                                        */
/* -------------------------------------------------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal>
      <section>
        <h2 className="mb-4 font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

const bodyText = 'text-[15px] leading-7 text-fg/65 sm:text-base sm:leading-7';

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

interface Props {
  project: Project;
  index: number;
  total: number;
  prev: Project | null;
  next: Project | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
  /** Optional: render your site CTA / footer at the end of the page. */
  footer?: ReactNode;
}

export default function ProjectDetail({
  project,
  index,
  total,
  prev,
  next,
  onClose,
  onNavigate,
  footer,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [stuck, setStuck] = useState(false);

  useSmoothScroll(scrollRef, !reduced);

  const { scrollY, scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });
  useMotionValueEvent(scrollY, 'change', (v) => setStuck(v > 280));

  const { scrollYProgress: heroProgress } = useScroll({
    container: scrollRef,
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '10%']);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [project.id]);

  useEffect(() => {
    const prevEl = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    return () => prevEl?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && next) onNavigate(next.id);
      else if (e.key === 'ArrowLeft' && prev) onNavigate(prev.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate, next, prev]);

  const extra = project as Project & Extra;
  const stack = groupStack(project.tags);

  const meta = (
    [
      ['Client', extra.client],
      ['Category', project.category],
      ['Timeline', extra.timeline ?? project.year],
      ['Role', project.role],
      ['Type', project.type],
      ['Status', project.status],
    ] as [string, string | number | undefined][]
  ).filter(([, v]) => v !== undefined && v !== '');

  // Related: the two projects that follow this one (wraps around).
  const at = projects.findIndex((p) => p.id === project.id);
  const related = projects
    .filter((p) => p.id !== project.id)
    .map((p, i, arr) => arr[(i + Math.max(at, 0)) % arr.length])
    .slice(0, 2);

  const hasResults = !!extra.results?.length;
  const hasGallery = !!extra.gallery?.length;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-0 z-[90] bg-bg text-fg"
    >
      {/* Reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 z-40 h-[2px] origin-left bg-accent"
      />

      <div
        ref={scrollRef}
        data-lenis-prevent="true"
        className="absolute inset-0 overflow-y-auto overscroll-contain"
      >
        <RootCtx.Provider value={scrollRef}>
          {/* ------------------------------ Header ------------------------------ */}
          <header className="sticky top-0 z-30 border-b border-fg/10 bg-bg/75 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="hover-target group flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted transition hover:text-fg"
              >
                <ArrowLeft
                  size={14}
                  className="transition group-hover:-translate-x-0.5"
                />
                <span className="hidden sm:inline">All works</span>
              </button>

              <div
                aria-hidden={!stuck}
                className={`pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 transition duration-300 md:flex ${
                  stuck ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                }`}
              >
                <span className="text-xs tabular-nums text-muted">
                  {pad(index + 1)} / {pad(total)}
                </span>
                <span className="font-display text-sm font-semibold tracking-tight">
                  {project.title}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!prev}
                  onClick={() => prev && onNavigate(prev.id)}
                  className="hover-target flex h-9 w-9 items-center justify-center rounded-full text-fg/60 transition hover:bg-fg/5 hover:text-fg disabled:opacity-25"
                  aria-label="Previous project"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  disabled={!next}
                  onClick={() => next && onNavigate(next.id)}
                  className="hover-target flex h-9 w-9 items-center justify-center rounded-full text-fg/60 transition hover:bg-fg/5 hover:text-fg disabled:opacity-25"
                  aria-label="Next project"
                >
                  <ArrowRight size={15} />
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="hover-target group ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-fg/5 text-fg transition hover:bg-fg hover:text-bg"
                  aria-label="Close"
                >
                  <X size={15} className="transition group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </header>

          <motion.main
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* ------------------------------- Intro ------------------------------ */}
            <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-12">
              <nav
                aria-label="Breadcrumb"
                className="mb-8 flex items-center gap-2 text-xs text-muted sm:mb-12"
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="hover-target transition hover:text-fg"
                >
                  Case Studies
                </button>
                <span aria-hidden>/</span>
                <span className="truncate rounded-sm bg-fg/5 px-2 py-1 text-fg">
                  {project.title}
                </span>
              </nav>

              <div className="grid gap-8 md:grid-cols-12 md:items-end">
                <div className="md:col-span-8">
                  <h1 className="font-display text-[clamp(2.25rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-tighter">
                    <span className="block overflow-hidden pb-1">
                      <motion.span
                        className="block"
                        initial={{ y: reduced ? 0 : '105%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
                      >
                        {project.title}
                      </motion.span>
                    </span>
                  </h1>

                  <motion.p
                    className="mt-5 max-w-xl text-base leading-7 text-fg/60 sm:text-lg"
                    initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                  >
                    {project.tagline}
                  </motion.p>
                </div>

                <motion.div
                  className="flex flex-col gap-5 md:col-span-4 md:items-end"
                  initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
                >
                  <ul className="flex flex-wrap gap-2 md:justify-end">
                    {project.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-sm bg-fg/5 px-3 py-1.5 text-[11px] font-medium text-muted"
                      >
                        {tagLabel(t)}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-target inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-bg transition hover:bg-accent"
                    >
                      Live site <ArrowUpRight size={14} />
                    </a>
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-target inline-flex items-center gap-2 rounded-full border border-fg/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-fg transition hover:border-fg"
                      >
                        <Github size={14} /> Code
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* -------------------------------- Hero ------------------------------ */}
            <div className="mx-auto mt-10 max-w-7xl px-5 sm:mt-14 sm:px-8">
              <motion.div
                ref={heroRef}
                className="relative aspect-[16/10] overflow-hidden bg-fg/5 sm:aspect-[2/1]"
                initial={{
                  clipPath: reduced ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
                }}
                animate={{ clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 1.2, ease: CURTAIN_EASE, delay: 0.15 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ y: reduced ? 0 : heroY, scale: reduced ? 1 : 1.1 }}
                >
                  <Image
                    src={project.image}
                    alt={`${project.title} preview`}
                    fill
                    priority
                    sizes="(min-width:1280px) 1216px, 100vw"
                    className="object-cover object-top"
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* -------------------------------- Body ------------------------------ */}
            <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-12 lg:gap-16">
              {/* Meta sidebar */}
              <aside className="lg:col-span-3">
                <div className="lg:sticky lg:top-24">
                  <Reveal>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-1">
                      {meta.map(([k, v]) => (
                        <div key={k} className="border-t border-fg/10 pt-3">
                          <dt className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                            {k}
                          </dt>
                          <dd className="text-sm font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                </div>
              </aside>

              {/* Content */}
              <div className="space-y-16 sm:space-y-20 lg:col-span-9">
                <Section title="About The Project">
                  <p className="text-lg leading-8 text-fg/80 sm:text-xl sm:leading-9">
                    {project.overview}
                  </p>
                </Section>

                {hasGallery && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-5">
                    {extra.gallery!.map((src, i) => (
                      <ClipReveal
                        key={src}
                        delay={(i % 2) * 0.08}
                        className={
                          i % 3 === 0
                            ? 'col-span-2 aspect-[16/9]'
                            : 'aspect-[4/5] sm:aspect-[4/3]'
                        }
                      >
                        <Image
                          src={src}
                          alt={`${project.title} — screen ${i + 1}`}
                          fill
                          sizes="(min-width:1024px) 60vw, 100vw"
                          className="object-cover object-top"
                        />
                      </ClipReveal>
                    ))}
                  </div>
                )}

                <div className="grid gap-12 md:grid-cols-2 md:gap-14">
                  <Section title="The Problem">
                    <p className={bodyText}>{project.problem}</p>
                  </Section>
                  <Section title="My Solution">
                    <p className={bodyText}>{project.solution}</p>
                  </Section>
                </div>

                {/* Features */}
                <section>
                  <Reveal>
                    <h2 className="mb-8 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                      Key Features
                    </h2>
                  </Reveal>
                  <div className="grid gap-x-12 gap-y-9 sm:grid-cols-2">
                    {project.features.map((f, i) => (
                      <Reveal key={f.title} delay={(i % 2) * 0.06}>
                        <div className="border-t border-fg/10 pt-5">
                          <span className="mb-3 block text-xs tabular-nums text-accent">
                            {pad(i + 1)}
                          </span>
                          <h3 className="mb-1.5 font-display text-lg font-medium tracking-tight">
                            {f.title}
                          </h3>
                          <p className="text-sm leading-6 text-fg/55">{f.desc}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </section>

                {/* Challenges */}
                {project.challenges && project.challenges.length > 0 && (
                  <section>
                    <Reveal>
                      <h2 className="mb-8 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                        Challenges &amp; Approach
                      </h2>
                    </Reveal>
                    <div>
                      {project.challenges.map((c) => (
                        <Reveal key={c.challenge}>
                          <div className="grid gap-4 border-t border-fg/10 py-6 md:grid-cols-2 md:gap-10">
                            <div>
                              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                                Challenge
                              </p>
                              <p className="text-[15px] leading-7 text-fg/80">
                                {c.challenge}
                              </p>
                            </div>
                            <div>
                              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                                Approach
                              </p>
                              <p className="text-[15px] leading-7 text-fg/60">
                                {c.solution}
                              </p>
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </section>
                )}

                {/* Results */}
                {hasResults && (
                  <section>
                    <Reveal>
                      <h2 className="mb-8 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                        Results &amp; Outcomes
                      </h2>
                    </Reveal>
                    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
                      {extra.results!.map((r, i) => (
                        <Reveal key={r.label} delay={i * 0.08}>
                          <div className="border-t border-fg/10 pt-5">
                            <p className="font-display text-5xl font-medium tracking-tighter text-accent sm:text-6xl">
                              <CountUp value={r.value} suffix={r.suffix ?? '%'} />
                            </p>
                            <p className="mt-3 text-sm font-medium">{r.label}</p>
                            {r.desc && (
                              <p className="mt-1.5 text-sm leading-6 text-fg/55">
                                {r.desc}
                              </p>
                            )}
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </section>
                )}

                {/* Tech stack */}
                <section>
                  <Reveal>
                    <h2 className="mb-8 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                      Tech Stack
                    </h2>
                  </Reveal>
                  <div>
                    {stack.map(({ group, items }) => (
                      <Reveal key={group}>
                        <div className="grid gap-3 border-t border-fg/10 py-5 sm:grid-cols-[10rem_1fr]">
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                            {group}
                          </p>
                          <ul className="flex flex-wrap gap-2">
                            {items.map((t) => (
                              <li
                                key={t}
                                className="rounded-sm bg-fg/5 px-3 py-1.5 text-xs font-medium"
                              >
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* ---------------------------- Related projects ---------------------------- */}
            {related.length > 0 && (
              <section className="border-t border-fg/10">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
                  <Reveal>
                    <div className="mb-10 flex items-end justify-between gap-6">
                      <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
                        Related Projects
                      </h2>
                      {next && (
                        <button
                          type="button"
                          onClick={() => onNavigate(next.id)}
                          className="hover-target group hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted transition hover:text-fg sm:flex"
                        >
                          Next project
                          <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </button>
                      )}
                    </div>
                  </Reveal>

                  <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:gap-x-12">
                    {related.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onNavigate(p.id)}
                        aria-label={`Open ${p.title} case study`}
                        className="hover-target group block text-left"
                      >
                        <ClipReveal className="aspect-[16/10]" delay={i * 0.1}>
                          <Image
                            src={p.image}
                            alt={`${p.title} preview`}
                            fill
                            sizes="(min-width:640px) 50vw, 100vw"
                            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        </ClipReveal>
                        <div className="mt-4 flex flex-col gap-3">
                          <h3 className="max-w-[22ch] font-display text-2xl font-medium leading-tight tracking-tight transition group-hover:text-accent sm:text-3xl">
                            {p.title}
                          </h3>
                          <ul className="flex flex-wrap gap-2">
                            {(
                              (p as { tags?: string[] }).tags?.length
                                ? (p as { tags: string[] }).tags
                                : [p.category]
                            ).map((t) => (
                              <li
                                key={t}
                                className="rounded-sm bg-fg/5 px-3 py-1.5 text-[11px] font-medium text-muted"
                              >
                                {tagLabel(t)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {footer}
          </motion.main>
        </RootCtx.Provider>
      </div>
    </motion.div>
  );
}