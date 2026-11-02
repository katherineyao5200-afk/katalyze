"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/*
 * A thin rail down the right edge that fills as you read, with a glowing
 * point at the leading edge. It tells first-time visitors there is more
 * below (kat asked for this). A "Scroll" label sits at the top until you
 * start. Hidden when the page does not scroll.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const top = useTransform(p, (v) => `${v * 100}%`);
  const label = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const pathname = usePathname();
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const check = () =>
      setScrolls(document.documentElement.scrollHeight > window.innerHeight * 1.5);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [pathname]);

  if (!scrolls) return null;

  return (
    <div
      aria-hidden="true"
      className="scroll-rail pointer-events-none mix-blend-difference fixed right-3 top-1/2 hidden md:block z-40 h-[38vh] w-px -translate-y-1/2 md:right-6"
    >
      <span className="absolute inset-0 rounded-full bg-white/15" />
      <motion.span
        className="absolute inset-x-0 top-0 origin-top rounded-full bg-gradient-to-b from-periwinkle/40 to-white"
        style={{ scaleY: p }}
      />
      <motion.span
        className="absolute left-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{
          top,
          boxShadow: "0 0 10px 2px rgb(232 204 210 / 0.7), 0 0 22px 6px rgb(138 141 179 / 0.35)",
        }}
      />
      <motion.span
        className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono uppercase text-white/60 [writing-mode:vertical-rl]"
        style={{ opacity: label, fontSize: "9px", letterSpacing: "0.2em", translateY: "-100%" }}
      >
        Scroll
      </motion.span>
    </div>
  );
}
