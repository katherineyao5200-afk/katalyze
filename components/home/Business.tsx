import Reveal from "@/components/Reveal";
import RoadmapScrubber from "@/components/home/RoadmapScrubber";
import Hint from "@/components/Hint";

// Market and landscape, from the pitch deck (v9, Sep 2026, pp. 10, 18,
// 32). Competitor rows describe what each product does, in neutral
// terms; no claims about their quality or results.
const MARKET = [
  {
    value: "$185B",
    label: "Global skincare market",
    note: "The Business Research Company, Skin Care Products Global Market Report 2026",
  },
  {
    value: "$56B",
    label: "Next-generation personalized beauty",
    note: "TBRC, Next-Generation Personalized Beauty Global Market Report 2026",
  },
  {
    value: "30–45",
    label: "First customers, by age",
    note: "People already spending $20–50 a month on skincare",
  },
];

const LANDSCAPE = [
  {
    name: "Function of Beauty",
    how: "Custom formula from an online quiz",
    updates: "Set once at signup",
  },
  {
    name: "Curology",
    how: "Prescription formula from a dermatologist",
    updates: "At each consultation",
  },
  {
    name: "Lesielle",
    how: "Mixes creams at home from active cartridges",
    updates: "When you change the settings",
  },
  {
    name: "Perso (L'Oréal)",
    how: "Estimates skin condition from a photo",
    updates: "Each use",
  },
  {
    name: "Katalyze",
    how: "Fingertip reading, weather and a daily check-in",
    updates: "Every morning",
    us: true,
  },
];

const ROADMAP = [
  {
    phase: "Validate",
    when: "Now",
    text: "Prototype tested with test liquids. Market research done. Talking to manufacturers and formulators.",
  },
  {
    phase: "Prepare",
    when: "Next",
    text: "Switch to real ingredients, choose a manufacturing partner and start regulatory groundwork.",
  },
  {
    phase: "Launch",
    when: "First run",
    text: "About 2,000 units to a founding group from the waitlist, sold direct.",
  },
  {
    phase: "Scale",
    when: "After",
    text: "Use real usage data to refine formulas, then widen manufacturing and markets.",
  },
];

export default function Business() {
  return (
    <section
      aria-labelledby="business-title"
      className="relative bg-[image:var(--grad-haze-dark)]"
      style={{ paddingBlock: "var(--s-32)" }}
    >
      <div
        className="mx-auto flex flex-col gap-20"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <Reveal className="flex max-w-3xl flex-col gap-6">
          <h2
            id="business-title"
            className="font-display font-extralight text-white"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Personalized skincare is already big business. Almost all of it stops at the quiz.
          </h2>
        </Reveal>

        {/* Market: one focal number, the two supporting ones beside it. */}
        <dl className="grid grid-cols-1 items-end gap-12 border-t border-[color:var(--rule-on-dark)] pt-10 md:grid-cols-[1.5fr_1fr] md:gap-16">
          <Reveal variant="fade" className="flex flex-col gap-3">
            <dt className="label order-1 text-periwinkle">{MARKET[1].label}</dt>
            <dd
              className="order-2 font-display font-extralight tabular-nums text-white"
              style={{ fontSize: "clamp(96px, 16vw, 240px)", lineHeight: 0.85 }}
            >
              {MARKET[1].value}
            </dd>
            <dd className="order-3 max-w-sm text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
              {MARKET[1].note}
            </dd>
          </Reveal>
          <div className="flex flex-col">
            {[MARKET[0], MARKET[2]].map((m, i) => (
              <Reveal
                key={m.label}
                variant="fade"
                delayMs={120 + i * 90}
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 border-b border-[color:var(--rule-on-dark)] py-5 last:border-b-0"
              >
                <dd
                  className="row-span-2 font-display font-extralight tabular-nums text-white"
                  style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}
                >
                  {m.value}
                </dd>
                <dt className="label text-white/80">{m.label}</dt>
                <dd className="text-[color:var(--faint-on-dark)]" style={{ fontSize: "var(--text-xs)" }}>
                  {m.note}
                </dd>
              </Reveal>
            ))}
          </div>
        </dl>

        {/* Landscape */}
        <Reveal variant="fade" className="flex min-w-0 flex-col gap-6">
          <h3
            className="label text-periwinkle"
            style={{
              fontSize: "var(--text-2xs)",
              letterSpacing: "var(--track-label)",
            }}
          >
            How others personalize
          </h3>
          <div className="w-full min-w-0 max-w-[calc(100vw-2*var(--margin))] overflow-x-auto">
            <table
              className="w-full min-w-[36rem] border-collapse text-left"
              style={{ fontSize: "var(--text-sm)" }}
            >
              <thead>
                <tr className="border-b border-[color:var(--rule-on-dark)] text-[color:var(--muted-on-dark)]">
                  <th scope="col" className="py-3 pr-6 font-normal">
                    Product
                  </th>
                  <th scope="col" className="py-3 pr-6 font-normal">
                    How it personalizes
                  </th>
                  <th scope="col" className="py-3 font-normal">
                    How often it updates
                  </th>
                </tr>
              </thead>
              <tbody>
                {LANDSCAPE.map((row) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[color:var(--rule-on-dark)] ${
                      "us" in row ? "bg-indigo/40 text-white" : "text-white/80"
                    }`}
                  >
                    <th
                      scope="row"
                      className={`py-4 pr-6 ${"us" in row ? "pl-4 font-medium" : "font-normal"}`}
                    >
                      {row.name}
                    </th>
                    <td className="py-4 pr-6">{row.how}</td>
                    <td className="py-4 pr-4">{row.updates}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Roadmap */}
        <div className="flex flex-col gap-6">
          <h3
            className="label text-periwinkle"
            style={{
              fontSize: "var(--text-2xs)",
              letterSpacing: "var(--track-label)",
            }}
          >
            Roadmap
          </h3>
          <Hint className="-mt-2">Drag the marker</Hint>
          <RoadmapScrubber stops={ROADMAP} />
        </div>
      </div>
    </section>
  );
}
