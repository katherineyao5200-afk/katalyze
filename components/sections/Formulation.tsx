"use client";

import { useEffect, useRef, useState } from "react";

import CartridgeIllustration from "@/components/CartridgeIllustration";
import Reveal from "@/components/Reveal";

// Real named actives (PRD §5). Base formulas aren't individually named
// anywhere in the docs yet, so they're numbered rather than invented.
// Each line says what the ingredient is for, not a percentage: no real
// formulation data exists yet, and a specific number would read as a
// clinical claim.
const SPECIMENS = [
  {
    label: "Base 01",
    role: "The carrier every dose starts from. How much of each base goes in sets the texture for the day.",
  },
  {
    label: "Base 02",
    role: "A second base, so a dry winter morning and a humid summer one don't get the same feel.",
  },
  {
    label: "Base 03",
    role: "The third base widens the range further. Each sits in its own channel with its own pump, so nothing cross-mixes.",
  },
  {
    label: "Hyaluronic acid",
    role: "A humectant that holds water at the skin's surface. Weighted up when your hydration trend dips.",
  },
  {
    label: "Niacinamide",
    role: "Vitamin B3, widely used for oil balance and an even tone.",
  },
  {
    label: "Ceramide",
    role: "A lipid that is part of the skin's own barrier. Weighted up on irritated or wind-dried days.",
  },
] as const;

// Layout device: annotated plate, light ground (§6 row 05), pinned per
// System B (§11) — "the analysis and formulation sections" are its
// named use case. Same IntersectionObserver-driven active state as
// Analysis, not raw scroll position.
export default function Formulation() {
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
    <section className="bg-white" style={{ paddingBlock: "var(--s-24)" }}>
      <Reveal
        className="mx-auto flex flex-col"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          gap: "var(--s-4)",
        }}
      >
        <p
          className="font-mono uppercase"
          style={{
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--track-label)",
            color: "var(--indigo)",
          }}
        >
          What&apos;s inside
        </p>
        <h2
          className="max-w-lg font-display font-extralight"
          style={{
            fontSize: "var(--text-2xl)",
            lineHeight: "var(--leading-tight)",
            color: "var(--ink-on-light)",
          }}
        >
          Three base formulas. Three active ingredients. Mixed fresh, every
          time.
        </h2>
      </Reveal>

      <div
        className="relative mx-auto grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr]"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          marginTop: "var(--s-16)",
        }}
      >
        <div
          className="relative md:sticky md:top-0 md:flex md:h-screen md:items-center"
          style={{ paddingBlock: "var(--s-8)" }}
        >
          <div className="device-sway flex w-full max-w-sm flex-col gap-3">
            <CartridgeIllustration activeIndex={active} />
            <p
              className="font-mono uppercase"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
                color: "var(--indigo)",
              }}
            >
              [{SPECIMENS[active].label}]
            </p>
          </div>
        </div>

        <dl className="flex flex-col">
          {SPECIMENS.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`flex flex-col justify-center gap-1 py-8 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-soft)] md:min-h-[35vh] md:py-0 ${
                i === active ? "active-glow" : ""
              }`}
              style={{
                opacity: i === active ? 1 : 0.4,
                borderTop: "1px solid var(--rule-on-light)",
                paddingLeft: "var(--s-4)",
              }}
            >
              <dt
                className="font-mono uppercase"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                  color: "var(--indigo)",
                }}
              >
                {item.label}
              </dt>
              <dd
                className="max-w-sm"
                style={{
                  fontSize: "var(--text-base)",
                  lineHeight: "var(--leading-body)",
                  color: "var(--ink-on-light)",
                }}
              >
                {item.role}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
