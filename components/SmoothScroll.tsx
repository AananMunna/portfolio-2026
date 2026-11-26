'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      // Slightly faster + more responsive feel
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out (smooth but snappy)

      orientation: 'vertical',
      gestureOrientation: 'vertical',

      // Better control on both mouse & trackpad
      smoothWheel: true,
      wheelMultiplier: 0.95,        // slightly less aggressive = more precise
      touchMultiplier: 1.6,         // good for mobile

      // Performance oriented
      infinite: false,
      autoResize: true,
      syncTouch: false,             // better performance on mobile
      syncTouchLerp: 0.075,
      touchInertiaMultiplier: 28,

      // Prevent layout thrashing
      lerp: 0.09,                   // lower = smoother on low-end devices
    });

    // Expose globally so Navbar can call lenis.scrollTo()
    (window as any).lenis = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Optional: pause Lenis when tab is hidden (saves battery)
    const onVisibility = () => {
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  return <>{children}</>;
}