"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Counts a percentage like "71.2%" up from zero the first time it scrolls
// into view. The real value is rendered on the server and for reduced
// motion, so crawlers and screen readers only ever see the true figure.
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);

  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : NaN;
  const decimals = match?.[1].split(".")[1]?.length ?? 0;
  const suffix = match?.[2] ?? "";

  useEffect(() => {
    if (!inView || reduced || Number.isNaN(target)) return;
    const controls = animate(0, target, {
      type: "spring",
      stiffness: 40,
      damping: 18,
      onUpdate: (v) => setDisplay(`${v.toFixed(decimals)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, reduced, target, decimals, suffix]);

  return (
    <span ref={ref} aria-label={value}>
      {display}
    </span>
  );
}
