"use client";

import { useEffect, useRef, useState } from "react";

import StepScene from "@/components/home/StepScene";

// Plays a step scene's drawing the first time it scrolls into view.
export default function SceneInView({
  step,
  className = "",
}: {
  step: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {seen ? (
        <StepScene step={step} className="h-auto w-full" />
      ) : (
        <div className="aspect-[400/380] w-full" />
      )}
    </div>
  );
}
