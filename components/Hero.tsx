"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scrollToTarget } from "@/lib/scroll";
import { Github, Linkedin, Instagram, Facebook, Twitter, ArrowUpRight, MapPin } from "lucide-react";

// Cloudinary serves a small, auto-format copy instead of the original PNG.
const PHOTO_SRC =
  "https://res.cloudinary.com/dtiotqi9q/image/upload/f_auto,q_auto,w_560/v1790229722/ChatGPT_Image_Sep_24_2026_12_01_47_PM_hl5xrw.png";

/* ------------------------------------------------------------------ */
/* Tiny syntax highlighter – only highlights the currently typed text */
/* ------------------------------------------------------------------ */

type Lang = "tsx" | "ts" | "sql";
type Kind = "kw" | "fn" | "type" | "str" | "num" | "prop" | "tag" | "punc" | "cmt" | "plain";
type Tok = { text: string; kind: Kind };

const COLOR: Record<Kind, string> = {
  kw: "text-[#5eead4]",
  fn: "text-[#67e8f9]",
  type: "text-[#6ee7b7]",
  str: "text-[#d9f99d]",
  num: "text-[#fcd34d]",
  prop: "text-[#bae6fd]",
  tag: "text-[#2dd4bf]",
  punc: "text-[#5b8782]",
  cmt: "text-[#4b6f6b] italic",
  plain: "text-[#d5f5f1]",
};

const JS_KW = new Set(["export", "function", "async", "await", "const", "let", "return", "new", "import", "from", "if", "else", "type"]);
const SQL_KW = new Set(["create", "table", "primary", "key", "not", "null", "references", "default", "index", "on"]);
const TYPES = new Set(["string", "number", "boolean", "Request", "Response", "int", "serial", "timestamptz"]);
const CONSTS = new Set(["true", "false", "null", "undefined"]);

function tokenizeLine(line: string, lang: Lang): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  let prev = "";

  const push = (text: string, kind: Kind) => {
    out.push({ text, kind });
    if (text.trim()) prev = text;
  };

  while (i < line.length) {
    const rest = line.slice(i);
    let m: RegExpMatchArray | null;

    if ((m = rest.match(/^\s+/))) {
      out.push({ text: m[0], kind: "plain" });
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^\/\/.*/)) || (lang === "sql" && (m = rest.match(/^--.*/)))) {
      push(m[0], "cmt");
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^"(?:[^"\\]|\\.)*"/)) || (m = rest.match(/^'(?:[^'\\]|\\.)*'/))) {
      push(m[0], "str");
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^\d+(?:\.\d+)?/))) {
      push(m[0], "num");
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^[A-Za-z_$][\w$]*/))) {
      const word = m[0];
      const next = rest.slice(word.length).match(/^\s*(.)/)?.[1];
      const kws = lang === "sql" ? SQL_KW : JS_KW;
      const w = lang === "sql" ? word.toLowerCase() : word;

      let kind: Kind = "plain";
      if (kws.has(w)) kind = "kw";
      else if (CONSTS.has(word)) kind = "num";
      else if (TYPES.has(word)) kind = "type";
      else if (lang === "tsx" && (prev === "<" || prev === "/")) kind = "tag";
      else if (next === "(") kind = "fn";
      else if (next === ":") kind = "prop";
      else if (/^[A-Z]/.test(word)) kind = "type";

      push(word, kind);
      i += word.length;
      continue;
    }
    push(line[i], "punc");
    i += 1;
  }
  return out;
}

function CodeBlock({ code, lang, caret }: { code: string; lang: Lang; caret: boolean }) {
  const lines = code.split("\n");
  return (
    <code className="block">
      {lines.map((line, n) => (
        <span key={n} className="flex">
          <span aria-hidden className="w-8 shrink-0 select-none pr-3 text-right text-[#9fd6cd]/25 text-[11px]">
            {n + 1}
          </span>
          <span className="whitespace-pre">
            {tokenizeLine(line, lang).map((t, k) => (
              <span key={k} className={COLOR[t.kind]}>
                {t.text}
              </span>
            ))}
            {line === "" && " "}
            {caret && n === lines.length - 1 && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1.1em] w-[6px] translate-y-[2px] bg-[#5eead4] animate-pulse"
              />
            )}
          </span>
        </span>
      ))}
    </code>
  );
}

/* ------------------------------------------------------------------ */
/* Extremely short snippets – designed for typewriter speed            */
/* ------------------------------------------------------------------ */

const layers = [
  {
    word: "front end",
    file: "OrderButton.tsx",
    lang: "tsx" as Lang,
    label: "TSX",
    note: "Click → request",
    code: `export function OrderButton({ id }) {
  const order = () =>
    fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  return <button onClick={order}>Order</button>;
}`,
  },
  {
    word: "back end",
    file: "orders/route.ts",
    lang: "ts" as Lang,
    label: "TS",
    note: "Request → query",
    code: `export async function POST(req: Request) {
  const { id } = await req.json();
  const order = await db.insert(orders).values({ itemId: id });
  return Response.json(order, { status: 201 });
}`,
  },
  {
    word: "database",
    file: "schema.sql",
    lang: "sql" as Lang,
    label: "SQL",
    note: "Query → row",
    code: `create table orders (
  id         serial primary key,
  item_id    int not null,
  created_at timestamptz default now()
);`,
  },
];

const socials = [
  { name: "GitHub", icon: Github, href: "https://github.com/AananMunna" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/aanan-munna/" },
  { name: "Twitter", icon: Twitter, href: "https://x.com/aanan_munna" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/aanan_munna/" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/aanan.munna/" },
  {
    name: "WhatsApp",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    href: "https://wa.me/8801310468353",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/* The typewriter lives in its own component so each keystroke re-renders only
   this small <pre>, not the whole hero. */
const TypedCode = memo(function TypedCode({
  code,
  lang,
  reduce,
}: {
  code: string;
  lang: Lang;
  reduce: boolean;
}) {
  const [typed, setTyped] = useState(reduce ? code : "");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce) {
      setTyped(code);
      setTyping(false);
      return;
    }
    setTyped("");
    setTyping(true);
    let i = 0;
    let t: number;
    const tick = () => {
      i = Math.min(code.length, i + 2); // two characters per tick keeps it light
      setTyped(code.slice(0, i));
      if (i < code.length) {
        t = window.setTimeout(tick, code[i - 1] === "\n" ? 40 : 28);
      } else {
        setTyping(false);
      }
    };
    t = window.setTimeout(tick, 180);
    return () => window.clearTimeout(t);
  }, [code, reduce]);

  return <CodeBlock code={typed} lang={lang} caret={typing || (!reduce && typed.length > 0)} />;
});

export default function Hero() {
  const [reduce, setReduce] = useState(false);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  // photo popup
  const [peek, setPeek] = useState(false);
  const peekRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const pointerType = useRef<string>("mouse");

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Autoplay (cheap)
  useEffect(() => {
    if (reduce || touched) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % layers.length), 4800);
    return () => window.clearInterval(id);
  }, [reduce, touched]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  /* photo popup */
  const openPeek = () => {
    window.clearTimeout(closeTimer.current);
    setPeek(true);
  };
  const closePeek = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPeek(false), 120);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!peek) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPeek(false);
    const onDown = (e: PointerEvent) => {
      if (!peekRef.current?.contains(e.target as Node)) setPeek(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [peek]);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  const current = layers[active];

  const word = (i: number) => (
    <button
      type="button"
      aria-pressed={active === i}
      aria-controls="layer-panel"
      onMouseEnter={() => pick(i)}
      onFocus={() => pick(i)}
      onClick={() => pick(i)}
      className={`hover-target inline cursor-pointer underline decoration-2 underline-offset-[7px] transition-colors duration-200 ${
        active === i ? "text-accent decoration-accent" : "text-fg decoration-fg/20 hover:decoration-fg/50"
      }`}
    >
      {layers[i].word}
    </button>
  );

  return (
    <section className="relative bg-bg">
      {/* very light background – almost nothing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-ambient absolute inset-0" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(128,128,128,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 65% 55% at 55% 45%, black 15%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 55% 45%, black 15%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center gap-12 px-5 pb-16 pt-28 sm:px-8 lg:flex-row lg:justify-between lg:gap-12 lg:px-12 lg:pb-20 lg:pt-32">
        {/* LEFT */}
        <div className="flex w-full flex-col items-center text-center lg:max-w-[48%] lg:items-start lg:text-left">
          {/* Signature */}
          <motion.div
            {...rise(0.05)}
            ref={peekRef}
            className="relative flex items-center gap-3.5"
            onPointerEnter={(e) => e.pointerType === "mouse" && openPeek()}
            onPointerLeave={(e) => e.pointerType === "mouse" && closePeek()}
            onFocus={() => pointerType.current !== "touch" && openPeek()}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) closePeek();
            }}
          >
            <button
              type="button"
              aria-expanded={peek}
              aria-label="Show a larger photo and details"
              onPointerDown={(e) => {
                pointerType.current = e.pointerType;
              }}
              onClick={() => pointerType.current === "touch" && setPeek((p) => !p)}
              className="hover-target group relative shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <img
                src={PHOTO_SRC}
                alt=""
                width={48}
                height={48}
                decoding="async"
                className="relative h-12 w-12 select-none rounded-full border hairline object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
                draggable={false}
              />
            </button>
            <div className="text-left">
              <p className="text-[15px] font-medium leading-tight text-fg">Aanan Munna</p>
              <p className="mt-0.5 font-mono text-[12.5px] font-medium leading-tight text-accent">Full Stack Developer</p>
            </div>

            <AnimatePresence>
              {peek && (
                <div className="absolute left-1/2 top-full z-50 w-[min(280px,86vw)] -translate-x-1/2 pt-3 lg:left-0 lg:translate-x-0">
                  <motion.div
                    role="dialog"
                    aria-label="About Aanan Munna"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="glass relative origin-top overflow-hidden rounded-2xl border hairline p-2 text-left shadow-xl lg:origin-top-left"
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={PHOTO_SRC}
                        alt="Aanan Munna, Full Stack Developer"
                        loading="lazy"
                        decoding="async"
                        width={560}
                        height={700}
                        className="block aspect-[4/5] max-h-[42svh] w-full select-none object-cover object-top"
                        draggable={false}
                      />
                    </div>

                    <div className="px-2.5 pb-2 pt-3">
                      <p className="text-[16px] font-semibold tracking-[-0.01em] text-fg">Aanan Munna</p>
                      <p className="mt-0.5 font-mono text-[12px] font-medium text-accent">Full Stack Developer</p>

                      <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-muted">
                        <MapPin size={13} strokeWidth={1.8} />
                        Kushtia, Bangladesh
                      </p>

                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {["Next.js", "Node", "Postgres"].map((t) => (
                          <li
                            key={t}
                            className="rounded-full border hairline bg-white/[0.04] px-2.5 py-1 font-mono text-[10.5px] text-fg/80"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href="/contact"
                        className="hover-target mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent underline-offset-4 hover:underline"
                      >
                        Say hello <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...rise(0.12)}
            className="mt-7 text-[clamp(2rem,4.2vw,3.25rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-fg"
          >
            I build the {word(0)}, the {word(1)} and the {word(2)}.
          </motion.h1>

          <motion.p
            {...rise(0.22)}
            className="mt-5 max-w-[34rem] text-[15.5px] leading-[1.65] text-muted sm:text-[16.5px]"
          >
            Mostly Next.js, Node and Postgres. I learned by shipping real projects, and I care more about things working well than looking clever.
          </motion.p>

          <motion.div {...rise(0.3)} className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a href="#work" onClick={(e) => { e.preventDefault(); scrollToTarget("#work"); }} className="hover-target btn-primary">
              View work
            </a>
            <Link href="/contact" className="hover-target btn-ghost">
              Get in touch <ArrowUpRight size={15} />
            </Link>
          </motion.div>

          {/* Socials */}
          <motion.div {...rise(0.36)} className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="hover-target flex h-9 w-9 items-center justify-center rounded-full border hairline bg-white/[0.03] text-fg/60 transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  <Icon size={16} strokeWidth={1.6} />
                </a>
              );
            })}
          </motion.div>
        </div>

        {/* RIGHT – iOS-style terminal (static, no mouse follow) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
          className="relative w-full max-w-[520px] shrink-0 lg:w-[47%]"
        >
          {/* very subtle teal glow – static */}
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[1.8rem] bg-[radial-gradient(50%_50%_at_50%_40%,rgba(45,212,191,0.18),transparent)] blur-lg"
          />

          {/* Terminal window – completely static */}
          <div className="keep-white relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f0e] shadow-[0_25px_50px_-20px_rgba(0,0,0,0.6)]">
            {/* iOS-style title bar */}
            <div className="relative flex items-center gap-2 border-b border-white/[0.06] bg-[#0d1413] px-3.5 py-2.5">
              {/* traffic lights */}
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>

              {/* centered title – classic iOS Terminal feel */}
              <div className="absolute inset-x-0 flex justify-center pointer-events-none">
                <span className="font-mono text-[11px] text-white/40 truncate max-w-[60%]">
                  {current.file}
                </span>
              </div>
            </div>

            {/* tabs (very light) */}
            <div className="flex border-b border-white/[0.04] bg-[#0a0f0e] px-1">
              {layers.map((l, i) => (
                <button
                  key={l.file}
                  type="button"
                  aria-pressed={active === i}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                  className={`relative px-3 py-2 font-mono text-[11px] transition-colors duration-150 ${
                    active === i ? "text-[#d5f5f1]" : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {l.file}
                  {active === i && (
                    <span className="absolute inset-x-2 bottom-0 h-px bg-[#5eead4]/70" />
                  )}
                </button>
              ))}
            </div>

            {/* code area */}
            <div
              id="layer-panel"
              aria-live="polite"
              className="relative min-h-[17.5rem] overflow-x-auto px-3 pb-4 pt-3 sm:min-h-[18.5rem]"
            >
              <pre className="font-mono text-[12px] leading-[1.7] sm:text-[12.5px]">
                <TypedCode code={current.code} lang={current.lang} reduce={reduce} />
              </pre>
            </div>

            {/* status bar */}
            <div className="flex items-center justify-between border-t border-white/[0.05] bg-[#0d1413] px-3.5 py-1.5 font-mono text-[10.5px] text-white/35">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5eead4]/80" />
                <span className="text-[#5eead4]/90">0{active + 1}/03</span>
                <span className="text-white/40">· {current.note}</span>
              </span>
              <span className="hidden sm:inline">{current.label}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}