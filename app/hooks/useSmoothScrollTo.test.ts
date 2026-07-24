import { describe, expect, it } from "vitest";
import { scrollDurationMs } from "./useSmoothScrollTo";

describe("scrollDurationMs", () => {
  it("takes longer for longer jumps", () => {
    expect(scrollDurationMs(4)).toBeGreaterThan(scrollDurationMs(1));
  });

  it("grows less than proportionally with distance", () => {
    expect(scrollDurationMs(4)).toBeLessThan(scrollDurationMs(1) * 4);
  });

  it("is capped", () => {
    expect(scrollDurationMs(50)).toBe(scrollDurationMs(100));
  });

  it("treats direction as irrelevant", () => {
    expect(scrollDurationMs(-3)).toBe(scrollDurationMs(3));
  });

  it("takes over 600ms for a single state", () => {
    expect(scrollDurationMs(1)).toBeGreaterThan(600);
  });
});
