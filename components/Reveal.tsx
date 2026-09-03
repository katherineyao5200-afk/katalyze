"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delayMs?: number;
}

export default function Reveal({
  children,
  className = "",
  style,
  delayMs = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // matchMedia isn't available during SSR; sync the real value once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion means no reveal transform: show content immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      data-revealed={visible ? "true" : "false"}
      style={{
        ...style,
        transitionDelay: visible ? `${delayMs}ms` : "0ms",
      }}
      className={`ease-glide transition-all duration-[var(--dur-base)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
