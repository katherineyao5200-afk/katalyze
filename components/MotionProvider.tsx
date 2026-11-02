"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// One place for the site's motion defaults. reducedMotion="user" makes every
// motion component drop transforms (keeping opacity) when the OS asks for
// reduced motion — the hard requirement in CLAUDE.md.
export const SPRING = { type: "spring", stiffness: 110, damping: 22, mass: 0.9 } as const;

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      {children}
    </MotionConfig>
  );
}
