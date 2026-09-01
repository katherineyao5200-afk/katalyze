import Reveal from "@/components/Reveal";

// Layout device: narrow column, dark (§6 row 07) — same device as
// Thesis, different padding value per §5's "no two consecutive
// sections share vertical padding" (this isn't adjacent to Thesis, but
// the rule still applies to keep rhythm honest).
export default function NotAQuiz() {
  return (
    <section className="bg-midnight" style={{ paddingBlock: "var(--s-24)" }}>
      <div
        className="mx-auto grid grid-cols-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-4 md:col-span-6 md:col-start-2">
          <p
            className="text-white/70"
            style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" }}
          >
            Personalization that doesn&apos;t stop at signup.
          </p>
          <h2
            className="font-display font-extralight text-white"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Not a quiz. <em className="italic">A conversation.</em>
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
