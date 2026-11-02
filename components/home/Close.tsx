import DitherField from "@/components/DitherField";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";
import { images } from "@/lib/images";

// Reference: alethia's dark closing block. Centered statement, one
// action, one plain fact, and the mark as a quiet watermark.
export default function Close() {
  return (
    <section
      className="relative overflow-hidden bg-[color:var(--canvas-deep)]"
      style={{ paddingBlock: "var(--s-40)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images.logo.nav.src}
        alt=""
        aria-hidden="true"
        width={images.logo.nav.width}
        height={images.logo.nav.height}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.035]"
      />
      {/* The glowing aura rises behind the closing line. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <DitherField
          variant="aura"
          center={[0.5, 1.08]}
          density={0.85}
          className="absolute inset-0"
        />
      </div>
      <Reveal
        className="relative z-10 mx-auto flex flex-col items-center gap-8 text-center"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <h2
          className="max-w-4xl font-display font-extralight text-white"
          style={{
            fontSize: "var(--text-display)",
            lineHeight: "var(--leading-display)",
          }}
        >
          Your catalyst
          <br />
          <em className="italic">to better skin.</em>
        </h2>
        <p
          className="max-w-md text-[color:var(--muted-on-dark)]"
          style={{
            fontSize: "var(--text-lg)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Not for sale yet. The first run is about 2,000 units, and the
          waitlist hears first.
        </p>
        <WaitlistForm
          source="closing"
          trackVisibility
          className="w-full max-w-md"
        />
      </Reveal>
    </section>
  );
}
