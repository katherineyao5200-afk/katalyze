import Chip from "@/components/home/Chip";
import Reveal from "@/components/Reveal";

// Planned launch pricing, from the pitch deck (v9, Sep 2026, pp. 20-21).
// Nothing is for sale yet: every number here is labelled as planned.
// The deck's "hydration/sebum" dashboard row is written as hydration
// only, because the sensor does not measure sebum (CLAUDE.md).
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 25,
    fit: "For one person on a budget",
    summary: "Refills only the actives running low.",
  },
  {
    id: "full",
    name: "Full",
    price: 45,
    fit: "For a daily routine using every active",
    summary: "Automatic refills across all six cartridges.",
    featured: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 89,
    fit: "For advanced routines and shared households",
    summary:
      "Everything in Full, plus premium ingredients and several user profiles.",
  },
] as const;

const FEATURES: { label: string; tiers: [boolean, boolean, boolean] }[] = [
  { label: "Daily formula, mixed fresh", tiers: [true, true, true] },
  { label: "Manual formula logging", tiers: [true, true, true] },
  { label: "Low-cartridge alerts", tiers: [true, true, true] },
  { label: "Hydration trend dashboard", tiers: [false, true, true] },
  { label: "Weather-adjusted formula", tiers: [false, true, true] },
  { label: "Priority refill shipping", tiers: [false, true, true] },
  { label: "All standard ingredients", tiers: [false, true, true] },
  { label: "Upgraded premium ingredients", tiers: [false, false, true] },
];

function Check({ on }: { on: boolean }) {
  return on ? (
    <span className="text-white">
      <span aria-hidden="true">●</span>
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="text-[color:var(--faint-on-dark)]">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not included</span>
    </span>
  );
}

// Reference: sharplink's data card and numbered chips. One device price,
// three refill plans, and the full comparison underneath.
export default function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="column-rules relative overflow-x-clip bg-midnight"
      style={{ paddingBlock: "var(--s-32)" }}
    >
      <div
        className="relative mx-auto flex flex-col gap-16"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <Reveal
          className="grid grid-cols-12 gap-y-6"
          style={{ columnGap: "var(--gutter)" }}
        >
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-6">
            <Chip>Planned pricing</Chip>
            <h2
              id="pricing-title"
              className="font-display font-extralight text-white"
              style={{
                fontSize: "var(--text-3xl)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              One device.<span className="text-periwinkle"> Refills that match how you use it.</span>
            </h2>
          </div>
          <p
            className="col-span-12 max-w-md self-end text-[color:var(--muted-on-dark)] lg:col-span-5 lg:col-start-8"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Buy the device once, then choose how it gets restocked. Refills ship
            when your cartridges actually run low, not on a fixed calendar.
            Katalyze isn&apos;t for sale yet, so these are planned launch prices
            and may change before the first run.
          </p>
        </Reveal>

        {/* Device + plans */}
        <div
          className="grid grid-cols-1 gap-px overflow-hidden border border-[color:var(--rule-on-dark)] bg-[color:var(--rule-on-dark)] md:grid-cols-2 lg:grid-cols-4"
          style={{ borderRadius: "var(--r-lg)" }}
        >
          <Reveal className="spot flex flex-col gap-6 bg-[color:var(--canvas-deep)] p-8">
            <span
              className="font-mono uppercase text-periwinkle"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              [00 · The device]
            </span>
            <p className="flex items-baseline gap-2 text-white">
              <span
                className="font-display font-extralight tabular-nums"
                style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}
              >
                $279
              </span>
              <span
                className="text-[color:var(--muted-on-dark)]"
                style={{ fontSize: "var(--text-sm)" }}
              >
                one time
              </span>
            </p>
            <p
              className="text-white/85"
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-body)",
              }}
            >
              The Katalyze device and a starter set of six cartridges. Required
              for every plan.
            </p>
          </Reveal>

          {PLANS.map((plan, i) => (
            <Reveal
              key={plan.id}
              variant="fade"
              delayMs={(i + 1) * 90}
              className={`spot flex flex-col gap-6 p-8 ${
                "featured" in plan ? "bg-indigo/40" : "bg-midnight"
              }`}
            >
              <span
                className="flex items-center justify-between font-mono uppercase text-periwinkle"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                }}
              >
                [{String(i + 1).padStart(2, "0")} · {plan.name}]
                {"featured" in plan && (
                  <span className="rounded-full bg-blush px-2 py-0.5 text-midnight">
                    Most complete
                  </span>
                )}
              </span>
              <p className="flex items-baseline gap-2 text-white">
                <span
                  className="font-display font-extralight tabular-nums"
                  style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}
                >
                  ${plan.price}
                </span>
                <span
                  className="text-[color:var(--muted-on-dark)]"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  per month
                </span>
              </p>
              <div className="flex flex-col gap-2">
                <p
                  className="text-white"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {plan.fit}
                </p>
                <p
                  className="text-[color:var(--muted-on-dark)]"
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {plan.summary}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Comparison */}
        <Reveal variant="fade" className="min-w-0">
          <div className="w-full min-w-0 max-w-[calc(100vw-2*var(--margin))] overflow-x-auto">
            <table
              aria-label="What each refill plan includes"
              className="w-full min-w-[36rem] border-collapse text-left"
              style={{ fontSize: "var(--text-sm)" }}
            >
              <thead>
                <tr className="border-b border-[color:var(--rule-on-dark)]">
                  <th
                    scope="col"
                    className="py-4 pr-4 font-mono font-normal uppercase text-periwinkle"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    Included
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className="w-28 py-4 text-center font-mono font-normal uppercase text-periwinkle"
                      style={{
                        fontSize: "var(--text-2xs)",
                        letterSpacing: "var(--track-label)",
                      }}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr
                    key={f.label}
                    className="border-b border-[color:var(--rule-on-dark)]"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-4 font-normal text-white/85"
                    >
                      {f.label}
                    </th>
                    {f.tiers.map((on, i) => (
                      <td key={PLANS[i].id} className="py-3 text-center">
                        <Check on={on} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            className="mt-4 text-[color:var(--faint-on-dark)]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Planned launch pricing in US dollars. Not yet available to buy. The
            waitlist hears confirmed prices first.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
