import WaitlistForm from "@/components/WaitlistForm";

// Layout device: full-bleed vertical gradient, midnight -> blush (§6 row
// 08) — "where the gradient resolves into light." System A (the
// particle field) is Hero's alone per §11's own centerpiece assignment,
// so this doesn't reuse it.
export default function ClosingCTA() {
  return (
    <section
      className="grain flex flex-col items-center text-center"
      style={{
        backgroundImage: "var(--grad-vertical)",
        paddingInline: "var(--margin)",
        paddingBlock: "var(--s-32)",
      }}
    >
      <h2
        className="max-w-xl font-display font-extralight text-white"
        style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
      >
        Be the first to try it.
      </h2>
      <p
        className="text-white/80"
        style={{
          marginTop: "var(--s-3)",
          fontSize: "var(--text-lg)",
          lineHeight: "var(--leading-body)",
        }}
      >
        We&apos;ll tell our waitlist before anyone else.
      </p>

      <WaitlistForm
        source="closing"
        trackVisibility
        className="mt-8 w-full max-w-md"
      />

      <p
        className="font-mono uppercase text-white/60"
        style={{
          marginTop: "var(--s-12)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
        }}
      >
        Our first production run is limited. The waitlist hears first.
      </p>
    </section>
  );
}
