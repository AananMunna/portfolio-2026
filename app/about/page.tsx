import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { projects, projectSlug } from '@/components/Projectsdata';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Aanan Munna is a full-stack developer from Kushtia, Bangladesh. Self-taught, shipping real projects with Next.js, Node and Postgres.',
};

const RESUME = 'https://drive.google.com/file/d/17lmURlHIjW8VCMQNHw-ddDGYOg_t6iGM/view';

const facts: [string, string][] = [
  ['Right now', 'Open to remote full-stack and frontend roles'],
  ['Last job', 'Frontend Developer at Al Jaami Technologies (Jul 2025 – Apr 2026)'],
  ['Worked on', 'Eqrah, a multi-tenant school management SaaS'],
  ['Daily tools', 'Next.js, React, Node, Postgres, MongoDB'],
  ['How I learned', 'By shipping, not from a CS degree'],
];

const habits = [
  ['Ask what can break first.', 'Bad data, two people clicking at once, a payment that only half works.'],
  ['Write boring code.', 'Easy to change beats clever and hard to explain.'],
  ['Say it early.', 'If something is taking longer than I thought, you hear it from me that day.'],
];

export default function AboutPage() {
  return (
    <main className="relative bg-bg">
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          <div className="order-2 md:order-1 md:col-span-7">
            <p className="eyebrow">About</p>
            <h1 className="mt-4 text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              Hi, I&apos;m <span className="text-accent">Aanan.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug tracking-tight text-fg/80">
              I build web apps, mostly the frontend, but I&apos;ll happily follow a bug all the way down to the database.
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-[15px] text-muted">
              <MapPin size={15} /> 24, from Kushtia, Bangladesh
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="hover-target btn-primary">
                Say hello
              </Link>
              <a href={RESUME} target="_blank" rel="noopener noreferrer" className="hover-target btn-ghost">
                Resume <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[340px] md:order-2 md:col-span-5 md:max-w-none">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border hairline bg-[var(--phosphorA)]">
                <Image
                  src="/images/aanan.webp"
                  alt="Aanan Munna"
                  fill
                  priority
                  sizes="(max-width: 768px) 340px, 40vw"
                  className="object-cover object-top"
                />
              </div>
              <span className="absolute -bottom-4 -left-3 -rotate-3 rounded-lg border hairline bg-bg px-3.5 py-2 text-[13px] font-medium shadow-sm sm:-left-5">
                Next.js · Node · Postgres
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Short version */}
      <section className="border-t hairline">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-12 md:gap-16">
          <h2 className="eyebrow md:col-span-4">The short version</h2>
          <dl className="md:col-span-8">
            {facts.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b hairline py-4 first:pt-0 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="text-[14px] text-muted">{k}</dt>
                <dd className="text-[17px] font-medium leading-snug tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How I work */}
      <section className="border-t hairline">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-12 md:gap-16">
          <h2 className="eyebrow md:col-span-4">How I work</h2>
          <ol className="space-y-9 md:col-span-8">
            {habits.map(([title, body], i) => (
              <li key={title} className="flex gap-5">
                <span className="pt-1.5 font-mono text-xs text-muted">0{i + 1}</span>
                <div>
                  <p className="text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-tight tracking-tight">{title}</p>
                  <p className="mt-1.5 max-w-md text-[16px] leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Things I've built */}
      <section className="border-t hairline">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-12 md:gap-16">
          <h2 className="eyebrow md:col-span-4">Things I&apos;ve built</h2>
          <ul className="md:col-span-8">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${projectSlug(p)}`}
                  className="hover-target group flex items-baseline justify-between gap-4 border-b hairline py-4 first:pt-0"
                >
                  <span className="text-[clamp(1.3rem,2.8vw,1.8rem)] font-semibold tracking-tight transition-colors group-hover:text-accent">
                    {p.title}
                  </span>
                  <span className="flex items-center gap-2 text-[14px] text-muted">
                    {p.category}
                    <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t hairline">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center sm:px-8 sm:py-20">
          <p className="max-w-md text-[clamp(1.6rem,3.6vw,2.4rem)] font-semibold leading-tight tracking-tight">
            Got something to build? <span className="text-accent">Let&apos;s talk.</span>
          </p>
          <Link href="/contact" className="hover-target btn-primary !px-7 !py-3.5">
            Get in touch →
          </Link>
        </div>
      </section>
    </main>
  );
}
