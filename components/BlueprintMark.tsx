"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

import { SPARKLE_PATH } from "@/components/Sparkle";

/*
 * The sparkle from the mark, shown with the geometry it is built from:
 * a 24-unit square, its axes, and the four corner circles whose arcs make
 * the star's sides. The lines draw in when the footer comes into view,
 * then the star fills. Drawn in information colours only.
 */
const LINES: { d: string; dash?: boolean }[] = [
  { d: "M0 0H24V24H0Z" },
  { d: "M12 -4V28" },
  { d: "M-4 12H28" },
  { d: "M0 0L24 24M24 0L0 24", dash: true },
  // corner circles, radius 12 (their inner quarters are the star's sides)
  { d: "M12 0A12 12 0 0 1 0 12", dash: true },
  { d: "M12 0A12 12 0 0 0 24 12", dash: true },
  { d: "M24 12A12 12 0 0 0 12 24", dash: true },
  { d: "M0 12A12 12 0 0 1 12 24", dash: true },
  { d: "M24 12A12 12 0 0 1 12 24 A12 12 0 0 1 0 12 A12 12 0 0 1 12 0 A12 12 0 0 1 24 12" },
];

export default function BlueprintMark({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, { once: true, amount: 0.6 });

  return (
    <svg
      ref={ref}
      viewBox="-8 -8 40 40"
      aria-hidden="true"
      className={`blueprint ${className}`}
      data-on={on || undefined}
    >
      {LINES.map((l, i) => (
        <path
          key={i}
          d={l.d}
          pathLength={1}
          fill="none"
          stroke="var(--periwinkle)"
          strokeWidth={0.12}
          strokeOpacity={l.dash ? 0.45 : 0.7}
          className="blueprint-line"
          style={{ transitionDelay: `${i * 110}ms` }}
        />
      ))}
      {[
        [0, 0],
        [24, 0],
        [24, 24],
        [0, 24],
        [12, 12],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.45} fill="var(--periwinkle)" className="blueprint-node" />
      ))}
      <path d={SPARKLE_PATH} fill="#fff" className="blueprint-fill" />
      <text x={12} y={-3} textAnchor="middle" className="blueprint-label">
        24
      </text>
      <text x={25.5} y={6} className="blueprint-label">
        R12
      </text>
    </svg>
  );
}
