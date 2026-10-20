"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Github, Linkedin, Instagram, Facebook, Twitter } from "lucide-react";

const PHOTO_SRC =
  "https://res.cloudinary.com/dtiotqi9q/image/upload/v1790229722/ChatGPT_Image_Sep_24_2026_12_01_47_PM_hl5xrw.png";

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
    <section className="relative pt-25 flex min-h-[100svh] items-center overflow-hidden bg-bg">
      {/* soft ambient glow */}
      {!reduce && (
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-accent/15 via-accent/5 to-transparent blur-[120px]"
        />
      )}

      {/* vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, rgba(3,5,12,0.55))",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col-reverse items-center gap-12 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-12 lg:py-0">
        {/* LEFT */}
        <div className="flex w-full flex-col items-center text-center lg:max-w-[55%] lg:items-start lg:text-left">
          {/* Name */}
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
                  className="inline-block text-[clamp(3.2rem,13vw,7.8rem)] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <span className="mt-[-0.06em] block overflow-hidden">
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
                  className="inline-block text-[clamp(3.2rem,13vw,7.8rem)] italic text-accent drop-shadow-[0_0_40px_rgba(0,255,136,0.2)]"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Role + Description */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-md"
          >
            {/* Highlighted Role */}
            <div className="inline-flex flex-col items-center lg:items-start">
              <p className="font-mono text-[13px] sm:text-[15px] font-semibold uppercase tracking-[0.28em] text-accent">
                Full Stack Developer
              </p>

              {/* Animated underline */}
              <motion.div
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.85, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2.5 h-[2px] w-full origin-left bg-gradient-to-r from-accent via-accent/70 to-transparent"
              />
            </div>

            {/* Short senior description */}
            <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
              I design and build scalable systems with clean architecture, strong performance, and production-ready quality.
            </p>
          </motion.div>

          {/* Socials */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col items-center gap-6 sm:flex-row sm:items-center lg:items-start"
          >
            <div className="flex items-center gap-4">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-white/50 hover:text-accent transition-colors duration-300 hover-target"
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Portrait */}
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

          <img
            src={PHOTO_SRC}
            alt="Aanan Munna — Full Stack Developer"
            width={640}
            height={800}
            className="relative z-10 block h-auto w-full select-none"
            style={{
              filter: "grayscale(15%) contrast(1.05) brightness(0.93)",
              clipPath: "polygon(0 0, 100% 0, 100% 93%, 90% 100%, 0 100%)",
            }}
            draggable={false}
          />

          <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted/70 lg:text-left">
            Aanan Munna · Dhaka
          </p>
        </motion.div>
      </div>
    </section>
  );
}