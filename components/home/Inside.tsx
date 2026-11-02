import Reveal from "@/components/Reveal";

// The base formulas have no public names yet (kat confirmed), so they
// are numbered. Each line says what the ingredient is for, never a
// percentage: no formulation data exists yet.
const BASES = [
  { code: "B-01", name: "Base 01", role: "The carrier every dose starts from. Sets the day's texture." },
  { code: "B-02", name: "Base 02", role: "Lets a dry winter morning and a humid summer one feel different." },
  { code: "B-03", name: "Base 03", role: "Widens the range further. Its own channel, its own pump." },
];

const ACTIVES = [
  { code: "A-01", name: "Hyaluronic acid", role: "Holds water at the skin's surface. Weighted up when your hydration trend dips." },
  { code: "A-02", name: "Niacinamide", role: "Vitamin B3, widely used for oil balance and an even tone." },
  { code: "A-03", name: "Ceramide", role: "Part of the skin's own barrier. Weighted up on irritated or wind-dried days." },
];

// Each cartridge is drawn as a frosted-glass vial: the liquid's colour
// glows through a frosted front pane that carries the label. Hover (or
// focus) lifts the pane a little and the liquid shows clearly, like
// opening the bay. Bases are tall bottles, actives short droppers.
const TINTS = {
  base: [
    "linear-gradient(180deg, #b8bce0, var(--periwinkle) 60%, var(--indigo))",
    "linear-gradient(180deg, #cfd2ea, #a3a7cf 60%, #6d74b4)",
    "linear-gradient(180deg, #f6f1ee, #e6dcd8 60%, #c9bcc6)",
  ],
  active: [
    "linear-gradient(180deg, #c9cdf0, #8f97d6 60%, var(--indigo))",
    "linear-gradient(180deg, #f7e6ea, var(--blush) 60%, #c99aa6)",
    "linear-gradient(180deg, #fbeef1, #efd3d9 60%, #d5a9b4)",
  ],
};

function Row({
  items,
  label,
  kind,
}: {
  items: typeof BASES;
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
              className={`vial group relative isolate flex flex-col justify-end outline-none ${
                tall ? "h-[230px] sm:h-[300px]" : "h-[210px] sm:h-[248px]"
              }`}
            >
              {/* the liquid, behind the glass */}
              <div
                aria-hidden="true"
                className="vial-liquid absolute inset-x-[14%] top-0 bottom-[10%] -z-10 rounded-[22px]"
                style={{ background: TINTS[kind][i] }}
              >
                <span className="absolute left-1/2 top-0 h-5 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 shadow-sm" />
                {!tall && (
                  <span className="absolute left-1/2 top-0 h-9 w-[12%] -translate-x-1/2 -translate-y-full rounded-t-full bg-white/80" />
                )}
              </div>
              {/* the frosted pane, carrying the label */}
              <div className="vial-pane flex h-[80%] flex-col sm:h-[72%] justify-between rounded-[22px] p-5">
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
                <p
                  className="text-midnight/75"
                  style={{ fontSize: "var(--text-sm)", lineHeight: 1.45 }}
                >
                  {item.role}
                </p>
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
            Six cartridges,<span className="text-[color:var(--faint-on-light)]"> one dose at a time.</span>
          </h2>
          <p
            className="max-w-sm text-[color:var(--muted-on-light)]"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            <strong className="font-medium text-midnight">
              Every dose fresh. Every ounce used.
            </strong>{" "}
            Each dose is mixed for one use, so there&apos;s no half-finished
            bottle at the back of the cabinet.
          </p>
        </Reveal>

        <div className="col-span-12 flex flex-col gap-12 lg:col-span-7 lg:col-start-6">
          <Row items={BASES} label="Base formulas · 3" kind="base" />
          <Row items={ACTIVES} label="Active ingredients · 3" kind="active" />
        </div>
      </div>
    </section>
  );
}
