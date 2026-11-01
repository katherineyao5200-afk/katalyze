"use client";

import { useEffect, useRef, useState } from "react";

import { images } from "@/lib/images";

export const INTRO_KEY = "katalyze-intro-seen";

// Runs before first paint (see app/layout.tsx). Adds `no-intro` to <html>
// when the intro should not play, so the overlay never flashes.
export const INTRO_BOOT = `try{var d=document.documentElement;if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches||location.hash||location.pathname!=="/")d.classList.add("no-intro")}catch(e){}`;

const COUNT_MS = 1500;
const HOLD_MS = 350;
const LIFT_MS = 1000;

/**
 * A short, automatic opening: the K draws up from its base while a
 * counter runs to 100, the wordmark settles, then the whole curtain
 * lifts off the hero. About 2.8 seconds, once per visit. Any click,
 * key, scroll or the Skip control ends it at once. Never plays under
 * reduced motion, on deep links, or on pages other than the homepage;
 * without JavaScript a <noscript> style hides it.
 */
export default function Intro() {
  const [phase, setPhase] = useState<"run" | "lift" | "gone">("run");
  const [count, setCount] = useState(0);
  const timers = useRef<number[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("no-intro")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("gone");
      return;
    }
    sessionStorage.setItem(INTRO_KEY, "true");
    root.dataset.gate = "open"; // lets the WebGL scenes idle meanwhile
    root.style.overflow = "hidden";

    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / COUNT_MS);
      setCount(Math.round(ease(t) * 100));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const lift = () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      setCount(100);
      delete root.dataset.gate;
      root.style.overflow = "";
      setPhase("lift");
      timers.current = [window.setTimeout(() => setPhase("gone"), LIFT_MS)];
    };
    timers.current.push(window.setTimeout(lift, COUNT_MS + HOLD_MS));

    const skip = () => lift();
    const opts = { once: true, passive: true } as const;
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchmove", skip, opts);
    window.addEventListener("keydown", skip, { once: true });

    return () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
      delete root.dataset.gate;
      root.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  const lifting = phase === "lift";

  return (
    <div
      className="intro fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown"))}
      style={{
        transform: lifting ? "translateY(-100%)" : "none",
        transition: `transform ${LIFT_MS}ms cubic-bezier(.76,0,.24,1)`,
        pointerEvents: lifting ? "none" : "auto",
      }}
    >
      <div className="absolute inset-0 bg-[color:var(--canvas-deep)]" />
      <div
        className="absolute inset-0"
        style={{ background: "var(--grad-haze-dark)", opacity: 0.7 }}
      />

      {/* centre: the mark draws up, the wordmark settles beside it */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-5"
        style={{
          transform: lifting ? "translateY(18vh)" : "none",
          opacity: lifting ? 0 : 1,
          transition: `transform ${LIFT_MS}ms cubic-bezier(.76,0,.24,1), opacity ${LIFT_MS * 0.6}ms ease`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images.logo.nav.src}
          alt=""
          width={images.logo.nav.width}
          height={images.logo.nav.height}
          className="intro-mark h-[clamp(56px,9vw,112px)] w-auto"
          draggable={false}
        />
        <span
          className="intro-word overflow-hidden font-display font-extralight text-white"
          style={{ fontSize: "clamp(44px, 7.5vw, 96px)", lineHeight: 1 }}
        >
          <span className="block">Katalyze</span>
        </span>
      </div>

      {/* bottom rail: label, counter, hairline */}
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
          className="font-display font-extralight tabular-nums text-white normal-case"
          style={{
            fontSize: "clamp(40px, 6vw, 80px)",
            lineHeight: 0.8,
            letterSpacing: 0,
          }}
        >
          {count}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--rule-on-dark)]">
        <div
          className="h-full origin-left bg-blush"
          style={{ transform: `scaleX(${count / 100})` }}
        />
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
