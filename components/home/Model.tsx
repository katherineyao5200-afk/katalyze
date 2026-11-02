import PhotoStatement from "@/components/PhotoStatement";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// The business model in one glance, over the countertop photo (blurred).
// Figures from the 2026 pitch deck; all planned, nothing on sale yet.
const PARTS = [
  { value: "$279", body: "for the device, once. It costs about $51 to make in the first run." },
  { value: "$25–89", body: "a month for refills, depending on the plan. This is where most of the long-term revenue comes from." },
  { value: "Later", body: "hotels: a fresh dose in the bathroom of a luxury room, sold to the hotel." },
];

export default function Model() {
  return (
    <PhotoStatement src={images.mood.counter.src} position="70% 50%">
      <Reveal className="flex flex-col gap-6">
        <p
          className="font-mono uppercase text-periwinkle"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          The business model
        </p>
        <h2
          className="font-display font-extralight text-white"
          style={{ fontSize: "clamp(36px, 5vw, 76px)", lineHeight: 1.02 }}
        >
          You buy the device once. The cartridges are what you keep buying.
        </h2>
      </Reveal>
      <Reveal>
        <dl className="flex flex-col border-t border-white/15">
          {PARTS.map((p) => (
            <div key={p.value} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-white/15 py-5 sm:grid-cols-[9rem_1fr]">
              <dt className="font-display font-extralight text-white" style={{ fontSize: "var(--text-2xl)", lineHeight: 1 }}>
                {p.value}
              </dt>
              <dd className="max-w-lg text-white/75" style={{ fontSize: "var(--text-base)", lineHeight: 1.5 }}>
                {p.body}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <p className="text-white/50" style={{ fontSize: "var(--text-xs)" }}>
        Planned pricing. Nothing is on sale yet. The first run is about 2,000 units, and the waitlist hears first.
      </p>
    </PhotoStatement>
  );
}
