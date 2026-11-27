/**
 * Native scrolling helpers. The browser's own scroller is the smoothest option
 * on every device (compositor-driven, no JS in the loop), so we only ask it to
 * animate programmatic jumps.
 */

export function scrollToY(y: number, immediate = false) {
  window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
}

export function scrollToTarget(target: string | number | Element, immediate = false) {
  if (typeof target === 'number') return scrollToY(target, immediate);
  if (target === 'body') return scrollToY(0, immediate);
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  // scrollIntoView honours the element's scroll-margin-top (e.g. scroll-mt-24).
  el.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth', block: 'start' });
}
