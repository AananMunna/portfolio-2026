"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const PHOTO_SRC =
  "https://res.cloudinary.com/dtiotqi9q/image/upload/v1790229722/ChatGPT_Image_Sep_24_2026_12_01_47_PM_hl5xrw.png";

export default function Hero() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // subtle mouse glow (disabled on reduced motion)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { damping: 32, stiffness: 120 };
  const sx = useSpring(mouseX, spring);
  const sy = useSpring(mouseY, spring);
  const glowX = useTransform(sx, [-1, 1], ["-12%", "12%"]);
  const glowY = useTransform(sy, [-1, 1], ["-12%", "12%"]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduce]);

  const name = "AANAN";
  const surname = "MUNNA";

  return (
    <section className="relative pt-20 flex min-h-[100svh] items-center overflow-hidden bg-bg">
      {/* soft ambient glow */}
      {!reduce && (
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-accent/15 via-accent/5 to-transparent blur-[120px]"
        />
      )}

      {/* very light vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, rgba(3,5,12,0.55))",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-12 lg:py-0">
        {/* ── LEFT: identity ── */}
        <div className="flex w-full flex-col items-center text-center lg:max-w-[58%] lg:items-start lg:text-left">
          {/* status line */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-muted"
          >
            {/* <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle shadow-[0_0_8px_var(--phosphor)]" /> */}
            {/* <span className="ml-2.5">Available for hire · Dhaka, BD</span> */}
          </motion.p>

          {/* name */}
          <h1 className="font-display font-bold uppercase leading-[0.82] tracking-tighter">
            <span className="block overflow-hidden">
              {name.split("").map((letter, i) => (
                <motion.span
                  key={`n-${i}`}
                  initial={reduce ? false : { y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.12 + i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block text-[clamp(3.4rem,14vw,8.5rem)] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/45"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <span className="mt-[-0.08em] block overflow-hidden">
              {surname.split("").map((letter, i) => (
                <motion.span
                  key={`s-${i}`}
                  initial={reduce ? false : { y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.32 + i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block text-[clamp(3.4rem,14vw,8.5rem)] italic text-accent drop-shadow-[0_0_40px_rgba(0,255,136,0.22)]"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* role + value prop — crystal clear for recruiters */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-md"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent/90 sm:text-xs">
              Full Stack Developer
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">
              I build fast, polished web experiences — from clean interfaces to
              immersive product moments that leave a lasting impression.
            </p>
          </motion.div>

          {/* quiet scroll cue */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-10 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted/60 lg:flex"
          >
            {/* <span className="h-px w-8 bg-border" /> */}
            {/* Scroll to explore work */}
          </motion.div>
        </div>

        {/* ── RIGHT: portrait ── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[min(58vw,240px)] shrink-0 sm:w-[220px] lg:w-[min(28vw,320px)]"
        >
          {/* corner marks */}
          <span className="absolute -left-2.5 -top-2.5 z-20 h-5 w-5 border-l border-t border-accent/50 sm:-left-3 sm:-top-3 sm:h-6 sm:w-6" />
          <span className="absolute -right-2.5 -top-2.5 z-20 h-5 w-5 border-r border-t border-accent/50 sm:-right-3 sm:-top-3 sm:h-6 sm:w-6" />
          <span className="absolute -bottom-2.5 -left-2.5 z-20 h-5 w-5 border-b border-l border-accent/50 sm:-bottom-3 sm:-left-3 sm:h-6 sm:w-6" />
          <span className="absolute -bottom-2.5 -right-2.5 z-20 h-5 w-5 border-b border-r border-accent/50 sm:-bottom-3 sm:-right-3 sm:h-6 sm:w-6" />

          {/* soft glow behind */}
          <div className="absolute -inset-4 rounded-full " />

          <img
            src={PHOTO_SRC}
            alt="Aanan Munna — Full Stack Developer"
            width={640}
            height={800}
            className="relative z-10 block h-auto w-full select-none"
            style={{
              filter: "grayscale(20%) contrast(1.06) brightness(0.92)",
              clipPath: "polygon(0 0, 100% 0, 100% 93%, 90% 100%, 0 100%)",
            }}
            draggable={false}
          />

          {/* subtle accent wash */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            // style={{
            //   background:
            //     "linear-gradient(155deg, rgba(0,255,136,0.06) 0%, transparent 55%)",
            // }}
          />

          {/* location label */}
          <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted/70 lg:text-left">
            Aanan Munna · Dhaka
          </p>
        </motion.div>
      </div>
    </section>
  );
}