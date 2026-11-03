import PhotoStatement from "@/components/PhotoStatement";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import Lead from "@/components/Lead";

// Where the idea came from, over the morning-ritual photo (blurred to
// atmosphere). The survey numbers follow in Research.
export default function Mission() {
  return (
    <PhotoStatement src={images.mood.ritual.src} position="40% 30%">
      <Reveal className="flex flex-col gap-8">
        <p
          className="font-mono uppercase text-periwinkle"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          Why it exists
        </p>
        <h2
          className="font-display font-extralight text-white"
          style={{ fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.98 }}
        >
          Most skincare is chosen for the skin you had the day you bought it.
        </h2>
      </Reveal>
      <Reveal className="flex max-w-xl flex-col gap-4 border-l border-blush/50 pl-6">
        <p className="text-white" style={{ fontSize: "var(--text-lg)", lineHeight: 1.4 }}>
          <Lead text="It started with a cabinet of half-used bottles. Each was right for a few weeks, then wrong. Katalyze checks every morning and mixes fresh." />
        </p>
      </Reveal>
    </PhotoStatement>
  );
}
