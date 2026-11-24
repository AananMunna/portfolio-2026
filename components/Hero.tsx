"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Linkedin, Instagram, Facebook, Twitter, Mail, ArrowUpRight } from "lucide-react";

const PHOTO_SRC =
  "https://res.cloudinary.com/dtiotqi9q/image/upload/v1790229722/ChatGPT_Image_Sep_24_2026_12_01_47_PM_hl5xrw.png";

// One small flow (clicking "Order"), shown as the code that handles it in each layer.
// These are illustrative snippets. Swap in real code from one of your projects if you can.
const layers = [
  {
    word: "front end",
    file: "components/OrderButton.tsx",
    note: "A click becomes a request.",
    code: `export function OrderButton({ id }: { id: number }) {
  const [busy, setBusy] = useState(false);

  async function order() {
    setBusy(true);
    await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    setBusy(false);
  }

  return <button disabled={busy} onClick={order}>Order</button>;
}`,
  },
  {
    word: "back end",
    file: "app/api/orders/route.ts",
    note: "The request becomes a query.",
    code: `export async function POST(req: Request) {
  const { id } = await req.json();

  const { rows } = await db.query(
    "insert into orders (item_id) values ($1) returning id",
    [id]
  );

  return Response.json({ order: rows[0] }, { status: 201 });
}`,
  },
  {
    word: "database",
    file: "db/schema.sql",
    note: "The query becomes a row.",
    code: `create table orders (
  id         serial primary key,
  item_id    int not null references items(id),
  created_at timestamptz not null default now()
);

create index on orders (created_at desc);`,
  },
];

const socials = [
  // { name: "Email", icon: Mail, href: "mailto:aananmunna420@gmail.com" },
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

export default function Hero() {
  const [reduce, setReduce] = useState(false);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false); // once someone interacts, autoplay stops

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Gentle autoplay through the three layers until the visitor takes over.
  useEffect(() => {
    if (reduce || touched) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % layers.length), 5000);
    return () => window.clearInterval(id);
  }, [reduce, touched]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { damping: 32, stiffness: 120 };
  const sx = useSpring(mouseX, spring);
  const sy = useSpring(mouseY, spring);
  const glowX = useTransform(sx, [-1, 1], ["-10%", "10%"]);
  const glowY = useTransform(sy, [-1, 1], ["-10%", "10%"]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduce]);

  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 18 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  const current = layers[active];

  // The three headline words double as the controls for the code window.
  const word = (i: number) => (
    <button
      type="button"
      aria-pressed={active === i}
      aria-controls="layer-panel"
      onMouseEnter={() => pick(i)}
      onFocus={() => pick(i)}
      onClick={() => pick(i)}
      className={`hover-target inline cursor-pointer underline decoration-2 underline-offset-[7px] transition-colors duration-300 ${
        active === i ? "text-accent decoration-accent" : "text-fg decoration-fg/20 hover:decoration-fg/50"
      }`}
    >
      {layers[i].word}
    </button>
  );

  return (
    <section className="relative bg-bg">
      {/* background layers: clipped on their own so content is never cut off */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-ambient absolute inset-0" />
        {!reduce && (
          <motion.div
            style={{ x: glowX, y: glowY }}
            className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-accent/15 via-accent/5 to-transparent blur-[110px]"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 45%, var(--vignette))",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center gap-14 px-5 pb-20 pt-32 sm:px-8 lg:flex-row lg:justify-between lg:gap-14 lg:px-12 lg:pb-24 lg:pt-36">
        {/* LEFT */}
        <div className="flex w-full flex-col items-center text-center lg:max-w-[50%] lg:items-start lg:text-left">
          <motion.div
            {...rise(0.05)}
            className=" hidden items-center gap-2 rounded-full border hairline bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] font-medium text-fg/80"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Open to remote work
            <span className="text-muted">·</span>
            <span className="text-muted">Kushtia, Bangladesh</span>
          </motion.div>

          {/* Signature: avatar, name, role */}
          <motion.div {...rise(0.1)} className="flex items-center gap-3.5">
            <img
              src={PHOTO_SRC}
              alt="Aanan Munna"
              width={48}
              height={48}
              className="h-12 w-12 select-none rounded-full border hairline object-cover object-top"
              draggable={false}
            />
            <div className="text-left">
              <p className="text-[15px] font-medium leading-tight text-fg">Aanan Munna</p>
              <p className="mt-0.5 font-mono text-[12.5px] font-medium leading-tight text-accent">Full Stack Developer</p>
            </div>
          </motion.div>

          {/* Headline: the three words are the controls */}
          <motion.h1
            {...rise(0.2)}
            className="mt-7 text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-fg"
          >
            I build the {word(0)}, the {word(1)} and the {word(2)}.
          </motion.h1>

          <motion.p
            {...rise(0.35)}
            className="mt-6 max-w-[34rem] text-[15.5px] leading-[1.7] text-muted sm:text-[17px]"
          >
            Mostly Next.js, Node and Postgres. I learned by shipping real projects, and I care more about things working well than looking clever.
          </motion.p>

          {/* <motion.p {...rise(0.4)} className="mt-3 font-mono text-[11.5px] text-muted/80">
            Hover or tap a word to see that layer.
          </motion.p> */}

          <motion.div {...rise(0.48)} className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a href="#work" className="hover-target btn-primary">
              View work
            </a>
            <Link href="/contact" className="hover-target btn-ghost">
              Get in touch <ArrowUpRight size={16} />
            </Link>
          </motion.div>

          {/* Socials: real buttons, always fully visible */}
          <motion.div {...rise(0.56)} className="mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="hover-target flex h-10 w-10 items-center justify-center rounded-full border hairline bg-white/[0.04] text-fg/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  <Icon size={17} strokeWidth={1.6} />
                </a>
              );
            })}
          </motion.div>
        </div>

        {/* RIGHT: code window that follows the headline word */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[560px] shrink-0 lg:w-[46%]"
        >
          <div className="absolute -inset-4 -z-10 rounded-[2.2rem] bg-gradient-to-br from-accent/25 via-transparent to-transparent blur-2xl" />
          <div className="card overflow-hidden !rounded-[1.5rem] p-0">
            {/* window chrome */}
            <div className="flex items-center gap-3 border-b hairline px-4 py-3">
              <span aria-hidden className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-muted">{current.file}</span>
            </div>

            {/* code */}
            <div id="layer-panel" aria-live="polite" className="min-h-[17rem] overflow-x-auto px-5 py-5 sm:min-h-[18.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.pre
                  key={current.file}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="font-mono text-[12px] leading-[1.7] text-fg/85 sm:text-[12.5px]"
                >
                  <code>{current.code}</code>
                </motion.pre>
              </AnimatePresence>
            </div>

            {/* caption + position dots */}
            <div className="flex items-center justify-between gap-4 border-t hairline px-5 py-3">
              <p className="font-mono text-[11.5px] text-muted">
                <span className="text-accent">0{active + 1}/03</span> · {current.note}
              </p>
              <span aria-hidden className="flex gap-1.5">
                {layers.map((l, i) => (
                  <span
                    key={l.word}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      active === i ? "w-5 bg-accent" : "w-1.5 bg-fg/20"
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>
          {/* <p className="mt-3 text-center font-mono text-[10.5px] text-muted/70 lg:text-left">
            Illustrative snippets of one flow, through all three layers.
          </p> */}
        </motion.div>
      </div>
    </section>
  );
}