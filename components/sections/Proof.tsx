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
// Still no clinical citation: no Katalyze trial exists, and
// DESIGN-SYSTEM.md §12 is explicit that a missing clinical result is a
// question, not a placeholder. The two expert quotes are verbatim from
// the pitch deck (v9, p.17) — don't paraphrase or shorten them into
// something they didn't say.
const QUOTES = [
  {
    quote:
      "Personalized skincare is an industry trend, and KATALYZE effectively fills the market gap for on-demand and home-based customized skincare. The product design reflects the team member's insight into consumer needs and their sensitivity to the industry.",
    name: "Jessica Tang",
    role: "Regional Sales Manager, MAC China",
  },
  {
    quote:
      "This keen awareness of life's pain points and bold application of cutting-edge technology not only usher in the 'precision era' of skincare but also allows us to glimpse the vibrant vitality of youth through scientific and technological innovation.",
    name: "Fu Tao",
    role: "Shanghai Kevin Kathy Biomedical Research Center",
  },
];
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
            People want skincare that keeps up.
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
            We surveyed about 75 skincare users in 2026 and described the
            device to them: a pad that reads your skin, and a dose mixed
            to match. Here is how they responded.
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

          <div
            className="grid grid-cols-1 gap-10 md:grid-cols-2"
            style={{ marginTop: "var(--s-16)" }}
          >
            {QUOTES.map((q) => (
              <figure key={q.name} className="flex flex-col gap-4">
                <blockquote
                  className="font-display font-extralight italic"
                  style={{
                    fontSize: "var(--text-lg)",
                    lineHeight: "var(--leading-snug)",
                    color: "var(--ink-on-light)",
                  }}
                >
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: "var(--leading-snug)",
                    color: "var(--ink-on-light)",
                  }}
                >
                  <span className="font-medium">{q.name}</span>
                  <span style={{ opacity: 0.7 }}> · {q.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
