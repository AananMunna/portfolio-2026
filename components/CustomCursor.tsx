'use client';

import { useEffect, useRef } from 'react';

const TEXT =
  'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]), textarea, [contenteditable=""], [contenteditable="true"]';
const CLICKABLE = 'a, button, [role="button"], summary, select, label[for], .hover-target';

/**
 * Desktop-only cursor (dot + trailing ring). No React state: JS only moves the
 * two wrappers; every visual state lives in CSS via data-attributes on <html>.
 *
 * Optional markup hooks:
 *   data-cursor-label="View"  -> ring grows into a labelled pill on hover
 *   data-cursor-on="dark"     -> use light cursor colors on always-dark surfaces
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l) return;

    const root = document.documentElement;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const forced = matchMedia('(forced-colors: active)');
    let teardown = () => {};

    const setup = () => {
      teardown();
      if (!fine.matches || reduce.matches || forced.matches) return;

      root.classList.add('cursor-none');
      root.dataset.cursor = 'hidden';

      let x = 0,
        y = 0,
        rx = 0,
        ry = 0,
        raf = 0,
        seen = false;

      const paint = () => {
        rx += (x - rx) * 0.22;
        ry += (y - ry) * 0.22;
        d.style.transform = `translate3d(${x}px,${y}px,0)`;
        r.style.transform = `translate3d(${rx}px,${ry}px,0)`;
        raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(paint) : 0;
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(paint);
      };

      const set = (kind: string, tip = '', surface = '') => {
        if (root.dataset.cursor !== kind) root.dataset.cursor = kind;
        if (l.textContent !== tip) l.textContent = tip;
        if (tip) root.dataset.label = '1';
        else delete root.dataset.label;
        if (surface) root.dataset.cursorOn = surface;
        else delete root.dataset.cursorOn;
      };

      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        x = e.clientX;
        y = e.clientY;
        if (!seen) {
          // first real position: snap the ring so it doesn't fly in from the corner
          seen = true;
          rx = x;
          ry = y;
        }
        if (root.dataset.cursor === 'hidden') set('idle');
        kick();
      };

      const over = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const el = e.target as Element | null;
        const tip = el?.closest?.('[data-cursor-label]')?.getAttribute('data-cursor-label') ?? '';
        const surface = el?.closest?.('[data-cursor-on]')?.getAttribute('data-cursor-on') ?? '';
        const kind = el?.closest?.(TEXT)
          ? 'text'
          : el?.closest?.(CLICKABLE) || tip
            ? 'hover'
            : 'idle';
        set(kind, kind === 'hover' ? tip : '', surface);
      };

      const leave = () => {
        set('hidden');
        delete root.dataset.press;
      };
      const down = () => {
        root.dataset.press = '1';
      };
      const up = () => {
        delete root.dataset.press;
      };

      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerover', over, { passive: true });
      window.addEventListener('pointerdown', down, { passive: true });
      window.addEventListener('pointerup', up, { passive: true });
      window.addEventListener('pointercancel', up, { passive: true });
      window.addEventListener('blur', leave);
      root.addEventListener('mouseleave', leave);

      teardown = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerover', over);
        window.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        window.removeEventListener('blur', leave);
        root.removeEventListener('mouseleave', leave);
        root.classList.remove('cursor-none');
        delete root.dataset.cursor;
        delete root.dataset.press;
        delete root.dataset.label;
        delete root.dataset.cursorOn;
      };
    };

    setup();
    [fine, reduce, forced].forEach((q) => q.addEventListener('change', setup));
    return () => {
      [fine, reduce, forced].forEach((q) => q.removeEventListener('change', setup));
      teardown();
    };
  }, []);

  return (
    <>
      <div ref={dot} aria-hidden className="cursor-dot">
        <i />
      </div>
      <div ref={ring} aria-hidden className="cursor-ring">
        <i />
        <span ref={label} className="cursor-label" />
      </div>
    </>
  );
}