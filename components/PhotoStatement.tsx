"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/*
 * A full-bleed statement set over a photo that has been blurred, tinted
 * navy and grained until it reads as atmosphere, not as a picture. The
 * photo drifts a little slower than the page; the words stay sharp.
 */
export default function PhotoStatement({
  src,
  position = "50% 50%",
  children,
  align = "left",
}: {
  src: string;
  position?: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <section ref={ref} className="photo-statement relative isolate overflow-hidden bg-midnight">
      <motion.div
        aria-hidden="true"
        className="absolute inset-[-8%] -z-20 bg-cover"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: position, y }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: `
            linear-gradient(${align === "left" ? "90deg" : "270deg"}, rgb(21 24 46 / 0.94) 0%, rgb(31 36 65 / 0.78) 45%, rgb(31 36 65 / 0.45) 100%),
            linear-gradient(180deg, var(--midnight) 0%, transparent 18%, transparent 82%, var(--midnight) 100%)`,
        }}
      />
      <div aria-hidden="true" className="photo-grain absolute inset-0 -z-10" />
      <div
        className={`mx-auto flex ${align === "right" ? "justify-end" : ""}`}
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)", paddingBlock: "var(--s-40)" }}
      >
        <div className="flex max-w-3xl flex-col gap-10">{children}</div>
      </div>
    </section>
  );
}
