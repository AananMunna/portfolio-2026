'use client';

import { useEffect, useRef } from 'react';

/**
 * Desktop-only cursor (dot + trailing ring). It never touches React state: the
 * elements are moved with transforms from one rAF loop that sleeps when the
 * mouse is still. Touch devices and reduced-motion users get nothing at all.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = dot.current;
    const r = ring.current;
    if (!fine || reduce || !d || !r) return;

    document.documentElement.classList.add('cursor-none');

    let x = -100, y = -100, rx = -100, ry = -100;
    let raf = 0;
    let hover = false;
    let down = false;

    const paint = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      d.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${hover ? 0 : down ? 0.55 : 1})`;
      const s = hover ? 1.7 : down ? 0.85 : 1;
      r.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${s})`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(paint) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      kick();
    };
    const over = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const next = !!el?.closest?.('a, button, [role="button"], .hover-target');
      if (next !== hover) {
        hover = next;
        r.dataset.hover = next ? '1' : '';
        kick();
      }
    };
    const setDown = (v: boolean) => () => {
      down = v;
      kick();
    };
    const downFn = setDown(true);
    const upFn = setDown(false);

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', downFn, { passive: true });
    window.addEventListener('pointerup', upFn, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('cursor-none');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', downFn);
      window.removeEventListener('pointerup', upFn);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference will-change-transform"
        style={{ transform: 'translate3d(-100px,-100px,0)' }}
      />
      <div
        ref={ring}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9998] h-9 w-9 rounded-full border-[1.5px] border-white/45 mix-blend-difference will-change-transform"
        style={{ transform: 'translate3d(-100px,-100px,0)' }}
      />
    </>
  );
}
