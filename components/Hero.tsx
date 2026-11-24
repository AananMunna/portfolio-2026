"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Linkedin, Instagram, Facebook, Twitter, Mail, ArrowUpRight } from "lucide-react";

const PHOTO_SRC =
  "https://res.cloudinary.com/dtiotqi9q/image/upload/v1790229722/ChatGPT_Image_Sep_24_2026_12_01_47_PM_hl5xrw.png";

const socials = [
  { name: "Email", icon: Mail, href: "mailto:aananmunna420@gmail.com" },
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

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col-reverse items-center justify-center gap-12 px-5 pb-20 pt-32 sm:px-8 lg:flex-row lg:justify-between lg:gap-16 lg:px-12 lg:pb-24 lg:pt-36">
        {/* LEFT */}
        <div className="flex w-full flex-col items-center text-center lg:max-w-[56%] lg:items-start lg:text-left">
          <motion.div
            {...rise(0.05)}
            className="inline-flex items-center gap-2 rounded-full border hairline bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] font-medium text-fg/80"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Open to remote work
            <span className="text-muted">·</span>
            <span className="text-muted">Kushtia, Bangladesh</span>
          </motion.div>

          {/* Name: deliberately modest. Role carries the weight. */}
          <motion.h1
            {...rise(0.15)}
            className="mt-6 text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold uppercase leading-[1.05] tracking-[0.04em] text-fg"
          >
            Aanan <span className="text-accent">Munna</span>
          </motion.h1>

          <motion.p
            {...rise(0.25)}
            className="mt-3 font-mono text-[13px] font-medium uppercase tracking-[0.22em] text-muted sm:text-sm"
          >
            Full Stack Developer
          </motion.p>

          <motion.p
            {...rise(0.35)}
            className="mt-6 max-w-[34rem] text-[15.5px] leading-[1.7] text-muted sm:text-[17px]"
          >
            I build web apps from the database to the button. Mostly Next.js, Node and Postgres. I learned by shipping real projects, and I care more about things working well than looking clever.
          </motion.p>

          <motion.div {...rise(0.45)} className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a href="#work" className="hover-target btn-primary">
              View work
            </a>
            <Link href="/contact" className="hover-target btn-ghost">
              Get in touch <ArrowUpRight size={16} />
            </Link>
          </motion.div>

          {/* Socials: real buttons, always fully visible */}
          <motion.div {...rise(0.55)} className="mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
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

        {/* RIGHT: portrait */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[min(62vw,260px)] shrink-0 sm:w-[260px] lg:w-[min(28vw,340px)]"
        >
          <div className="absolute -inset-4 -z-10 rounded-[2.2rem] bg-gradient-to-br from-accent/25 via-transparent to-transparent blur-2xl" />
          <div className="card overflow-hidden !rounded-[1.75rem] p-1.5">
            <img
              src={PHOTO_SRC}
              alt="Aanan Munna, Full Stack Developer"
              width={640}
              height={800}
              className="block h-auto w-full select-none rounded-[1.4rem]"
              style={{ filter: "contrast(1.03)" }}
              draggable={false}
            />
          </div>

          {/* floating stack card */}
          <div className="glass absolute -bottom-5 -left-4 hidden rounded-2xl border hairline px-4 py-3 shadow-xl sm:block lg:-left-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Currently building with</p>
            <p className="mt-1 text-sm font-semibold text-fg">Next.js · Node · Postgres</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
