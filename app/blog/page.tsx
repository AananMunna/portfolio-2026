import type { Metadata } from "next";
import Link from "next/link";
import { posts, readingTime } from "@/lib/blogData";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on problems I ran into while building real projects.",
};

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-32 pt-32 sm:pt-40">
      <h1 className="font-display text-5xl font-bold tracking-tighter sm:text-6xl">Blog</h1>
      <p className="mt-4 max-w-xl text-lg text-fg/60">
        Notes on problems I ran into while building real projects, and what I did about them.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="hover-target group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-accent/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt=""
              className="aspect-[1200/630] w-full border-b border-white/10 object-cover"
            />
            <div className="flex flex-1 flex-col p-5">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">
                {post.tags.join(" · ")}
              </p>
              <h2 className="font-display text-xl font-bold leading-snug text-fg transition-colors group-hover:text-accent">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-fg/60">{post.excerpt}</p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted">
                {post.date} · {readingTime(post)} min read
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
