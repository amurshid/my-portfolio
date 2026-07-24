"use client";

import { useCallback, useEffect, useRef } from "react";
import { easeInOutCubic } from "@/app/lib/particles/math";

// Native smooth scrolling is too quick to see the morph, so the scroll is
// animated here instead.
const BASE_MS = 700;
const PER_STATE_MS = 420;
const MAX_MS = 2400;

/** Duration for jumping `states` viewports: a base time plus a bit per state, capped. */
export function scrollDurationMs(states: number): number {
  return Math.min(MAX_MS, BASE_MS + Math.abs(states) * PER_STATE_MS);
}

/**
 * Returns a function that animates scrolling to a state. Any wheel, touch or key
 * input cancels it, and with reduced motion it jumps straight there.
 */
export function useSmoothScrollTo(): (stateIndex: number) => void {
  const animRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  useEffect(() => {
    const stop = () => cancel();
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      cancel();
    };
  }, [cancel]);

  return useCallback(
    (stateIndex: number) => {
      const start = window.scrollY;
      const distance = stateIndex * window.innerHeight - start;
      if (Math.abs(distance) < 1) return;

      cancel();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, start + distance);
        return;
      }

      const duration = scrollDurationMs(distance / window.innerHeight);

      let t0: number | null = null;
      const step = (now: number) => {
        if (t0 === null) t0 = now;
        const t = Math.min(1, (now - t0) / duration);
        window.scrollTo(0, start + distance * easeInOutCubic(t));
        animRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animRef.current = requestAnimationFrame(step);
    },
    [cancel]
  );
}
