'use client';
/**
 * Project details that appear on the wall next to the frame you walked up to.
 * Desktop: sits on the right half. Mobile: a bottom sheet you can drag down to leave.
 * Loaded lazily — nothing here ships until a frame is opened.
 */
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { ArrowUpRight, Plus } from 'lucide-react';
import type { Project } from './Projectsdata';

const pad = (n: number) => String(n).padStart(2, '0');
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Props {
  projects: Project[];
  index: number;
  onSelect: (i: number) => void;
  onCase: () => void;
  onClose: () => void;
}

export default function GalleryDetail({ projects, index, onSelect, onCase, onClose }: Props) {
  const p = projects[index];
  const sheet = useRef<HTMLElement>(null);
  const drag = useRef({ on: false, y: 0, dy: 0 });

  // swipe the sheet down to leave (mobile) — only from the handle, so the content can still scroll
  const down = (e: React.PointerEvent) => {
    drag.current = { on: true, y: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (sheet.current) sheet.current.style.transition = 'none';
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current.on || !sheet.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    drag.current.dy = dy;
    sheet.current.style.transform = `translate3d(0, ${dy}px, 0)`;
  };
  const up = () => {
    if (!drag.current.on || !sheet.current) return;
    drag.current.on = false;
    sheet.current.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
    if (drag.current.dy > 90) onClose();
    else sheet.current.style.transform = '';
  };

  const rows: { name: string; body: React.ReactNode }[] = [
    { name: 'overview', body: <p>{p.overview}</p> },
    { name: 'problem', body: <p>{p.problem}</p> },
    { name: 'solution', body: <p>{p.solution}</p> },
    {
      name: 'features',
      body: (
        <ul className="space-y-3">
          {p.features.map((f) => (
            <li key={f.title}>
              <span className="text-fg">{f.title}.</span> {f.desc}
            </li>
          ))}
        </ul>
      ),
    },
  ];
  if (p.challenges?.length) {
    rows.push({
      name: 'challenges',
      body: (
        <ul className="space-y-3">
          {p.challenges.map((c) => (
            <li key={c.challenge}>
              <span className="text-fg">{c.challenge}</span> {c.solution}
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <motion.aside
      ref={sheet}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, delay: 0.5 }}
      data-lenis-prevent
      className="absolute inset-x-0 bottom-0 z-20 flex h-[60%] flex-col rounded-t-2xl border-t border-border bg-bg md:inset-y-0 md:left-[50%] md:right-0 md:h-auto md:rounded-none md:border-0 md:bg-transparent"
    >
      {/* grab handle (mobile) */}
      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 md:hidden"
        aria-label="Drag down to close"
      >
        <span className="h-1 w-10 rounded-full bg-border" />
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-32 pt-2 md:pb-36 md:pl-6 md:pr-12 md:pt-24"
        style={{ overscrollBehavior: 'contain' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="max-w-xl"
          >
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {pad(index + 1)} / {pad(projects.length)} {"//"} {p.year}
              <span className="ml-3 text-muted">{p.status}</span>
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tighter text-fg md:text-6xl">
              {p.title}
            </h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">{p.category}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-fg/80">{p.description}</p>

            <dl className="mt-6 grid grid-cols-[5rem_1fr] gap-y-2 border-y border-border py-4 font-mono text-xs uppercase tracking-wider">
              <dt className="text-muted">role</dt>
              <dd className="text-fg">{p.role}</dd>
              <dt className="text-muted">type</dt>
              <dd className="text-fg">{p.type}</dd>
              <dt className="text-muted">stack</dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1 text-accent">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </dd>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="hover-target inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-opacity active:opacity-70 sm:flex-none"
              >
                live site <ArrowUpRight size={14} />
              </a>
              <a
                href={p.github}
                target="_blank"
                rel="noreferrer"
                className="hover-target inline-flex min-h-11 items-center justify-center border border-border px-5 py-3 font-mono text-xs uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent"
              >
                source
              </a>
              <button
                type="button"
                onClick={onCase}
                className="hover-target inline-flex min-h-11 items-center justify-center border border-border px-5 py-3 font-mono text-xs uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent"
              >
                case study
              </button>
            </div>

            <Accordion rows={rows} />

            <div className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted">other work</div>
            <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" data-lenis-prevent>
              {projects.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => i !== index && onSelect(i)}
                  aria-label={q.title}
                  aria-current={i === index}
                  className={`relative h-14 w-24 shrink-0 overflow-hidden border transition-colors duration-200 ${i === index ? 'border-accent' : 'border-border opacity-60 hover:opacity-100'}`}
                >
                  <Image src={q.image} alt="" fill sizes="96px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

function Accordion({ rows }: { rows: { name: string; body: React.ReactNode }[] }) {
  const [open, setOpen] = useState<string | null>('overview');
  return (
    <div className="mt-6 border-t border-border">
      {rows.map((r) => {
        const isOpen = open === r.name;
        return (
          <div key={r.name} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : r.name)}
              aria-expanded={isOpen}
              className="flex min-h-12 w-full items-center justify-between text-left font-mono text-xs uppercase tracking-widest text-fg"
            >
              <span>
                <span className="mr-2 text-accent">{isOpen ? '−' : '+'}</span>
                {r.name}
              </span>
              <Plus size={13} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="pb-5 text-sm leading-relaxed text-muted">{r.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
