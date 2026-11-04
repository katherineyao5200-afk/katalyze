import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import DotStat from "@/components/home/DotStat";
import Orbit from "@/components/home/Orbit";
import Lead from "@/components/Lead";

// Katalyze's own survey, about 75 respondents, 2026 (pitch deck v9).
const LEAD = {
  value: "71.2%",
  description:
    "say their skin changes with the season or the weather.",
};

const STATS = [
  { value: "78%", description: "have bought a product that ended up not working for their skin" },
  { value: "78.1%", description: "say too many options is their biggest struggle" },
  { value: "68.5%", description: "found a device that reads and mixes on the spot very or extremely appealing" },
];

// Reference: sharplink's dotted grid with a dark data card set between
// two text columns. 12 cols: headline 1-4, card 5-8, stat list 9-12.
export default function Research() {
  return (
    <section
      className="column-rules relative bg-[image:var(--grad-haze-dark)]"
      style={{ paddingBlock: "var(--s-32)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 gap-y-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <h2
            className="font-display font-extralight text-white"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Our idea,
            <br />
            <span className="text-periwinkle">tested in the market.</span>
          </h2>
          <p
            className="max-w-sm text-[color:var(--muted-on-dark)]"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            <Lead text="Before building anything, Katherine asked about 75 skincare users what goes wrong. Most said their skin changes with the weather, and most had bought products that didn't work for them." />
          </p>
        </Reveal>

        {/* The data card: the one dark object on a light screen. */}
        <Reveal
          variant="scale"
          delayMs={100}
          className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-4 lg:col-start-auto"
        >
          <div
            className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden border border-[color:var(--rule-on-dark)] bg-[color:var(--panel)] p-8 text-white backdrop-blur-sm"
            style={{ borderRadius: "var(--r-lg)" }}
          >
            <Orbit
              readouts={["N ≈ 75", "SURVEY 2026", "71.2%"]}
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-80"
            />
            <p
              className="relative z-10 label text-periwinkle"
              style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
            >
              Katalyze survey, 2026
            </p>
            <div className="relative z-10 flex flex-col gap-3">
              <DotStat lit={71} className="mb-4 w-40" />
              <p
                className="focal font-display font-extralight tabular-nums"
                style={{ fontSize: "var(--text-display)", lineHeight: "var(--leading-display)" }}
              >
                <CountUp value={LEAD.value} />
              </p>
              <p
                className="max-w-xs text-white/80"
                style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-snug)" }}
              >
                {LEAD.description}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="col-span-12 flex flex-col lg:col-span-4">
          {STATS.map((s, i) => (
            <Reveal
              key={s.value}
              variant="slide"
              delayMs={i * 90}
              className="flex items-baseline gap-5 border-b border-[color:var(--rule-on-dark)] py-6 first:pt-0"
            >
              <span
                className="w-24 shrink-0 font-display font-extralight tabular-nums text-white"
                style={{ fontSize: "var(--text-2xl)" }}
              >
                <CountUp value={s.value} />
              </span>
              <span
                className="text-[color:var(--muted-on-dark)]"
                style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}
              >
                {s.description}
              </span>
            </Reveal>
          ))}
          <p
            className="pt-4 text-[color:var(--faint-on-dark)]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Katalyze market research survey, about 75 respondents, 2026.
          </p>
        </div>
      </div>
    </section>
  );
}
