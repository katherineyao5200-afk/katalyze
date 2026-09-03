import Reveal from "@/components/Reveal";

const STATS = [
  {
    value: "71.2%",
    description:
      "say their skin changes with the weather, but their products stay the same",
  },
  {
    value: "78.1%",
    description: "say too many options is their biggest struggle",
  },
  {
    value: "78%",
    description: "have bought a product that ended up not working for their skin",
  },
  {
    value: "86.3%",
    description:
      "say proven results, not features, are what would earn their trust",
  },
];

// Layout device: narrow column, cols 2-7 of 12, deep midnight (§6 row 02).
export default function Thesis() {
  return (
    <section
      className="relative overflow-hidden bg-midnight"
      style={{ paddingBlock: "var(--s-40)" }}
    >
      {/* Ambient texture in the empty right-hand whitespace (cols 8-12
          carry no content) — ties this flat section back to the
          constellation motif without competing with the text. */}
      <div
        aria-hidden="true"
        className="absolute rounded-full blur-3xl"
        style={{
          right: "-10%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "45%",
          aspectRatio: "1 / 1",
          backgroundImage: "var(--grad-point)",
          opacity: 0.25,
        }}
      />

      <div
        className="relative z-10 mx-auto grid grid-cols-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col md:col-span-6 md:col-start-2">
          <h2
            className="font-display font-extralight text-white"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            We measure. <em className="italic">They guess.</em>
          </h2>

          <p
            className="text-white/80"
            style={{
              marginTop: "var(--s-6)",
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-body)",
              maxWidth: "var(--measure)",
            }}
          >
            Skin changes daily. So should your formula.
          </p>

          <dl
            className="flex flex-col divide-y divide-[color:var(--rule-on-dark)]"
            style={{ marginTop: "var(--s-16)" }}
          >
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="flex items-baseline gap-6 py-4 first:pt-0 last:pb-0"
              >
                <dt
                  className="font-display font-extrabold text-periwinkle tabular-nums"
                  style={{ fontSize: "var(--text-2xl)" }}
                >
                  {stat.value}
                </dt>
                <dd
                  className="text-white/70"
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  {stat.description}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
