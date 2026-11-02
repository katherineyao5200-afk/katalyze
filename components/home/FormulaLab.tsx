"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Reveal from "@/components/Reveal";

/*
 * An interactive illustration of how the rule-based engine reasons.
 * Every number here is made up for the demo and labelled that way: no
 * formulation data exists yet, so the tubes show relative weighting
 * inside a "safe range" band, never percentages. The note under the dish
 * is a fixed template (the real app uses AI only to word the
 * explanation, never to pick the formula).
 */

type Weather = "humid" | "mild" | "dry";
type Feel = "comfortable" | "tight" | "irritated" | "shiny";

const WEATHER: { id: Weather; label: string }[] = [
  { id: "humid", label: "Humid" },
  { id: "mild", label: "Mild" },
  { id: "dry", label: "Dry and cold" },
];

const FEEL: { id: Feel; label: string }[] = [
  { id: "comfortable", label: "Comfortable" },
  { id: "tight", label: "Tight" },
  { id: "irritated", label: "Irritated" },
  { id: "shiny", label: "Shiny" },
];

// Six channels: three base, three active. Each has a safe range
// (min-max, 0-1 of the tube) that the rules can never leave.
const CHANNELS = [
  { code: "B-01", name: "Toner", kind: "base", min: 0.1, max: 0.55 },
  { code: "B-02", name: "Serum", kind: "base", min: 0.5, max: 0.8 },
  { code: "B-03", name: "Cream", kind: "base", min: 0.1, max: 0.6 },
  { code: "A-01", name: "Hyaluronic acid", kind: "active", min: 0.1, max: 0.7 },
  { code: "A-02", name: "Niacinamide", kind: "active", min: 0.05, max: 0.6 },
  { code: "A-03", name: "Ceramide", kind: "active", min: 0.1, max: 0.65 },
] as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

function blend(trend: number, weather: Weather, feel: Feel) {
  const dry = weather === "dry" ? 1 : 0;
  const humid = weather === "humid" ? 1 : 0;
  const low = Math.max(0, -trend); // drier than usual, 0-1
  const high = Math.max(0, trend);
  const raw = [
    // toner: lighter days
    0.3 +
      0.15 * humid +
      0.08 * high -
      0.12 * dry +
      (feel === "shiny" ? 0.12 : 0),
    // serum: the core of every dose
    0.65 - 0.08 * dry + 0.06 * humid,
    // cream: drier, colder days
    0.3 + 0.18 * dry + 0.15 * low - 0.15 * humid + (feel === "tight" ? 0.1 : 0),
    0.3 + 0.3 * low + 0.1 * dry + (feel === "tight" ? 0.15 : 0) - 0.1 * high,
    0.25 +
      (feel === "shiny" ? 0.3 : 0) +
      0.08 * humid -
      (feel === "irritated" ? 0.12 : 0),
    0.25 + (feel === "irritated" ? 0.3 : 0) + 0.18 * dry + 0.06 * low,
  ];
  return raw.map((v, i) => clamp(v, CHANNELS[i].min, CHANNELS[i].max));
}

function note(trend: number, weather: Weather, feel: Feel) {
  const reading =
    trend < -0.2
      ? "Your reading is drier than your usual"
      : trend > 0.2
        ? "Your reading is more hydrated than your usual"
        : "Your reading is close to your usual";
  const air =
    weather === "dry"
      ? "the air is dry and cold"
      : weather === "humid"
        ? "it's humid out"
        : "the weather is mild";
  const up: string[] = [];
  if (trend < -0.2 || feel === "tight") up.push("hyaluronic acid");
  if (feel === "irritated" || weather === "dry") up.push("ceramide");
  if (feel === "shiny") up.push("niacinamide");
  const texture =
    weather === "dry" || trend < -0.4
      ? "The base leans on cream."
      : weather === "humid"
        ? "The base leans on toner."
        : "The base stays mostly serum.";
  const weighted = up.length
    ? `so ${up.join(" and ")} ${up.length > 1 ? "are" : "is"} weighted up.`
    : "so the actives stay near their usual levels.";
  return `${reading} and ${air}, ${weighted} ${texture} Everything stays inside its safe range.`;
}

// Liquid tints from the palette only: bases read periwinkle-white,
// actives read blush.
const TINT = {
  base: "color-mix(in oklab, var(--periwinkle) 45%, white)",
  active: "var(--blush)",
};

const READ_MS = 3000;
const MIX_MS = 2200;

// A burst of sparks at a point (ShootingStars listens for this).
function burst(x: number, y: number) {
  window.dispatchEvent(new CustomEvent("katalyze:burst", { detail: { x, y } }));
}

function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend
        className="mb-3 font-mono uppercase text-periwinkle"
        style={{
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
        }}
      >
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.id === value;
          return (
            <label
              key={o.id}
              className={`cursor-pointer rounded-full px-4 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blush ${
                on ? "btn-primary" : "glass text-white/80 hover:text-white"
              }`}
              style={{ fontSize: "var(--text-sm)" }}
            >
              <input
                type="radio"
                className="sr-only"
                name={legend}
                checked={on}
                onChange={() => onChange(o.id)}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function FormulaLab() {
  const [trend, setTrend] = useState(-0.35);
  const [weather, setWeather] = useState<Weather>("dry");
  const [feel, setFeel] = useState<Feel>("tight");
  const [reading, setReading] = useState<"idle" | "reading" | "done">("idle");
  const [holdPct, setHoldPct] = useState(0);
  const holdStart = useRef<number | null>(null);
  const raf = useRef(0);
  const wave = useRef<SVGPolylineElement>(null);
  const [phase, setPhase] = useState<"idle" | "mixing" | "ready">("idle");
  const [doses, setDoses] = useState(0);
  const mixTimer = useRef(0);

  const levels = blend(trend, weather, feel);

  // Changing any input empties the dish: the dose no longer matches.
  const inputs = `${trend}|${weather}|${feel}`;
  const [mixedFor, setMixedFor] = useState<string | null>(null);
  if (mixedFor !== null && mixedFor !== inputs && phase !== "idle") {
    setPhase("idle");
    setMixedFor(null);
  }

  const mix = useCallback(
    (e?: React.MouseEvent) => {
      if (phase === "mixing") return;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const at = e
        ? { x: e.clientX, y: e.clientY }
        : null;
      setMixedFor(inputs);
      setPhase("mixing");
      window.clearTimeout(mixTimer.current);
      mixTimer.current = window.setTimeout(
        () => {
          setPhase("ready");
          setDoses((d) => d + 1);
          if (at) burst(at.x, at.y - 120);
        },
        reduce ? 0 : MIX_MS,
      );
    },
    [inputs, phase],
  );

  const stopHold = useCallback(() => {
    cancelAnimationFrame(raf.current);
    holdStart.current = null;
    setReading((r) => (r === "reading" ? "idle" : r));
    setHoldPct(0);
  }, []);

  const startHold = useCallback(() => {
    if (holdStart.current != null) return;
    holdStart.current = performance.now();
    setReading("reading");
    const tick = () => {
      if (holdStart.current == null) return;
      const t = (performance.now() - holdStart.current) / READ_MS;
      // A live trace while the pad reads: noisy at first, settling.
      if (wave.current) {
        const amp = 9 * (1 - Math.min(1, t)) + 1.5;
        const pts = Array.from({ length: 48 }, (_, i) => {
          const x = (i / 47) * 200;
          const y =
            20 +
            Math.sin(i * 0.55 + performance.now() / 90) * amp * 0.6 +
            Math.sin(i * 1.7 + performance.now() / 50) * amp * 0.4;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        wave.current.setAttribute("points", pts.join(" "));
      }
      if (t >= 1) {
        holdStart.current = null;
        setHoldPct(1);
        setReading("done");
        const pad = document.getElementById("lab-pad")?.getBoundingClientRect();
        if (pad) burst(pad.left + pad.width / 2, pad.top + pad.height / 2);
        // A demo reading: somewhere between quite dry and a little
        // more hydrated than usual.
        setTrend(Math.round((Math.random() * 1.3 - 0.85) * 20) / 20);
        return;
      }
      setHoldPct(t);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(mixTimer.current);
    },
    [],
  );

  // Dose colour: weighted mix of the six tints.
  const baseShare = levels.slice(0, 3).reduce((a, b) => a + b, 0);
  const activeShare = levels.slice(3).reduce((a, b) => a + b, 0);
  const activePct = Math.round((activeShare / (baseShare + activeShare)) * 100);
  const cupColor = `color-mix(in oklab, ${TINT.active} ${activePct}%, ${TINT.base})`;

  const trendLabel =
    trend < -0.2
      ? "Drier than usual"
      : trend > 0.2
        ? "More hydrated than usual"
        : "About usual";

  return (
    <section
      aria-labelledby="lab-title"
      className="relative overflow-hidden bg-[color:var(--canvas-deep)] text-white"
      style={{ paddingBlock: "var(--s-32)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 gap-y-14"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-6 lg:col-span-5">
          <h2
            id="lab-title"
            className="font-display font-extralight"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            <span className="text-periwinkle">Not a quiz.</span>
            <br />
            A conversation.
          </h2>
          <p
            className="max-w-md text-[color:var(--muted-on-dark)]"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Try it. Take a reading, pick the weather and how your skin feels,
            and watch all six cartridges rebalance.
          </p>

          {/* 01: the sensor */}
          <div className="mt-4 flex flex-col gap-4 border-t border-[color:var(--rule-on-dark)] pt-8">
            <p
              className="font-mono uppercase text-periwinkle"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              [01 · Fingertip reading]
            </p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  startHold();
                }}
                onPointerUp={stopHold}
                onPointerCancel={stopHold}
                onKeyDown={(e) => {
                  if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                    e.preventDefault();
                    startHold();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") stopHold();
                }}
                onContextMenu={(e) => e.preventDefault()}
                id="lab-pad"
                aria-label="Hold to take a demo reading"
                data-cursor="Hold"
                className={`relative grid size-24 shrink-0 cursor-pointer touch-none select-none place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush ${
                  reading === "idle" ? "lab-pad-idle" : ""
                }`}
              >
                <svg
                  viewBox="0 0 96 96"
                  className="absolute inset-0 size-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    fill="none"
                    stroke="var(--rule-on-dark)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    fill="none"
                    stroke="var(--blush)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - holdPct}
                  />
                </svg>
                <span
                  className={`grid size-16 place-items-center rounded-full border transition-[transform,background-color] duration-[var(--dur-base)] ${
                    reading === "reading"
                      ? "scale-90 border-blush bg-blush/25"
                      : "border-white/30 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* a fingertip pad: concentric electrode rings */}
                  <svg
                    viewBox="0 0 32 32"
                    className="size-8"
                    aria-hidden="true"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity=".5"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity=".7"
                    />
                    <circle cx="16" cy="16" r="3" fill="currentColor" />
                  </svg>
                </span>
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p
                  className="text-white"
                  style={{ fontSize: "var(--text-sm)" }}
                  aria-live="polite"
                >
                  {reading === "reading"
                    ? "Reading… keep holding"
                    : reading === "done"
                      ? `Demo reading: ${trendLabel.toLowerCase()}`
                      : "Press and hold the pad for three seconds"}
                </p>
                <svg
                  viewBox="0 0 200 40"
                  className="h-10 w-full max-w-[200px]"
                  aria-hidden="true"
                >
                  <line
                    x1="0"
                    y1="20"
                    x2="200"
                    y2="20"
                    stroke="var(--rule-on-dark)"
                  />
                  <polyline
                    ref={wave}
                    fill="none"
                    stroke="var(--periwinkle)"
                    strokeWidth="1.5"
                    points="0,20 200,20"
                    style={{ opacity: reading === "reading" ? 1 : 0.35 }}
                  />
                </svg>
              </div>
            </div>
            <label className="flex flex-col gap-2">
              <span
                className="flex justify-between text-[color:var(--muted-on-dark)]"
                style={{ fontSize: "var(--text-xs)" }}
              >
                <span>Drier</span>
                <span className="font-mono text-periwinkle">
                  [{trendLabel}]
                </span>
                <span>More hydrated</span>
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.05}
                value={trend}
                onChange={(e) => setTrend(Number(e.target.value))}
                aria-label="Hydration trend compared with your usual"
                className="lab-range w-full"
              />
            </label>
          </div>

          <div className="flex flex-col gap-8 border-t border-[color:var(--rule-on-dark)] pt-8">
            <Segmented
              legend="[02 · Local weather]"
              options={WEATHER}
              value={weather}
              onChange={setWeather}
            />
            <Segmented
              legend="[03 · Morning check-in]"
              options={FEEL}
              value={feel}
              onChange={setFeel}
            />
          </div>
        </Reveal>

        {/* The machine's view: six channels, the dose dish, the note */}
        <Reveal
          variant="scale"
          className="col-span-12 flex flex-col gap-8 lg:col-span-6 lg:col-start-7 lg:self-center"
        >
          <div
            className="spot relative border border-[color:var(--rule-on-dark)] bg-[color:var(--panel)] p-6 sm:p-10"
            style={{ borderRadius: "var(--r-lg)" }}
          >
            <div
              className="mb-6 flex items-center justify-between font-mono uppercase text-periwinkle"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              <span>[Today&apos;s blend · demo]</span>
              <span className="flex items-center gap-2" aria-live="polite">
                <span
                  className={`size-1.5 rounded-full ${phase === "mixing" ? "lab-live bg-blush" : phase === "ready" ? "bg-white" : "bg-periwinkle"}`}
                  aria-hidden="true"
                />
                {phase === "mixing"
                  ? "Dispensing"
                  : phase === "ready"
                    ? `Dose ${String(doses).padStart(2, "0")} ready`
                    : "Waiting to mix"}
              </span>
            </div>

            <ul
              className="grid grid-cols-6 gap-3 sm:gap-5"
              aria-label="Relative weighting of each cartridge"
            >
              {CHANNELS.map((c, i) => (
                <li key={c.code} className="flex flex-col items-center gap-3">
                  <div
                    className={`relative h-40 w-full max-w-12 overflow-hidden rounded-full border bg-white/[0.03] transition-[border-color,box-shadow] duration-500 sm:h-48 ${
                      phase === "mixing"
                        ? "border-white/50 shadow-[0_0_18px_rgb(232_204_210/0.35)]"
                        : "border-white/20"
                    }`}
                    role="meter"
                    aria-label={c.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(levels[i] * 100)}
                  >
                    {/* safe range band */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 border-y border-dashed border-white/30 bg-white/[0.04]"
                      style={{
                        bottom: `${c.min * 100}%`,
                        height: `${(c.max - c.min) * 100}%`,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="lab-liquid absolute inset-x-0 bottom-0"
                      style={{
                        height: `${levels[i] * 100}%`,
                        background: `linear-gradient(to top, ${TINT[c.kind]}, color-mix(in oklab, ${TINT[c.kind]} 55%, transparent))`,
                      }}
                    >
                      <span className="lab-meniscus absolute inset-x-0 top-0 h-1 bg-white/70" />
                    </div>
                  </div>
                  <span
                    className={`font-mono ${c.kind === "active" ? "text-blush" : "text-periwinkle"}`}
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    {c.code}
                  </span>
                </li>
              ))}
            </ul>

            {/* Six lines, one per channel, meeting at the dish. */}
            <div className="relative -mt-1 h-16" aria-hidden="true">
              <svg
                viewBox="0 0 600 64"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                {CHANNELS.map((c, i) => {
                  const x = ((i + 0.5) / 6) * 600;
                  return (
                    <path
                      key={c.code}
                      d={`M${x} 0 C${x} 36 300 24 300 64`}
                      fill="none"
                      stroke={c.kind === "active" ? "var(--blush)" : "var(--periwinkle)"}
                      strokeWidth={phase === "mixing" ? 2 : 1}
                      strokeOpacity={phase === "mixing" ? 0.95 : 0.25}
                      vectorEffect="non-scaling-stroke"
                      className={phase === "mixing" ? "lab-flow" : ""}
                      style={{
                        animationDelay: `${i * 90}ms`,
                        transition: "stroke-opacity 400ms",
                      }}
                    />
                  );
                })}
              </svg>
            </div>

            {/* The dose dish, centred under the six channels */}
            <div className="flex flex-col items-center gap-5">
              <div
                className={`relative h-14 w-36 ${phase === "ready" ? "lab-cup-ready" : ""}`}
                aria-hidden="true"
              >
                {/* the dish: a low pod seen slightly from above */}
                <div className="absolute inset-x-0 bottom-0 h-11 overflow-hidden rounded-b-[999px] rounded-t-[40%] border border-white/40 bg-white/[0.04]">
                  <div
                    className="lab-fill absolute inset-x-0 bottom-0 rounded-b-[999px]"
                    style={{
                      height: phase === "idle" ? "0%" : "58%",
                      background: cupColor,
                      transition: `height ${phase === "mixing" ? MIX_MS : 400}ms var(--ease-glide), background 900ms var(--ease-glide)`,
                    }}
                  >
                    {phase === "mixing" && <span className="lab-swirl absolute inset-0" />}
                  </div>
                </div>
                {/* the lip */}
                <div className="absolute inset-x-0 top-[3px] h-4 rounded-[50%] border border-white/50 bg-[color:var(--panel)]/40" />
              </div>
              <button
                type="button"
                onClick={(e) => mix(e)}
                disabled={phase === "mixing"}
                className={`btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 disabled:opacity-60 ${
                  phase === "idle" ? "lab-cta" : ""
                }`}
                style={{ fontSize: "var(--text-sm)" }}
              >
                {phase === "mixing"
                  ? "Mixing…"
                  : phase === "ready"
                    ? "Mix again"
                    : "Mix today's dose"}
                <span aria-hidden="true" className="btn-arrow">
                  {phase === "mixing" ? "" : "→"}
                </span>
              </button>
            </div>

            <div
              className={`mt-8 grid transition-[grid-template-rows,opacity] duration-700 ${
                phase === "ready" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
              aria-hidden={phase !== "ready"}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 border-t border-[color:var(--rule-on-dark)] pt-6">
                  <p
                    className="font-mono uppercase text-periwinkle"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    [Why this blend]
                  </p>
                  <p
                    className="text-white/90"
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: "var(--leading-body)",
                    }}
                    aria-live="polite"
                  >
                    {phase === "ready" ? note(trend, weather, feel) : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p
            className="text-[color:var(--faint-on-dark)]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Illustrative only. Real ingredient ranges will be set with
            Katalyze&apos;s formulation partner, and the sensor tracks relative
            trends, not clinical values.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
