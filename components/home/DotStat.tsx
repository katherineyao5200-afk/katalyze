"use client";

import { useInView } from "motion/react";
import { useMemo, useRef } from "react";

/*
 * A share drawn as a field of 100 points (after the dot-simulation
 * visuals): `lit` of them light up, one after another, in a scattered
 * order, when the field scrolls into view.
 */
export default function DotStat({
  lit,
  className = "",
}: {
  lit: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // Each dot's place in the lighting order: a fixed shuffle.
  const order = useMemo(() => {
    let s = 9;
    const r = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const idx = Array.from({ length: 100 }, (_, i) => i);
    for (let i = 99; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const rank = new Array(100);
    idx.forEach((d, k) => (rank[d] = k));
    return rank as number[];
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`grid grid-cols-10 gap-[4px] ${className}`}
    >
      {order.map((rank, i) => {
        const on = inView && rank < lit;
        return (
          <span
            key={i}
            className="dot-stat aspect-square rounded-full"
            style={{
              background: on
                ? rank % 6 === 0
                  ? "var(--periwinkle)"
                  : "#fff"
                : "rgb(138 141 179 / 0.16)",
              boxShadow: on ? "0 0 6px rgb(255 255 255 / 0.35)" : "none",
              transform: on ? "scale(0.82)" : "scale(0.6)",
              transitionDelay: `${rank * 14}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
