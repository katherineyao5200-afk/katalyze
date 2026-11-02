"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // A new page always opens at the top. Lenis otherwise keeps its own
  // scroll target across client-side navigations and lands you wherever
  // you clicked from.
  useEffect(() => {
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const lenis = new Lenis({ lerp: 0.08 });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
