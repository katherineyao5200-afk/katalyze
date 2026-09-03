import type { Metadata } from "next";

import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Katalyze pricing: a one-time device purchase plus three subscription tiers for cartridge replenishment.",
};

const TIERS = [
  {
    name: "Machine Purchase",
    price: "$279",
    cadence: "one-time",
    bestFor: null,
    description:
      "Katalyze device + one starter cartridge set based on initial skin screening.",
  },
  {
    name: "Basic Subscription",
    price: "$25",
    cadence: "/month",
    bestFor: "Best for price-conscious, single users",
    description: "Replenish only the actives running low.",
  },
  {
    name: "Full Subscription",
    price: "$45",
    cadence: "/month",
    bestFor: "Best for daily, all-active routines",
    description: "Automatic full replenishment across all actives.",
  },
  {
    name: "Premium Subscription",
    price: "$89",
    cadence: "/month",
    bestFor: "Best for advanced routines & multi-user households",
    description:
      "Full replenishment, priority access to advanced formulations, multi-user profiles, and expedited shipping.",
  },
];

const FAQS = [
  {
    question: "Is it safe?",
    answer:
      "Every formula is generated within pre-set safe ranges by a rule-based engine — not open-ended guessing. Our AI writes the plain-language explanation of your blend; it never decides the formula itself. The device never touches your skin: your dose pours into a cup, and you apply it yourself, like a serum.",
  },
  {
    question: "Does it measure sebum, or give a clinical-grade reading?",
    answer:
      "No. The capacitive pad gives a relative hydration trend over time — not a clinically calibrated absolute value, and not a sebum reading. Think of it as a screening tool that gets more useful the longer you use it, not a diagnostic device.",
  },
  {
    question: "How does refilling work?",
    answer:
      "Six independent channels — three base formulas, three actives — run low at different rates depending on your routine. Basic replenishes just the actives running low; Full replenishes everything automatically; Premium adds priority access to new formulations, multi-user profiles, and expedited shipping.",
  },
  {
    question: "When will it ship?",
    answer:
      "We're targeting a first production run of about 2,000 units. Exact ship windows go to the waitlist first, before anywhere else — that's the whole reason to join now instead of waiting for a public launch.",
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col bg-midnight">
      <section style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-24)" }}>
        <div className="mx-auto flex flex-col gap-3" style={{ maxWidth: "var(--max-w)" }}>
          <h1
            className="font-display font-extralight text-white"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Pricing.
          </h1>
          <p
            className="max-w-lg text-white/70"
            style={{ fontSize: "var(--text-lg)" }}
          >
            One device. Three ways to keep it stocked.
          </p>
          <p
            className="max-w-lg text-white/60"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}
          >
            You&apos;re probably already spending $20–50 a month on skincare.
            This isn&apos;t new spend — it&apos;s a swap. And because each
            dose is mixed fresh for one use, nothing sits half-used in a
            drawer.
          </p>
        </div>
      </section>

      <section style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-16)" }}>
        <div
          className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          style={{ maxWidth: "var(--max-w)" }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col gap-4 border border-[color:var(--rule-on-dark)] p-6"
              style={{ borderRadius: "var(--r-lg)", backgroundColor: "var(--panel)" }}
            >
              <h2
                className="font-display font-extrabold text-white"
                style={{ fontSize: "var(--text-lg)" }}
              >
                {tier.name}
              </h2>

              {tier.bestFor ? (
                <p
                  className="font-display italic font-extralight text-periwinkle"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {tier.bestFor}
                </p>
              ) : null}

              <p className="text-white/70" style={{ fontSize: "var(--text-sm)" }}>
                {tier.description}
              </p>

              <p
                className="mt-auto font-display font-extrabold text-white"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {tier.price}
                <span
                  className="font-sans font-normal text-periwinkle"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {tier.cadence === "one-time" ? " one-time" : tier.cadence}
                </span>
              </p>

              <a
                href="#pricing-waitlist"
                className={`bg-white px-6 py-3 text-center font-medium text-midnight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:bg-white/85 ${focusRing}`}
                style={{ borderRadius: "var(--r-md)", fontSize: "var(--text-base)" }}
              >
                Join the waitlist
              </a>
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-16)" }}>
        <div
          className="mx-auto flex flex-col"
          style={{ maxWidth: "var(--measure)" }}
        >
          <h2
            className="font-display font-extralight text-white"
            style={{
              fontSize: "var(--text-xl)",
              lineHeight: "var(--leading-tight)",
              marginBottom: "var(--s-6)",
            }}
          >
            Questions before you join.
          </h2>
          <div className="flex flex-col divide-y divide-[color:var(--rule-on-dark)]">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group py-5 first:pt-0 last:pb-0">
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between gap-4 text-white ${focusRing}`}
                  style={{ fontSize: "var(--text-base)" }}
                >
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-periwinkle transition-transform duration-[var(--dur-fast)] ease-[var(--ease-soft)] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p
                  className="text-white/70"
                  style={{
                    marginTop: "var(--s-3)",
                    fontSize: "var(--text-sm)",
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

      <section
        id="pricing-waitlist"
        style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-24)" }}
      >
        <div
          className="mx-auto flex flex-col gap-4"
          style={{ maxWidth: "var(--measure)" }}
        >
          <p className="text-white/70" style={{ fontSize: "var(--text-base)" }}>
            Early pricing may still refine slightly before launch — we&apos;ll
            tell our waitlist first either way.
          </p>
          <WaitlistForm
            source="pricing"
            trackVisibility
            className="w-full max-w-md"
          />
        </div>
      </section>
    </main>
  );
}
