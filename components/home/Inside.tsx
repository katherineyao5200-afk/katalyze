import CartridgeIllustration from "@/components/CartridgeIllustration";
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

function Row({ items, label }: { items: typeof BASES; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p
        className="font-mono uppercase text-indigo"
        style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
      >
        {label}
      </p>
      <dl className="grid grid-cols-1 border-t border-[color:var(--rule-on-light)] sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal
            key={item.code}
            delayMs={i * 80}
            className={`flex flex-col gap-2 py-6 sm:pr-6 ${
              i > 0 ? "border-t border-[color:var(--rule-on-light)] sm:border-l sm:border-t-0 sm:pl-6" : ""
            }`}
          >
            <dt className="flex items-baseline justify-between gap-4">
              <span
                className="font-display font-extralight text-midnight"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {item.name}
              </span>
              <span
                className="font-mono uppercase text-[color:var(--faint-on-light)]"
                style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
              >
                [{item.code}]
              </span>
            </dt>
            <dd
              className="text-[color:var(--muted-on-light)]"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}
            >
              {item.role}
            </dd>
          </Reveal>
        ))}
      </dl>
    </div>
  );
}

// Reference: alethia's annotated specimens, set on white. 12 cols:
// heading + illustration 1-4, the two cartridge rows 6-12.
export default function Inside() {
  return (
    <section className="bg-white" style={{ paddingBlock: "var(--s-40) var(--s-24)" }}>
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
          <CartridgeIllustration className="mt-6 w-full max-w-sm" />
        </Reveal>

        <div className="col-span-12 flex flex-col gap-12 lg:col-span-7 lg:col-start-6">
          <Row items={BASES} label="[Base formulas · 3]" />
          <Row items={ACTIVES} label="[Active ingredients · 3]" />
        </div>
      </div>
    </section>
  );
}
