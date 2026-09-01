"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * System B (§11) — "every pin and threshold reads off Lenis, not native
 * scroll events." This just drives the raf loop; pinned sections read
 * scroll progress from Lenis's own callbacks, not window.scrollY.
 *
 * Respects prefers-reduced-motion by not instantiating at all — native
 * scroll behavior is the correct reduced-motion fallback here, not a
 * slowed-down version of the smoothing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const lenis = new Lenis({ lerp: 0.08 });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
