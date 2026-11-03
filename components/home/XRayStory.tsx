"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

import XRay from "@/components/home/XRay";
import { CARTRIDGE_TINT } from "@/lib/tints";

const XRayScene = dynamic(() => import("@/components/home/XRayScene"), { ssr: false });

/*
 * "What happens inside", the cinematic version: a tall section whose
 * scroll drives a camera through the x-ray device (XRayScene). Captions
 * change with each beat. Reduced motion or no WebGL falls back to the
 * flat SVG cutaway (XRay), which shows the same four steps.
 */

const BEATS = [
  { from: 0, title: "This is Katalyze.", body: "Let's look inside." },
  { from: 0.1, n: "01", title: "Touch the pad.", body: "The sensor on top checks if your skin is drier than normal for you." },
  { from: 0.25, n: "02", title: "Your phone picks the mix.", body: "The app adds the weather and how your skin feels, then sends the amounts back." },
  { from: 0.4, n: "03", title: "Each pump measures one ingredient.", body: "Six pumps, six tubes. Nothing mixes until it reaches the dish." },
  { from: 0.7, n: "04", title: "Weighed into the dish.", body: "A scale under the dish stops each pump at the right amount." },
  { from: 0.86, title: "Ready. Scoop and apply.", body: "About a minute, every morning." },
];

const AMOUNTS: [keyof typeof CARTRIDGE_TINT, string, number][] = [
  ["B-01", "Toner", 0.55],
  ["B-02", "Serum", 1],
  ["B-03", "Cream", 0.7],
  ["A-01", "Hyaluronic acid", 0.45],
  ["A-02", "Niacinamide", 0.2],
  ["A-03", "Ceramide", 0.3],
];

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function XRayStory() {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [webgl, setWebgl] = useState(true);
  const onUnsupported = useCallback(() => setWebgl(false), []);
  const track = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const b = BEATS.reduce((acc, x, i) => (v >= x.from ? i : acc), 0);
    if (b !== beat) setBeat(b);
    // Coarse steps are enough for the progress line and the phone card.
    const q = Math.round(v * 100) / 100;
    if (q !== p) setP(q);
  });

  if (reduced || !webgl) return <XRay />;

  const phoneOn = p > 0.27 && p < 0.42;
  const b = BEATS[beat];

  return (
    <section
      ref={track}
      aria-labelledby="xray-title"
      className="relative bg-[color:var(--canvas-deep)] text-white"
      style={{ height: "560vh" }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <XRayScene progress={scrollYProgress} onUnsupported={onUnsupported} className="absolute inset-0" />

        {/* soft vignette so captions read over the model */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgb(21 24 46 / 0.85) 100%), linear-gradient(180deg, rgb(21 24 46 / 0.7) 0%, transparent 22%, transparent 70%, rgb(21 24 46 / 0.9) 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex items-center justify-between font-mono uppercase text-periwinkle"
          style={{
            maxWidth: "var(--max-w)",
            paddingInline: "var(--margin)",
            paddingTop: "calc(var(--s-24) * 0.9)",
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--track-label)",
          }}
        >
          <h2 id="xray-title" className="m-0 font-normal">
            What happens inside
          </h2>
          <span aria-hidden="true">X-ray view</span>
        </div>

        {/* caption */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)", paddingBottom: "var(--s-16)" }}
          aria-live="polite"
        >
          <div key={beat} className="xray-caption flex max-w-xl flex-col gap-3">
            {b.n && (
              <span className="font-mono text-blush" style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--track-label)" }}>
                STEP {b.n} / 04
              </span>
            )}
            <p className="font-display font-extralight" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
              {b.title}
            </p>
            <p className="text-white/75" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}>
              {b.body}
            </p>
          </div>
          <div className="mt-8 h-px w-full bg-white/10">
            <div className="h-px bg-blush/70" style={{ width: `${p * 100}%` }} />
          </div>
        </div>

        {/* the app's answer, on the phone */}
        <div
          aria-hidden={!phoneOn}
          className="pointer-events-none absolute right-[var(--margin)] top-1/2 w-52 -translate-y-1/2 border border-[color:var(--rule-on-dark)] bg-[color:var(--canvas-deep)]/85 p-5 backdrop-blur-md transition-all duration-700 max-md:top-28 max-md:w-44 max-md:translate-y-0"
          style={{
            borderRadius: "28px",
            opacity: phoneOn ? 1 : 0,
            transform: `${phoneOn ? "" : "translateX(24px)"}`,
            transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
          }}
        >
          <p className="font-mono uppercase text-periwinkle" style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}>
            Today&apos;s mix
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {AMOUNTS.map(([code, name, amt], i) => (
              <li key={code} className="flex flex-col gap-1">
                <span className="text-white/70" style={{ fontSize: "11px" }}>
                  {name}
                </span>
                <span className="block h-1.5 w-full rounded-full bg-white/10">
                  <span
                    className="block h-1.5 rounded-full transition-[width] duration-700"
                    style={{
                      width: phoneOn ? `${amt * 100}%` : "0%",
                      background: CARTRIDGE_TINT[code],
                      transitionDelay: `${i * 90}ms`,
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-white/50" style={{ fontSize: "10px" }}>
            Demo amounts
          </p>
        </div>
      </div>
    </section>
  );
}
