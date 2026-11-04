"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Reveal from "@/components/Reveal";
import Hint from "@/components/Hint";
import { CARTRIDGE_TINT, type CartridgeCode } from "@/lib/tints";

/*
 * "See inside": an x-ray cutaway of one morning's run, drawn in SVG and
 * driven by a single timeline (t, in seconds) so every part stays in sync.
 * Follows the product spec: fingertip pad on top, six cartridges, one pump
 * and one tube per ingredient (nothing shares a path), a scale under the
 * dish, and the app on the phone choosing the amounts. Amounts are demo.
 */

const CARTS: { code: CartridgeCode; name: string; amount: number }[] = [
  { code: "B-01", name: "Toner", amount: 0.55 },
  { code: "B-02", name: "Serum", amount: 1 },
  { code: "B-03", name: "Cream", amount: 0.7 },
  { code: "A-01", name: "Hyaluronic", amount: 0.45 },
  { code: "A-02", name: "Niacinamide", amount: 0.2 },
  { code: "A-03", name: "Ceramide", amount: 0.3 },
];

// Timeline, in seconds.
const T_TOUCH = 0;
const T_APP = 1.8;
const T_PUMP = 4.0;
const PUMP_EACH = 0.85;
const T_DONE = T_PUMP + PUMP_EACH * CARTS.length; // 9.1
const T_END = T_DONE + 1.4;

const STEPS = [
  {
    at: T_TOUCH,
    title: "Touch the pad",
    body: "The sensor on top checks if your skin is drier than normal for you.",
  },
  {
    at: T_APP,
    title: "The app picks the mix",
    body: "Your phone adds the weather and how your skin feels, then sends the amounts back.",
  },
  {
    at: T_PUMP,
    title: "Pumps measure each one",
    body: "One small pump per ingredient, each with its own tube. A scale under the dish stops each pump at the right amount.",
  },
  {
    at: T_DONE,
    title: "Scoop and apply",
    body: "One fresh portion waits in the dish. Use a fingertip, like a moisturizer.",
  },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp(v), 3);

// Geometry (drawn on a 760 x 520 grid, cropped by the viewBox).
const PAD = { x: 320, y: 78 };
const cartX = (i: number) => 140 + i * 72;
const CART_TOP = 122;
const CART_H = 96;
const PUMP_Y = 276;
const NOZZLE = { x: 320, y: 372 };
const DISH = { x: 320, y: 444 };
const CTRL = { x: 488, y: 336, w: 74, h: 44 };
const PHONE = { x: 622, y: 128, w: 112, h: 210 };

const tubePath = (i: number) => {
  const x = cartX(i);
  const tip = NOZZLE.x - 15 + i * 6;
  return `M ${x} ${PUMP_Y + 16} C ${x} ${PUMP_Y + 60}, ${tip} ${NOZZLE.y - 50}, ${tip} ${NOZZLE.y}`;
};

export default function XRay() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  const play = useCallback(
    (from = 0) => {
      cancelAnimationFrame(raf.current);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // No motion: jump to the end of the chosen step.
        const next = STEPS.find((s) => s.at > from)?.at ?? T_END;
        setT(Math.min(T_END, next - 0.01));
        return;
      }
      setPlaying(true);
      start.current = performance.now() - from * 1000;
      const tick = (now: number) => {
        const v = (now - start.current) / 1000;
        if (v >= T_END) {
          setT(T_END);
          setPlaying(false);
          return;
        }
        setT(v);
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [],
  );

  // Play once, the first time the drawing is mostly in view.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !played.current) {
          played.current = true;
          // Reduced motion: show the finished state, steps still clickable.
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setT(T_END);
          else play(0);
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [play]);

  const stepIndex = STEPS.reduce((acc, s, i) => (t >= s.at ? i : acc), 0);
  const started = t > 0.01;

  // Derived state for each part.
  const touch = clamp((t - T_TOUCH) / 1.2);
  const fingerY = t < T_APP ? -30 + 48 * ease(touch / 0.5) - (touch > 0.85 ? 60 * ease((touch - 0.85) / 0.15) : 0) : -80;
  const padGlow = t < T_APP ? clamp(touch * 2 - 0.6) : clamp(1 - (t - T_APP) / 0.6) * 0.6;
  const appP = clamp((t - T_APP) / (T_PUMP - T_APP));
  const toPhone = clamp(appP / 0.4);
  const fromPhone = clamp((appP - 0.6) / 0.4);
  const totalAmount = CARTS.reduce((a, c) => a + c.amount, 0);

  const pumps = CARTS.map((c, i) => {
    const s = T_PUMP + i * PUMP_EACH;
    const p = clamp((t - s) / PUMP_EACH);
    const active = t >= s && t < s + PUMP_EACH;
    return { ...c, p, active, flow: ease(p / 0.45), drop: (p - 0.4) / 0.6 };
  });
  const fill = pumps.reduce((a, c) => a + c.amount * ease(c.p), 0) / totalAmount;
  const activePump = pumps.findIndex((p) => p.active);

  return (
    <section
      aria-labelledby="xray-title"
      className="relative bg-[color:var(--canvas-deep)] text-white"
      style={{ paddingBlock: "var(--s-24)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 gap-y-10"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-4 lg:col-span-7">
          <h2
            id="xray-title"
            className="font-display font-extralight"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            What happens inside.
          </h2>
          <p
            className="max-w-xl text-[color:var(--muted-on-dark)]"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            <strong className="font-medium text-white">
              One morning, from touch to dish, in about a minute.
            </strong>
            <span className="block pt-1 text-[0.88em] opacity-75">
              Shown sped up. Tap the pad on the drawing, or pick a step.
            </span>
          </p>
        </Reveal>

        <div
          ref={root}
          className="col-span-12 overflow-hidden border border-[color:var(--rule-on-dark)] bg-midnight lg:col-span-8"
          style={{ borderRadius: "var(--r-lg)" }}
        >
          <div
            className="flex items-center justify-between border-b border-[color:var(--rule-on-dark)] px-5 py-3 font-mono uppercase text-periwinkle"
            style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
          >
            <span>Cutaway · demo amounts</span>
            <span className="tabular-nums">
              {t >= T_END ? "Ready" : started ? `Step ${stepIndex + 1} of 4` : "Tap the pad"}
            </span>
          </div>
          <svg
            viewBox="56 8 696 476"
            className="block h-auto w-full"
            role="img"
            aria-label="Cutaway of the Katalyze machine. A fingertip touches the pad on top. The phone app sends back amounts. Six pumps, one per cartridge, push each ingredient through its own tube into a small dish on a scale."
          >
            <defs>
              <filter id="xr-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <linearGradient id="xr-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* body */}
            <rect x="72" y="78" width="500" height="372" rx="46" fill="url(#xr-body)" stroke="var(--periwinkle)" strokeOpacity="0.45" />
            <rect x="72" y="440" width="500" height="34" rx="14" fill="var(--indigo)" fillOpacity="0.6" />
            {/* frosted window */}
            <rect x="108" y="104" width="428" height="132" rx="16" fill="#ffffff" fillOpacity="0.03" stroke="var(--periwinkle)" strokeOpacity="0.25" strokeDasharray="3 5" />

            {/* finger */}
            <g transform={`translate(${PAD.x - 15} ${fingerY})`} opacity={t < T_APP && started ? 1 : 0}>
              <rect x="0" y="0" width="30" height="62" rx="15" fill="var(--blush)" fillOpacity="0.85" />
              <rect x="7" y="6" width="16" height="12" rx="6" fill="#ffffff" fillOpacity="0.5" />
            </g>

            {/* sensor pad */}
            <circle cx={PAD.x} cy={PAD.y} r="30" fill="var(--blush)" opacity={padGlow * 0.6} filter="url(#xr-glow)" />
            <rect
              x={PAD.x - 26}
              y={PAD.y - 6}
              width="52"
              height="10"
              rx="5"
              fill={padGlow > 0.2 ? "var(--blush)" : "var(--periwinkle)"}
              fillOpacity={0.5 + padGlow * 0.5}
              onClick={() => play(0)}
              className="cursor-pointer"
              role="button"
              aria-label="Touch the pad to start"
            />

            {/* controller + wires */}
            <path d={`M ${PAD.x + 26} ${PAD.y} C 470 ${PAD.y}, 460 300, ${CTRL.x + 20} ${CTRL.y}`} fill="none" stroke="var(--periwinkle)" strokeOpacity="0.35" strokeDasharray="4 4" />
            <rect x={CTRL.x} y={CTRL.y} width={CTRL.w} height={CTRL.h} rx="8" fill="var(--indigo)" stroke="var(--periwinkle)" strokeOpacity="0.5" />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={CTRL.x + 10 + k * 15} y={CTRL.y + 14} width="9" height="16" rx="2" fill="var(--periwinkle)" fillOpacity={stepIndex >= 1 && started ? 0.8 : 0.3} />
            ))}

            {/* signal to phone and back */}
            <path id="xr-link" d={`M ${CTRL.x + CTRL.w} ${CTRL.y + 10} C 600 300, 600 300, ${PHONE.x} ${PHONE.y + 150}`} fill="none" stroke="var(--periwinkle)" strokeOpacity="0.25" strokeDasharray="2 6" />
            {appP > 0 && appP < 1 &&
              [0, 1, 2].map((k) => {
                const v = appP < 0.5 ? toPhone - k * 0.12 : 1 - (fromPhone - k * 0.12);
                if (v <= 0 || v >= 1) return null;
                const x0 = CTRL.x + CTRL.w, y0 = CTRL.y + 10, x1 = PHONE.x, y1 = PHONE.y + 150;
                const x = x0 + (x1 - x0) * v;
                const y = y0 + (y1 - y0) * v - Math.sin(v * Math.PI) * 30;
                return <circle key={k} cx={x} cy={y} r="3.5" fill="var(--blush)" />;
              })}

            {/* phone */}
            <g opacity={started ? 1 : 0.55}>
              <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx="18" fill="var(--canvas-deep)" stroke="var(--periwinkle)" strokeOpacity="0.6" />
              <text x={PHONE.x + 14} y={PHONE.y + 30} fill="var(--periwinkle)" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="1.2">
                TODAY&apos;S MIX
              </text>
              {CARTS.map((c, i) => {
                const w = 84 * c.amount * ease((appP - i * 0.06) / 0.5);
                return (
                  <g key={c.code}>
                    <rect x={PHONE.x + 14} y={PHONE.y + 48 + i * 24} width="84" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.06" />
                    <rect x={PHONE.x + 14} y={PHONE.y + 48 + i * 24} width={t >= T_PUMP ? 84 * c.amount : w} height="7" rx="3.5" fill={CARTRIDGE_TINT[c.code]} />
                  </g>
                );
              })}
            </g>

            {/* cartridges, pumps, tubes */}
            {pumps.map((c, i) => {
              const x = cartX(i);
              const level = 0.82 - c.amount * 0.28 * ease(c.p);
              const lh = (CART_H - 8) * level;
              const tint = CARTRIDGE_TINT[c.code];
              const lit = c.active || (t >= T_APP + 1.6 && t < T_PUMP);
              return (
                <g key={c.code}>
                  <rect x={x - 22} y={CART_TOP} width="44" height={CART_H} rx="10" fill="#ffffff" fillOpacity="0.05" stroke={lit ? tint : "var(--periwinkle)"} strokeOpacity={lit ? 0.9 : 0.35} />
                  <rect x={x - 18} y={CART_TOP + CART_H - 4 - lh} width="36" height={lh} rx="7" fill={tint} fillOpacity="0.85" />
                  <text x={x} y={CART_TOP - 8} textAnchor="middle" fill="var(--periwinkle)" fontSize="9.5" fontFamily="var(--font-mono)">
                    {c.name}
                  </text>

                  {/* feed line cartridge -> pump */}
                  <line x1={x} y1={CART_TOP + CART_H} x2={x} y2={PUMP_Y - 16} stroke={tint} strokeOpacity={c.active ? 0.9 : 0.3} strokeWidth="3" />

                  {/* pump */}
                  <circle cx={x} cy={PUMP_Y} r="16" fill="var(--canvas-deep)" stroke={c.active ? tint : "var(--periwinkle)"} strokeOpacity={c.active ? 1 : 0.45} />
                  <g transform={`rotate(${c.active ? (t * 540) % 360 : 0} ${x} ${PUMP_Y})`}>
                    <line x1={x - 10} y1={PUMP_Y} x2={x + 10} y2={PUMP_Y} stroke="var(--periwinkle)" strokeOpacity="0.7" />
                    <line x1={x} y1={PUMP_Y - 10} x2={x} y2={PUMP_Y + 10} stroke="var(--periwinkle)" strokeOpacity="0.7" />
                  </g>

                  {/* tube: empty, then filled as it runs */}
                  <path d={tubePath(i)} fill="none" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="4" strokeLinecap="round" />
                  <path
                    d={tubePath(i)}
                    fill="none"
                    stroke={tint}
                    strokeWidth="4"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - c.flow}
                    strokeOpacity={c.active ? 1 : 0.4}
                  />

                  {/* drop into the dish */}
                  {c.active && c.drop > 0 && c.drop < 1 && (
                    <circle
                      cx={NOZZLE.x - 15 + i * 6}
                      cy={NOZZLE.y + 6 + (DISH.y - NOZZLE.y - 12) * ((c.drop * 2) % 1)}
                      r="4"
                      fill={tint}
                    />
                  )}
                </g>
              );
            })}

            {/* nozzle head: six separate tips */}
            <rect x={NOZZLE.x - 24} y={NOZZLE.y - 4} width="48" height="12" rx="4" fill="var(--indigo)" stroke="var(--periwinkle)" strokeOpacity="0.5" />

            {/* dish alcove, dish, scale */}
            <rect x={DISH.x - 84} y="356" width="168" height="94" rx="14" fill="#000000" fillOpacity="0.18" />
            <rect x={DISH.x - 62} y={DISH.y + 10} width="124" height="8" rx="4" fill="var(--indigo)" stroke="var(--periwinkle)" strokeOpacity={activePump >= 0 ? 0.9 : 0.4} />
            <ellipse cx={DISH.x} cy={DISH.y} rx="52" ry="11" fill="#ffffff" fillOpacity="0.85" />
            <ellipse cx={DISH.x} cy={DISH.y - 1} rx={6 + 38 * fill} ry={1.5 + 6 * fill} fill={CARTRIDGE_TINT["B-02"]} opacity={fill > 0 ? 1 : 0} />
            {t >= T_DONE && (
              <circle cx={DISH.x} cy={DISH.y - 2} r="30" fill="var(--blush)" opacity={0.3 * clamp((t - T_DONE) / 0.6)} filter="url(#xr-glow)" />
            )}

            {/* part labels */}
            <g fill="var(--periwinkle)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="1">
              <text x={PAD.x + 40} y={PAD.y - 12} opacity={stepIndex === 0 && started ? 1 : 0.6}>SENSOR PAD</text>
              <text x={CTRL.x} y={CTRL.y + CTRL.h + 18} opacity="0.6">CONTROLLER</text>
              <text x={PHONE.x} y={PHONE.y + PHONE.h + 20} opacity={stepIndex === 1 ? 1 : 0.6}>YOUR PHONE</text>
              <text x="84" y={PUMP_Y + 4} opacity={stepIndex === 2 ? 1 : 0.6}>PUMPS</text>
              <text x={DISH.x + 70} y={DISH.y + 18} opacity={stepIndex >= 2 ? 1 : 0.6}>DISH ON A SCALE</text>
            </g>
          </svg>
        </div>

        <ol className="col-span-12 flex flex-col lg:col-span-4">
          {STEPS.map((s, i) => {
            const on = started && i === stepIndex;
            const done = started && (i < stepIndex || t >= T_END);
            return (
              <li key={s.title} className="border-b border-[color:var(--rule-on-dark)] first:border-t">
                <button
                  type="button"
                  onClick={() => play(s.at)}
                  className="flex w-full gap-4 py-5 text-left transition-opacity"
                  style={{ opacity: on || !started ? 1 : done ? 0.75 : 0.45 }}
                >
                  <span
                    className={`font-mono tabular-nums ${on ? "text-blush" : "text-periwinkle"}`}
                    style={{ fontSize: "var(--text-xs)", paddingTop: "0.2em" }}
                  >
                    0{i + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-medium text-white" style={{ fontSize: "var(--text-base)" }}>
                      {s.title}
                    </span>
                    <span className="text-[color:var(--muted-on-dark)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}>
                      {s.body}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          <li className="pt-5">
            <button
              type="button"
              onClick={() => play(0)}
              disabled={playing}
              className="text-blush underline decoration-blush/40 underline-offset-4 disabled:opacity-40"
              style={{ fontSize: "var(--text-sm)" }}
            >
              {started ? "Play again" : "Play"}
            </button>
            <Hint className="ml-4">Or tap a step</Hint>
          </li>
        </ol>
      </div>
    </section>
  );
}
