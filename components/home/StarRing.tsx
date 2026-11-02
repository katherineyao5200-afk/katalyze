import { SPARKLE_PATH } from "@/components/Sparkle";

// A faint celestial chart behind the hero device: rings, a degree
// scale, a few stars. Atmosphere only; it turns very slowly and
// stops under reduced motion.
const STARS: [number, number, number][] = [
  [118, -212, 1],
  [-246, -96, 0.7],
  [262, 128, 0.8],
  [-150, 230, 0.6],
  [40, -330, 0.5],
  [-318, 60, 0.55],
];

export default function StarRing({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 120 }, (_, i) => i);
  return (
    <svg
      aria-hidden="true"
      viewBox="-400 -400 800 800"
      className={`star-ring pointer-events-none ${className}`}
      fill="none"
    >
      <g stroke="var(--periwinkle)">
        <circle r="380" strokeOpacity="0.14" />
        <circle r="300" strokeOpacity="0.1" strokeDasharray="2 6" />
        <circle r="210" strokeOpacity="0.08" />
        {ticks.map((i) => {
          const a = (i / ticks.length) * Math.PI * 2;
          const long = i % 10 === 0;
          const r0 = long ? 362 : 370;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r0}
              y1={Math.sin(a) * r0}
              x2={Math.cos(a) * 380}
              y2={Math.sin(a) * 380}
              strokeOpacity={long ? 0.35 : 0.16}
            />
          );
        })}
        <line x1="-390" y1="0" x2="390" y2="0" strokeOpacity="0.06" />
        <line x1="0" y1="-390" x2="0" y2="390" strokeOpacity="0.06" />
      </g>
      {STARS.map(([x, y, s], i) => (
        <path
          key={i}
          d={SPARKLE_PATH}
          fill={i % 2 ? "var(--blush)" : "var(--periwinkle)"}
          opacity={0.55}
          className="star-twinkle"
          style={{ animationDelay: `${i * 0.9}s` }}
          transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}
        />
      ))}
    </svg>
  );
}
