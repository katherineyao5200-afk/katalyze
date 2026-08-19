import ImagePlaceholder from "@/components/ImagePlaceholder";
import { images } from "@/lib/images";

const BASE_LABELS = ["Base formula", "Base formula", "Base formula"];
const ACTIVE_LABELS = ["Hyaluronic acid", "Niacinamide", "Ceramide"];

interface CartridgeSlot {
  src: null;
  width: number;
  height: number;
  alt: string;
}

function Cartridge({ slot, label }: { slot: CartridgeSlot; label: string }) {
  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        aria-hidden="true"
        className="absolute -top-6 h-20 w-20 rounded-full bg-periwinkle/25 blur-2xl"
      />
      <div className="w-full max-w-[160px]">
        <ImagePlaceholder width={slot.width} height={slot.height} alt={slot.alt} />
      </div>
      <p className="font-sans text-body text-navy-900">{label}</p>
    </div>
  );
}

export default function WhatsInside() {
  return (
    <section className="bg-cream px-6 py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-display font-extralight text-h2 text-navy-900">
            What&apos;s inside.
          </h2>
          <p className="max-w-md font-sans text-body text-navy-700">
            Three base formulas. Three active ingredients. Mixed fresh, every
            time.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
          {images.cartridges.base.map((slot, i) => (
            <Cartridge key={`base-${i}`} slot={slot} label={BASE_LABELS[i]} />
          ))}
          {images.cartridges.active.map((slot, i) => (
            <Cartridge key={`active-${i}`} slot={slot} label={ACTIVE_LABELS[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
