"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { posts } from "@/lib/blogData";

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
            Things I&apos;ve <br />
            <span className="italic text-accent">Written</span>
          </h2>
        </div>

        <div className="md:col-span-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="hover-target group block border-b border-white/10 py-8 first:pt-0"
              >
                <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">
                  {post.tags.join(" · ")} — {post.date}
                </p>
                <h3 className="font-display text-2xl font-bold tracking-tight text-fg transition-colors group-hover:text-accent sm:text-3xl">
                  {post.title}
                </h3>
                <p className="mt-3 max-w-2xl text-fg/60">{post.excerpt}</p>
              </Link>
            </motion.div>
          ))}

          <Link
            href="/blog"
            className="hover-target mt-8 inline-block font-mono text-xs uppercase tracking-widest text-accent hover:opacity-80"
          >
            All posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
