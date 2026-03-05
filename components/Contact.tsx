"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative h-[80vh] sm:h-screen bg-accent text-bg overflow-hidden flex flex-col justify-between"
    >
      <motion.div
        style={{ y, opacity }}
        className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 text-center"
      >
        <h2 className="font-display text-[14vw] sm:text-[12vw] leading-[0.8] tracking-tighter uppercase font-bold mb-6 sm:mb-8">
          Let&apos;s Build <br />
          <span
            className="italic text-outline"
            style={{ WebkitTextStroke: "2px var(--color-bg)" }}
          >
            Together
          </span>
        </h2>

        <p className="max-w-md mx-auto mb-8 sm:mb-10 text-bg/80 font-medium text-sm sm:text-base px-4">
          I respond within 24 hours. Always. If you&apos;re building something
          and need someone who ships — let&apos;s talk.
        </p>

        {/* Email — mailto on click, tooltip on hover */}
        <a
          href="mailto:aananmunna420@gmail.com"
          title="Click to send me an email"
          className="hover-target group relative text-xl sm:text-3xl font-medium border-b-2 border-bg pb-2 hover:opacity-70 transition-opacity"
        >
          aananmunna420@gmail.com
          {/* Tooltip */}
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-bg text-accent text-xs font-mono px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Click to email →
          </span>
        </a>

        <p className="mt-5 text-bg/50 font-mono text-xs uppercase tracking-widest">
          — or find me on LinkedIn &amp; GitHub
        </p>
      </motion.div>

      <div className="p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-0 font-mono text-[10px] sm:text-xs uppercase tracking-widest border-t border-bg/20">
        <div className="flex gap-6 sm:gap-8">
          <a
            href="https://x.com/aanan_munna"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-target hover:underline"
          >
            Twitter
          </a>
          <a
            href="https://www.linkedin.com/in/aanan-munna/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-target hover:underline"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/AananMunna"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-target hover:underline"
          >
            GitHub
          </a>
        </div>
        <div className="text-center sm:text-right">
          <p>© 2026 Aanan Munna</p>
          <p>All Rights Reserved</p>
        </div>
      </div>
    </section>
  );
}
