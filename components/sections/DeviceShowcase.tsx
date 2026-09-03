import Image from "next/image";

import FloatOnScroll from "@/components/FloatOnScroll";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Not one of §6's 8 named sections, but the PRD's "emotional peak" beat
// is real content worth keeping. Real product render now (was a
// gradient placeholder) — full photo shown, soft ambient glow behind
// it and a grounding shadow, rather than the edge-bleed crop that only
// made sense for an abstract gradient block.
export default function DeviceShowcase() {
  const device = images.product.deviceHero;

  return (
    <section className="overflow-hidden bg-midnight" style={{ paddingBlock: "var(--s-32)" }}>
      <div
        className="mx-auto grid grid-cols-12 items-center gap-y-12"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <Reveal className="col-span-12 flex flex-col gap-4 md:col-span-5">
          <p
            className="font-mono uppercase text-periwinkle"
            style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
          >
            Six cartridges
          </p>
          <h2
            className="max-w-sm font-display font-extralight text-white"
            style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
          >
            One object. A different formula every day.
          </h2>
        </Reveal>

        <Reveal
          delayMs={120}
          className="relative col-span-12 flex items-center justify-center md:col-span-7"
        >
          <FloatOnScroll className="relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute rounded-full blur-3xl"
              style={{
                width: "70%",
                height: "70%",
                backgroundImage: "var(--grad-point)",
                opacity: 0.5,
              }}
            />
            <Image
              src={device.src}
              alt={device.alt}
              width={device.width}
              height={device.height}
              className="relative w-full max-w-sm"
              style={{
                borderRadius: "var(--r-lg)",
                boxShadow: "0 24px 60px -12px rgb(31 36 65 / 0.55)",
              }}
            />
          </FloatOnScroll>
        </Reveal>
      </div>
    </section>
  );
}
