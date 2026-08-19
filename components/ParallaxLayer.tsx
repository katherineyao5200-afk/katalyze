"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  /** Fraction of scroll distance this layer moves. 0 = static (front layer). */
  speed: number;
  className?: string;
}

export default function ParallaxLayer({
  children,
  speed,
  className = "",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    // matchMedia isn't available during SSR; sync the real value once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(!reducedMotion && isDesktop && speed !== 0);
  }, [speed]);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let visible = true;
    let rafId: number | null = null;
    let ticking = false;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(el);

    function onScroll() {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        if (visible) setOffset(window.scrollY * speed);
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
      visibilityObserver.disconnect();
    };
  }, [enabled, speed]);

  return (
    <div
      ref={ref}
      style={enabled ? { transform: `translate3d(0, ${offset}px, 0)` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
