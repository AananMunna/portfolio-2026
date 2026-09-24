"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "motion/react";
import { useRef, useEffect, useState } from "react";

const PHOTO_SRC =
  "https://res.cloudinary.com/dtiotqi9q/image/upload/v1790229722/ChatGPT_Image_Sep_24_2026_12_01_47_PM_hl5xrw.png";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const mouseXMv = useMotionValue(0);
  const mouseYMv = useMotionValue(0);
  const spring = { damping: 28, stiffness: 140 };
  const springX = useSpring(mouseXMv, spring);
  const springY = useSpring(mouseYMv, spring);
  const glowX = useTransform(springX, [-1, 1], ["-20%", "20%"]);
  const glowY = useTransform(springY, [-1, 1], ["-20%", "20%"]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseXMv.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseYMv.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mouseXMv, mouseYMv]);

  const smooth = useSpring(scrollYProgress, { damping: 30, stiffness: 90 });
  const textX = useTransform(smooth, [0, 0.5, 1], ["0%", "-12%", "-12%"]);
  const textScale = useTransform(smooth, [0, 0.5, 1], [1, 0.78, 0.78]);
  const photoX = useTransform(smooth, [0, 0.4, 0.75], ["100%", "100%", "0%"]);
  const photoOp = useTransform(smooth, [0, 0.38, 0.65], [0, 0, 1]);
  const photoSc = useTransform(smooth, [0.4, 0.75], [0.9, 1]);

  const text1 = "AANAN".split("");
  const text2 = "MUNNA".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
  };
  const letterVariants = {
    hidden: { y: 100, opacity: 0, rotateX: -90, filter: "blur(10px)" },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 15, stiffness: 100 },
    },
  };

  // ── MOBILE: normal flow, no sticky, no 220vh ──
  if (isMobile) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-bg overflow-hidden px-4 py-16 gap-8">
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] bg-gradient-to-tr from-accent/20 via-accent/5 to-transparent rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

        {/* Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center z-10"
        >
          <div className="flex overflow-hidden mb-[-4vw]">
            {text1.map((l, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="font-display text-[22vw] leading-[0.85] tracking-tighter uppercase font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 inline-block select-none"
              >
                {l}
              </motion.span>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {text2.map((l, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="text-accent font-display text-[22vw] leading-[0.85] tracking-tighter uppercase font-bold italic inline-block drop-shadow-[0_0_30px_rgba(0,255,136,0.2)] select-none"
              >
                {l}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="relative w-[52vw] max-w-[200px] z-10"
        >
          <span className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-accent/60 z-20" />
          <span className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-accent/60 z-20" />
          <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-accent/60 z-20" />
          <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-accent/60 z-20" />
          <div className="absolute -inset-3 bg-accent/10 blur-xl rounded-full z-0" />
          <img
            src={PHOTO_SRC}
            alt="Aanan Munna"
            className="relative z-10 w-full h-auto block"
            style={{
              filter: "grayscale(25%) contrast(1.08) brightness(0.9)",
              clipPath: "polygon(0 0, 100% 0, 100% 92%, 88% 100%, 0 100%)",
            }}
            draggable={false}
          />
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(0,255,136,0.07) 0%, transparent 60%)",
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex items-center gap-3 z-10"
        >
          <div className="w-6 h-[1px] bg-accent/50" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg/70 text-center">
            Full Stack Developer
            {/* <span className="text-accent mx-2">·</span>
            Full-Stack Capable */}
          </p>
          <div className="w-6 h-[1px] bg-accent/50" />
        </motion.div>
      </section>
    );
  }

  // ── DESKTOP: sticky scroll reveal ──
  return (
    <div ref={containerRef} style={{ height: "220vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-bg flex items-center justify-center">
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute top-1/2 left-1/2 w-[70vw] h-[70vw] bg-gradient-to-tr from-accent/20 via-accent/5 to-transparent rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

        <div className="w-full h-full flex items-center justify-center relative z-10">
          {/* TEXT */}
          <motion.div
            style={{ x: textX, scale: textScale }}
            className="flex flex-col items-start origin-left will-change-transform pl-[6vw]"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col"
            >
              <div className="flex overflow-hidden mb-[-2vw]">
                {text1.map((l, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className="font-display text-[17vw] leading-[0.85] tracking-tighter uppercase font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 inline-block select-none"
                  >
                    {l}
                  </motion.span>
                ))}
              </div>
              <div className="flex overflow-hidden">
                {text2.map((l, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className="text-accent font-display text-[17vw] leading-[0.85] tracking-tighter uppercase font-bold italic inline-block drop-shadow-[0_0_40px_rgba(0,255,136,0.25)] select-none"
                  >
                    {l}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-8 flex items-center gap-4"
            >
              <div className="w-10 h-[1px] bg-accent/50" />
              <p className="font-mono text-md uppercase tracking-[0.3em] text-fg/80">
            Full Stack Developer
                {/* <span className="text-accent mx-3">·</span>
                Full-Stack Capable */}
              </p>
              <div className="w-10 h-[1px] bg-accent/50" />
            </motion.div>
          </motion.div>

          {/* PHOTO */}
          <motion.div
            style={{ x: photoX, opacity: photoOp, scale: photoSc }}
            className="absolute right-[5vw] will-change-transform origin-right"
          >
            <div className="relative w-[28vw] max-w-[360px]">
              <span className="absolute -top-3 -left-3 w-7 h-7 border-t-2 border-l-2 border-accent/60 z-20" />
              <span className="absolute -top-3 -right-3 w-7 h-7 border-t-2 border-r-2 border-accent/60 z-20" />
              <span className="absolute -bottom-3 -left-3 w-7 h-7 border-b-2 border-l-2 border-accent/60 z-20" />
              <span className="absolute -bottom-3 -right-3 w-7 h-7 border-b-2 border-r-2 border-accent/60 z-20" />
              <div
                className="absolute inset-0 z-10 pointer-events-none opacity-25"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)",
                }}
              />
              <div className="absolute -inset-4 bg-accent/10 blur-2xl rounded-full z-0" />
              <img
                src={PHOTO_SRC}
                alt="Aanan Munna"
                className="relative z-10 w-full h-auto block"
                style={{
                  filter: "grayscale(25%) contrast(1.08) brightness(0.9)",
                  clipPath: "polygon(0 0, 100% 0, 100% 92%, 88% 100%, 0 100%)",
                }}
                draggable={false}
              />
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(0,255,136,0.07) 0%, transparent 60%)",
                }}
              />
              <div className="absolute -bottom-8 left-0 z-20">
                <span className="font-mono text-[9px] tracking-[3px] text-accent/50 uppercase">
                  Aanan Munna — Dhaka, BD
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
