import Reveal from "@/components/Reveal";

// Layout devices 2 + 3 combined (§6 row 06): full-bleed split, one side
// carrying an oversized cropped numeral. No measured waste figure exists
// yet, so the numeral is the one fact that's true by design: the device
// mixes a single dose at a time.
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
            marginLeft: "var(--margin)",
          }}
        >
          1
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
          Dose mixed at a time. No half-used bottles.
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
