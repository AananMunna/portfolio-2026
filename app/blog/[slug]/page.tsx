import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/blogData";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} | Aanan Munna`, description: post.excerpt };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pb-32 pt-10">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-widest text-muted">
        {post.tags.join(" · ")} — {post.date}
      </p>
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        {post.title}
      </h1>

      <div className="mt-12 space-y-6">
        {post.content.map((block, i) => {
          if (block.type === "h")
            return (
              <h2 key={i} className="pt-6 font-display text-2xl font-bold text-fg">
                {block.text}
              </h2>
            );
          if (block.type === "code")
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl border border-white/10 bg-surface p-5 font-mono text-sm leading-relaxed text-fg/85"
              >
                <code>{block.text}</code>
              </pre>
            );
          return (
            <p key={i} className="text-lg leading-relaxed text-fg/75">
              {block.text}
            </p>
          );
        })}
      </div>

      <div className="mt-16 border-t border-white/10 pt-8">
        <Link
          href="/blog"
          className="hover-target font-mono text-xs uppercase tracking-widest text-accent hover:opacity-80"
        >
          ← All posts
        </Link>
      </div>
    </article>
  );
}
