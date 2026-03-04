'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const text = "Hello, I'm Aanan. Thank you for taking the time to visit. I know as a hiring manager, your time is valuable, so I'll keep this simple: I build web experiences that make your company look good and your users feel great.";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  const words = text.split(" ");

  return (
    <section className="py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg" id="about" ref={containerRef}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
        <div className="md:col-span-4 flex flex-col justify-between">
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tighter">
            Make Yourself <br />
            <span className="text-accent italic">At Home</span>
          </h2>
          
          <div className="hidden md:block mt-16">
            <div className="w-16 h-[1px] bg-accent mb-4"></div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Based in<br />
              <span className="text-fg">Dhaka, Bangladesh</span>
            </p>
          </div>
        </div>

        <div className="md:col-span-8">
          <p className="text-2xl sm:text-4xl md:text-5xl leading-tight font-medium flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-2">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + (1 / words.length);
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const color = useTransform(scrollYProgress, [start, end], ['var(--text2)', 'var(--text)']);
              
              const isHighlight = word.includes('experiences') || word.includes('good') || word.includes('great.');
              
              return (
                <motion.span 
                  key={i} 
                  style={{ opacity, color: isHighlight ? 'var(--phosphor)' : color }}
                  className={isHighlight ? 'text-accent' : ''}
                >
                  {word}
                </motion.span>
              );
            })}
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-white/10 pb-4">The Value I Bring</h3>
              <p className="text-muted leading-relaxed text-lg">
                Beyond writing clean, maintainable code, I pride myself on being a collaborative team player. I bridge the gap between design and engineering, ensuring that the final product is not just functional, but a joy to use.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-white/10 pb-4">Why Hire Me?</h3>
              <p className="text-muted leading-relaxed text-lg">
                When you hire me, you&apos;re getting someone who takes ownership, communicates proactively, and is deeply invested in your company&apos;s success. I don&apos;t just complete tickets; I solve problems.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
