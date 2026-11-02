"use client";

import { motion } from "motion/react";

// The page's one orchestrated load moment: the two hero lines settle in
// on a spring, the second just after the first, like a reading followed by
// a mix. Everything else on the page only moves when scrolled to.
const LINE = {
  hidden: { opacity: 0, y: "0.35em", filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function HeroHeadline({
  tone = "dark",
  compact = false,
}: {
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  // When the headline shares the screen with the device it steps down
  // from --text-hero to --text-display.
  const size =
    (tone === "light" ? "text-midnight " : "text-white ") +
    (tone === "light" || compact
      ? "[font-size:var(--text-hero-mobile)] md:[font-size:var(--text-display)]"
      : "[font-size:var(--text-hero-mobile)] md:[font-size:var(--text-hero)]");

  return (
    <motion.h1
      className={`focal font-display font-extralight ${size}`}
      style={{
        lineHeight: "var(--leading-display)",
        letterSpacing: "var(--track-display)",
      }}
      initial="hidden"
      animate="shown"
      transition={{ staggerChildren: 0.35, delayChildren: 0.15 }}
    >
      <motion.span className="block" variants={LINE}>
        It reads your skin.
      </motion.span>
      <motion.em
        className="block italic"
        variants={LINE}
        transition={{ type: "spring", stiffness: 70, damping: 18 }}
      >
        Then it mixes.
      </motion.em>
    </motion.h1>
  );
}
