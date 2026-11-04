"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";

import { STEP_VISUALS } from "@/components/StepVisuals";

export type Step = {
  title: string;
  time: string;
  body: string;
  facts: string[];
};

/*
 * How it works as a held scene: a close-up for each step on one side
 * (the pad, the app's blend, the dish, the check-in) swings in and out in
 * 3D, while the steps sit in a deck of glass cards on the other. Scrolling deals the top card off
 * and the next one rises into place. Reduced motion gets the cards as a
 * plain list.
 */
export default function StepDeck({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion();
  if (reduce) return <StaticSteps steps={steps} />;
  return <Deck steps={steps} />;
}

function Deck({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLElement>(null);
  const n = steps.length;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Card position: 0..n-1, holding on each card before moving on.
  const deck = useTransform(scrollYProgress, (p) => {
    const x = Math.min(n - 1e-4, Math.max(0, p * n));
    const i = Math.floor(x);
    const f = x - i;
    if (i >= n - 1) return n - 1;
    return i + Math.min(1, Math.max(0, (f - 0.55) / 0.45));
  });
  const dots = useTransform(deck, (d) => Math.round(d));

  return (
    <section
      ref={ref}
      aria-label="The four steps"
      className="relative"
      style={{ height: `${n * 110}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 72% 50%, rgb(49 63 121 / 0.6), transparent 70%)",
          }}
        />
        <div
          className="relative mx-auto grid h-full w-full grid-cols-1 grid-rows-[40%_60%] md:grid-cols-12 md:grid-rows-1 md:items-center"
          style={{
            maxWidth: "var(--max-w)",
            paddingInline: "var(--margin)",
            columnGap: "var(--gutter)",
          }}
        >
          {/* The close-ups */}
          <div className="relative row-start-1 h-full pt-16 pb-2 [perspective:1600px] md:col-span-6 md:col-start-7 md:h-[80%] md:py-0">
            {steps.map((s, i) => (
              <Visual key={s.title} index={i} deck={deck} />
            ))}
          </div>

          {/* The deck */}
          <div className="relative row-start-2 h-full [perspective:1400px] md:col-span-5 md:col-start-1 md:row-start-1 md:h-[460px]">
            {steps.map((s, i) => (
              <Card key={s.title} step={s} index={i} deck={deck} n={n} />
            ))}
            <Dots n={n} at={dots} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Visual({ index, deck }: { index: number; deck: MotionValue<number> }) {
  const rel = useTransform(deck, (d) => d - index);
  const rotateY = useTransform(rel, (r) => Math.max(-1, Math.min(1, r)) * -38);
  const rotateX = useTransform(rel, (r) => 6 - Math.abs(Math.max(-1, Math.min(1, r))) * 4);
  const x = useTransform(rel, (r) => `${Math.max(-1, Math.min(1, r)) * -30}%`);
  const z = useTransform(rel, (r) => Math.abs(Math.max(-1, Math.min(1, r))) * -260);
  const opacity = useTransform(rel, (r) => Math.max(0, 1 - Math.abs(r) * 1.6));
  const V = STEP_VISUALS[index] ?? STEP_VISUALS[0];
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
      style={{ rotateY, rotateX, x, z, opacity }}
    >
      <div className="step-float h-full w-full">
        <V />
      </div>
    </motion.div>
  );
}

function Card({
  step,
  index,
  deck,
  n,
}: {
  step: Step;
  index: number;
  deck: MotionValue<number>;
  n: number;
}) {
  // rel < 0: still in the pile; 0: on top; > 0: being dealt away.
  const rel = useTransform(deck, (d) => d - index);
  const y = useTransform(rel, (r) => (r < 0 ? Math.min(-r, 3) * -22 : r * -60));
  const x = useTransform(rel, (r) => (r > 0 ? r * -140 : 0));
  const scale = useTransform(rel, (r) =>
    r < 0 ? 1 - Math.min(-r, 3) * 0.06 : 1 - r * 0.04,
  );
  const rotateZ = useTransform(rel, (r) => (r > 0 ? r * -9 : Math.min(-r, 3) * 1.2));
  const rotateX = useTransform(rel, (r) => (r > 0 ? r * 18 : 0));
  const opacity = useTransform(rel, (r) =>
    r > 0 ? Math.max(0, 1 - r * 1.4) : r < -2.6 ? 0 : 1 - Math.min(-r, 3) * 0.18,
  );
  const blur = useTransform(rel, (r) =>
    r < 0 ? `blur(${Math.min(-r, 3) * 1.2}px)` : "blur(0px)",
  );
  const pointer = useTransform(rel, (r) => (Math.abs(r) < 0.5 ? "auto" : "none"));

  return (
    <motion.article
      className="glass absolute inset-x-0 top-6 flex flex-col gap-4 rounded-[28px] p-6 md:top-0 md:gap-5 md:p-9"
      style={{
        y,
        x,
        scale,
        rotateZ,
        rotateX,
        opacity,
        filter: blur,
        zIndex: n - index,
        pointerEvents: pointer,
        transformOrigin: "50% 100%",
        background:
          "linear-gradient(160deg, rgb(52 66 124), rgb(31 36 65))",
      }}
    >
      <p
        className="flex items-baseline justify-between label text-periwinkle"
        style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
      >
        <span className="text-white">
          0{index + 1} / 0{n}
        </span>
        <span>{step.time}</span>
      </p>
      <h2
        className="focal font-display font-extralight text-white"
        style={{ fontSize: "clamp(44px, 5vw, 80px)", lineHeight: 0.95 }}
      >
        {step.title}
      </h2>
      <p
        className="text-white/80 [font-size:var(--text-sm)] md:[font-size:var(--text-base)]"
        style={{ lineHeight: "var(--leading-body)" }}
      >
        {step.body}
      </p>
      <ul className="mt-auto hidden flex-wrap gap-2 sm:flex">
        {step.facts.map((f) => (
          <li
            key={f}
            className="rounded-full border border-white/15 px-3 py-1 text-white/75"
            style={{ fontSize: "var(--text-xs)" }}
          >
            {f}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

function Dots({ n, at }: { n: number; at: MotionValue<number> }) {
  const [i, setI] = useState(0);
  useMotionValueEvent(at, "change", (v) => setI(v));
  return (
    <div
      aria-hidden="true"
      className="absolute -bottom-8 left-0 hidden gap-2 md:flex"
    >
      {Array.from({ length: n }, (_, k) => (
        <span
          key={k}
          className={`h-1 rounded-full transition-all duration-500 ${
            k === i ? "w-8 bg-white" : "w-3 bg-white/25"
          }`}
        />
      ))}
    </div>
  );
}

function StaticSteps({ steps }: { steps: Step[] }) {
  return (
    <section style={{ paddingBlock: "var(--s-24)" }}>
      <ol
        className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        {steps.map((s, i) => (
          <li key={s.title} className="glass flex flex-col gap-4 rounded-[28px] p-8">
            <p
              className="flex justify-between label text-periwinkle"
              style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
            >
              <span className="text-white">0{i + 1}</span>
              <span>{s.time}</span>
            </p>
            <h2
              className="font-display font-extralight"
              style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}
            >
              {s.title}
            </h2>
            <p
              className="text-white/80"
              style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
            >
              {s.body}
            </p>
            <ul className="flex flex-wrap gap-2">
              {s.facts.map((f) => (
                <li
                  key={f}
                  className="rounded-full border border-white/15 px-3 py-1 text-white/75"
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
