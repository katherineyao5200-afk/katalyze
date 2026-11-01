import type { Metadata } from "next";

import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Sparkle from "@/components/Sparkle";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Planned Katalyze pricing: a one-time device purchase plus three subscription plans for cartridge refills.",
};

const PLANS = [
  { name: "Basic", price: "$25", note: "For price-conscious, single users" },
  { name: "Full", price: "$45", note: "For daily, all-active routines" },
  {
    name: "Premium",
    price: "$89",
    note: "For advanced routines and multi-user households",
  },
];

// Which plan includes what: [Basic, Full, Premium].
const FEATURES: [string, boolean, boolean, boolean][] = [
  ["Refills for the actives running low", true, true, true],
  ["Automatic full refills across all actives", false, true, true],
  ["Priority access to advanced formulations", false, false, true],
  ["Multi-user profiles", false, false, true],
  ["Expedited shipping", false, false, true],
];

const FAQS = [
  {
    question: "Is it safe?",
    answer:
      "Every formula is set by a rule-based engine inside pre-set safe ranges, not open-ended guessing. AI only writes the plain-language explanation of your blend; it never decides the formula. The device never touches your skin: your dose goes into a cup, and you apply it yourself, like a serum.",
  },
  {
    question: "Does it measure sebum, or give a clinical-grade reading?",
    answer:
      "No. The capacitive pad gives a relative hydration trend over time, not a clinically calibrated value and not a sebum reading. It gets more useful the longer you use it, and it isn't a diagnostic device.",
  },
  {
    question: "How do refills work?",
    answer:
      "The six cartridges, three base and three active, run low at different rates depending on your routine. Basic refills just the actives running low. Full refills everything automatically. Premium adds priority access to new formulations, multi-user profiles and expedited shipping.",
  },
  {
    question: "When will it ship?",
    answer:
      "The first production run is planned at about 2,000 units. Ship windows go to the waitlist first, before anywhere else.",
  },
];

const mono = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--track-label)",
} as const;

function Mark({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex justify-center text-blush">
      <Sparkle size={12} />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="inline-flex justify-center text-[color:var(--faint-on-dark)]">
      <span aria-hidden="true">–</span>
      <span className="sr-only">Not included</span>
    </span>
  );
}

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col bg-midnight text-white">
      <PageHero
        label="Planned pricing"
        title={
          <>
            One device.
            <br />
            Three ways to keep it stocked.
          </>
        }
        lede="You're probably already spending $20 to $50 a month on skincare. This is a swap, not new spend. And because each dose is mixed fresh for one use, nothing sits half-used in a drawer."
      />

      {/* The device, then the plans as one comparison. */}
      <section style={{ paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-x-[var(--gutter)]"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <Reveal className="flex flex-col gap-6 lg:col-span-4">
            <p className="font-mono uppercase text-periwinkle" style={mono}>
              The device · one-time
            </p>
            <p
              className="font-display font-extralight"
              style={{ fontSize: "clamp(72px, 10vw, 148px)", lineHeight: 0.9 }}
            >
              $279
            </p>
            <p
              className="max-w-sm text-white/75"
              style={{
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-body)",
              }}
            >
              The Katalyze device and one starter set of six cartridges, chosen
              from your first skin reading and setup questions.
            </p>
            <a
              href="#pricing-waitlist"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-blush px-6 py-3 font-medium text-midnight transition-opacity hover:opacity-90"
              style={{ fontSize: "var(--text-sm)" }}
            >
              Join the waitlist <span aria-hidden="true">→</span>
            </a>
          </Reveal>

          {/* Phones: one block per plan. */}
          <ul className="flex flex-col gap-4 md:hidden">
            {PLANS.map((p, i) => (
              <li
                key={p.name}
                className="border border-[color:var(--rule-on-dark)] bg-[color:var(--canvas-deep)] p-6"
                style={{ borderRadius: "var(--r-lg)" }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span style={{ fontSize: "var(--text-base)" }}>{p.name}</span>
                  <span
                    className="font-display font-extralight"
                    style={{ fontSize: "var(--text-2xl)", lineHeight: 1 }}
                  >
                    {p.price}
                    <span
                      className="font-sans text-periwinkle"
                      style={{ fontSize: "var(--text-xs)" }}
                    >
                      /mo
                    </span>
                  </span>
                </div>
                <p
                  className="mt-1 text-[color:var(--muted-on-dark)]"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {p.note}
                </p>
                <ul className="mt-4 flex flex-col gap-2 border-t border-[color:var(--rule-on-dark)] pt-4">
                  {FEATURES.filter((f) => f[i + 1]).map(([f]) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-white/80"
                      style={{ fontSize: "var(--text-sm)" }}
                    >
                      <span className="mt-1 text-blush">
                        <Sparkle size={10} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <Reveal
            variant="fade"
            className="spot hidden overflow-hidden border md:block border-[color:var(--rule-on-dark)] bg-[color:var(--canvas-deep)] lg:col-span-8"
            style={{ borderRadius: "var(--r-lg)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <caption className="sr-only">
                  Planned monthly refill plans and what each includes
                </caption>
                <thead>
                  <tr className="border-b border-[color:var(--rule-on-dark)]">
                    <th
                      scope="col"
                      className="p-6 align-bottom font-mono font-normal uppercase text-periwinkle"
                      style={mono}
                    >
                      Refill plans · monthly
                    </th>
                    {PLANS.map((p) => (
                      <th
                        key={p.name}
                        scope="col"
                        className="w-[22%] p-6 align-bottom font-normal"
                      >
                        <span
                          className="block text-white/80"
                          style={{ fontSize: "var(--text-sm)" }}
                        >
                          {p.name}
                        </span>
                        <span
                          className="block font-display font-extralight"
                          style={{
                            fontSize: "var(--text-2xl)",
                            lineHeight: 1.1,
                          }}
                        >
                          {p.price}
                          <span
                            className="font-sans text-periwinkle"
                            style={{ fontSize: "var(--text-xs)" }}
                          >
                            /mo
                          </span>
                        </span>
                        <span
                          className="mt-2 block text-[color:var(--muted-on-dark)]"
                          style={{
                            fontSize: "var(--text-xs)",
                            lineHeight: 1.4,
                          }}
                        >
                          {p.note}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map(([f, ...on]) => (
                    <tr
                      key={f}
                      className="border-b border-[color:var(--rule-on-dark)] last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-normal text-white/80"
                        style={{ fontSize: "var(--text-sm)" }}
                      >
                        {f}
                      </th>
                      {on.map((v, i) => (
                        <td key={i} className="px-6 py-4 text-center">
                          <Mark on={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
        <p
          className="mx-auto mt-8 text-[color:var(--faint-on-dark)]"
          style={{
            maxWidth: "var(--max-w)",
            paddingInline: "var(--margin)",
            fontSize: "var(--text-xs)",
          }}
        >
          Planned pricing. Katalyze isn&apos;t for sale yet, and prices may
          still change before launch. The waitlist hears first either way.
        </p>
      </section>

      {/* Questions. */}
      <section
        className="bg-[color:var(--canvas-deep)]"
        style={{ paddingBlock: "var(--s-24)" }}
      >
        <div
          className="mx-auto grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-[var(--gutter)]"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <h2
            className="font-display font-extralight md:col-span-4"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Questions before you join.
          </h2>
          <div className="flex flex-col md:col-span-7 md:col-start-6">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-[color:var(--rule-on-dark)] py-6"
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush"
                  style={{ fontSize: "var(--text-lg)" }}
                >
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-blush transition-transform duration-[var(--dur-fast)] ease-[var(--ease-soft)] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p
                  className="max-w-xl text-[color:var(--muted-on-dark)]"
                  style={{
                    marginTop: "var(--s-3)",
                    fontSize: "var(--text-base)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Join. */}
      <section
        id="pricing-waitlist"
        className="relative overflow-hidden"
        style={{ paddingBlock: "var(--s-32)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 100%, color-mix(in oklab, var(--indigo) 70%, transparent), transparent)",
          }}
        />
        <Reveal
          className="relative mx-auto flex flex-col items-center gap-6 text-center"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <h2
            className="max-w-3xl font-display font-extralight"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            The first run is about 2,000 units.
          </h2>
          <p
            className="max-w-md text-[color:var(--muted-on-dark)]"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Join the waitlist to hear first when pricing is final and when
            ship windows open.
          </p>
          <WaitlistForm
            source="pricing"
            trackVisibility
            className="w-full max-w-md"
          />
        </Reveal>
      </section>
    </main>
  );
}
