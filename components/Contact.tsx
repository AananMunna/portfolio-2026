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
            style={{ WebkitTextStroke: "1px var(--color-bg)" }}
          >
            Together
          </span>
        </h2>

        <p className="max-w-md mx-auto mb-8 sm:mb-10 text-bg/80 font-medium text-sm sm:text-base px-4">
          My inbox is always open. Whether you are hiring for a role, have a
          question, or just want to say hi, I&apos;ll try my best to get back to
          you!
        </p>

        <a
          href="mailto:aananmunna420@gmail.com"
          className="hover-target text-xl sm:text-3xl font-medium border-b-2 border-bg pb-2 hover:opacity-70 transition-opacity"
        >
          aananmunna420@gmail.com
        </a>
      </motion.div>

      <div className="p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-0 font-mono text-[10px] sm:text-xs uppercase tracking-widest border-t border-bg/20">
        <div className="flex gap-6 sm:gap-8">
          <a href="#" className="hover-target hover:underline">
            Twitter
          </a>
          <a href="#" className="hover-target hover:underline">
            LinkedIn
          </a>
          <a href="#" className="hover-target hover:underline">
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
