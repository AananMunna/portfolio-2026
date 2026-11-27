'use client';

import { useEffect } from 'react';

/**
 * One soft "pop" for every click on something clickable (link, button, card).
 * Clicks on empty space stay silent.
 *
 * The sound is synthesised with the Web Audio API (no audio file): a dry
 * "tick" transient, a soft low body and a faint high shine, about 60 ms in
 * total, in the spirit of the iOS keyboard click.
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
  master.gain.value = 0.9;
  // gentle low-pass keeps it warm and "glassy" instead of harsh
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 7000;
  master.connect(lp).connect(ac.destination);

  // 1. the "tick": short, dry, woody transient (like the iOS keyboard click)
  const nBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.02), ac.sampleRate);
  const d = nBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const noise = ac.createBufferSource();
  noise.buffer = nBuf;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3200;
  bp.Q.value = 1.4;
  const ng = ac.createGain();
  ng.gain.value = 0.55;
  noise.connect(bp).connect(ng).connect(master);
  noise.start(now);

  // 2. the "body": a soft low thump that gives it weight
  const thump = ac.createOscillator();
  const tg = ac.createGain();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(260, now);
  thump.frequency.exponentialRampToValueAtTime(130, now + 0.05);
  tg.gain.setValueAtTime(0.0001, now);
  tg.gain.exponentialRampToValueAtTime(0.5, now + 0.003);
  tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  thump.connect(tg).connect(master);
  thump.start(now);
  thump.stop(now + 0.07);

  // 3. the "shine": a tiny high tone that fades fast, for the premium glint
  const shine = ac.createOscillator();
  const sg = ac.createGain();
  shine.type = 'sine';
  shine.frequency.setValueAtTime(2350, now);
  sg.gain.setValueAtTime(0.0001, now);
  sg.gain.exponentialRampToValueAtTime(0.13, now + 0.002);
  sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  shine.connect(sg).connect(master);
  shine.start(now);
  shine.stop(now + 0.05);
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
