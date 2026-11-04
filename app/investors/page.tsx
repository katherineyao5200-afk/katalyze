import type { Metadata } from "next";

import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Investors",
  description:
    "Katalyze at a glance: the problem, the market, the business model, five-year projections and the $450K raise.",
};

/*
 * The business plan, kept plain on purpose: someone with two minutes
 * (an investor, an admissions reader) should leave with the key numbers.
 * Every figure comes from the pitch deck (Sep 2026, v9). Projections are
 * labelled as projections. Product claims follow the site's rules: the
 * sensor reads relative hydration trends, and no efficacy is claimed.
 */

const mono = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--track-label)",
} as const;

const HEADLINE = [
  { value: "$450K", label: "Raising now", note: "To take Katalyze from prototype to first commercial units" },
  { value: "$279", label: "Device price", note: "Plus refill plans from $25 a month" },
  { value: "~$51", label: "Landed unit cost", note: "18% of price at the first run; ~$35 ex-factory at scale" },
  { value: "Year 2", label: "Projected breakeven", note: "Meaningfully profitable from Year 3" },
];

const SURVEY = [
  { value: "71.2%", text: "say their skin changes with the season or weather" },
  { value: "78%", text: "have bought a product that didn't work for them" },
  { value: "78.1%", text: "say too many options is their biggest struggle" },
  { value: "68.5%", text: "find a device that reads and mixes very or extremely appealing" },
  { value: "60.3%", text: "would probably or definitely buy it if available today" },
];

const MARKET = [
  { tier: "TAM", value: "$185B", text: "Global skincare market", source: "The Business Research Company, 2026" },
  { tier: "SAM", value: "$56B", text: "Next-generation personalized beauty: devices, apps, home diagnostics. Growing 14.8% a year to $97B by 2030", source: "TBRC, 2026" },
  { tier: "SOM", value: "$5.6B", text: "10% of SAM, below the 16% innovator and early-adopter band", source: "Rogers, Diffusion of Innovations" },
];

const PLANS = [
  { name: "Device", price: "$279", per: "one time", text: "The countertop device, with its six cartridge bays." },
  { name: "Basic", price: "$25", per: "a month", text: "Replenishes only the actives running low." },
  { name: "Full", price: "$45", per: "a month", text: "Automatic refills across all cartridges, weather-adjusted formula, trend dashboard." },
  { name: "Premium", price: "$89", per: "a month", text: "Everything in Full, plus premium ingredients, multi-user profiles and expedited refills." },
];

const YEARS = ["Y1", "Y2", "Y3", "Y4", "Y5"];
const PROJECTION: { row: string; values: string[]; strong?: boolean }[] = [
  { row: "Devices sold", values: ["1,840", "3,220", "5,520", "9,200", "13,800"] },
  { row: "Active subscribers", values: ["959", "2,089", "3,777", "6,426", "9,972"] },
  { row: "Device revenue", values: ["$513K", "$898K", "$1.54M", "$2.57M", "$3.85M"] },
  { row: "Recurring revenue", values: ["$259K", "$732K", "$1.39M", "$2.41M", "$3.83M"] },
  { row: "Total revenue", values: ["$772K", "$1.63M", "$2.93M", "$4.98M", "$7.68M"], strong: true },
  { row: "Gross margin", values: ["76%", "78%", "79%", "80%", "80%"] },
  { row: "EBIT", values: ["−$73K", "+$9K", "+$196K", "+$660K", "+$1.48M"], strong: true },
];

const FUNDS = [
  { label: "Manufacturing & inventory", amount: "$324K", share: 28, text: "The ~2,000-unit first run, cartridge inventory, fulfilment" },
  { label: "Fixed operating costs", amount: "$289K", share: 25, text: "People, support, facilities, overhead through Year 1" },
  { label: "Seed user acquisition", amount: "$218K", share: 19, text: "Waitlist, creator seeding, founding-cohort incentives, demos" },
  { label: "Regulatory & compliance", amount: "$189K", share: 16, text: "FCC certification, MoCRA registration, patch and stability testing, tooling, IP" },
  { label: "Operating reserves", amount: "$134K", share: 12, text: "Shipping, payments, returns and warranty, liability insurance" },
];

const COMPETITORS = [
  { name: "Perso (L'Oréal)", does: "Photo-based skin analysis plus weather data to mix a dose", gap: "Estimates from a photo; never reached full commercial launch after its 2020–21 beta" },
  { name: "Lesielle", does: "Device that mixes fresh creams from four active cartridges", gap: "You set the personalization; it isn't driven by a reading" },
  { name: "Function of Beauty", does: "Custom formula from an online quiz", gap: "Fixed after signup; doesn't change as skin does" },
  { name: "Curology", does: "Prescription formulas reviewed by a dermatologist", gap: "Needs a consultation; not a daily, on-demand routine" },
];

const ROADMAP = [
  { phase: "Validate", when: "Now", text: "Prototype tested with simulated liquids. Market research done. Manufacturing and formulation outreach underway." },
  { phase: "Prepare", when: "Year 1, early", text: "Raise the round, move to real actives, finalize partners and regulatory groundwork, build the waitlist." },
  { phase: "Launch", when: "Year 1", text: "Direct-to-consumer launch in LA and NYC with a ~2,000-unit founding run. Referrals and demos begin." },
  { phase: "Scale", when: "Year 3", text: "Use real usage data to refine the formula rules. Broaden manufacturing and markets." },
  { phase: "Expand", when: "Year 5", text: "Deeper R&D and international expansion, starting with APAC." },
];

const TRACTION = [
  "Working six-channel prototype, run on simulated liquids",
  "Market research survey of about 75 skincare users",
  "Pitching Round, Diamond Challenge 2026",
  "Finalist (top 2%), Blue Ocean Student Entrepreneur Competition 2026",
];

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="label text-periwinkle" style={mono}>
        {label}
      </p>
      <h2
        className="max-w-3xl font-display font-extralight text-white"
        style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
      >
        {title}
      </h2>
    </div>
  );
}

function Band({
  children,
  deep = false,
}: {
  children: React.ReactNode;
  deep?: boolean;
}) {
  return (
    <section
      className={deep ? "bg-[color:var(--canvas-deep)]" : ""}
      style={{ paddingBlock: "var(--s-16)" }}
    >
      <div
        className="mx-auto flex flex-col gap-10"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        {children}
      </div>
    </section>
  );
}

export default function InvestorsPage() {
  return (
    <main className="flex flex-1 flex-col bg-midnight text-white">
      <PageHero
        label="Investors"
        title={
          <>
            The business,
            <br />
            at a glance.
          </>
        }
        lede="Katalyze is a countertop skincare device. It reads the skin from one fingertip each morning and mixes a fresh dose from six cartridges. Pre-launch, founded by Katherine Yao, raising $450K."
      />

      {/* The four numbers to remember */}
      <section className="border-y border-[color:var(--rule-on-dark)] bg-[color:var(--canvas-deep)]">
        <dl
          className="mx-auto grid grid-cols-2 lg:grid-cols-4"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          {HEADLINE.map((h, i) => (
            <div
              key={h.label}
              className={`flex flex-col gap-2 py-10 pr-6 ${i > 0 ? "lg:border-l lg:border-[color:var(--rule-on-dark)] lg:pl-8" : ""} ${i % 2 === 1 ? "border-l border-[color:var(--rule-on-dark)] pl-6 lg:pl-8" : ""}`}
            >
              <dt className="order-2 label text-periwinkle" style={mono}>
                {h.label}
              </dt>
              <dd
                className="focal order-1 font-display font-extralight tabular-nums text-white"
                style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}
              >
                {h.value}
              </dd>
              <dd
                className="order-3 text-[color:var(--muted-on-dark)]"
                style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-snug)" }}
              >
                {h.note}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Problem */}
      <Band>
        <SectionHead
          label="The problem"
          title="Skin changes week to week. The jar on the shelf doesn't."
        />
        <Reveal>
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--rule-on-dark)] bg-[color:var(--rule-on-dark)] sm:grid-cols-2 lg:grid-cols-5">
            {SURVEY.map((s) => (
              <li key={s.value} className="flex flex-col gap-3 bg-midnight p-6">
                <span
                  className="font-display font-extralight tabular-nums text-white"
                  style={{ fontSize: "var(--text-2xl)", lineHeight: 1 }}
                >
                  {s.value}
                </span>
                <span
                  className="text-[color:var(--muted-on-dark)]"
                  style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}
                >
                  {s.text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        <p className="text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
          Katalyze market research survey, about 75 respondents, 2026.
        </p>
      </Band>

      {/* Solution */}
      <Band deep>
        <SectionHead
          label="The product"
          title="Each morning: a fingertip reading in, one fresh dose out."
        />
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            ["Reads", "A capacitive fingertip pad tracks your hydration trend against your own usual."],
            ["Decides", "A rule-based engine in the app combines the reading, local weather and a quick check-in, always inside pre-set safe ranges."],
            ["Mixes", "Six cartridges (a toner, a serum and a cream base, plus three actives) dispense one fresh dose into a small dish, scooped out with a fingertip. Refills ship when cartridges run low."],
          ].map(([t, d], i) => (
            <li key={t} className="flex flex-col gap-3 border-t border-[color:var(--rule-on-dark)] pt-6">
              <span className="font-mono text-periwinkle" style={mono}>
                0{i + 1}
              </span>
              <span className="font-display font-extralight" style={{ fontSize: "var(--text-xl)" }}>
                {t}
              </span>
              <span className="text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>
                {d}
              </span>
            </li>
          ))}
        </ol>
      </Band>

      {/* Market */}
      <Band>
        <SectionHead label="Market" title="A $56B personalized-beauty segment, growing 14.8% a year." />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {MARKET.map((m, i) => (
            <Reveal key={m.tier} delayMs={i * 90} variant="scale">
              <div
                className="flex h-full flex-col gap-4 border border-[color:var(--rule-on-dark)] p-6"
                style={{
                  borderRadius: "var(--r-lg)",
                  background: `rgb(138 141 179 / ${0.04 + (2 - i) * 0.04})`,
                }}
              >
                <span className="font-mono text-periwinkle" style={mono}>
                  {m.tier}
                </span>
                <span className="font-display font-extralight tabular-nums" style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}>
                  {m.value}
                </span>
                <span className="text-white/85" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}>
                  {m.text}
                </span>
                <span className="mt-auto text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
                  {m.source}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="max-w-2xl text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>
          First customers: tech-curious adults aged 30 to 45 who already spend $20 to $50 a month on skincare and have been burned by products that didn&apos;t work.
        </p>
      </Band>

      {/* Business model */}
      <Band deep>
        <SectionHead label="Business model" title="The device is sold once. Refills are the business." />
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--rule-on-dark)] bg-[color:var(--rule-on-dark)] sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.name} className="flex flex-col gap-3 bg-[color:var(--canvas-deep)] p-6">
              <span className="label text-periwinkle" style={mono}>
                {p.name}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-display font-extralight tabular-nums" style={{ fontSize: "var(--text-2xl)", lineHeight: 1 }}>
                  {p.price}
                </span>
                <span className="text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
                  {p.per}
                </span>
              </span>
              <span className="text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}>
                {p.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-l border-blush/50 pl-6">
          <p className="text-white" style={{ fontSize: "var(--text-base)" }}>
            Later: luxury hotels (B2B)
          </p>
          <p className="max-w-2xl text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>
            Katalyze as an in-suite amenity: $199 per unit placement, then $749 per unit per year for refills, monitoring and support. Planned from Year 1 with 10 design-partner hotels in LA and NYC. Consumer sales come first.
          </p>
        </div>
        <p className="text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
          Planned launch prices. Not in public markets yet.
        </p>
      </Band>

      {/* Projections */}
      <Band>
        <SectionHead label="Five-year projection" title="Revenue grows 10×. Recurring revenue grows to half the business." />
        <div className="scroll-x overflow-x-auto rounded-[var(--r-lg)] border border-[color:var(--rule-on-dark)]">
          <table className="w-full min-w-[640px] border-collapse text-left tabular-nums">
            <caption className="sr-only">Five-year consumer projection (B2C)</caption>
            <thead>
              <tr className="bg-[color:var(--canvas-deep)]">
                <th scope="col" className="p-4 label text-periwinkle" style={mono}>
                  Projection
                </th>
                {YEARS.map((y) => (
                  <th key={y} scope="col" className="p-4 text-right label text-periwinkle" style={mono}>
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECTION.map((r) => (
                <tr key={r.row} className="border-t border-[color:var(--rule-on-dark)]">
                  <th
                    scope="row"
                    className={`p-4 font-normal ${r.strong ? "text-white" : "text-[color:var(--muted-on-dark)]"}`}
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {r.row}
                  </th>
                  {r.values.map((v, i) => (
                    <td
                      key={i}
                      className={`p-4 text-right ${r.strong ? "text-white" : "text-white/75"} ${i === 4 && r.strong ? "focal" : ""}`}
                      style={{ fontSize: r.strong ? "var(--text-base)" : "var(--text-sm)" }}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
          Projections from the 2026 business plan, consumer business only. Unit cost falls from ~$70 to ~$51 landed with volume.
        </p>
      </Band>

      {/* The raise */}
      <Band deep>
        <SectionHead label="The ask" title="$450K to reach first commercial units." />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
              {FUNDS.map((f, i) => (
                <span
                  key={f.label}
                  style={{
                    width: `${f.share}%`,
                    background: `color-mix(in oklab, var(--periwinkle) ${100 - i * 18}%, var(--indigo))`,
                  }}
                  className="border-r border-[color:var(--canvas-deep)] last:border-0"
                />
              ))}
            </div>
            <ul className="flex flex-col">
              {FUNDS.map((f, i) => (
                <li key={f.label} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-t border-[color:var(--rule-on-dark)] py-4">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ background: `color-mix(in oklab, var(--periwinkle) ${100 - i * 18}%, var(--indigo))` }}
                  />
                  <span className="flex flex-col gap-1">
                    <span className="text-white" style={{ fontSize: "var(--text-sm)" }}>
                      {f.label} · {f.share}%
                    </span>
                    <span className="text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-snug)" }}>
                      {f.text}
                    </span>
                  </span>
                  <span className="tabular-nums text-white" style={{ fontSize: "var(--text-sm)" }}>
                    {f.amount}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
              Total Year 1 uses: $1.15M. The raise is $450K, structured to last about 12 months.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9">
            <p className="label text-periwinkle" style={mono}>
              What it delivers
            </p>
            <p className="text-white/90" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}>
              A production-ready device moved from prototype to real formulation, a first run of about 2,000 units sold to a founding cohort, real usage data from that cohort, and validated unit economics for the next raise.
            </p>
          </div>
        </div>
      </Band>

      {/* Competition */}
      <Band>
        <SectionHead label="Competition" title="Competitors personalize at signup or guess from a photo. None of them measure daily." />
        <div className="scroll-x overflow-x-auto rounded-[var(--r-lg)] border border-[color:var(--rule-on-dark)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-[color:var(--canvas-deep)]">
                {["Brand", "What they do", "What's missing"].map((h) => (
                  <th key={h} scope="col" className="p-4 label text-periwinkle" style={mono}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="border-t border-[color:var(--rule-on-dark)] align-top">
                  <th scope="row" className="p-4 font-normal text-white" style={{ fontSize: "var(--text-sm)" }}>
                    {c.name}
                  </th>
                  <td className="p-4 text-white/75" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}>
                    {c.does}
                  </td>
                  <td className="p-4 text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}>
                    {c.gap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Band>

      {/* Roadmap + traction + team */}
      <Band deep>
        <SectionHead label="Roadmap" title="Where it is, and what comes next." />
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {ROADMAP.map((r, i) => (
            <li key={r.phase} className="flex flex-col gap-3 border-t border-[color:var(--rule-on-dark)] pt-5">
              <span className={`label ${i === 0 ? "text-blush" : "text-periwinkle"}`} style={mono}>
                {r.when}
              </span>
              <span className="font-display font-extralight" style={{ fontSize: "var(--text-xl)" }}>
                {r.phase}
              </span>
              <span className="text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}>
                {r.text}
              </span>
            </li>
          ))}
        </ol>
      </Band>

      <Band>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHead label="Traction" title="What's already been done." />
            <ul className="flex flex-col">
              {TRACTION.map((t) => (
                <li key={t} className="border-t border-[color:var(--rule-on-dark)] py-4 text-white/90" style={{ fontSize: "var(--text-sm)" }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <SectionHead label="Team" title="Katherine, plus specialist partners." />
            <p className="text-white/85" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>
              Katherine Yao leads product, design, the financial model, supplier sourcing and go-to-market. Hardware is built with a Shenzhen manufacturing partner, formulas with a contract formulator, and the app and site with an external development company.
            </p>
            <div className="mt-2 flex flex-col gap-3">
              <p className="label text-periwinkle" style={mono}>
                Hear first when the first run opens
              </p>
              <WaitlistForm source="investors" className="max-w-md" />
            </div>
          </div>
        </div>
      </Band>
    </main>
  );
}
