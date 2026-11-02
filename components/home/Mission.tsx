import PhotoStatement from "@/components/PhotoStatement";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// The problem and the mission, in one breath, over the morning-ritual
// photo (blurred to atmosphere). The survey numbers follow in Research.
export default function Mission() {
  return (
    <PhotoStatement src={images.mood.ritual.src} position="40% 30%">
      <Reveal className="flex flex-col gap-8">
        <p
          className="font-mono uppercase text-periwinkle"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          Why Katalyze exists
        </p>
        <h2
          className="font-display font-extralight text-white"
          style={{ fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.98 }}
        >
          Your skin changes with the weather, the season, the week.
          <span className="text-white/45"> Your skincare comes in a bottle that never does.</span>
        </h2>
      </Reveal>
      <Reveal className="flex max-w-xl flex-col gap-4 border-l border-blush/50 pl-6">
        <p className="text-white" style={{ fontSize: "var(--text-lg)", lineHeight: 1.4 }}>
          Our mission is to make skincare respond to the skin you actually
          have: measure first, then mix one fresh dose, every morning.
        </p>
        <p className="text-white/60" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>
          No guessing from a quiz you took once. No half-used bottles of the
          wrong thing.
        </p>
      </Reveal>
    </PhotoStatement>
  );
}
