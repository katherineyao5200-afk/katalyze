import Link from "next/link";

import Reveal from "@/components/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Read",
    description: "A capacitive pad reads your skin's hydration trends in seconds.",
    titleSize: "var(--text-lg)",
  },
  {
    n: "02",
    title: "Mix",
    description: "Three base formulas and three actives blend to today's ratio.",
    titleSize: "var(--text-xl)",
  },
  {
    n: "03",
    title: "Apply",
    description: "Your dose pours into the cup. You apply it yourself.",
    titleSize: "var(--text-display)",
  },
  {
    n: "04",
    title: "Learn",
    description: "Each entry sharpens tomorrow's blend.",
    titleSize: "var(--text-lg)",
  },
] as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm";

// Layout device: numbered technical sequence, asymmetric (§6 row 04).
// Step 03 (Apply) is the emotional peak — largest by a wide margin, not
// an equal card in a grid.
export default function HowItWorks() {
  return (
    <section className="bg-midnight" style={{ paddingBlock: "var(--s-32)" }}>
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <Reveal
          className="flex flex-col"
          style={{ gap: "var(--s-6)", maxWidth: "var(--measure)" }}
        >
          <h2
            className="font-display font-extralight text-white"
            style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
          >
            The daily ritual.
          </h2>
          <p
            className="text-white/70"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            You rest a finger on the pad. It reads your skin in three
            seconds. Today&apos;s blend appears on your phone — a little more
            hydration, it&apos;s dry out. You tap once. It mixes. You collect
            the dose and go.
          </p>
        </Reveal>

        <div
          className="flex flex-col divide-y divide-[color:var(--rule-on-dark)]"
          style={{ marginTop: "var(--s-24)" }}
        >
          {STEPS.map((step, i) => (
            <Reveal
              key={step.n}
              delayMs={i * 80}
              className="flex items-baseline gap-6 py-6 first:pt-0 last:pb-0"
            >
              <span
                className="font-mono text-periwinkle"
                style={{ fontSize: "var(--text-xs)", minWidth: "2.5ch" }}
              >
                {step.n}
              </span>
              <div className="flex flex-col gap-1">
                <h3
                  className="font-display font-extrabold text-white"
                  style={{ fontSize: step.titleSize, lineHeight: "var(--leading-tight)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/70"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Link
          href="/how-it-works"
          className={`inline-flex min-h-11 items-center py-2 text-blush transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:text-white ${focusRing}`}
          style={{ marginTop: "var(--s-8)", fontSize: "var(--text-base)" }}
        >
          Learn how it works →
        </Link>
      </div>
    </section>
  );
}
