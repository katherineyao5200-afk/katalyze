"use client";

import { useState } from "react";

import Reveal from "@/components/Reveal";
import { SPARKLE_PATH } from "@/components/Sparkle";
import Hint from "@/components/Hint";
import Lead from "@/components/Lead";

/*
 * "Your skin, charted": three weeks of demo readings drawn as a star
 * chart. Each morning is a star placed by how far that day's reading sat
 * from the person's usual; the lines between them are the constellation
 * the formula follows. Demo data, labelled as such. The sensor measures
 * relative trends, so the axis is "drier / usual / more hydrated", never
 * a number.
 */

const DAYS = 21;
const W = 840;
const H = 300;
const PAD_X = 30;
const MID = H / 2;

// A believable three weeks: a slow drift drier (a cold snap), a recovery,
// and day-to-day noise. Deterministic so the server and browser agree.
const READINGS = Array.from({ length: DAYS }, (_, i) => {
  const drift = -0.55 * Math.sin((i / (DAYS - 1)) * Math.PI);
  const noise = Math.sin(i * 2.3) * 0.18 + Math.cos(i * 1.1) * 0.08;
  return Math.max(-0.95, Math.min(0.95, drift + noise + 0.12));
});

const WEATHER = [
  "Mild",
  "Mild",
  "Dry",
  "Cold",
  "Cold",
  "Dry",
  "Cold",
  "Cold",
  "Dry",
  "Dry",
  "Mild",
  "Cold",
  "Dry",
  "Mild",
  "Mild",
  "Humid",
  "Mild",
  "Humid",
  "Mild",
  "Mild",
  "Humid",
];

function describe(v: number) {
  if (v < -0.45)
    return {
      read: "Much drier than usual",
      blend: "Hyaluronic acid and ceramide weighted up, richer base",
    };
  if (v < -0.15)
    return { read: "Drier than usual", blend: "Hyaluronic acid weighted up" };
  if (v > 0.25)
    return {
      read: "More hydrated than usual",
      blend: "Lighter base, actives near usual",
    };
  return { read: "About usual", blend: "Actives at their usual levels" };
}

const pts = READINGS.map((v, i) => ({
  x: PAD_X + (i / (DAYS - 1)) * (W - PAD_X * 2),
  y: MID - v * (H / 2 - 30),
  v,
}));

export default function SkinChart() {
  const [active, setActive] = useState<number>(DAYS - 1);
  const a = pts[active];
  const d = describe(a.v);

  return (
    <section
      aria-labelledby="chart-title"
      className="relative overflow-hidden bg-midnight text-white"
      style={{ paddingBlock: "var(--s-32)" }}
    >
      <div
        className="mx-auto flex flex-col gap-12"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <Reveal
          className="grid grid-cols-12 gap-y-6"
          style={{ columnGap: "var(--gutter)" }}
        >
          <h2
            id="chart-title"
            className="col-span-12 font-display font-extralight lg:col-span-7"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            In the app, every morning&apos;s reading becomes a star on your chart.
          </h2>
          <p
            className="col-span-12 max-w-md self-end text-[color:var(--muted-on-dark)] lg:col-span-4 lg:col-start-9"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            <Lead text="Compared only with your own usual. After a few weeks you can see the pattern, and so can the formula." />
            <Hint className="mt-4 flex">Tap any star</Hint>
          </p>
        </Reveal>

        <Reveal variant="fade" className="relative">
          <div
            className="spot relative overflow-hidden border border-[color:var(--rule-on-dark)] bg-[color:var(--canvas-deep)]"
            style={{ borderRadius: "var(--r-lg)" }}
          >
            <div
              className="flex items-center justify-between border-b border-[color:var(--rule-on-dark)] px-6 py-4 font-mono uppercase text-periwinkle"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              <span>Demo chart, 21 mornings</span>
              <span className="hidden sm:inline">Relative to your usual</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_17rem]">
              <div className="relative overflow-x-auto px-2 py-6 sm:px-6">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="chart-draw h-auto w-full min-w-[560px]"
                  role="img"
                  aria-label="Demo chart of 21 morning readings. Readings drift drier through a cold week, then recover above usual."
                >
                  {/* sky grid */}
                  <g stroke="var(--periwinkle)">
                    {[0.25, 0.75].map((f) => (
                      <line
                        key={f}
                        x1="0"
                        x2={W}
                        y1={H * f}
                        y2={H * f}
                        strokeOpacity="0.1"
                        strokeDasharray="2 6"
                      />
                    ))}
                    <line
                      x1="0"
                      x2={W}
                      y1={MID}
                      y2={MID}
                      strokeOpacity="0.35"
                      strokeDasharray="6 6"
                    />
                    {pts.map((p, i) =>
                      i % 7 === 0 ? (
                        <line
                          key={i}
                          x1={p.x}
                          x2={p.x}
                          y1="0"
                          y2={H}
                          strokeOpacity="0.08"
                        />
                      ) : null,
                    )}
                  </g>
                  <text
                    x="6"
                    y={MID + 18}
                    fill="var(--periwinkle)"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    letterSpacing="1.5"
                  >
                    YOUR USUAL
                  </text>
                  <text
                    x="6"
                    y="16"
                    fill="var(--faint-on-dark)"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    letterSpacing="1.5"
                  >
                    MORE HYDRATED
                  </text>
                  <text
                    x="6"
                    y={H - 8}
                    fill="var(--faint-on-dark)"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    letterSpacing="1.5"
                  >
                    DRIER
                  </text>

                  {/* the constellation */}
                  <polyline
                    className="chart-line"
                    points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="var(--periwinkle)"
                    strokeOpacity="0.55"
                    strokeWidth="1"
                    pathLength={1}
                  />

                  {/* active guide */}
                  <line
                    x1={a.x}
                    x2={a.x}
                    y1="0"
                    y2={H}
                    stroke="var(--blush)"
                    strokeOpacity="0.4"
                  />

                  {pts.map((p, i) => {
                    const on = i === active;
                    const s = on ? 1 : 0.55;
                    return (
                      <g
                        key={i}
                        tabIndex={0}
                        role="button"
                        aria-label={`Day ${i + 1}: ${describe(p.v).read}`}
                        aria-pressed={on}
                        data-cursor="Read"
                        className="chart-star cursor-pointer outline-none"
                        style={{ animationDelay: `${0.6 + i * 0.05}s` }}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        onClick={() => setActive(i)}
                      >
                        <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                        {on && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="14"
                            fill="none"
                            stroke="var(--blush)"
                            strokeOpacity="0.5"
                          />
                        )}
                        <path
                          d={SPARKLE_PATH}
                          fill={
                            on
                              ? "var(--blush)"
                              : p.v < -0.15
                                ? "var(--periwinkle)"
                                : "white"
                          }
                          transform={`translate(${p.x - 12 * s} ${p.y - 12 * s}) scale(${s})`}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <dl
                className="flex flex-col gap-5 border-t border-[color:var(--rule-on-dark)] p-6 lg:border-t-0 lg:border-l"
                aria-live="polite"
              >
                <div className="flex flex-col gap-1">
                  <dt
                    className="font-mono uppercase text-periwinkle"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    Morning
                  </dt>
                  <dd
                    className="font-display font-extralight"
                    style={{ fontSize: "var(--text-2xl)", lineHeight: 1 }}
                  >
                    Day {String(active + 1).padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt
                    className="font-mono uppercase text-periwinkle"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    Reading
                  </dt>
                  <dd style={{ fontSize: "var(--text-sm)" }}>{d.read}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt
                    className="font-mono uppercase text-periwinkle"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    Weather
                  </dt>
                  <dd style={{ fontSize: "var(--text-sm)" }}>
                    {WEATHER[active]}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt
                    className="font-mono uppercase text-periwinkle"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--track-label)",
                    }}
                  >
                    That day&apos;s blend
                  </dt>
                  <dd
                    className="text-white/85"
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: "var(--leading-body)",
                    }}
                  >
                    {d.blend}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <p
            className="mt-4 text-[color:var(--faint-on-dark)]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Illustrative data. The sensor tracks relative hydration trends, not
            clinical values.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
