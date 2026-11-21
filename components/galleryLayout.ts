/** Layout numbers shared by the lazy placeholder and the 3D scene (kept free of three.js). */
export const S0 = 11; // first frame, distance walked along the tunnel
export const STEP_S = 6.2; // distance between consecutive frames (they alternate walls)

export const sLast = (n: number) => S0 + (n - 1) * STEP_S;
export const camEnd = (n: number) => sLast(n) + 6;

/** scroll length of the section, in svh */
export const heightSvh = (n: number, mobile: boolean) => 100 + camEnd(n) * (mobile ? 6.4 : 8.6);

export function webglOK(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function isLowEnd(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;
}

/** the small optimised copy of a screenshot that the 3D scene uses (same URL everywhere so the browser cache is shared) */
export const artUrl = (src: string, mobile: boolean) => `/_next/image?url=${encodeURIComponent(src)}&w=${mobile ? 640 : 1080}&q=75`;
