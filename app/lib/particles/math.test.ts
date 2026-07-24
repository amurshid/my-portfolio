import { describe, expect, it } from "vitest";
import {
  clamp,
  easeInOutCubic,
  lerp,
  luma,
  mulberry32,
  segmentMorphProgress,
  smoothstep,
} from "./math";
import { SEGMENT_HOLD } from "./config";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(0x10c6);
    const b = mulberry32(0x10c6);
    const first = Array.from({ length: 50 }, a);
    const second = Array.from({ length: 50 }, b);
    expect(first).toEqual(second);
  });

  it("produces different sequences for different seeds", () => {
    const a = Array.from({ length: 10 }, mulberry32(1));
    const b = Array.from({ length: 10 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });

  it("stays within [0,1)", () => {
    const rand = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("segmentMorphProgress", () => {
  it("holds the formation at both ends of the segment", () => {
    expect(segmentMorphProgress(0, SEGMENT_HOLD)).toBe(0);
    expect(segmentMorphProgress(SEGMENT_HOLD, SEGMENT_HOLD)).toBe(0);
    expect(segmentMorphProgress(1, SEGMENT_HOLD)).toBe(1);
    expect(segmentMorphProgress(1 - SEGMENT_HOLD, SEGMENT_HOLD)).toBe(1);
  });

  it("is symmetric about the segment midpoint", () => {
    expect(segmentMorphProgress(0.5, SEGMENT_HOLD)).toBeCloseTo(0.5, 10);
    for (const d of [0.05, 0.15, 0.25, 0.35]) {
      const before = segmentMorphProgress(0.5 - d, SEGMENT_HOLD);
      const after = segmentMorphProgress(0.5 + d, SEGMENT_HOLD);
      expect(before).toBeCloseTo(1 - after, 10);
    }
  });

  it("increases monotonically", () => {
    let prev = -1;
    for (let f = 0; f <= 1.0001; f += 0.01) {
      const v = segmentMorphProgress(f, SEGMENT_HOLD);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("easeInOutCubic", () => {
  it("returns 0 and 1 at the ends", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it("passes through the midpoint", () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
  });

  it("starts and ends slower than linear", () => {
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1);
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9);
  });
});

describe("basic helpers", () => {
  it("lerp interpolates and hits both endpoints", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });

  it("clamp bounds in both directions", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("smoothstep hits 0, 0.5 and 1", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 10);
  });

  it("luma weights green most heavily", () => {
    expect(luma(0, 0, 0)).toBe(0);
    expect(luma(255, 255, 255)).toBeCloseTo(255, 6);
    expect(luma(0, 255, 0)).toBeGreaterThan(luma(255, 0, 0));
    expect(luma(255, 0, 0)).toBeGreaterThan(luma(0, 0, 255));
  });
});
