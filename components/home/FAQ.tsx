import Lead from "@/components/Lead";
import Reveal from "@/components/Reveal";

// Plain answers to what a careful visitor asks before trusting a
// pre-launch product. Every answer follows the product-accuracy rules
// in CLAUDE.md.
const FAQS = [
  {
    q: "Can I buy Katalyze now?",
    a: "Not yet. Katalyze is a working prototype. The first production run will be about 2,000 units, and people on the waitlist hear about it first. Joining the waitlist is free and doesn't commit you to anything.",
  },
  {
    q: "What does the sensor actually measure?",
    a: "A capacitive pad reads your fingertip for about three seconds and tracks how your hydration changes over time. It shows relative trends, not a clinical measurement, and it doesn't measure oil or scan your face.",
  },
  {
    q: "Who decides what goes in my formula?",
    a: "A rule-based engine in the app, working only within pre-set safe ranges. It combines your reading, local weather and a short check-in. AI is used only to explain the formula in plain words, never to choose it.",
  },
  {
    q: "Does the device touch my skin?",
    a: "No. It mixes one dose into a small dish, and you scoop it out and apply it yourself.",
  },
  {
    q: "Is it regulated?",
    a: "Formulas will be made with a contract formulator in compliance with FDA cosmetic regulations. Cosmetics are regulated by the FDA, but they are not “approved” by it, so we won't claim that.",
  },
  {
    q: "Who is behind Katalyze?",
    a: "Katherine Yao, the founder, leads product, design, financial planning and supplier sourcing. She works with external partners for hardware, formulation, logistics and software.",
  },
];

export default function FAQ() {
  return (
    <section
      aria-labelledby="faq-title"
      className="bg-midnight"
      style={{ paddingBlock: "var(--s-32)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 gap-y-10"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <h2
            id="faq-title"
            className="font-display font-extralight text-white"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Questions<span className="text-periwinkle"> people ask first.</span>
          </h2>
        </Reveal>
        <div className="col-span-12 border-t border-[color:var(--rule-on-dark)] lg:col-span-7 lg:col-start-6">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group border-b border-[color:var(--rule-on-dark)]"
            >
              <summary
                className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush [&::-webkit-details-marker]:hidden"
                style={{ fontSize: "var(--text-lg)" }}
              >
                {f.q}
                <span
                  aria-hidden="true"
                  className="font-mono text-periwinkle transition-transform duration-[var(--dur-fast)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p
                className="max-w-xl pb-6 text-[color:var(--muted-on-dark)]"
                style={{
                  fontSize: "var(--text-base)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                <Lead text={f.a} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
