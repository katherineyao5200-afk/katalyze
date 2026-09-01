import ImagePlaceholder from "@/components/ImagePlaceholder";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Not one of §6's 8 named sections, but the PRD's "emotional peak" beat
// is real content worth keeping. Given the closest-fitting device (§5.3,
// oversized/cropped specimen): the device bleeds off the right edge
// instead of sitting centered above the headline.
export default function DeviceShowcase() {
  const device = images.product.deviceHero;

  return (
    <section className="overflow-hidden bg-midnight" style={{ paddingBlock: "var(--s-32)" }}>
      <div className="mx-auto grid grid-cols-12 items-center gap-y-12" style={{ maxWidth: "var(--max-w)" }}>
        <Reveal
          className="col-span-12 flex flex-col gap-4 md:col-span-5"
          style={{ paddingInlineStart: "var(--margin)" }}
        >
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

        <div className="col-span-12 md:col-span-7">
          <ImagePlaceholder
            width={device.width}
            height={device.height}
            alt={device.alt}
            radius="0"
          />
        </div>
      </div>
    </section>
  );
}
