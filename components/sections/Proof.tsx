import Reveal from "@/components/Reveal";

const STATS = [
  {
    value: "68.5%",
    description: "found a device that reads and mixes on the spot very or extremely appealing",
  },
  {
    value: "60.3%",
    description: "said they'd probably or definitely buy it",
  },
];

// Layout device: light ground (§6 row 05's exception), narrow column —
// same palette shift as Formulation, used here for the same reason:
// this is the section asking to be believed, so it gets the "clean and
// safe" treatment instead of the atmospheric dark.
//
// Deliberately does not include a clinical citation or named
// testimonials yet — no real source text exists for either, and
// DESIGN-SYSTEM.md §12 is explicit that a missing clinical result is a
// question, not a placeholder. Slot them in here, verbatim, once real
// source text exists; don't invent shape for them in the meantime.
export default function Proof() {
  return (
    <section className="bg-white" style={{ paddingBlock: "var(--s-24)" }}>
      <div
        className="mx-auto grid grid-cols-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-4 md:col-span-8 md:col-start-2">
          <p
            className="font-mono uppercase"
            style={{
              fontSize: "var(--text-2xs)",
              letterSpacing: "var(--track-label)",
              color: "var(--indigo)",
            }}
          >
            The research
          </p>
          <h2
            className="max-w-lg font-display font-extralight"
            style={{
              fontSize: "var(--text-2xl)",
              lineHeight: "var(--leading-tight)",
              color: "var(--ink-on-light)",
            }}
          >
            This is where skincare is headed.
          </h2>
          <p
            className="max-w-lg"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
              color: "var(--ink-on-light)",
              opacity: 0.75,
            }}
          >
            90 million U.S. adults are already open to device-based skin
            monitoring. We asked people considering Katalyze directly — the
            numbers back it up.
          </p>

          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            style={{ marginTop: "var(--s-8)" }}
          >
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col gap-2"
                style={{
                  borderTop: "1px solid var(--rule-on-light)",
                  paddingTop: "var(--s-4)",
                }}
              >
                <p
                  className="font-display font-extrabold tabular-nums"
                  style={{ fontSize: "var(--text-2xl)", color: "var(--indigo)" }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: "var(--leading-snug)",
                    color: "var(--ink-on-light)",
                  }}
                >
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
