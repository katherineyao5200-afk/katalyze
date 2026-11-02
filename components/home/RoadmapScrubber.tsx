"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState } from "react";

import { SPARKLE_PATH } from "@/components/Sparkle";

type Stop = { phase: string; when: string; text: string };

const TICKS = 64;

// Deterministic star positions for the constellation above the ruler.
function stars(n: number) {
  let s = 41;
  const r = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: n }, (_, i) => {
    const a = r() * Math.PI * 2;
    const d = i === 0 ? 0 : 18 + Math.sqrt(r()) * 120;
    return {
      x: 200 + Math.cos(a) * d * 1.5,
      y: 80 + Math.sin(a) * d * 0.5,
      s: i === 0 ? 1.4 : 0.35 + r() * 0.5,
    };
  });
}

// How many stars each phase lights: one prototype, then a few partners,
// then the first run, then everyone after.
const LIT = [1, 4, 14, 40];

/*
 * The roadmap as a ruler you scrub (after the Earth Timeline concept):
 * drag the handle, or use the arrow keys, and the phase above changes.
 * The constellation fills in as the plan grows. It snaps to the nearest
 * phase when you let go.
 */
export default function RoadmapScrubber({ stops }: { stops: Stop[] }) {
  const id = useId();
  const pos = stops.map((_, i) => 0.06 + (i / (stops.length - 1)) * 0.88);
  const [v, setV] = useState(pos[0]);
  const [dragging, setDragging] = useState(false);
  const nearest = pos.reduce(
    (best, p, i) => (Math.abs(p - v) < Math.abs(pos[best] - v) ? i : best),
    0,
  );
  const stop = stops[nearest];
  const sky = useMemo(() => stars(LIT[LIT.length - 1]), []);
  const lit = LIT[nearest] ?? 1;

  return (
    <div className="flex flex-col items-center gap-10">
      {/* the constellation */}
      <svg
        viewBox="0 0 400 160"
        aria-hidden="true"
        className="h-auto w-full max-w-xl overflow-visible"
      >
        {sky.map((st, i) => (
          <path
            key={i}
            d={SPARKLE_PATH}
            fill={i === 0 ? "var(--blush)" : i % 4 === 0 ? "var(--blush)" : "white"}
            style={{
              opacity: i < lit ? 1 : 0.08,
              transform: `translate(${st.x - 12 * st.s}px, ${st.y - 12 * st.s}px) scale(${
                i < lit ? st.s : st.s * 0.6
              })`,
              transition: `opacity 700ms ${i * 12}ms cubic-bezier(.16,1,.3,1), transform 900ms ${
                i * 12
              }ms cubic-bezier(.16,1,.3,1)`,
            }}
          />
        ))}
      </svg>

      {/* the phase */}
      <div className="relative min-h-[150px] w-full max-w-xl text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stop.phase}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <span
              className={`font-mono uppercase ${nearest === 0 ? "text-blush" : "text-periwinkle"}`}
              style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
            >
              {String(nearest + 1).padStart(2, "0")} · {stop.when}
            </span>
            <span
              className="font-display font-extralight text-white"
              style={{ fontSize: "var(--text-3xl)", lineHeight: 1 }}
            >
              {stop.phase}
            </span>
            <span
              className="max-w-md text-[color:var(--muted-on-dark)]"
              style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
            >
              {stop.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* the ruler */}
      <div className="relative w-full max-w-3xl select-none rounded-lg pt-2 pb-8 outline-offset-8 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-blush has-[input:focus-visible]:outline">
        <div className="relative h-10">
          {Array.from({ length: TICKS + 1 }, (_, i) => {
            const x = i / TICKS;
            const major = pos.some((p) => Math.abs(p - x) < 0.5 / TICKS);
            const passed = x <= v;
            return (
              <span
                key={i}
                aria-hidden="true"
                className="absolute bottom-0 w-px -translate-x-1/2"
                style={{
                  left: `${x * 100}%`,
                  height: major ? 26 : 12,
                  background: passed ? "#fff" : "var(--periwinkle)",
                  opacity: passed ? (major ? 1 : 0.6) : major ? 0.6 : 0.25,
                  transition: "background 300ms, opacity 300ms",
                }}
              />
            );
          })}
          {/* handle */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 -translate-x-1/2"
            style={{
              left: `${v * 100}%`,
              transition: dragging ? "none" : "left 600ms cubic-bezier(.16,1,.3,1)",
            }}
          >
            <span className="block h-10 w-[2px] bg-blush shadow-[0_0_12px_var(--blush)]" />
            <span className="glass absolute -top-2 left-1/2 block h-4 w-4 -translate-x-1/2 rounded-full !bg-blush" />
          </span>
        </div>
        {/* labels */}
        <div className="relative mt-3 h-4">
          {stops.map((s, i) => (
            <button
              key={s.phase}
              type="button"
              onClick={() => setV(pos[i])}
              className={`absolute -translate-x-1/2 whitespace-nowrap font-mono uppercase transition-colors ${
                i === nearest ? "text-white" : "text-periwinkle hover:text-white"
              }`}
              style={{
                left: `${pos[i] * 100}%`,
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
              tabIndex={-1}
            >
              {s.when}
            </button>
          ))}
        </div>
        <label htmlFor={id} className="sr-only">
          Roadmap phase
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={v}
          aria-valuetext={`${stop.when}: ${stop.phase}`}
          onChange={(e) => setV(+e.target.value)}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => {
            setDragging(false);
            setV(pos[nearest]);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              setV(pos[Math.min(stops.length - 1, nearest + 1)]);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              setV(pos[Math.max(0, nearest - 1)]);
            }
          }}
          className="roadmap-range absolute inset-x-0 top-0 h-12 w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
