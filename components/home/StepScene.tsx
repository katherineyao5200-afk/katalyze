import { SPARKLE_PATH } from "@/components/Sparkle";

/*
 * One small animated diagram per step of "How it works". Plain SVG and
 * CSS (classes `ss-*` in globals.css). Every animated element's resting
 * style is its final state, so under reduced motion each scene simply
 * shows the finished picture.
 */

const mono = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.12em",
} as const;

function Label({
  x,
  y,
  children,
  anchor = "start",
  fill = "var(--periwinkle)",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle" | "end";
  fill?: string;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={fill} style={mono}>
      {children}
    </text>
  );
}

// 01 · Read: a fingertip settles on the capacitive pad, rings pulse out,
// and the reading resolves into a relative trend.
function Read() {
  return (
    <g>
      {/* device top surface */}
      <rect
        x="60"
        y="250"
        width="280"
        height="90"
        rx="28"
        fill="white"
        fillOpacity="0.05"
        stroke="white"
        strokeOpacity="0.25"
      />
      {/* pad: two electrodes */}
      <ellipse
        cx="200"
        cy="268"
        rx="46"
        ry="10"
        fill="none"
        stroke="var(--periwinkle)"
        strokeOpacity="0.6"
      />
      <ellipse
        cx="200"
        cy="268"
        rx="26"
        ry="5.5"
        fill="var(--periwinkle)"
        fillOpacity="0.35"
      />
      {/* pulses */}
      {[0, 1, 2].map((i) => (
        <ellipse
          key={i}
          className="ss-pulse"
          style={{ animationDelay: `${0.9 + i * 0.6}s` }}
          cx="200"
          cy="268"
          rx="46"
          ry="10"
          fill="none"
          stroke="var(--blush)"
        />
      ))}
      {/* fingertip */}
      <g className="ss-finger">
        <path
          d="M168 120 L168 236 Q168 266 200 266 Q232 266 232 236 L232 120"
          fill="white"
          fillOpacity="0.92"
        />
        <path
          d="M184 238 Q200 250 216 238"
          fill="none"
          stroke="var(--midnight)"
          strokeOpacity="0.15"
        />
      </g>
      {/* readout */}
      <g className="ss-fade" style={{ animationDelay: "1.4s" }}>
        <rect
          x="240"
          y="70"
          width="130"
          height="92"
          rx="10"
          fill="var(--canvas-deep)"
          stroke="white"
          strokeOpacity="0.18"
        />
        <Label x={254} y={92}>
          READING · 3 S
        </Label>
        <rect
          x="254"
          y="102"
          width="102"
          height="2"
          fill="white"
          fillOpacity="0.15"
        />
        <rect
          className="ss-grow"
          style={{ animationDelay: "1.5s" }}
          x="254"
          y="102"
          width="102"
          height="2"
          fill="var(--blush)"
        />
        <polyline
          className="ss-draw"
          style={{ animationDelay: "2.2s" }}
          pathLength={1}
          points="256,140 272,134 288,138 304,128 320,142 336,146 352,150"
          fill="none"
          stroke="var(--periwinkle)"
        />
        <line
          x1="254"
          y1="132"
          x2="356"
          y2="132"
          stroke="white"
          strokeOpacity="0.2"
          strokeDasharray="2 4"
        />
        <Label x={254} y={156} fill="white">
          DRIER THAN USUAL
        </Label>
      </g>
      <line
        className="ss-fade"
        style={{ animationDelay: "1.4s" }}
        x1="232"
        y1="160"
        x2="240"
        y2="150"
        stroke="white"
        strokeOpacity="0.3"
      />
    </g>
  );
}

// 02 · Mix: reading, weather and check-in meet in the rules, and the six
// pumps each send their measured share down to one cup.
function Mix() {
  const inputs = ["READING", "WEATHER", "CHECK-IN"];
  const tubes = ["B-01", "B-02", "B-03", "A-01", "A-02", "A-03"];
  const share = [0.7, 0.45, 0.3, 0.6, 0.25, 0.5];
  return (
    <g>
      {inputs.map((t, i) => {
        const x = 70 + i * 130;
        return (
          <g
            key={t}
            className="ss-fade"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <rect
              x={x - 52}
              y="34"
              width="104"
              height="26"
              rx="13"
              fill="none"
              stroke="white"
              strokeOpacity="0.3"
            />
            <Label x={x} y={51} anchor="middle" fill="white">
              {t}
            </Label>
            <path
              className="ss-draw"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              pathLength={1}
              d={`M${x} 60 C ${x} 90, 200 80, 200 104`}
              fill="none"
              stroke="var(--periwinkle)"
              strokeOpacity="0.6"
            />
          </g>
        );
      })}
      <g className="ss-fade" style={{ animationDelay: "0.8s" }}>
        <rect
          x="140"
          y="104"
          width="120"
          height="36"
          rx="8"
          fill="var(--canvas-deep)"
          stroke="var(--blush)"
          strokeOpacity="0.7"
        />
        <Label x={200} y={126} anchor="middle" fill="var(--blush)">
          RULES · SAFE RANGE
        </Label>
      </g>
      {tubes.map((t, i) => {
        const x = 75 + i * 50;
        const active = i > 2;
        const fill = active
          ? "var(--blush)"
          : "color-mix(in oklab, var(--periwinkle) 50%, white)";
        return (
          <g key={t}>
            <path
              className="ss-draw"
              style={{ animationDelay: "1s" }}
              pathLength={1}
              d={`M200 140 L ${x} 168`}
              stroke="white"
              strokeOpacity="0.15"
              fill="none"
            />
            <rect
              x={x - 13}
              y="168"
              width="26"
              height="80"
              rx="13"
              fill="none"
              stroke="white"
              strokeOpacity="0.3"
            />
            <rect
              className="ss-level"
              style={{
                animationDelay: `${1.1 + i * 0.08}s`,
                transformOrigin: `${x}px 248px`,
              }}
              x={x - 13}
              y={248 - 80 * share[i]}
              width="26"
              height={80 * share[i]}
              rx="12"
              fill={fill}
              fillOpacity="0.85"
            />
            <Label
              x={x}
              y={264}
              anchor="middle"
              fill={active ? "var(--blush)" : "var(--periwinkle)"}
            >
              {t}
            </Label>
            <path
              d={`M${x} 270 Q ${x} 300, 200 318`}
              stroke="white"
              strokeOpacity="0.1"
              fill="none"
            />
            <circle
              className="ss-drop"
              style={{
                animationDelay: `${1.8 + i * 0.22}s`,
                ["--dx" as string]: `${200 - x}px`,
              }}
              cx={x}
              cy="272"
              r="3.5"
              fill={fill}
            />
          </g>
        );
      })}
      <path
        d="M176 318 L182 360 Q200 368 218 360 L224 318"
        fill="none"
        stroke="white"
        strokeOpacity="0.55"
      />
    </g>
  );
}

// 03 · Apply: the dose settles in the cup, is stirred, and is ready.
function Apply() {
  return (
    <g>
      <ellipse
        cx="200"
        cy="330"
        rx="120"
        ry="16"
        fill="black"
        fillOpacity="0.25"
      />
      <defs>
        <clipPath id="ss-cup">
          <path d="M120 150 L140 310 Q200 336 260 310 L280 150 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#ss-cup)">
        <rect
          className="ss-fill"
          x="100"
          y="200"
          width="200"
          height="140"
          fill="var(--blush)"
          fillOpacity="0.8"
        />
        <ellipse
          className="ss-fill"
          cx="200"
          cy="200"
          rx="90"
          ry="10"
          fill="white"
          fillOpacity="0.5"
        />
        {/* stir */}
        <g className="ss-stir" style={{ transformOrigin: "200px 255px" }}>
          <path
            d="M160 255 Q200 235 240 255"
            fill="none"
            stroke="white"
            strokeOpacity="0.5"
          />
          <path
            d="M170 275 Q200 290 230 275"
            fill="none"
            stroke="white"
            strokeOpacity="0.35"
          />
        </g>
      </g>
      <path
        d="M120 150 L140 310 Q200 336 260 310 L280 150"
        fill="none"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="1.5"
      />
      <ellipse
        cx="200"
        cy="150"
        rx="80"
        ry="9"
        fill="none"
        stroke="white"
        strokeOpacity="0.5"
      />
      {[
        [300, 120, 0.9],
        [96, 172, 0.6],
        [270, 80, 0.5],
      ].map(([x, y, s], i) => (
        <g
          key={i}
          transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}
        >
          <path
            className="ss-pop"
            style={{ animationDelay: `${1.6 + i * 0.4}s` }}
            d={SPARKLE_PATH}
            fill={i === 0 ? "var(--blush)" : "white"}
          />
        </g>
      ))}
      <g className="ss-fade" style={{ animationDelay: "1.8s" }}>
        <Label x={200} y={58} anchor="middle" fill="white">
          ONE FRESH DOSE · READY
        </Label>
        <Label x={200} y={78} anchor="middle">
          YOU APPLY IT · NOTHING TOUCHES YOUR SKIN
        </Label>
      </g>
    </g>
  );
}

// 04 · Learn: a week of readings joins up into a constellation, and the
// next blend follows the pattern.
function Learn() {
  const pts = [
    [60, 210],
    [105, 180],
    [150, 230],
    [195, 250],
    [240, 205],
    [285, 175],
    [330, 150],
  ];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <g>
      <line
        x1="40"
        y1="200"
        x2="360"
        y2="200"
        stroke="var(--periwinkle)"
        strokeOpacity="0.4"
        strokeDasharray="5 5"
      />
      <Label x={40} y={192}>
        YOUR USUAL
      </Label>
      <polyline
        className="ss-draw"
        style={{ animationDelay: "0.3s", animationDuration: "2.4s" }}
        pathLength={1}
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="var(--periwinkle)"
        strokeOpacity="0.7"
      />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <g transform={`translate(${x - 8} ${y - 8}) scale(0.66)`}>
            <path
              className="ss-pop"
              style={{ animationDelay: `${0.3 + i * 0.32}s` }}
              d={SPARKLE_PATH}
              fill={i === pts.length - 1 ? "var(--blush)" : "white"}
            />
          </g>
          <Label x={x} y={300} anchor="middle">
            {days[i]}
          </Label>
        </g>
      ))}
      <g className="ss-fade" style={{ animationDelay: "2.6s" }}>
        <path
          d="M330 150 L 360 120"
          stroke="var(--blush)"
          strokeDasharray="3 4"
        />
        <rect
          x="236"
          y="70"
          width="140"
          height="44"
          rx="8"
          fill="var(--canvas-deep)"
          stroke="var(--blush)"
          strokeOpacity="0.6"
        />
        <Label x={250} y={89} fill="var(--blush)">
          TOMORROW&apos;S BLEND
        </Label>
        <Label x={250} y={105} fill="white">
          FOLLOWS THE TREND
        </Label>
      </g>
    </g>
  );
}

const SCENES = [Read, Mix, Apply, Learn];

export default function StepScene({
  step,
  className = "",
}: {
  step: number;
  className?: string;
}) {
  const Scene = SCENES[step] ?? Read;
  return (
    <svg
      viewBox="0 0 400 380"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <Scene />
    </svg>
  );
}
