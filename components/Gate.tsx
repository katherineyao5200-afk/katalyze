"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import GateCanvas, { canUseFluidGate } from "@/components/GateCanvas";
import { images } from "@/lib/images";

const SESSION_KEY = "katalyze-gate-seen";
const EXIT_DELAY_MS = 900;
const EXIT_DURATION_MS = 1100;

// Centre-lines of the K mark's three strokes, in the mark image's own
// pixel space (360 × 433), measured from mark-cream.png. The sparkle is
// not traced: it blooms when the K is complete.
const VIEW_W = 360;
const VIEW_H = 433;
type Pt = { x: number; y: number };

// Each stroke is a quadratic curve (a straight line when the control
// point sits on it): start, control, end.
const STROKES: { id: string; p: [Pt, Pt, Pt]; samples: number }[] = [
  {
    id: "stem",
    p: [
      { x: 56, y: 24 },
      { x: 56, y: 222 },
      { x: 56, y: 420 },
    ],
    samples: 22,
  },
  {
    id: "arm",
    p: [
      { x: 98, y: 250 },
      { x: 162, y: 214 },
      { x: 182, y: 122 },
    ],
    samples: 14,
  },
  {
    id: "leg",
    p: [
      { x: 104, y: 262 },
      { x: 252, y: 286 },
      { x: 300, y: 420 },
    ],
    samples: 18,
  },
];

function quad([a, c, b]: [Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

// Even enough spacing for these gentle curves.
const SAMPLES: Pt[][] = STROKES.map((s) =>
  Array.from({ length: s.samples + 1 }, (_, k) => quad(s.p, k / s.samples)),
);

const pathD = ([a, c, b]: [Pt, Pt, Pt]) =>
  `M${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;

// How much of the K has to be covered. Generous on purpose: this is a
// welcome, not a test.
const TOTAL_NEEDED = 0.85;
const STROKE_NEEDED = 0.7;

function distToSegment(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * System C (§11) — the trace-to-enter gate. The visitor follows the
 * three strokes of the K; paint blooms under the cursor and each part
 * of the K lights up as it is covered. Guardrails, not tunable:
 * - Skip is visible immediately, keyboard-focusable, first in tab
 *   order; Escape and Enter also skip.
 * - Bypassed under prefers-reduced-motion, on touch devices, on repeat
 *   visits this session, on any page but the homepage, on deep links
 *   (a #hash), and without WebGL2 + float render targets.
 * - Renders null until an effect proves none of those apply, so
 *   crawlers and no-JS visitors only ever see the real page.
 * - No audio.
 */
export default function Gate() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [visited, setVisited] = useState<boolean[][]>(() =>
    STROKES.map((s) => Array(s.samples + 1).fill(false)),
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const visitedRef = useRef(visited);
  const lastRef = useRef<Pt | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === "true";
    const deepLink =
      window.location.pathname !== "/" || window.location.hash !== "";
    if (reducedMotion || isTouch || seen || deepLink || !canUseFluidGate())
      return;
    // These bypass checks can only run client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // Lets the WebGL scenes underneath pause until the gate lifts.
    document.documentElement.dataset.gate = "open";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      delete document.documentElement.dataset.gate;
    };
  }, [visible]);

  const leave = useCallback((delay: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    sessionStorage.setItem(SESSION_KEY, "true");
    setTimeout(() => {
      // Wake the page underneath so it is live as the gate fades.
      delete document.documentElement.dataset.gate;
      setExiting(true);
    }, delay);
    setTimeout(() => setVisible(false), delay + EXIT_DURATION_MS);
  }, []);

  function track(event: React.PointerEvent) {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX - 5}px, ${event.clientY - 5}px, 0)`;
    }
    const svg = svgRef.current;
    if (!svg || completedRef.current) return;

    // Pointer into the mark's viewBox space.
    const rect = svg.getBoundingClientRect();
    const scale = VIEW_W / rect.width;
    const p = {
      x: (event.clientX - rect.left) * scale,
      y: (event.clientY - rect.top) * scale,
    };
    // Join the gap since the last event so a quick stroke doesn't skip
    // points, but not a long jump: that is a fling, not a trace.
    const last = lastRef.current;
    const prev =
      last && Math.hypot(p.x - last.x, p.y - last.y) / scale < 90 ? last : p;
    lastRef.current = p;

    // Hit radius: about 26 screen px, never smaller than the stroke.
    const radius = Math.max(26 * scale, 20);
    let changed = false;
    const next = visitedRef.current.map((row, si) =>
      row.map((v, k) => {
        if (v) return v;
        const hit = distToSegment(SAMPLES[si][k], prev, p) <= radius;
        if (hit) changed = true;
        return hit;
      }),
    );
    if (!changed) return;
    visitedRef.current = next;
    setVisited(next);

    const per = next.map((row) => row.filter(Boolean).length / row.length);
    const total = next.flat().filter(Boolean).length / next.flat().length;
    if (total >= TOTAL_NEEDED && per.every((f) => f >= STROKE_NEEDED)) {
      setDone(true);
      leave(EXIT_DELAY_MS);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") leave(0);
  }

  if (!visible) return null;

  const flat = visited.flat();
  const progress = done ? 1 : flat.filter(Boolean).length / flat.length;
  const started = flat.some(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Katalyze"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[color:var(--canvas-deep)]"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.04)" : "none",
        transitionProperty: "opacity, transform",
        transitionDuration: `${EXIT_DURATION_MS}ms`,
        transitionTimingFunction: "var(--ease-glide)",
        pointerEvents: exiting ? "none" : "auto",
      }}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={() => (lastRef.current = null)}
      onKeyDown={handleKeyDown}
    >
      {/* First in the DOM: keyboard-focusable, first in tab order. */}
      <button
        type="button"
        autoFocus
        onClick={() => leave(0)}
        className="fixed top-6 right-6 z-20 rounded-full border border-[color:var(--rule-on-dark)] px-4 py-2 uppercase text-periwinkle transition-colors duration-[var(--dur-fast)] hover:border-blush hover:text-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
          cursor: "pointer",
        }}
      >
        Skip →
      </button>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--grad-haze-dark)", opacity: 0.8 }}
      />

      <GateCanvas />

      {/* The mark and its guide. Pointer events pass through to the
          canvas; tracking happens on the wrapper. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-10"
        style={{
          width: "min(34vh, 52vw)",
          aspectRatio: `${VIEW_W} / ${VIEW_H}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images.logo.nav.src}
          alt=""
          width={VIEW_W}
          height={VIEW_H}
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
          style={{
            opacity: done ? 1 : 0.07,
            filter: done
              ? "drop-shadow(0 0 28px rgba(232,204,210,0.55))"
              : "none",
            transition:
              "opacity 700ms var(--ease-glide), filter 700ms var(--ease-glide)",
          }}
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          style={{
            opacity: done ? 0 : 1,
            transition: "opacity 500ms var(--ease-glide)",
          }}
        >
          <defs>
            <filter id="gate-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dashed guide */}
          {STROKES.map((s) => (
            <path
              key={s.id}
              d={pathD(s.p)}
              fill="none"
              stroke="var(--periwinkle)"
              strokeOpacity={0.55}
              strokeWidth={3}
              strokeDasharray="2 12"
              strokeLinecap="round"
            />
          ))}

          {/* Covered segments light up in blush */}
          <g filter="url(#gate-glow)">
            {STROKES.map((s, si) =>
              visited[si].map((v, k) => {
                const pts = SAMPLES[si];
                if (k === 0 || !v || !visited[si][k - 1]) return null;
                const a = pts[k - 1];
                const b = pts[k];
                return (
                  <line
                    key={`${s.id}-${k}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="var(--blush)"
                    strokeWidth={9}
                    strokeLinecap="round"
                  />
                );
              }),
            )}
          </g>

          {/* Stroke order: where each stroke starts */}
          {STROKES.map((s, si) => {
            const start = SAMPLES[si][0];
            const covered =
              visited[si].filter(Boolean).length / visited[si].length;
            return (
              <g key={`n-${s.id}`} opacity={covered > 0.5 ? 0.25 : 1}>
                <circle
                  cx={start.x}
                  cy={start.y}
                  r={7}
                  fill="var(--blush)"
                  className={si === 0 && !started ? "gate-pulse" : undefined}
                />
                <text
                  x={start.x + (si === 0 ? -34 : 14)}
                  y={start.y + (si === 0 ? 5 : si === 1 ? 16 : 22)}
                  fill="var(--periwinkle)"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 15,
                    letterSpacing: "0.1em",
                  }}
                >
                  {String(si + 1).padStart(2, "0")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pointer-events-none relative z-10 mt-12 flex flex-col items-center gap-4">
        <p
          className="font-mono uppercase text-periwinkle"
          style={{
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--track-label)",
          }}
          aria-live="polite"
        >
          {done
            ? "[Welcome in]"
            : `[Trace the K · ${Math.round(progress * 100)
                .toString()
                .padStart(2, "0")}%]`}
        </p>
        <div
          className="h-px w-40 overflow-hidden"
          style={{ backgroundColor: "var(--rule-on-dark)" }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: "var(--blush)",
              transition: "width 300ms var(--ease-glide)",
            }}
          />
        </div>
        <p
          className="text-[color:var(--faint-on-dark)]"
          style={{ fontSize: "var(--text-xs)" }}
        >
          Follow the three strokes in order, or press Skip.
        </p>
      </div>

      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-30 h-2.5 w-2.5 rounded-full bg-blush"
        style={{
          transform: "translate3d(-20px, -20px, 0)",
          boxShadow: "0 0 18px 4px rgba(232,204,210,0.45)",
        }}
      />
    </div>
  );
}
