import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CodeBlock from "@/components/blog/CodeBlock";
import Toc from "@/components/blog/Toc";
import { getAdjacent, getPost, posts, readingTime, slugify } from "@/lib/blogData";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.cover] },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacent(slug);
  const toc = post.content
    .filter((b) => b.type === "h2")
    .map((b) => ({ id: slugify((b as { text: string }).text), text: (b as { text: string }).text }));

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 pb-32 pt-28 lg:grid-cols-[220px_minmax(0,1fr)_200px]">
      {/* Left: all posts */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">Blog</p>
          <ul className="space-y-1">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className={`hover-target block rounded-md px-3 py-2 text-sm leading-snug transition-colors ${
                    p.slug === slug
                      ? "bg-accent/10 text-accent"
                      : "text-fg/60 hover:bg-white/5 hover:text-fg"
                  }`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Center: article */}
      <article className="min-w-0 max-w-3xl">
        <nav className="mb-6 font-mono text-xs text-muted">
          <Link href="/blog" className="hover-target hover:text-accent">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-fg/60">{post.tags[0]}</span>
        </nav>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
          {post.date} · {readingTime(post)} min read
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-fg/60"
            >
              {t}
            </span>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover}
          alt={post.title}
          className="mt-8 w-full rounded-2xl border border-white/10"
        />

        <div className="mt-10 space-y-6">
          {post.content.map((block, i) => {
            switch (block.type) {
              case "h2":
                return (
                  <h2
                    key={i}
                    id={slugify(block.text)}
                    className="scroll-mt-24 border-b border-white/10 pb-2 pt-8 font-display text-2xl font-bold text-fg"
                  >
                    {block.text}
                  </h2>
                );
              case "h3":
                return (
                  <h3 key={i} className="pt-4 font-display text-xl font-semibold text-fg">
                    {block.text}
                  </h3>
                );
              case "ul":
                return (
                  <ul key={i} className="list-disc space-y-2 pl-6 text-lg leading-relaxed text-fg/75 marker:text-accent">
                    {block.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                );
              case "callout":
                return (
                  <div
                    key={i}
                    className={`rounded-xl border-l-4 p-5 text-base leading-relaxed ${
                      block.kind === "warning"
                        ? "border-(color:--amber) bg-(color:--amberA) text-fg/85"
                        : "border-accent bg-accent/10 text-fg/85"
                    }`}
                  >
                    <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-widest">
                      {block.kind === "warning" ? "Watch out" : "Note"}
                    </p>
                    {block.text}
                  </div>
                );
              case "code":
                return <CodeBlock key={i} file={block.file} text={block.text} />;
              default:
                return (
                  <p key={i} className="text-lg leading-relaxed text-fg/75">
                    {block.text}
                  </p>
                );
            }
          })}
        </div>

        {/* Prev / next */}
        <div className="mt-16 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="hover-target rounded-xl border border-white/10 p-4 transition-colors hover:border-accent/40"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">← Previous</span>
              <span className="mt-1 block text-fg">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="hover-target rounded-xl border border-white/10 p-4 text-right transition-colors hover:border-accent/40"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Next →</span>
              <span className="mt-1 block text-fg">{next.title}</span>
            </Link>
          )}
        </div>
      </article>

      {/* Right: on this page */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <Toc items={toc} />
        </div>
      </aside>
    </div>
  );
}
