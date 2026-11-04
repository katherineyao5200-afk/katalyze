"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Chip from "@/components/home/Chip";
import Process from "@/components/home/Process";
import { SHAPES } from "@/components/home/ParticleSculpture";
import Lead from "@/components/Lead";

const ParticleSculpture = dynamic(
  () => import("@/components/home/ParticleSculpture"),
  { ssr: false },
);

/*
 * How it works, as one continuous scene (after emotion-agency.com): the
 * screen holds while you scroll, a sculpture of points of light changes
 * form for each step, and one headline at a time passes over it. Each
 * headline arrives out of a blur and leaves with a soft colour split.
 * Reduced motion gets the plain step-by-step section instead.
 */

type Chapter = {
  chip: string;
  title: [string, string];
  body: string;
  side: "left" | "right";
};

const CHAPTERS: Chapter[] = [
  {
    chip: "How it works",
    title: ["A morning", "with Katalyze."],
    body: "About a minute each morning. Most of it is the machine mixing while you brush your teeth.",
    side: "left",
  },
  {
    chip: "01 · Read",
    title: ["Touch the", "sensor pad."],
    body: "Touch the pad for three seconds. It checks if your skin is drier or less dry than normal for you.",
    side: "right",
  },
  {
    chip: "02 · Mix",
    title: ["It works out", "today's blend."],
    body: "The app picks the mix. It uses your reading, the weather and a quick question about how your skin feels. Every amount stays within safe limits.",
    side: "left",
  },
  {
    chip: "03 · Apply",
    title: ["Scoop it", "from the dish."],
    body: "One dose lands in a small dish. Scoop it with a fingertip and put it on like a moisturizer. The machine never touches your face.",
    side: "right",
  },
  {
    chip: "04 · Learn",
    title: ["Tomorrow starts", "from today."],
    body: "It keeps track. Each reading is saved, so over a few weeks the mix follows your skin's pattern.",
    side: "left",
  },
];

const N = CHAPTERS.length;

function useIsSmall() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 767px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return small;
}

export default function Journey() {
  const reduce = useReducedMotion();
  if (reduce) return <Process />;
  return <Scene />;
}

function Scene() {
  const small = useIsSmall();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Which form the points hold: each chapter holds its form for most of
  // its stretch of scroll, then they travel to the next.
  const morph = useTransform(scrollYProgress, (p) => {
    const x = Math.min(N - 1e-4, Math.max(0, p * N));
    const i = Math.floor(x);
    const f = x - i;
    if (i >= SHAPES - 1) return SHAPES - 1;
    const t = Math.min(1, Math.max(0, (f - 0.62) / 0.38));
    return i + t;
  });
  // Where the form sits: opposite the text, or above it on phones.
  const offset = useTransform(morph, (m) => {
    if (small) return [0, 1.7, 0.6];
    const i = Math.floor(m);
    const f = m - i;
    const side = (k: number) =>
      CHAPTERS[Math.min(k, N - 1)].side === "left" ? 2.3 : -2.3;
    const e = f * f * (3 - 2 * f);
    return [side(i) + (side(i + 1) - side(i)) * e, 0, 1];
  });

  return (
    <section
      ref={ref}
      aria-labelledby="journey-title"
      className="relative bg-[color:var(--canvas-deep)] text-white"
      style={{ height: `${N * 120}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 45%, rgb(49 63 121 / 0.55), transparent 70%)",
          }}
        />
        <ParticleSculpture
          morph={morph}
          offset={offset}
          className="absolute inset-0"
        />
        <div aria-hidden="true" className="grain absolute inset-0" />

        {CHAPTERS.map((c, i) => (
          <ChapterText
            key={c.chip}
            chapter={c}
            index={i}
            progress={scrollYProgress}
            small={small}
          />
        ))}
      </div>
    </section>
  );
}

function ChapterText({
  chapter,
  index,
  progress,
  small,
}: {
  chapter: Chapter;
  index: number;
  progress: MotionValue<number>;
  small: boolean;
}) {
  const a = index / N;
  const b = (index + 1) / N;
  const span = b - a;
  const first = index === 0;
  const last = index === N - 1;
  // in: 0 -> 1 as it arrives; out: 0 -> 1 as it leaves
  const inV = useTransform(progress, [a - span * 0.05, a + span * 0.18], [first ? 1 : 0, 1]);
  const outV = useTransform(progress, [a + span * 0.6, a + span * 0.9], [0, last ? 0 : 1]);
  const opacity = useTransform(
    [inV, outV] as MotionValue<number>[],
    ([i, o]: number[]) => i * (1 - o),
  );
  const y = useTransform(
    [inV, outV] as MotionValue<number>[],
    ([i, o]: number[]) => (1 - i) * 60 - o * 50,
  );
  const blur = useTransform(
    [inV, outV] as MotionValue<number>[],
    ([i, o]: number[]) => `blur(${(1 - i) * 12 + o * 6}px)`,
  );
  const split = useTransform(outV, (o) => `${o * 10}px`);
  const skew = useTransform(outV, (o) => `${o * -6}deg`);
  const pointer = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  const Heading = first ? "h2" : "h3";
  const right = chapter.side === "right" && !small;

  return (
    <motion.div
      className={`absolute inset-x-0 mx-auto flex ${
        small ? "bottom-[15svh]" : "top-1/2 -translate-y-1/2"
      } ${right ? "justify-end" : "justify-start"}`}
      style={{
        maxWidth: "var(--max-w)",
        paddingInline: "var(--margin)",
        opacity,
        pointerEvents: pointer,
      }}
    >
      <motion.div
        className="chroma flex max-w-xl flex-col gap-5"
        style={
          {
            y,
            filter: blur,
            skewX: skew,
            "--split": split,
          } as unknown as React.CSSProperties
        }
      >
        <Chip>{chapter.chip}</Chip>
        <Heading
          id={first ? "journey-title" : undefined}
          className="focal font-display font-extralight"
          style={{
            fontSize: small ? "clamp(40px, 11vw, 56px)" : "clamp(56px, 6.4vw, 104px)",
            lineHeight: 0.98,
            letterSpacing: "-0.01em",
          }}
        >
          {chapter.title[0]}
          <br />
          <span className="italic text-periwinkle">{chapter.title[1]}</span>
        </Heading>
        <p
          className="max-w-md text-white/75"
          style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
        >
          <Lead text={chapter.body} />
        </p>
        {index === N - 1 && (
          <Link
            href="/how-it-works"
            className="glass mt-2 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-white"
            style={{ fontSize: "var(--text-sm)" }}
          >
            See every step <span aria-hidden="true" className="btn-arrow">→</span>
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
