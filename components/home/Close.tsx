import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";

// Reference: alethia's dark closing block. The vertical brand gradient
// resolves into light at the bottom; one line, one action, one fact.
export default function Close() {
  return (
    <section
      className="grain relative overflow-hidden bg-[image:var(--grad-vertical)]"
      style={{ paddingBlock: "var(--s-40) var(--s-56)" }}
    >
      <Reveal
        className="relative z-10 mx-auto flex flex-col gap-8"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <h2
          className="max-w-4xl font-display font-extralight text-white"
          style={{ fontSize: "var(--text-display)", lineHeight: "var(--leading-display)" }}
        >
          Your catalyst
          <br />
          <em className="italic">to better skin.</em>
        </h2>
        <p className="max-w-md text-white/85" style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" }}>
          Katalyze isn&apos;t for sale yet. The first production run is
          limited to about 2,000 units, and the waitlist hears first.
        </p>
        <WaitlistForm source="closing" trackVisibility className="max-w-md" />
      </Reveal>
    </section>
  );
}
