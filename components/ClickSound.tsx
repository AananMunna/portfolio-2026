'use client';

import { useEffect } from 'react';

/**
 * One sweet little "tink" for every click on something clickable (link,
 * button, card). Clicks on empty space stay silent.
 *
 * Synthesised with the Web Audio API, so there is no audio file to download.
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
  const master = ac.createGain();
  master.gain.value = 0.85;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 6000;
  master.connect(lp).connect(ac.destination);

  // A small mallet / music-box "tink": a C6 with soft upper partials.
  // Quick 3 ms attack, smooth ~160 ms ring-out. Sweet, never sharp.
  const partials: [number, number, number][] = [
    [1046.5, 0.2, 0.16], // C6 (fundamental)
    [2093.0, 0.07, 0.1], // C7
    [3136.0, 0.025, 0.06], // G7, a faint sparkle
  ];
  for (const [freq, level, ring] of partials) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.012, now); // tiny settle makes it feel soft
    o.frequency.exponentialRampToValueAtTime(freq, now + 0.025);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(level, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + ring);
    o.connect(g).connect(master);
    o.start(now);
    o.stop(now + ring + 0.02);
  }

  // a whisper of "tap" under it so it still reads as a click
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.012), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
  const n = ac.createBufferSource();
  n.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 2200;
  const ng = ac.createGain();
  ng.gain.value = 0.18;
  n.connect(f).connect(ng).connect(master);
  n.start(now);
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
