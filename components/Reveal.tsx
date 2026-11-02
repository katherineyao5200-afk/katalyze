"use client";

import { useInView } from "motion/react";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

/*
 * The site's one entrance. Content "reads in": each child is uncovered
 * top to bottom behind a soft mask while it settles, one after another
 * (see `.rv` in globals.css). Variants change direction, not character:
 *   rise   text blocks (default)
 *   slide  items in a sequence, uncovered left to right
 *   scale  images and objects: the frame unveils, the picture settles
 *   fade   quiet asides
 * Pure CSS transitions on transform and mask, so it costs nothing per
 * frame on the main thread. Reduced motion shows everything at once.
 */
// A backstop for the observer: on a heavy page (WebGL busy, a fast
// fling) an IntersectionObserver callback can arrive late, leaving text
// hidden on screen. One shared, frame-throttled scroll check reveals
// anything that is plainly in view.
const checks = new Set<() => void>();
let queued = false;
function runChecks() {
  queued = false;
  checks.forEach((c) => c());
}
function onScroll() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(runChecks);
  }
}
function watch(check: () => void) {
  if (checks.size === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
  checks.add(check);
  onScroll();
  return () => {
    checks.delete(check);
    if (checks.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
}

export type RevealVariant = "rise" | "fade" | "scale" | "slide";

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delayMs?: number;
  variant?: RevealVariant;
  role?: string;
}

export default function Reveal({
  children,
  className = "",
  style,
  delayMs = 0,
  variant = "rise",
  role,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observed = useInView(ref, { once: true, amount: 0.15 });
  const [seen, setSeen] = useState(false);
  const inView = observed || seen;
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (inView) return;
    let stop = () => {};
    stop = watch(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92 && r.bottom > innerHeight * 0.05) {
        setSeen(true);
        stop();
      }
    });
    return () => stop();
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setSettled(true), delayMs + 1900);
    return () => clearTimeout(t);
  }, [inView, delayMs]);

  return (
    <div
      ref={ref}
      data-revealed={inView ? "true" : "false"}
      data-settled={settled ? "true" : undefined}
      data-variant={variant}
      className={`rv ${className}`}
      style={
        delayMs
          ? ({ ...style, "--rv-base": `${delayMs}ms` } as CSSProperties)
          : style
      }
      role={role}
    >
      {children}
    </div>
  );
}
