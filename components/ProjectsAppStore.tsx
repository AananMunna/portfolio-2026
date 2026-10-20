'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { projects } from './Projectsdata';

interface Props {
  onOpen: (id: number) => void;
}

/**
 * Staggered 3-step rhythm (repeats):
 *  0 → wide card, left
 *  1 → narrower card, right (top-aligned with the wide one)
 *  2 → wide card, centered on its own row
 */
const getCardLayout = (index: number) => {
  switch (index % 3) {
    case 0:
      return 'md:col-span-7';
    case 1:
      return 'md:col-span-5 md:self-start';
    default:
      return 'md:col-span-7 md:col-start-3';
  }
};

const getImageRatio = (index: number) =>
  index % 3 === 1 ? 'aspect-[16/10]' : 'aspect-[7/5]';

/**
 * Curtain reveal.
 * A single curtain covers the image. When the card scrolls into view,
 * it slides down from the top and away past the bottom edge, revealing
 * the image.
 */
function EyeReveal({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setOpen(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          observer.disconnect(); // play once
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Image layer – eases from slightly zoomed to normal as the curtain drops */}
      <div
        className={`absolute inset-0 transition-transform duration-[1800ms] ease-out motion-reduce:transition-none ${
          open ? 'scale-100' : 'scale-110'
        }`}
      >
        {children}
      </div>

      {/* Curtain: covers the image, then slides down and away */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 bg-fg transition-transform duration-[1300ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform motion-reduce:hidden ${
          open ? 'translate-y-full' : 'translate-y-0'
        }`}
      />
    </div>
  );
}

export default function ProjectsAppStore({ onOpen }: Props) {
  if (!projects.length) return null;

  return (
    <section
      id="work"
      aria-labelledby="projects-heading"
      className="bg-bg py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section header */}
        <header className="mb-12 border-b border-fg/10 pb-8 sm:mb-16 sm:pb-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
                Portfolio
              </p>

              <h2
                id="projects-heading"
                className="font-display text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl"
              >
                Selected <span className="text-accent">Works</span>
              </h2>
            </div>

            <div className="flex flex-col gap-5 md:col-span-5 md:pb-1">
              <p className="max-w-md text-sm leading-6 text-muted sm:text-base sm:leading-7">
                A curated selection of my recent work, showcasing clear
                thinking, practical problem-solving, and visually balanced
                digital experiences made with close attention to detail.
              </p>

              <p className="text-xs font-medium tabular-nums uppercase tracking-[0.14em] text-muted">
                {String(projects.length).padStart(2, '0')} Projects
              </p>
            </div>
          </div>
        </header>

        {/* Staggered grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-12 md:gap-y-16 lg:gap-x-12">
          {projects.map((project, index) => {
            // Optional `tags` field on a project; falls back to its category.
            const rawTags = (project as { tags?: string[] }).tags;
            const tags =
              Array.isArray(rawTags) && rawTags.length
                ? rawTags
                : [project.category];

            const isNarrow = index % 3 === 1;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpen(project.id)}
                aria-label={`Explore ${project.title} case study`}
                className={`group block min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 ${getCardLayout(
                  index
                )}`}
              >
                {/* Image with curtain reveal */}
                <EyeReveal className={`w-full bg-[#e9e9e9] ${getImageRatio(index)}`}>
                  <Image
                    src={project.image}
                    alt={`${project.title} project preview`}
                    fill
                    priority={index < 2}
                    sizes={
                      isNarrow
                        ? '(max-width: 768px) 100vw, 40vw'
                        : '(max-width: 768px) 100vw, 58vw'
                    }
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </EyeReveal>

                {/* Caption: title + tags */}
                <div
                  className={`mt-4 flex gap-3 ${
                    isNarrow
                      ? 'flex-col'
                      : 'flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-6'
                  }`}
                >
                  <h3 className="max-w-[16ch] font-display text-2xl font-medium leading-tight tracking-tight text-fg sm:max-w-[20ch] sm:text-3xl md:max-w-[18ch] lg:max-w-[22ch]">
                    {project.title}
                  </h3>

                  <ul
                    className={`flex flex-wrap gap-2 ${
                      isNarrow ? '' : 'sm:max-w-[45%] sm:justify-start sm:pt-1'
                    }`}
                  >
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-sm bg-fg/5 px-3 py-1.5 text-[11px] font-medium text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}