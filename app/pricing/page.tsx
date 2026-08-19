import type { Metadata } from "next";

import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Pricing | Katalyze",
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

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 focus-visible:ring-offset-blush";

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col bg-near-black">
      <section className="px-6 py-24 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h1 className="font-display font-extralight text-h1 text-cream">
            Pricing.
          </h1>
          <p className="max-w-lg font-sans text-body-lg text-cream">
            One device. Three ways to keep it stocked.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col gap-4 rounded-2xl border border-periwinkle/20 bg-navy-900 p-6"
            >
              <h2 className="font-display font-extrabold text-h4 text-cream">
                {tier.name}
              </h2>

              {tier.bestFor ? (
                <p className="font-display italic font-extralight text-body text-periwinkle">
                  {tier.bestFor}
                </p>
              ) : null}

              <p className="font-sans text-body text-cream">{tier.description}</p>

              <p className="mt-auto font-display font-extrabold text-h3 text-cream">
                {tier.price}
                <span className="font-sans text-body font-normal text-periwinkle">
                  {tier.cadence === "one-time" ? " one-time" : tier.cadence}
                </span>
              </p>

              <a
                href="#pricing-waitlist"
                className={`rounded-full bg-blush px-6 py-3 text-center font-sans text-body font-medium text-navy-900 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-[1.03] ${focusRing}`}
              >
                Join the waitlist
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing-waitlist" className="px-6 pb-24">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <p className="font-sans text-body text-cream">
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
