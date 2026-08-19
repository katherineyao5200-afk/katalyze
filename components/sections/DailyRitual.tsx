import Link from "next/link";

import Reveal from "@/components/Reveal";

const STEPS = [
  {
    title: "Read",
    description: "A capacitive pad reads your skin's hydration trends in seconds.",
  },
  {
    title: "Mix",
    description: "Three base formulas and three actives blend to today's ratio.",
  },
  {
    title: "Apply",
    description: "Your dose pours into the cup. You apply it yourself.",
  },
  {
    title: "Learn",
    description: "Each entry sharpens tomorrow's blend.",
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-near-black rounded-sm";

export default function DailyRitual() {
  return (
    <section className="bg-near-black px-6 py-24">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
        <h2 className="font-display font-extralight text-h2 text-cream">
          The daily ritual.
        </h2>

        <p className="max-w-xl font-sans text-body-lg text-cream">
          You rest a finger on the pad. It reads your skin in three seconds.
          Today&apos;s blend appears on your phone — a little more hydration,
          it&apos;s dry out. You tap once. It mixes. You collect the dose and
          go.
        </p>

        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.title} className="flex flex-col items-center gap-2">
              <h3 className="font-display font-extrabold text-h4 text-periwinkle">
                {step.title}
              </h3>
              <p className="font-sans text-body text-cream">{step.description}</p>
            </div>
          ))}
        </div>

        <Link
          href="/how-it-works"
          className={`inline-flex min-h-11 items-center py-2 font-sans text-body text-blush transition-colors duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:text-cream ${focusRing}`}
        >
          Learn how it works →
        </Link>
      </Reveal>
    </section>
  );
}
