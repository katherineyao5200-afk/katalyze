"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useEffect } from "react";

/**
 * Two small site-wide reactions:
 * - a hairline reading-progress bar along the top edge;
 * - a soft light that follows the pointer inside any `.spot` card
 *   (pricing, roadmap, stats). Pointer-only: touch never sees it.
 */
export default function PageFX() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let last: HTMLElement | null = null;
    function onMove(e: PointerEvent) {
      const el =
        (e.target as Element | null)?.closest?.<HTMLElement>(".spot") ?? null;
      if (last && last !== el) last.style.removeProperty("--spot-o");
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.style.setProperty("--spot-o", "1");
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px origin-left bg-blush"
      style={{ scaleX }}
    />
  );
}
