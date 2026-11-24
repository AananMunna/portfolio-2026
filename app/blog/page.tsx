import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blogData";

export const metadata: Metadata = {
  title: "Blog | Aanan Munna",
  description: "Notes on problems I ran into while building real projects.",
};

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-32 pt-10">
      <h1 className="font-display text-5xl font-bold uppercase tracking-tighter sm:text-7xl">
        Blog
      </h1>
      <p className="mt-5 max-w-xl text-fg/60">
        Notes on problems I ran into while building real projects, and what I did about them.
      </p>

      <div className="mt-14">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="hover-target group block border-b border-white/10 py-8"
          >
            <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">
              {post.tags.join(" · ")} — {post.date}
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-fg transition-colors group-hover:text-accent sm:text-3xl">
              {post.title}
            </h2>
            <p className="mt-3 text-fg/60">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
