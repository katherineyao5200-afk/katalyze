"use client";

import { motion, type Variants } from "motion/react";
import { CSSProperties, ReactNode, useState } from "react";

// Each section picks the entrance that fits its content instead of one
// fade-up everywhere: "rise" for text blocks, "fade" for quiet asides,
// "scale" for objects and photos, "slide" for items in a sequence.
export type RevealVariant = "rise" | "fade" | "scale" | "slide";

const VARIANTS: Record<RevealVariant, Variants> = {
  rise: { hidden: { opacity: 0, y: 28 }, shown: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, shown: { opacity: 1, scale: 1 } },
  slide: { hidden: { opacity: 0, x: -24 }, shown: { opacity: 1, x: 0 } },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delayMs?: number;
  variant?: RevealVariant;
}

export default function Reveal({
  children,
  className = "",
  style,
  delayMs = 0,
  variant = "rise",
}: RevealProps) {
  // data-revealed still drives CSS-only details (e.g. HowItWorks' accent line).
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      data-revealed={revealed ? "true" : "false"}
      className={className}
      style={style}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: delayMs / 1000 }}
      onAnimationComplete={() => setRevealed(true)}
    >
      {children}
    </motion.div>
  );
}
