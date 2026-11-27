'use client';

import { useEffect } from 'react';

/**
 * A short, bright two-note notification-style "ping" for every click on
 * something clickable (link, button, card, dock icon). Clicks on empty space
 * stay silent. Synthesised with the Web Audio API: no audio file to download.
 */

const CLICKABLE =
  'a[href], button, summary, [role="button"], [role="tab"], [role="link"], input[type="submit"], input[type="button"], label[for], .hover-target, [data-sound]';

let ctx: AudioContext | null = null;
let lastPlay = 0;

function getCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: 'interactive' });
  return ctx;
}

function bell(ac: AudioContext, out: AudioNode, t: number, freq: number, level: number, ring: number) {
  // glassy bell: fundamental + inharmonic partials (2.76x, 5.4x) that die faster
  const parts: [number, number, number][] = [
    [1, 1, 1],
    [2.76, 0.22, 0.45],
    [5.4, 0.07, 0.22],
  ];
  for (const [ratio, amp, life] of parts) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = freq * ratio;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level * amp, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ring * life);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + ring * life + 0.02);
  }
}

function pop() {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();

  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0.8;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 9000;
  master.connect(lp).connect(ac.destination);

  // Two quick notes rising a fourth (G6 -> C7). A rising interval resolves
  // upward like a "ping, you got something" notification: bright, short and
  // light. Total length is ~0.3 s so it never drags on repeated clicks.
  bell(ac, master, now, 1568.0, 0.13, 0.16);
  bell(ac, master, now + 0.07, 2093.0, 0.16, 0.26);
}

export default function ClickSound() {
  useEffect(() => {
    // Browsers only allow audio after a gesture; warm the context up early so the
    // first click is not delayed.
    const warm = () => {
      const ac = getCtx();
      if (ac && ac.state === 'suspended') void ac.resume();
    };
    window.addEventListener('pointerdown', warm, { once: true, passive: true });

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(CLICKABLE);
      if (!el) return;
      if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return;
      const t = performance.now();
      if (t - lastPlay < 110) return; // nested clickables fire once
      lastPlay = t;
      pop();
    };

    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', warm);
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, []);

  return null;
}
