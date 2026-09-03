import Reveal from "@/components/Reveal";

// Layout devices 2 + 3 combined (§6 row 06): full-bleed split, one side
// carrying an oversized cropped numeral. No real waste/freshness figure
// exists in any doc, so the numeral stays an honest "—" rather than an
// invented percentage — same call as Formulation's percentages.
export default function Freshness() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div
        className="grain relative flex items-center overflow-hidden bg-indigo"
        style={{ minHeight: "60vh" }}
      >
        <span
          aria-hidden="true"
          className="numeral-shimmer font-display font-extrabold"
          style={{
            fontSize: "var(--text-hero)",
            lineHeight: "var(--leading-display)",
            marginLeft: "calc(var(--margin) * -0.15)",
          }}
        >
          —
        </span>
        <span
          className="absolute font-mono uppercase text-periwinkle"
          style={{
            left: "var(--margin)",
            bottom: "var(--s-8)",
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--track-label)",
          }}
        >
          Per-dose waste — figure pending
        </span>
      </div>

      <Reveal
        className="flex flex-col justify-center bg-midnight"
        style={{
          paddingInline: "var(--margin)",
          paddingBlock: "var(--s-24)",
        }}
      >
        <h2
          className="max-w-sm font-display font-extralight text-white"
          style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
        >
          Every dose fresh.
          <br />
          <em className="italic">Every ounce used.</em>
        </h2>
      </Reveal>
    </section>
  );
}
