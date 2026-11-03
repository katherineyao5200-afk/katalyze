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
          Tired of buying skincare that stops working for you?
        </h2>
      </Reveal>
      <Reveal className="flex max-w-xl flex-col gap-4 border-l border-blush/50 pl-6">
        <p className="text-white" style={{ fontSize: "var(--text-lg)", lineHeight: 1.4 }}>
          <Lead text="Most people end up with a shelf of half-used products. That's how Katalyze started: Katherine's own bottles each worked for a few weeks, then didn't, because her skin kept changing." />
        </p>
      </Reveal>
    </PhotoStatement>
  );
}
