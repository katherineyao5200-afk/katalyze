import ImagePlaceholder from "@/components/ImagePlaceholder";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Real inputs only (§5 rule) — no fabricated sensor readings. The device
// measures relative hydration via a capacitive pad; everything else is
// user-reported or external. Four real inputs, not padded to a round
// number with invented data.
const INPUTS = [
  { label: "Hydration trend", detail: "capacitive pad, relative reading", y: 18 },
  { label: "Local weather", detail: "pulled automatically, daily", y: 40 },
  { label: "Logged skin feel", detail: "your entry, each morning", y: 62 },
  { label: "Initial screening", detail: "one-time, at setup", y: 84 },
];

// Layout device 1: annotated plate (§5) — mono labels off to the side,
// connected to the specimen by a hairline, never centered underneath.
export default function Analysis() {
  const specimen = images.product.skinMacro;

  return (
    <section className="bg-midnight" style={{ paddingBlock: "var(--s-24)" }}>
      <Reveal
        className="mx-auto flex flex-col gap-4"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <p
          className="font-mono uppercase text-periwinkle"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          What it reads
        </p>
        <h2
          className="max-w-xl font-display font-extralight text-white"
          style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
        >
          Four real inputs, not a guess.
        </h2>
      </Reveal>

      <div
        className="relative mx-auto mt-12 grid grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr]"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <div className="relative">
          <ImagePlaceholder
            width={specimen.width}
            height={specimen.height}
            alt={specimen.alt}
          />
          {INPUTS.map((input) => (
            <span
              key={input.label}
              aria-hidden="true"
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: "50%",
                top: `${input.y}%`,
                backgroundImage: "var(--grad-point)",
              }}
            />
          ))}
        </div>

        <dl className="flex flex-col" style={{ gap: "var(--s-8)" }}>
          {INPUTS.map((input) => (
            <div key={input.label} className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="mt-3 h-px w-8 shrink-0 bg-[color:var(--rule-on-dark)] md:w-12"
              />
              <div className="flex flex-col gap-1">
                <dt
                  className="font-mono uppercase text-periwinkle"
                  style={{
                    fontSize: "var(--text-2xs)",
                    letterSpacing: "var(--track-label)",
                  }}
                >
                  {input.label}
                </dt>
                <dd
                  className="text-white/70"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {input.detail}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
