"use client";

import { useEffect, useRef, useState } from "react";

import { SPARKLE_PATH } from "@/components/Sparkle";
import { images } from "@/lib/images";

export const INTRO_KEY = "katalyze-intro-seen";

// Runs before first paint (see app/layout.tsx). Adds `no-intro` to <html>
// when the intro should not play, so the overlay never flashes.
export const INTRO_BOOT = `try{var d=document.documentElement;if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches||location.hash||location.pathname!=="/")d.classList.add("no-intro")}catch(e){}`;

// Keep in step with the .intro-* animations in globals.css.
const COUNT_MS = 1800;
const HOLD_MS = 350;
const LIFT_MS = 900;

const R = 300; // dial radius, in SVG units
const TICKS = Array.from({ length: 96 }, (_, i) => i);
// Twelve points of light around the dial, one per "hour".
const POINTS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * (R + 34), Math.sin(a) * (R + 34)];
});

function Dial({ lit = false }: { lit?: boolean }) {
  const color = lit ? "var(--blush)" : "var(--periwinkle)";
  return (
    <svg viewBox="-400 -400 800 800" className="h-full w-full" fill="none">
      <g stroke={color}>
        <circle r={R} strokeOpacity={lit ? 0.9 : 0.18} strokeWidth={lit ? 2 : 1} />
        <circle
          r={R - 46}
          strokeOpacity={lit ? 0.5 : 0.1}
          strokeDasharray="2 7"
        />
        {TICKS.map((i) => {
          const a = (i / TICKS.length) * Math.PI * 2;
          const long = i % 8 === 0;
          const r0 = R - (long ? 26 : 12);
          return (
            <line
              key={i}
              x1={Math.cos(a) * r0}
              y1={Math.sin(a) * r0}
              x2={Math.cos(a) * R}
              y2={Math.sin(a) * R}
              strokeOpacity={lit ? (long ? 1 : 0.7) : long ? 0.35 : 0.16}
              strokeWidth={lit && long ? 2 : 1}
            />
          );
        })}
      </g>
      {POINTS.map(([x, y], i) => {
        const s = i % 3 === 0 ? 0.75 : 0.45;
        return (
          <path
            key={i}
            d={SPARKLE_PATH}
            fill={lit ? (i % 3 === 0 ? "white" : "var(--blush)") : "var(--periwinkle)"}
            opacity={lit ? 1 : 0.3}
            transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}
          />
        );
      })}
    </svg>
  );
}

/**
 * The opening: a celestial dial around the K mark lights up clockwise,
 * blush and glowing, as a counter runs to 100; then the curtain lifts.
 * Built for a smooth first paint: every moving part is a CSS animation
 * that starts with the server-rendered HTML (before React hydrates),
 * and the counter writes straight to the DOM instead of re-rendering.
 * Plays once per visit; any click, key or scroll skips it. Never plays
 * under reduced motion, on deep links or off the homepage.
 */
export default function Intro() {
  const [phase, setPhase] = useState<"run" | "lift" | "gone">("run");
  const countRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("no-intro")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("gone");
      return;
    }
    sessionStorage.setItem(INTRO_KEY, "true");
    root.dataset.gate = "open";
    root.style.overflow = "hidden";

    // The sweep has been running since first paint; read when it began
    // so the counter and the lift line up with it exactly.
    const anim = sweepRef.current?.getAnimations?.()[0];
    const t0 =
      typeof anim?.startTime === "number" ? anim.startTime : performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / COUNT_MS);
      if (countRef.current)
        countRef.current.textContent = String(Math.round(ease(t) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const timers: number[] = [];
    let lifted = false;
    const lift = () => {
      if (lifted) return;
      lifted = true;
      cancelAnimationFrame(raf);
      if (countRef.current) countRef.current.textContent = "100";
      delete root.dataset.gate;
      root.style.overflow = "";
      setPhase("lift");
      timers.push(
        window.setTimeout(() => {
          setPhase("gone");
          root.classList.add("intro-done");
        }, LIFT_MS),
      );
    };
    const wait = Math.max(0, COUNT_MS + HOLD_MS - (performance.now() - t0));
    timers.push(window.setTimeout(lift, wait));

    const opts = { once: true, passive: true } as const;
    window.addEventListener("wheel", lift, opts);
    window.addEventListener("touchmove", lift, opts);
    window.addEventListener("keydown", lift, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("wheel", lift);
      window.removeEventListener("touchmove", lift);
      window.removeEventListener("keydown", lift);
      delete root.dataset.gate;
      root.style.overflow = "";
      root.classList.add("intro-done");
    };
  }, []);

  if (phase === "gone") return null;
  const lifting = phase === "lift";

  return (
    <div
      className={`intro fixed inset-0 z-[100] overflow-hidden bg-[color:var(--canvas-deep)] ${
        lifting ? "intro-lifting" : ""
      }`}
      aria-hidden="true"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown"))}
    >
      <div
        className="absolute inset-0"
        style={{ background: "var(--grad-haze-dark)", opacity: 0.6 }}
      />

      {/* The dial: a quiet base ring, and a lit copy revealed clockwise. */}
      <div className="intro-stage absolute inset-0 flex items-center justify-center">
        <div className="intro-dial relative aspect-square w-[min(84vmin,620px)]">
          <div className="absolute inset-0">
            <Dial />
          </div>
          {/* glow: a soft blurred copy under the crisp lit ring */}
          <div ref={sweepRef} className="intro-sweep absolute inset-0">
            <div className="absolute inset-0 opacity-70 blur-[10px] will-change-transform">
              <Dial lit />
            </div>
            <div className="absolute inset-0">
              <Dial lit />
            </div>
          </div>
          {/* the comet: a star riding the leading edge */}
          <div className="intro-comet absolute inset-0">
            <svg
              viewBox="-400 -400 800 800"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <circle cx="0" cy={-R} r="22" fill="var(--blush)" opacity="0.25" />
              <path
                d={SPARKLE_PATH}
                fill="white"
                transform={`translate(-14 ${-R - 14}) scale(1.17)`}
              />
            </svg>
          </div>

          {/* centre: mark and wordmark */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.logo.nav.src}
              alt=""
              width={images.logo.nav.width}
              height={images.logo.nav.height}
              className="intro-mark h-[clamp(52px,9vmin,92px)] w-auto"
              draggable={false}
            />
            <span
              className="intro-word overflow-hidden font-display font-extralight text-white"
              style={{ fontSize: "clamp(32px, 5.5vmin, 56px)", lineHeight: 1 }}
            >
              <span className="block">Katalyze</span>
            </span>
          </div>
        </div>
      </div>

      {/* bottom rail: line, counter */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end justify-between font-mono uppercase text-periwinkle"
        style={{
          padding: "var(--margin)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
        }}
      >
        <span>Your catalyst to better skin</span>
        <span
          ref={countRef}
          className="font-display font-extralight tabular-nums text-white normal-case"
          style={{
            fontSize: "clamp(40px, 6vw, 80px)",
            lineHeight: 0.8,
            letterSpacing: 0,
          }}
        >
          0
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new KeyboardEvent("keydown"));
        }}
        className="absolute top-6 right-6 font-mono uppercase text-periwinkle transition-colors hover:text-white"
        style={{
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
        }}
        tabIndex={-1}
      >
        Skip
      </button>
    </div>
  );
}
