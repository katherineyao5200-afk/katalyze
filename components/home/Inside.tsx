import { useId } from "react";
import Reveal from "@/components/Reveal";
import Hint from "@/components/Hint";
import { CARTRIDGE_TINT, type CartridgeCode } from "@/lib/tints";
import Lead from "@/components/Lead";

// The three bases are a toner, a serum and a cream (kat, Nov 2026). Each line says what the ingredient is for, never a
// percentage: no formulation data exists yet.
type Item = {
  code: string;
  name: string;
  role: string;
  when: string;
  // The constellation drawn on the vial: points (x, y in a 60x40 box)
  // and the pairs of points joined by lines.
  sky: { pts: [number, number][]; links: [number, number][]; caption: string };
};

const BASES: Item[] = [
  {
    code: "B-01",
    name: "Toner",
    role: "The lightest base, thin and watery. Makes the dose fresher and lighter.",
    when: "Leans in on humid days or a reading above your usual",
    sky: {
      caption: "Mist",
      pts: [[8, 34], [22, 8], [34, 6], [46, 12], [54, 24]],
      links: [[0, 1], [0, 2], [0, 3], [0, 4]],
    },
  },
  {
    code: "B-02",
    name: "Serum",
    role: "The core of every dose. Carries the actives.",
    when: "In every dose",
    sky: {
      caption: "A steady line",
      pts: [[6, 24], [16, 20], [26, 23], [36, 19], [46, 22], [55, 18]],
      links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    },
  },
  {
    code: "B-03",
    name: "Cream",
    role: "The richest base. Gives the dose more body.",
    when: "Leans in on dry, cold days or a drier reading",
    sky: {
      caption: "Frost",
      pts: [[30, 20], [30, 6], [30, 34], [18, 13], [42, 27], [18, 27], [42, 13]],
      links: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
    },
  },
];

const ACTIVES: Item[] = [
  {
    code: "A-01",
    name: "Hyaluronic acid",
    role: "Holds water at the skin's surface.",
    when: "Added more when your skin reads drier than usual or feels tight",
    sky: {
      caption: "A drop",
      pts: [[30, 4], [22, 18], [20, 27], [25, 35], [35, 35], [40, 27], [38, 18]],
      links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
    },
  },
  {
    code: "A-02",
    name: "Niacinamide",
    role: "Vitamin B3, widely used for oil balance and an even tone.",
    when: "Added more when skin feels shiny or the air is humid",
    sky: {
      caption: "A balance",
      pts: [[30, 8], [30, 24], [10, 24], [50, 24], [6, 32], [14, 32], [46, 32], [54, 32]],
      links: [[0, 1], [2, 1], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7]],
    },
  },
  {
    code: "A-03",
    name: "Ceramide",
    role: "Part of the skin's own barrier.",
    when: "Added more on irritated or wind-dried days",
    sky: {
      caption: "A wall",
      pts: [[8, 12], [22, 12], [36, 12], [50, 12], [15, 22], [29, 22], [43, 22], [8, 32], [22, 32], [36, 32], [50, 32]],
      links: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9], [9, 10], [0, 4], [4, 7], [3, 6], [6, 10]],
    },
  },
];

// Engraved into the frosted pane: each line is a dark groove with a
// bright lower lip, and each star a cut dot with a glowing core and halo.
// Lines etch themselves in when the vial scrolls into view; stars twinkle.
function Constellation({ sky, glow }: { sky: Item["sky"]; glow: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-4 -4 68 48" aria-hidden="true" className="vial-sky h-[84px] w-[122px] overflow-visible">
      <defs>
        <radialGradient id={`h${id}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.25" stopColor={glow} stopOpacity="1" />
          <stop offset="0.6" stopColor="var(--periwinkle)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--periwinkle)" stopOpacity="0" />
        </radialGradient>
        <filter id={`b${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      {/* coloured light pooled in the grooves */}
      <g filter={`url(#b${id})`}>
        {sky.links.map(([a, b], i) => (
          <line
            key={`w${i}`}
            className="glowline"
            pathLength={1}
            x1={sky.pts[a][0]}
            y1={sky.pts[a][1]}
            x2={sky.pts[b][0]}
            y2={sky.pts[b][1]}
            stroke="var(--periwinkle)"
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* bright lip, offset down: catches the light below the groove */}
      {sky.links.map(([a, b], i) => (
        <line
          key={`l${i}`}
          className="lip"
          x1={sky.pts[a][0]}
          y1={sky.pts[a][1] + 0.6}
          x2={sky.pts[b][0]}
          y2={sky.pts[b][1] + 0.6}
          pathLength={1}
          stroke="#ffffff"
          strokeOpacity={0.95}
          strokeWidth={1.6}
          strokeLinecap="round"
          style={{ animationDelay: `${200 + i * 70}ms` }}
        />
      ))}
      {/* the groove */}
      {sky.links.map(([a, b], i) => (
        <line
          key={`g${i}`}
          className="groove"
          x1={sky.pts[a][0]}
          y1={sky.pts[a][1]}
          x2={sky.pts[b][0]}
          y2={sky.pts[b][1]}
          pathLength={1}
          stroke="var(--midnight)"
          strokeOpacity={0.9}
          strokeWidth={1.2}
          strokeLinecap="round"
          style={{ animationDelay: `${200 + i * 70}ms` }}
        />
      ))}
      {sky.pts.map(([x, y], i) => (
        <g key={i} className="star" style={{ animationDelay: `${(i * 430) % 2600}ms` }}>
          <circle cx={x} cy={y} r={i === 0 ? 8 : 5.6} fill={`url(#h${id})`} className="halo" />
          <circle cx={x} cy={y + 0.5} r={i === 0 ? 2.5 : 1.8} fill="#ffffff" />
          <circle cx={x} cy={y} r={i === 0 ? 2.5 : 1.8} fill="var(--midnight)" />
          <circle cx={x} cy={y} r={i === 0 ? 1.3 : 0.9} fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}

// Each cartridge is drawn as a frosted-glass vial: the liquid's colour
// glows through a frosted front pane that carries the label. Hover (or
// focus) lifts the pane a little and the liquid shows clearly, like
// opening the bay. Bases are tall bottles, actives short droppers.
const tint = (code: string) => {
  const c = CARTRIDGE_TINT[code as CartridgeCode];
  return `linear-gradient(180deg, color-mix(in oklab, ${c} 45%, white), ${c} 55%, color-mix(in oklab, ${c} 70%, var(--indigo)))`;
};

function Row({
  items,
  label,
  kind,
}: {
  items: Item[];
  label: string;
  kind: "base" | "active";
}) {
  const tall = kind === "base";
  return (
    <div className="flex flex-col gap-5">
      <p
        className="font-mono uppercase text-indigo"
        style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
      >
        {label}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.code} delayMs={i * 90} variant="scale">
            <div
              tabIndex={0}
              data-cursor="Look inside"
              className={`vial group relative isolate flex flex-col justify-end outline-none ${
                tall ? "h-[330px] sm:h-[380px]" : "h-[310px] sm:h-[350px]"
              }`}
            >
              {/* the liquid, behind the glass */}
              <div
                aria-hidden="true"
                className="vial-liquid absolute inset-x-[14%] top-0 bottom-[10%] -z-10 rounded-[22px]"
                style={{ background: tint(item.code) }}
              >
                <span className="absolute left-1/2 top-0 h-5 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 shadow-sm" />
                {!tall && (
                  <span className="absolute left-1/2 top-0 h-9 w-[12%] -translate-x-1/2 -translate-y-full rounded-t-full bg-white/80" />
                )}
              </div>
              {/* the frosted pane, carrying the label */}
              <div className="vial-pane flex h-[88%] flex-col justify-between gap-3 rounded-[22px] p-5 sm:h-[84%]">
                <h3 className="flex items-baseline justify-between gap-4">
                  <span
                    className="font-display font-extralight text-midnight"
                    style={{ fontSize: "var(--text-xl)", lineHeight: 1.1 }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="whitespace-nowrap font-mono uppercase text-indigo/70"
                    style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
                  >
                    {item.code}
                  </span>
                </h3>
                <div className="flex items-end justify-between gap-3">
                  <Constellation sky={item.sky} glow={CARTRIDGE_TINT[item.code as CartridgeCode]} />
                  <span
                    className="pb-1 font-mono uppercase text-indigo/70"
                    style={{ fontSize: "9px", letterSpacing: "var(--track-label)" }}
                  >
                    {item.sky.caption}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <p
                    className="text-midnight/80"
                    style={{ fontSize: "var(--text-sm)", lineHeight: 1.45 }}
                  >
                    {item.role}
                  </p>
                  <p
                    className="border-t border-midnight/10 pt-2 text-midnight/60"
                    style={{ fontSize: "var(--text-xs)", lineHeight: 1.4 }}
                  >
                    {item.when}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// Reference: alethia's annotated specimens, set on white. 12 cols:
// heading + illustration 1-4, the two cartridge rows 6-12.
export default function Inside() {
  return (
    <section data-nav="light" className="bg-white" style={{ paddingBlock: "var(--s-40) var(--s-24)" }}>
      <div
        className="mx-auto grid grid-cols-12 gap-y-16"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <h2
            className="font-display font-extralight text-midnight"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            What goes into your skincare.
          </h2>
          <p
            className="max-w-sm text-[color:var(--muted-on-light)]"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            <Lead text="No more half-used bottles. Each dose is mixed fresh and used right away, so nothing sits open for months or gets thrown out." className="text-midnight" />
          </p>
        </Reveal>

        <div className="col-span-12 flex flex-col gap-12 lg:col-span-7 lg:col-start-6">
          <Hint className="text-midnight">Hover or tap a vial to look inside</Hint>
          <Row items={BASES} label="Bases · toner, serum, cream" kind="base" />
          <Row items={ACTIVES} label="Active ingredients · 3" kind="active" />
        </div>
      </div>
    </section>
  );
}
