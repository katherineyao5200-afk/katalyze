"use client";

import { useEffect, useRef, useState } from "react";

import ImagePlaceholder from "@/components/ImagePlaceholder";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Real inputs only (§5 rule) — no fabricated sensor readings. The device
// measures relative hydration via a capacitive pad; everything else is
// user-reported or external. Four real inputs, not padded to a round
// number with invented data.
const INPUTS = [
  { label: "Hydration trend", detail: "capacitive pad, relative reading", y: 22 },
  { label: "Local weather", detail: "pulled automatically, daily", y: 42 },
  { label: "Logged skin feel", detail: "your entry, each morning", y: 62 },
  { label: "Initial screening", detail: "one-time, at setup", y: 82 },
] as const;

// Layout devices 1 + System B (§5, §11): annotated plate, pinned to a
// scrolling text column — "the analysis and formulation sections" are
// System B's named use case. The active input is whichever one is
// centered in the viewport; IntersectionObserver drives that, not raw
// scroll position, so it stays correct regardless of Lenis's smoothing.
export default function Analysis() {
  const specimen = images.product.skinMacro;
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = itemRefs.current.indexOf(
              entry.target as HTMLDivElement,
            );
            if (index !== -1) setActive(index);
          }
        }
      },
      { threshold: 0.5 },
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-midnight" style={{ paddingBlock: "var(--s-24)" }}>
      <Reveal
        className="mx-auto flex flex-col gap-4"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <p
          className="font-mono uppercase text-periwinkle"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          What it reads
        </p>
        <h2
          className="max-w-xl font-display font-extralight text-white"
          style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
        >
          Four real inputs, not a guess.
        </h2>
      </Reveal>

      <div
        className="relative mx-auto mt-12 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <div
          className="relative md:sticky md:top-0 md:flex md:h-screen md:items-center"
          style={{ paddingBlock: "var(--s-8)" }}
        >
          <div className="relative w-full">
            <ImagePlaceholder
              width={specimen.width}
              height={specimen.height}
              alt={specimen.alt}
            />
            {INPUTS.map((input, i) => (
              <span
                key={input.label}
                aria-hidden="true"
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[var(--dur-base)] ease-[var(--ease-soft)]"
                style={{
                  left: "50%",
                  top: `${input.y}%`,
                  backgroundImage: "var(--grad-point)",
                  opacity: i === active ? 1 : 0.35,
                  transform: `translate(-50%, -50%) scale(${i === active ? 1.6 : 1})`,
                }}
              />
            ))}
          </div>
        </div>

        <dl className="flex flex-col">
          {INPUTS.map((input, i) => (
            <div
              key={input.label}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="flex flex-col justify-center gap-2 py-8 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-soft)] md:py-0"
              style={{
                minHeight: "70vh",
                opacity: i === active ? 1 : 0.45,
                borderLeft: "1px solid var(--rule-on-dark)",
                paddingLeft: "var(--s-4)",
              }}
            >
              <dt
                className="font-mono uppercase text-periwinkle"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                }}
              >
                [{input.label}]
              </dt>
              <dd
                className="mt-1 text-white/70"
                style={{ fontSize: "var(--text-sm)" }}
              >
                {input.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
