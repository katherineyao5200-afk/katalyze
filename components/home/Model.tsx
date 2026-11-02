import PhotoStatement from "@/components/PhotoStatement";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// The business model in one glance, over the countertop photo (blurred).
// Figures from the 2026 pitch deck; all planned, nothing on sale yet.
const PARTS = [
  {
    value: "$279",
    title: "The device",
    body: "Bought once. About $51 to make at the first run.",
  },
  {
    value: "$25–89",
    title: "Refills, monthly",
    body: "Cartridge subscriptions in three tiers. This is the recurring revenue.",
  },
  {
    value: "Next",
    title: "Hotels",
    body: "Fresh, personalized skincare in luxury hotel rooms, as a B2B channel.",
  },
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
          style={{ fontSize: "clamp(40px, 5.5vw, 88px)", lineHeight: 1 }}
        >
          Sell the device once.
          <span className="text-white/45"> Refill it every month.</span>
        </h2>
      </Reveal>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PARTS.map((p, i) => (
          <li key={p.title}>
            <Reveal delayMs={i * 90} className="glass flex h-full flex-col gap-2 rounded-[24px] p-6">
              <span
                className="focal font-display font-extralight text-white"
                style={{ fontSize: "var(--text-2xl)", lineHeight: 1 }}
              >
                {p.value}
              </span>
              <span className="text-white" style={{ fontSize: "var(--text-sm)" }}>
                {p.title}
              </span>
              <span className="text-white/60" style={{ fontSize: "var(--text-xs)", lineHeight: 1.45 }}>
                {p.body}
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="text-white/50" style={{ fontSize: "var(--text-xs)" }}>
        Planned pricing. Katalyze isn&apos;t on sale yet; the first run is about 2,000 units and the waitlist hears first.
      </p>
    </PhotoStatement>
  );
}
