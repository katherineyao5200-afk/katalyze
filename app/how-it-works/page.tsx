import Lead from "@/components/Lead";
import type { Metadata } from "next";

import Close from "@/components/home/Close";
import FormulaLab from "@/components/home/FormulaLab";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SceneInView from "@/components/SceneInView";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Read, mix, apply, learn: how Katalyze turns a fingertip reading into a fresh, personalized dose.",
};

const STEPS = [
  {
    title: "Read",
    time: "About 3 seconds",
    body: "Rest a fingertip on the capacitive pad on top of the device. It tracks whether your skin is drier or more hydrated than your own usual. It's a relative trend over time, not a clinical value, and it doesn't measure sebum.",
    facts: ["Two-electrode pad", "Fingertip contact only", "Compared with your own baseline"],
  },
  {
    title: "Mix",
    time: "Under a minute",
    body: "The app combines that reading with local weather and a quick morning check-in. A rule-based engine picks the blend, always inside pre-set safe ranges. Six independent pumps, three for bases and three for actives, then dispense each ingredient by weight.",
    facts: ["3 base + 3 active cartridges", "Dosed by weight", "Rules set the formula, not AI"],
  },
  {
    title: "Apply",
    time: "One dose",
    body: "A single fresh dose lands in the cup. You apply it yourself, like a serum. The device never touches your skin, and nothing sits half-used in a drawer.",
    facts: ["Dispenses into a cup", "Made for one use", "You apply it yourself"],
  },
  {
    title: "Learn",
    time: "Every morning",
    body: "You log how your skin feels. That, the day's reading and the weather shape tomorrow's blend, so the formula keeps moving with your skin instead of staying the same until the bottle runs out.",
    facts: ["Daily check-in", "Local weather", "Tomorrow's blend follows the trend"],
  },
];

const NOT = [
  ["It doesn't scan your face.", "The only reading is a fingertip on a small pad."],
  ["It isn't a medical device.", "Readings are relative trends, never clinical numbers."],
  ["It never touches your skin.", "Each dose goes into a cup, and you apply it."],
  ["AI doesn't pick your formula.", "Rules within safe ranges do. AI only explains the blend in plain words."],
];

const mono = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--track-label)",
} as const;

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 flex-col bg-midnight text-white">
      <PageHero
        label="How it works"
        title={
          <>
            From one fingertip
            <br />
            to one fresh dose.
          </>
        }
        lede="Closer to a skincare printer than a subscription box. Every morning it reads, mixes and dispenses one dose made for that day's skin."
      />

      {/* The four steps, each drawn. */}
      <section style={{ paddingBlock: "var(--s-24)" }}>
        <ol
          className="mx-auto flex flex-col"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="grid grid-cols-1 items-center gap-10 border-t border-[color:var(--rule-on-dark)] py-16 md:grid-cols-12 md:gap-x-[var(--gutter)]"
            >
              <SceneInView
                step={i}
                className={`mx-auto w-full max-w-[420px] md:col-span-5 ${
                  i % 2 ? "md:order-2 md:col-start-8" : ""
                }`}
              />
              <Reveal
                className={`flex flex-col gap-5 md:col-span-6 ${
                  i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"
                }`}
              >
                <p
                  className="flex items-baseline gap-4 font-mono uppercase text-periwinkle"
                  style={mono}
                >
                  <span className="text-white">0{i + 1}</span>
                  <span>{s.time}</span>
                </p>
                <h2
                  className="font-display font-extralight"
                  style={{
                    fontSize: "var(--text-display)",
                    lineHeight: "var(--leading-display)",
                  }}
                >
                  {s.title}
                </h2>
                <p
                  className="max-w-lg text-[color:var(--muted-on-dark)]"
                  style={{
                    fontSize: "var(--text-base)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  <Lead text={s.body} />
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-[color:var(--rule-on-dark)] pt-4">
                  {s.facts.map((f) => (
                    <li
                      key={f}
                      className="text-[color:var(--muted-on-dark)]"
                      style={{ fontSize: "var(--text-sm)" }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Try the rules yourself. */}
      <FormulaLab />

      {/* What it deliberately doesn't do. */}
      <section
        className="bg-[color:var(--canvas-deep)]"
        style={{ paddingBlock: "var(--s-24)" }}
      >
        <div
          className="mx-auto grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-[var(--gutter)]"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <Reveal className="md:col-span-4">
            <h2
              className="font-display font-extralight"
              style={{
                fontSize: "var(--text-3xl)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              What it doesn&apos;t do,<span className="text-periwinkle"> on purpose.</span>
            </h2>
          </Reveal>
          <dl className="flex flex-col md:col-span-7 md:col-start-6">
            {NOT.map(([t, d]) => (
              <Reveal
                key={t}
                className="grid grid-cols-1 gap-2 border-t border-[color:var(--rule-on-dark)] py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-8"
              >
                <dt style={{ fontSize: "var(--text-lg)" }}>{t}</dt>
                <dd
                  className="text-[color:var(--muted-on-dark)]"
                  style={{
                    fontSize: "var(--text-base)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {d}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Close />
    </main>
  );
}
