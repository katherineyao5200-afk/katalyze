import ParticleDrift from "@/components/ParticleDrift";
import WaitlistForm from "@/components/WaitlistForm";

// Layout device: full-bleed vertical gradient, midnight -> blush (§6 row
// 08) — "where the gradient resolves into light." System A (the
// particle field) is Hero's alone per §11's own centerpiece assignment,
// so this uses a much lighter, non-interactive ParticleDrift instead —
// a soft settling-into-light touch, not a second centerpiece.
export default function ClosingCTA() {
  return (
    <section
      className="grain relative flex flex-col items-center overflow-hidden text-center"
      style={{
        backgroundImage: "var(--grad-vertical)",
        paddingInline: "var(--margin)",
        paddingBlock: "var(--s-32)",
      }}
    >
      <div className="absolute inset-0">
        <ParticleDrift />
      </div>

      <h2
        className="relative z-10 max-w-xl font-display font-extralight text-white"
        style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
      >
        Be the first to try it.
      </h2>
      <p
        className="relative z-10 text-white/80"
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
        className="relative z-10 mt-8 w-full max-w-md"
      />

      <p
        className="relative z-10 font-mono uppercase text-white/60"
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
