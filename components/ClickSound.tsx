'use client';

import { useEffect } from 'react';

/**
 * One soft "pop" for every click on something clickable (link, button, card).
 * Clicks on empty space stay silent.
 *
 * The sound is synthesised with the Web Audio API, so there is no audio file
 * to download: a ~90 ms rising sine blip (A5 -> E6) with a tiny soft attack
 * and a quick decay, plus a quiet octave overtone for a "bubble" sparkle.
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

function pop() {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();

  const now = ac.currentTime;
  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.16, now + 0.008);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
  out.connect(ac.destination);

  const tone = (type: OscillatorType, from: number, to: number, level: number) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, now);
    o.frequency.exponentialRampToValueAtTime(to, now + 0.07);
    g.gain.value = level;
    o.connect(g).connect(out);
    o.start(now);
    o.stop(now + 0.12);
  };

  tone('sine', 880, 1318.5, 1); // A5 -> E6, a rising perfect fifth
  tone('sine', 1760, 2637, 0.22); // soft overtone
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
      if (t - lastPlay < 60) return; // nested clickables fire once
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
