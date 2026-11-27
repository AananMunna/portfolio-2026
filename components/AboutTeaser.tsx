import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/** Short intro on the home page. The full story lives at /about. */
export default function AboutTeaser() {
  return (
    <section id="about-preview" className="relative z-20 bg-bg">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-[1.75rem] border hairline bg-[var(--phosphorA)] md:max-w-none">
            <Image
              src="/images/aanan.webp"
              alt="Aanan Munna"
              fill
              sizes="(max-width: 768px) 300px, 33vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="md:col-span-8">
          <p className="eyebrow">About</p>
          <h2 className="mt-3 text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
            I&apos;m Aanan, 24, from Kushtia.
            <span className="text-muted"> I build web apps and learn by shipping them.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-fg/70">
            No CS degree. I got good by building real things, breaking them, and fixing them.
          </p>
          <Link href="/about" className="hover-target btn-ghost mt-8">
            More about me <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
