"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface FloatOnScrollProps {
  children: ReactNode;
  className?: string;
  /** [restingScale, peakScale] — peak hits as the element centers in view. */
  scaleRange?: [number, number];
  /** How far (px) the element rises from its resting offset at progress 0. */
  riseDistance?: number;
}

/**
 * "Rising and scaling slightly on scroll" — the PRD's original spec for
 * the device showcase, dropped in the first pass for time. Progress is
 * 0 when the element is at the viewport edge, 1 when centered — driven
 * by scroll position via rAF, same pattern as ParallaxLayer, not a
 * second competing scroll-tracking approach.
 */
export default function FloatOnScroll({
  children,
  className = "",
  scaleRange = [0.94, 1],
  riseDistance = 32,
}: FloatOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string | undefined>(undefined);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // matchMedia isn't available during SSR; sync the real value once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(!reducedMotion);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;
    let ticking = false;

    function update() {
      const rect = el!.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const maxDist = vh / 2 + rect.height / 2;
      const progress = Math.min(
        1,
        Math.max(0, 1 - Math.abs(center - vh / 2) / maxDist),
      );
      const scale = scaleRange[0] + (scaleRange[1] - scaleRange[0]) * progress;
      const rise = (1 - progress) * riseDistance;
      setTransform(`translate3d(0, ${rise}px, 0) scale(${scale})`);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [enabled, scaleRange, riseDistance]);

  return (
    <div
      ref={ref}
      className={className}
      style={enabled ? { transform, willChange: "transform" } : undefined}
    >
      {children}
    </div>
  );
}
