"use client";

import { useEffect, useRef, useState } from "react";

import GateCanvas, { canUseFluidGate } from "@/components/GateCanvas";

const SESSION_KEY = "katalyze-gate-seen";
const COMPLETE_THRESHOLD_PX = 500;
const EXIT_DURATION_MS = 900;

/**
 * System C (§11) — the paint-to-enter gate. Guardrails are
 * non-negotiable, not tunable:
 * - Skip is visible immediately (well under 2s), keyboard-focusable,
 *   and first in the DOM/tab order.
 * - Bypassed entirely under prefers-reduced-motion, on touch devices,
 *   on repeat visits this session, and when WebGL2 + EXT_color_buffer_
 *   float aren't both available — a gate that renders but can't be
 *   drawn on is worse than no gate.
 * - Content behind it is already in the DOM regardless — this renders
 *   null by default and only shows after an effect proves none of the
 *   bypass conditions apply, so a crawler or a user with JS disabled
 *   never sees a gate at all, only the real page.
 * - No audio.
 */
export default function Gate() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const pathLengthRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === "true";
    const canDraw = canUseFluidGate();
    if (reducedMotion || isTouch || seen || !canDraw) return;
    // These bypass checks can only run client-side; syncing the real
    // value once mounted is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [visible]);

  function complete() {
    if (completedRef.current) return;
    completedRef.current = true;
    sessionStorage.setItem(SESSION_KEY, "true");
    setExiting(true);
    setTimeout(() => setVisible(false), EXIT_DURATION_MS);
  }

  function handlePathLength(delta: number) {
    pathLengthRef.current += delta;
    setProgress(Math.min(1, pathLengthRef.current / COMPLETE_THRESHOLD_PX));
    if (pathLengthRef.current >= COMPLETE_THRESHOLD_PX) complete();
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") complete();
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-midnight"
      style={{
        opacity: exiting ? 0 : 1,
        transitionProperty: "opacity",
        transitionDuration: "var(--dur-cine)",
        transitionTimingFunction: "var(--ease-glide)",
        pointerEvents: exiting ? "none" : "auto",
      }}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    >
      {/* First in the DOM: keyboard-focusable, first in tab order. */}
      <button
        type="button"
        onClick={complete}
        className="fixed top-6 right-6 z-20 uppercase text-periwinkle underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
        }}
      >
        Skip
      </button>

      <GateCanvas onPathLength={handlePathLength} />

      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush"
      />

      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4">
        <p
          className="font-mono uppercase text-periwinkle"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          Trace the K
        </p>
        <div
          className="h-px w-24 overflow-hidden"
          style={{ backgroundColor: "var(--rule-on-dark)" }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: "var(--blush)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
