"use client";

import { motion } from "motion/react";

export interface BlogPost {
  title: string;
  href: string;
  tags: string[];
  date: string; // e.g. "Nov 12, 2026"
}

/**
 * Add your real articles here. While this list is empty the whole Blog
 * section stays hidden, so nothing placeholder is ever shown.
 */
export const posts: BlogPost[] = [];

export default function Blog() {
  if (posts.length === 0) return null;

  return (
    <section
      id="blog"
      className="relative z-20 mx-auto max-w-7xl bg-bg px-4 py-24 sm:px-8"
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
        <div className="md:col-span-4">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tighter sm:text-6xl md:sticky md:top-32">
            Featured <br />
            <span className="italic text-accent">Articles</span>
          </h2>
        </div>

        <div className="md:col-span-8">
          {posts.map((post, i) => (
            <motion.a
              key={post.href}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="hover-target group block border-b border-white/10 py-8 first:pt-0"
            >
              <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">
                {post.tags.join(" · ")} — {post.date}
              </p>
              <h3 className="font-display text-2xl font-bold tracking-tight text-fg transition-colors group-hover:text-accent sm:text-3xl">
                {post.title}
              </h3>
              <span className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-accent">
                Read article →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
