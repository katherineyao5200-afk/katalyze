"use client";

import { useEffect, useRef, useState } from "react";

import DeviceIllustration, { type DevicePart } from "@/components/DeviceIllustration";
import Reveal from "@/components/Reveal";

// Real inputs only (§5 rule) — no fabricated sensor readings. The device
// measures relative hydration via a capacitive pad; everything else is
// user-reported or external. Four real inputs, not padded to a round
// number with invented data. `part` ties each input to the device part
// that's actually responsible for it.
const INPUTS: {
  label: string;
  detail: string;
  part: DevicePart;
}[] = [
  {
    label: "Hydration trend",
    detail:
      "Rest a fingertip on the pad for three seconds. It tracks whether your skin is drier or more hydrated than your usual, not a clinical number.",
    part: "buttons",
  },
  {
    label: "Local weather",
    detail:
      "Humidity and temperature for where you are, pulled by the app each day. A dry, cold week shifts the blend before you notice it.",
    part: "display",
  },
  {
    label: "Logged skin feel",
    detail:
      "A quick check-in each morning: tight, oily, irritated, fine. You know things a sensor can't.",
    part: "window",
  },
  {
    label: "Initial screening",
    detail:
      "A one-time questionnaire at setup covering skin type, sensitivities and goals. It sets the safe range every daily formula stays inside.",
    part: "cartridge-base",
  },
];

// Layout devices 1 + System B (§5, §11): annotated plate, pinned to a
// scrolling text column — "the analysis and formulation sections" are
// System B's named use case. The active input is whichever one is
// centered in the viewport; IntersectionObserver drives that, not raw
// scroll position, so it stays correct regardless of Lenis's smoothing.
export default function Analysis() {
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
          <div className="device-sway relative w-full max-w-md">
            <DeviceIllustration activePart={INPUTS[active].part} />
          </div>
        </div>

        <dl className="flex flex-col">
          {INPUTS.map((input, i) => (
            <div
              key={input.label}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`flex flex-col justify-center gap-2 py-8 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-soft)] md:py-0 ${
                i === active ? "active-glow" : ""
              }`}
              style={{
                minHeight: "45vh",
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
                className="mt-1 max-w-sm text-white/75"
                style={{
                  fontSize: "var(--text-base)",
                  lineHeight: "var(--leading-body)",
                }}
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
