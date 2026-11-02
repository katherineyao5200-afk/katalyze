import Chip from "@/components/home/Chip";
import Reveal from "@/components/Reveal";

// Reference: truekind's plain value cards. The test is a reader who knows
// nothing about skincare: one screen should tell them what this is, how
// it works and how far along it is. Numbered chips instead of icons.
// Each column leads with the answer, big; the label is small and the
// detail is quiet, so a skimmer gets the point from the headlines alone.
const ITEMS = [
  {
    n: "01 · What it is",
    title: "A skincare printer for your counter.",
    body: "Six cartridges inside. Three bases, three actives, one dose at a time.",
  },
  {
    n: "02 · How it works",
    title: "One touch. One fresh dose.",
    body: "Three seconds on the sensor. Katalyze weighs that against the weather and how your skin feels, then sets out one fresh dose.",
  },
  {
    n: "03 · Where it stands",
    title: "Already working.",
    body: "A six-channel prototype, tested with simulated liquids. Real ingredients are next."
  },
];

export default function AtAGlance() {
  return (
    <section className="bg-midnight" style={{ paddingBlock: "var(--s-16)" }}>
      {/* 12 cols: three equal columns divided by hairlines */}
      <div
        className="mx-auto grid grid-cols-1 border-y border-[color:var(--rule-on-dark)] md:grid-cols-3"
        style={{ maxWidth: "var(--max-w)", marginInline: "var(--margin)" }}
      >
        {ITEMS.map((item, i) => (
          <Reveal
            key={item.n}
            delayMs={i * 80}
            className={`flex flex-col gap-4 py-10 md:px-8 ${
              i > 0
                ? "border-t border-[color:var(--rule-on-dark)] md:border-t-0 md:border-l"
                : "md:pl-0"
            }`}
          >
            <Chip>{item.n}</Chip>
            <h2
              className="font-display font-extralight text-white"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              {item.title}
            </h2>
            <p
              className="max-w-sm text-[color:var(--muted-on-dark)]"
              style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
            >
              {item.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
