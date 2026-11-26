"use client";

import { useEffect, useState } from "react";

export default function Toc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">
        On this page
      </p>
      <ul className="space-y-2 border-l border-white/10">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={`-ml-px block border-l py-0.5 pl-4 text-sm transition-colors ${
                active === i.id
                  ? "border-accent text-accent"
                  : "border-transparent text-fg/55 hover:text-fg"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
