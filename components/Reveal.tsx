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
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [settled, setSettled] = useState(false);

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
