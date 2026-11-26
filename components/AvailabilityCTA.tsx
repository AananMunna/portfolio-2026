"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function AvailabilityCTA() {
  return (
    <section className="relative z-20 border-y border-white/10 bg-bg px-4 py-24 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"
      >
        <div>
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Open to remote work
          </p>
          <h2 className="font-display text-4xl font-bold uppercase leading-[0.9] tracking-tighter sm:text-6xl">
            Got something <span className="italic text-accent">to build?</span>
          </h2>
        </div>

        <Link href="/contact" className="hover-target btn-primary shrink-0 !px-8 !py-4">
          Get in touch →
        </Link>
      </motion.div>
    </section>
  );
}
