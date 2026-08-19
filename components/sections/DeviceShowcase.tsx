import ImagePlaceholder from "@/components/ImagePlaceholder";
import { images } from "@/lib/images";

export default function DeviceShowcase() {
  const device = images.product.deviceHero;

  return (
    <section className="bg-near-black px-6 py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-12 text-center">
        <div className="w-full max-w-sm">
          <ImagePlaceholder
            width={device.width}
            height={device.height}
            alt={device.alt}
          />
        </div>

        <h2 className="max-w-xl font-display font-extralight text-h2 text-cream">
          One object. Six cartridges. A different formula every day.
        </h2>
      </div>
    </section>
  );
}
