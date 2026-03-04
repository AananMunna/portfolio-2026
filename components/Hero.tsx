'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { useRef, useEffect } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Mouse tracking for parallax and glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax transforms for different layers
  const textX1 = useTransform(springX, [-1, 1], [-20, 20]);
  const textY1 = useTransform(springY, [-1, 1], [-20, 20]);
  
  const textX2 = useTransform(springX, [-1, 1], [-40, 40]);
  const textY2 = useTransform(springY, [-1, 1], [-40, 40]);

  const glowX = useTransform(springX, [-1, 1], ['-20%', '20%']);
  const glowY = useTransform(springY, [-1, 1], ['-20%', '20%']);

  const text1 = "AANAN".split("");
  const text2 = "MUNNA".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 120, opacity: 0, rotateX: -90, filter: 'blur(10px)' },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 100,
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-4 sm:px-8 bg-bg"
    >
      {/* Premium Ambient Glow */}
      <motion.div 
        style={{ x: glowX, y: glowY }}
        className="absolute top-1/2 left-1/2 w-[70vw] h-[70vw] bg-gradient-to-tr from-accent/20 via-accent/5 to-transparent rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <motion.div style={{ y, opacity }} className="text-center z-10 w-full max-w-7xl perspective-1000">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center"
        >
          <motion.div style={{ x: textX1, y: textY1 }} className="overflow-hidden flex justify-center mb-[-2vw] sm:mb-[-4vw]">
            {text1.map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="font-display text-[22vw] sm:text-[20vw] leading-[0.8] tracking-tighter uppercase font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 inline-block drop-shadow-2xl"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.div style={{ x: textX2, y: textY2 }} className="overflow-hidden flex justify-center items-center z-20">
            <div className="flex">
              {text2.map((letter, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="text-accent font-display text-[22vw] sm:text-[20vw] leading-[0.8] tracking-tighter uppercase font-bold italic inline-block drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="w-12 h-[1px] bg-accent/50"></div>
            <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-muted">
              Creative Front-End Developer
            </p>
            <div className="w-12 h-[1px] bg-accent/50"></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
