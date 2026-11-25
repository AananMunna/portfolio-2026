'use client';

import { useEffect, useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'motion/react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [cursorText, setCursorText] = useState<string | null>(null);

  // Motion values (no re-render on every mouse move)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ultra responsive springs
  const springConfig = { damping: 28, stiffness: 1200, mass: 0.15 };
  const ringSpring = { damping: 22, stiffness: 380, mass: 0.4 };

  const dotX = useSpring(mouseX, springConfig);
  const dotY = useSpring(mouseY, springConfig);
  const ringX = useSpring(mouseX, ringSpring);
  const ringY = useSpring(mouseY, ringSpring);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) {
      const handleTap = (e: TouchEvent) => {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return;

        const id = Date.now();
        setRipples((prev) => [...prev, { id, x: touch.clientX, y: touch.clientY }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 650);
      };

      window.addEventListener('touchstart', handleTap, { passive: true });
      return () => window.removeEventListener('touchstart', handleTap);
    }

    // Desktop logic
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const down = () => setIsClicking(true);
    const up = () => setIsClicking(false);

    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;

      const interactive =
        el.closest('a') ||
        el.closest('button') ||
        el.closest('[role="button"]') ||
        el.closest('.hover-target') ||
        el.tagName === 'A' ||
        el.tagName === 'BUTTON';

      setIsHovering(!!interactive);

      // Optional text label (add data-cursor="View" on any element)
      const label = el.closest('[data-cursor]') as HTMLElement | null;
      setCursorText(label?.dataset.cursor || null);
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseover', over, { passive: true });

    // Hide default cursor
    document.documentElement.classList.add('cursor-none');

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseover', over);
      document.documentElement.classList.remove('cursor-none');
    };
  }, [isMobile, mouseX, mouseY]);

  // Mobile version
  if (isMobile) {
    return (
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0.55, scale: 0, x: r.x - 18, y: r.y - 18 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 w-9 h-9 rounded-full border border-accent/80 pointer-events-none z-[9999]"
          />
        ))}
      </AnimatePresence>
    );
  }

  return (
    <>
      {/* Tiny accurate dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 0 : isClicking ? 0.55 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference flex items-center justify-center rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: 36,
          height: 36,
        }}
        animate={{
          scale: isHovering ? (cursorText ? 2.4 : 1.7) : isClicking ? 0.85 : 1,
          backgroundColor: isHovering ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)',
          borderColor: isHovering ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.45)',
          borderWidth: isHovering ? 0 : 1.5,
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 28,
          mass: 0.35,
        }}
      >
        {/* Optional text inside cursor */}
        <AnimatePresence>
          {cursorText && isHovering && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-medium text-black tracking-wide whitespace-nowrap"
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}