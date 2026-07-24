/** Math helpers for the particle system. */

/** Linear interpolation from `a` to `b` at `t` in [0,1]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Hermite ease with zero slope at both ends. */
export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Cubic ease-in-out. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Rec. 601 luma from 8-bit channels. */
export function luma(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Seeded PRNG (mulberry32) returning values in [0, 1). Shapes are rebuilt on
 * resize, so the random-looking ones use this to come out the same each time.
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Maps progress through a scroll segment (0-1) to morph progress (0-1), staying
 * at 0 or 1 for the first and last `hold` of the segment.
 */
export function segmentMorphProgress(frac: number, hold: number): number {
  return clamp((frac - hold) / (1 - 2 * hold), 0, 1);
}
