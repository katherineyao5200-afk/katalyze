import Reveal from "@/components/Reveal";

// Real named actives (PRD §5) — base formulas aren't individually named
// anywhere in the docs, so they stay generic rather than invented.
// Percentages are left as "—": no real formulation percentage data
// exists yet, and a placeholder specific number would read as a real
// clinical claim, which §5's "real input names only" rule (extended
// here to real values only) doesn't allow.
const SPECIMENS = [
  { label: "Base formula", pct: "—" },
  { label: "Base formula", pct: "—" },
  { label: "Base formula", pct: "—" },
  { label: "Hyaluronic acid", pct: "—" },
  { label: "Niacinamide", pct: "—" },
  { label: "Ceramide", pct: "—" },
];

// Layout device: annotated plate, light ground (§6 row 05) — the one
// deliberate light-background exception on the page.
export default function Formulation() {
  return (
    <section className="bg-white" style={{ paddingBlock: "var(--s-24)" }}>
      <Reveal
        className="mx-auto flex flex-col"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          gap: "var(--s-4)",
        }}
      >
        <p
          className="font-mono uppercase"
          style={{
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--track-label)",
            color: "var(--indigo)",
          }}
        >
          What&apos;s inside
        </p>
        <h2
          className="max-w-lg font-display font-extralight"
          style={{
            fontSize: "var(--text-2xl)",
            lineHeight: "var(--leading-tight)",
            color: "var(--ink-on-light)",
          }}
        >
          Three base formulas. Three active ingredients. Mixed fresh, every
          time.
        </h2>
      </Reveal>

      <div
        className="mx-auto"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          marginTop: "var(--s-16)",
        }}
      >
        <dl
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ columnGap: "var(--gutter)" }}
        >
          {SPECIMENS.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="flex items-baseline justify-between gap-6 py-4"
              style={{ borderTop: "1px solid var(--rule-on-light)" }}
            >
              <dt
                className="font-mono uppercase"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                  color: "var(--indigo)",
                }}
              >
                {item.label}
              </dt>
              <dd
                className="font-mono tabular-nums"
                style={{ fontSize: "var(--text-sm)", color: "var(--ink-on-light)" }}
              >
                {item.pct}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
