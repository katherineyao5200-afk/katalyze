"use client";

import { useEffect, useState } from "react";

import Reveal from "@/components/Reveal";
import Lead from "@/components/Lead";
import SkinOrb from "@/components/home/SkinOrb";

/*
 * Straight after the hero: ordinary skin days and what the blend does
 * about each, beside a glowing orb of the six ingredients that re-mixes
 * itself for the chosen day. It cycles on its own; tap a day to pick it.
 * Shares are illustrative (demo), in cartridge order B-01..A-03.
 */
const DAYS = [
  { day: "Tight after a night with the heating on", dose: "more cream, more hyaluronic acid", mix: [0.2, 0.5, 0.9, 0.9, 0.1, 0.3] },
  { day: "Shiny by lunchtime in a humid August", dose: "more toner, a little niacinamide", mix: [0.9, 0.5, 0.12, 0.3, 0.55, 0.1] },
  { day: "Red and touchy after a windy walk", dose: "more ceramide", mix: [0.3, 0.5, 0.5, 0.3, 0.1, 0.95] },
  { day: "A normal Tuesday", dose: "mostly serum, everything near your usual", mix: [0.35, 0.95, 0.35, 0.35, 0.3, 0.3] },
];

export default function SkinRitual() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  // Cycle through the days until someone picks one.
  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % DAYS.length), 3600);
    return () => window.clearInterval(id);
  }, [held]);
  const d = DAYS[active];

  return (
    <section className="relative overflow-hidden bg-midnight" style={{ paddingBlock: "var(--s-24) var(--s-16)" }}>
      <div
        className="mx-auto grid grid-cols-1 items-center gap-y-12 md:grid-cols-12"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)", columnGap: "var(--gutter)" }}
      >
        <Reveal className="relative mx-auto aspect-square w-full max-w-[380px] md:col-span-5 md:max-w-none">
          <SkinOrb mix={d.mix} className="absolute inset-0" />
          <p
            className="absolute inset-x-0 bottom-0 text-center label text-periwinkle"
            style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
            aria-live="polite"
          >
            Today&apos;s mix · demo
          </p>
        </Reveal>

        <div className="flex flex-col gap-8 md:col-span-6 md:col-start-7">
          <Reveal className="flex flex-col gap-5">
            <h2
              className="font-display font-extralight text-white"
              style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
            >
              Your skin isn&apos;t the same two mornings in a row.
            </h2>
            <p
              className="max-w-md text-[color:var(--muted-on-dark)]"
              style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
            >
              <Lead text="Your skin changes, but your products don't. Each morning Katalyze checks your skin and mixes a fresh amount to match. You put it on like a normal moisturizer." />
            </p>
          </Reveal>
          <Reveal>
            <ul className="border-t border-[color:var(--rule-on-dark)]">
              {DAYS.map((x, i) => {
                const on = i === active;
                return (
                  <li key={x.day} className="border-b border-[color:var(--rule-on-dark)]">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setActive(i);
                        setHeld(true);
                      }}
                      className="relative grid w-full grid-cols-1 gap-1 py-4 pl-4 text-left transition-opacity duration-500 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
                      style={{ opacity: on ? 1 : 0.55 }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-3 bottom-3 w-px bg-blush transition-transform duration-500"
                        style={{ transform: `scaleY(${on ? 1 : 0})` }}
                      />
                      <span className="text-white" style={{ fontSize: "var(--text-base)" }}>
                        {x.day}
                      </span>
                      <span className="text-periwinkle sm:text-right" style={{ fontSize: "var(--text-sm)" }}>
                        {x.dose}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
