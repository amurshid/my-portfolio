import { describe, expect, it } from "vitest";
import { applyTint, normalizeToCount } from "./sampling";
import type { Point } from "./types";

const pt = (x: number, y: number, v = 255): Point => ({
  x,
  y,
  r: v,
  g: v,
  b: v,
});

describe("normalizeToCount", () => {
  it("returns exactly the requested count when oversupplied", () => {
    const input = Array.from({ length: 500 }, (_, i) => pt(i, i));
    expect(normalizeToCount(input, 100)).toHaveLength(100);
  });

  it("returns exactly the requested count when undersupplied", () => {
    const input = Array.from({ length: 7 }, (_, i) => pt(i, i));
    expect(normalizeToCount(input, 100)).toHaveLength(100);
  });

  it("returns the requested count when supply matches exactly", () => {
    const input = Array.from({ length: 64 }, (_, i) => pt(i, i));
    expect(normalizeToCount(input, 64)).toHaveLength(64);
  });

  it("never returns an empty formation, even with no candidates", () => {
    expect(normalizeToCount([], 32)).toHaveLength(32);
  });

  it("preserves colour when padding duplicates", () => {
    const out = normalizeToCount([pt(0, 0, 128)], 10);
    expect(out).toHaveLength(10);
    for (const p of out) {
      expect(p.r).toBe(128);
      expect(p.g).toBe(128);
      expect(p.b).toBe(128);
    }
  });

  it("keeps padded duplicates near the point they came from", () => {
    // Padding jitters by up to 2px.
    const out = normalizeToCount([pt(50, -30)], 200);
    for (const p of out) {
      expect(Math.abs(p.x - 50)).toBeLessThanOrEqual(2);
      expect(Math.abs(p.y - -30)).toBeLessThanOrEqual(2);
    }
  });
});

describe("applyTint", () => {
  const white = { r: 255, g: 255, b: 255 };

  it("maps the brightest pixel to the full tint", () => {
    const [p] = applyTint([pt(0, 0, 255)], white, 0.75);
    expect(p.r).toBeCloseTo(255, 6);
  });

  it("applies the floor to black pixels", () => {
    const [p] = applyTint([pt(0, 0, 0)], white, 0.75);
    expect(p.r).toBeCloseTo(255 * 0.75, 6);
  });

  it("keeps relative brightness ordering", () => {
    const [dark, mid, bright] = applyTint(
      [pt(0, 0, 20), pt(1, 1, 140), pt(2, 2, 240)],
      white,
      0.7
    );
    expect(dark.r).toBeLessThan(mid.r);
    expect(mid.r).toBeLessThan(bright.r);
  });

  it("leaves geometry untouched", () => {
    const [p] = applyTint([pt(12, -34, 100)], white, 0.7);
    expect(p.x).toBe(12);
    expect(p.y).toBe(-34);
  });
});
