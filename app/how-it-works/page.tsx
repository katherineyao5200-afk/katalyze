import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Read, mix, apply, learn — how Katalyze turns a fingertip reading into a fresh, personalized dose.",
};

const STEPS = [
  {
    title: "Read",
    description:
      "A capacitive pad reads your skin's relative hydration — trends over time, not a clinically calibrated absolute value. We never claim clinical precision, and we don't measure sebum.",
  },
  {
    title: "Mix",
    description:
      "Six independent channels — three base formulas, three actives — dispense by weight, then mix.",
  },
  {
    title: "Apply",
    description:
      "One dose, made for one use. It pours into a cup, and you apply it yourself, like a serum. The device never touches your skin.",
  },
  {
    title: "Learn",
    description:
      "You log how your skin feels. That, plus local weather, shapes tomorrow's blend.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 flex-col bg-midnight">
      <section style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto flex flex-col gap-3"
          style={{ maxWidth: "var(--max-w)" }}
        >
          <h1
            className="font-display font-extralight text-white"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            How Katalyze works.
          </h1>
          <p
            className="font-display font-extralight italic text-periwinkle"
            style={{ fontSize: "var(--text-lg)" }}
          >
            Not a quiz. A conversation.
          </p>
        </div>
      </section>

      <section style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-16)" }}>
        <div
          className="mx-auto flex flex-col divide-y divide-[color:var(--rule-on-dark)]"
          style={{ maxWidth: "var(--max-w)" }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col gap-2 py-8 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span
                className="font-mono text-periwinkle"
                style={{ fontSize: "var(--text-xs)", minWidth: "2.5ch" }}
              >
                0{i + 1}
              </span>
              <div className="flex flex-col gap-2">
                <h2
                  className="font-display font-extrabold text-white"
                  style={{ fontSize: "var(--text-2xl)" }}
                >
                  {step.title}
                </h2>
                <p
                  className="max-w-xl text-white/70"
                  style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-indigo" style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto flex flex-col gap-4"
          style={{ maxWidth: "var(--measure)" }}
        >
          <h2
            className="font-display font-extralight text-white"
            style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
          >
            Rule-based, on purpose.
          </h2>
          <p
            className="text-white/80"
            style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" }}
          >
            Every formula is generated within pre-set safe ranges — not
            open-ended guessing. Our AI writes the plain-language explanation
            of your blend; it never decides the formula itself. That
            boundary is a deliberate safety choice, not a limitation.
          </p>
        </div>
      </section>
    </main>
  );
}
