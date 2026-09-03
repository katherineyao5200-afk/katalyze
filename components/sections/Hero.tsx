import ParticleField from "@/components/ParticleField";
import WaitlistForm from "@/components/WaitlistForm";

// Layout device 2 (§5): full-bleed atmospheric split, no container, no
// margin on the section itself — text gets its own inset instead. Dark
// left -> light right via --grad-atmosphere; grain mandatory on top.
export default function Hero() {
  return (
    <section className="grain relative flex min-h-[100vh] items-end overflow-hidden bg-[image:var(--grad-atmosphere)] bg-cover">
      <ParticleField />

      {/* Text block: cols 1-7 of 12, lower-left per §6 row 01. */}
      <div
        className="relative z-10 flex w-full flex-col gap-6"
        style={{ padding: "var(--margin)" }}
      >
        <div className="flex max-w-2xl flex-col gap-6">
          <p className="font-mono text-2xs uppercase text-periwinkle tracking-[var(--track-label)]">
            Now developing
          </p>

          <h1
            className="font-display font-extralight text-white [font-size:var(--text-hero-mobile)] md:[font-size:var(--text-hero)]"
            style={{
              lineHeight: "var(--leading-display)",
              letterSpacing: "var(--track-display)",
            }}
          >
            It reads your skin.
            <br />
            <em className="italic">Then it mixes.</em>
          </h1>

          <p
            className="max-w-md text-white/80"
            style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" }}
          >
            Most personalized skincare guesses once — a quiz, a photo — then
            stops. Katalyze checks in every time: a capacitive sensor reads
            your skin&apos;s hydration trend, then mixes a fresh single dose
            on the spot. A skincare printer, not a subscription box.
          </p>

          <WaitlistForm source="hero" trackVisibility className="mt-2 max-w-md" />
        </div>
      </div>

      {/* Small anchored detail, bottom-left — balances the pointer hint
          on the right per §11 System A. Real product facts, not filler:
          capacitive read + rule-based mix are both hard rules in
          CLAUDE.md, so this doubles as a quiet credibility marker. */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-6 z-10 font-mono text-2xs uppercase text-periwinkle/70 tracking-[var(--track-label)]"
      >
        Capacitive read · Rule-based mix
      </p>

      {/* Mono hint, bottom-right — the discoverable pointer-interaction
          affordance §11 System A asks for. */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-6 z-10 font-mono text-2xs uppercase text-periwinkle/70 tracking-[var(--track-label)]"
      >
        Move to disturb
      </p>
    </section>
  );
}
