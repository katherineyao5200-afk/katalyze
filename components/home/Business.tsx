import Reveal from "@/components/Reveal";

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
    text: "Prototype tested with simulated liquids. Market research done. Talking to manufacturers and formulators.",
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
            A big market that still personalizes only once.
          </h2>
        </Reveal>

        {/* Market */}
        <dl className="grid grid-cols-1 border-t border-[color:var(--rule-on-dark)] md:grid-cols-3">
          {MARKET.map((m, i) => (
            <Reveal
              key={m.label}
              variant="fade"
              delayMs={i * 90}
              className={`flex flex-col gap-3 border-b border-[color:var(--rule-on-dark)] py-8 md:border-b-0 md:px-8 ${
                i === 0 ? "md:pl-0" : "md:border-l"
              }`}
            >
              <dd
                className="order-2 font-display font-extralight tabular-nums text-white"
                style={{ fontSize: "var(--text-display)", lineHeight: 1 }}
              >
                {m.value}
              </dd>
              <dt
                className="order-1 font-mono uppercase text-periwinkle"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                }}
              >
                {m.label}
              </dt>
              <dd
                className="order-3 max-w-xs text-[color:var(--faint-on-dark)]"
                style={{ fontSize: "var(--text-xs)" }}
              >
                {m.note}
              </dd>
            </Reveal>
          ))}
        </dl>

        {/* Landscape */}
        <Reveal variant="fade" className="flex min-w-0 flex-col gap-6">
          <h3
            className="font-mono uppercase text-periwinkle"
            style={{
              fontSize: "var(--text-2xs)",
              letterSpacing: "var(--track-label)",
            }}
          >
            [How others personalize]
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
            className="font-mono uppercase text-periwinkle"
            style={{
              fontSize: "var(--text-2xs)",
              letterSpacing: "var(--track-label)",
            }}
          >
            [Roadmap]
          </h3>
          <ol
            className="grid grid-cols-1 gap-px overflow-hidden border border-[color:var(--rule-on-dark)] bg-[color:var(--rule-on-dark)] md:grid-cols-4"
            style={{ borderRadius: "var(--r-lg)" }}
          >
            {ROADMAP.map((r, i) => (
              <li
                key={r.phase}
                className={`spot flex flex-col gap-4 p-6 ${i === 0 ? "bg-indigo/50" : "bg-midnight"}`}
              >
                <span
                  className="flex items-center justify-between font-mono uppercase"
                  style={{
                    fontSize: "var(--text-2xs)",
                    letterSpacing: "var(--track-label)",
                  }}
                >
                  <span className="text-periwinkle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={
                      i === 0
                        ? "rounded-full bg-blush px-2 py-0.5 text-midnight"
                        : "text-[color:var(--faint-on-dark)]"
                    }
                  >
                    {r.when}
                  </span>
                </span>
                <span
                  className="font-display font-extralight text-white"
                  style={{ fontSize: "var(--text-xl)" }}
                >
                  {r.phase}
                </span>
                <span
                  className="text-[color:var(--muted-on-dark)]"
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {r.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
