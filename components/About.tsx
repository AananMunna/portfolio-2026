'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const text =
  "I'm Aanan, 24, from Kushtia. I build web apps for a living. I didn't come through a CS degree. I learned by shipping things and fixing what broke.";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 50%'],
  });

  const words = text.split(' ');

  return (
    <section
      className="py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg"
      id="about"
      ref={containerRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
        {/* Left column */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tighter">
            Who <br />
            <span className="text-accent italic">I am</span>
          </h2>

          <div className="hidden md:block mt-16">
            <div className="w-16 h-[1px] bg-accent mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Based in
              <br />
              <span className="text-fg">Kushtia, Bangladesh</span>
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-8">
          {/* Scroll-reveal statement */}
          <p className="text-2xl sm:text-4xl md:text-5xl leading-tight font-medium flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-2">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;

              // eslint-disable-next-line react-hooks/rules-of-hooks
              const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const color = useTransform(
                scrollYProgress,
                [start, end],
                ['var(--text2)', 'var(--text)']
              );

              return (
                <motion.span key={i} style={{ opacity, color }}>
                  {word}
                </motion.span>
              );
            })}
          </p>

          {/* Two columns */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-white/10 pb-4">
                HOW I WORK
              </h3>
              <p className="text-fg/70 leading-relaxed text-lg">
                I start by asking what can go wrong: bad data, two people clicking at once, a payment that only half works. Then I build the normal path. I'd rather write boring code that's easy to change than something clever I have to explain later.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-white/10 pb-4">
                WHAT YOU GET
              </h3>
              <p className="text-fg/70 leading-relaxed text-lg">
                Someone who owns a feature from the database to the UI. I ask questions early, tell you when something is taking longer than I thought, and I don't disappear after the first commit.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}