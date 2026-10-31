import Chip from "@/components/home/Chip";
import Reveal from "@/components/Reveal";

// Reference: truekind's plain value cards. The test is a reader who knows
// nothing about skincare: one screen should tell them what this is, how
// it works and how far along it is. Numbered chips instead of icons.
const ITEMS = [
  {
    n: "01",
    title: "What it is",
    body: "A countertop skincare printer. Six cartridges sit inside: three base formulas and three active ingredients.",
  },
  {
    n: "02",
    title: "How it works",
    body: "You rest a finger on a capacitive pad. It reads whether your skin is drier or more hydrated than usual, the app adds local weather and a quick check-in, and the device mixes one dose into a cup.",
  },
  {
    n: "03",
    title: "Where it stands",
    body: "A working six-channel prototype, tested with simulated liquids. Next comes real ingredients and a manufacturing partner.",
  },
];

export default function AtAGlance() {
  return (
    <section className="bg-white" style={{ paddingBlock: "var(--s-16)" }}>
      {/* 12 cols: three equal columns divided by hairlines */}
      <div
        className="mx-auto grid grid-cols-1 border-y border-[color:var(--rule-on-light)] md:grid-cols-3"
        style={{ maxWidth: "var(--max-w)", marginInline: "var(--margin)" }}
      >
        {ITEMS.map((item, i) => (
          <Reveal
            key={item.n}
            delayMs={i * 80}
            className={`flex flex-col gap-4 py-10 md:px-8 ${
              i > 0
                ? "border-t border-[color:var(--rule-on-light)] md:border-t-0 md:border-l"
                : "md:pl-0"
            }`}
          >
            <Chip>{item.n}</Chip>
            <h2
              className="font-display font-extralight text-midnight"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              {item.title}
            </h2>
            <p
              className="max-w-sm text-[color:var(--muted-on-light)]"
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
