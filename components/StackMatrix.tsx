"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { stack, type Tech } from "@/lib/stackData";

/* ───────────── tiny syntax highlighter (good enough for a 12-line snippet) ───────────── */

const KEYWORDS = new Set(
  (
    "const let var function return async await export default import from if else for while throw try catch new " +
    "type interface extends implements class enum as of in typeof null true false undefined void " +
    "model SELECT FROM WHERE LEFT JOIN ON ORDER BY LIMIT AS paths get parameters responses name on jobs steps uses run with " +
    "git switch add commit rebase push"
  ).split(" "),
);

const TOKEN =
  /(\/\/.*|#\s.*|--\s.*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\()|\b([A-Za-z_$][\w$]*)\b/g;

function highlight(src: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const [txt, comment, str, num, fn, word] = m;
    let color: string | undefined;
    if (comment) color = "#6b7a90";
    else if (str) color = "#ecc48d";
    else if (num) color = "#f78c6c";
    else if (fn) color = "#82aaff";
    else if (word && KEYWORDS.has(word)) color = "#c792ea";
    else if (word && /^[A-Z]/.test(word)) color = "#ffcb6b";
    out.push(
      color ? (
        <span key={m.index} style={{ color }}>
          {txt}
        </span>
      ) : (
        txt
      ),
    );
    last = m.index + txt.length;
    if (txt.length === 0) TOKEN.lastIndex++;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}

/* ───────────── typing hook ───────────── */

function useTyped(text: string, reduce: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) {
      setN(text.length);
      return;
    }
    setN(0);
    const duration = Math.min(1700, Math.max(550, text.length * 6.5));
    const start = performance.now() + 120; // short beat before typing starts
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.max(0, Math.min(1, (t - start) / duration));
      setN(Math.floor(p * text.length));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduce]);
  return n;
}

/* ───────────── terminal (the sticky half) ───────────── */

function Terminal({ tech, reduce }: { tech: Tech; reduce: boolean }) {
  const n = useTyped(tech.code, reduce);
  const done = n >= tech.code.length;
  const typed = tech.code.slice(0, n);
  const lineCount = tech.code.split("\n").length;

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)]"
      style={{ background: "var(--term-bg)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* chrome */}
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <p className="flex-1 truncate text-center font-mono text-[11.5px] text-[#8b96a8]">
          aanan@dev — {tech.file}
        </p>
        <span className="rounded bg-white/[0.07] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#9aa6b8]">
          {tech.lang}
        </span>
      </div>

      {/* code */}
      <pre
        className="overflow-hidden px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-[#d6deeb] sm:text-[13px] sm:px-5"
        style={{ minHeight: `${Math.max(lineCount, 9) * 1.7 * 13 + 32}px` }}
        aria-label={`${tech.name} code example`}
      >
        <code className="block whitespace-pre-wrap break-words">
          {highlight(typed)}
          {!done && <span className="caret" />}
        </code>
      </pre>

      {/* run output */}
      <div
        className="border-t px-4 py-3 font-mono text-[12px] leading-relaxed sm:px-5"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
      >
        <p className="text-[#8b96a8]">
          <span className="text-[#34d399]">$</span> {tech.cmd}
          {!done && <span className="caret ml-1" />}
        </p>
        <p
          className="mt-1 text-[#34d399] transition-all duration-500"
          style={{ opacity: done ? 1 : 0, transform: done ? "none" : "translateY(4px)" }}
        >
          {tech.out}
        </p>
      </div>
    </div>
  );
}

/* ───────────── section ───────────── */

export default function StackMatrix() {
  const flat = useMemo(() => stack.flatMap((g) => g.items), []);
  const [active, setActive] = useState(flat[0].name);
  const [reduce, setReduce] = useState(false);
  const [touch, setTouch] = useState(false);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tech = flat.find((t) => t.name === active) ?? flat[0];

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  // On touch screens there is no hover: whichever row crosses the middle of the screen becomes active.
  useEffect(() => {
    if (!touch) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.tech!);
        }),
      { rootMargin: "-42% 0px -48% 0px", threshold: 0 },
    );
    Object.values(rowRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [touch]);

  return (
    <section className="relative z-20 bg-bg">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <p className="eyebrow">Technical stack</p>
          <h2 className="section-title mt-3">
            Tools I build <span className="text-accent">with.</span>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            {touch
              ? "Scroll the list. The terminal shows how I use each one."
              : "Hover anything on the left. The terminal shows how I actually use it."}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* terminal: sticks while the list scrolls (below the list on desktop's right, on top for phones) */}
          <div className="order-first lg:order-last">
            <div className="sticky top-[84px] z-10 lg:top-28">
              <Terminal tech={tech} reduce={reduce} />
              <p className="mt-3 hidden text-center font-mono text-[11px] text-muted lg:block">
                {tech.name} · {tech.use}
              </p>
            </div>
          </div>

          {/* single-column list */}
          <div className="pb-10 lg:pb-24">
            {stack.map((group) => (
              <Fragment key={group.title}>
                <p className="eyebrow mb-1 mt-12 first:mt-0">{group.title}</p>
                <ul>
                  {group.items.map((t) => {
                    const on = t.name === active;
                    return (
                      <li key={t.name}>
                        <button
                          ref={(el) => {
                            rowRefs.current[t.name] = el;
                          }}
                          data-tech={t.name}
                          onMouseEnter={() => setActive(t.name)}
                          onFocus={() => setActive(t.name)}
                          onClick={() => setActive(t.name)}
                          aria-pressed={on}
                          className="hover-target group relative flex w-full items-baseline justify-between gap-6 border-b hairline py-4 text-left sm:py-5"
                        >
                          <span
                            className={`absolute -left-4 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-all duration-300 ${
                              on ? "h-7" : ""
                            }`}
                          />
                          <span
                            className={`text-[1.65rem] font-semibold tracking-tight transition-all duration-300 sm:text-[2.1rem] ${
                              on ? "translate-x-2 text-fg" : "text-fg/35 group-hover:text-fg/70"
                            }`}
                          >
                            {t.name}
                          </span>
                          <span
                            className={`hidden text-right font-mono text-[11.5px] transition-colors duration-300 md:block ${
                              on ? "text-accent" : "text-muted/70"
                            }`}
                          >
                            {t.use}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
