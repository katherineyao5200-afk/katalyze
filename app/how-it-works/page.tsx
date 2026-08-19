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
    <main className="flex flex-1 flex-col bg-near-black">
      <section className="px-6 py-24 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h1 className="font-display font-extralight text-h1 text-cream">
            How Katalyze works.
          </h1>
          <p className="font-display font-extralight italic text-body-lg text-periwinkle">
            Not a quiz. A conversation.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col items-start gap-2 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="font-sans text-eyebrow text-periwinkle sm:w-8">
                0{i + 1}
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-extrabold text-h3 text-cream">
                  {step.title}
                </h2>
                <p className="max-w-xl font-sans text-body-lg text-cream">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="font-display font-extralight text-h2 text-cream">
            Rule-based, on purpose.
          </h2>
          <p className="font-sans text-body-lg text-cream">
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
