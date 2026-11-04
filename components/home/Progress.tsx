import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import Lead from "@/components/Lead";

// Real milestones only, from the pitch deck (v9, Sep 2026). Add rows as
// they actually happen; never pre-date one.
const MILESTONES = [
  { status: "Done", text: "Market research survey with about 75 respondents" },
  {
    status: "Done",
    text: "Working prototype built and tested with water-like test liquids",
  },
  {
    status: "Done",
    text: "Advanced to the Pitching Round, Diamond Challenge 2026",
  },
  {
    status: "Done",
    text: "Finalist (top 2%), Blue Ocean Student Entrepreneur Competition 2026",
  },
  { status: "Next", text: "Move from test liquids to real skincare ingredients" },
  {
    status: "Next",
    text: "Lock in a manufacturing partner for a first run of about 2,000 units",
  },
];

// The prototype as a gallery you drag through, then the milestones as a
// plain two-column list.
export default function Progress() {
  const { front, pumps, electronics } = images.prototype;
  const photos = [
    {
      ...front,
      title: "The working prototype",
      text: "Six bottles, six tubes, one pull-out drawer. Tested so far with test liquids, not real skincare.",
    },
    {
      ...pumps,
      title: "Six pumps",
      text: "One small pump for each ingredient, so they never mix inside the machine.",
    },
    {
      ...electronics,
      title: "The controller",
      text: "The small computer that runs the pumps and weighs each ingredient as it comes out.",
    },
  ];

  return (
    <section
      className="overflow-hidden bg-midnight text-white"
      style={{ paddingBlock: "var(--s-32) var(--s-40)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 items-end gap-y-8"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-6 lg:col-span-7">
          <h2
            className="font-display font-extralight"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            The prototype runs. It hasn&apos;t touched real skincare yet.
          </h2>
        </Reveal>
        <p
          className="col-span-12 max-w-md text-white/75 lg:col-span-4 lg:col-start-9"
          style={{
            fontSize: "var(--text-base)",
            lineHeight: "var(--leading-body)",
          }}
        >
          <Lead text="The prototype works with test liquids. Each ingredient has its own pump and tube, so nothing mixes before it should. Testing with real ingredients comes next." />
        </p>
      </div>

      <div className="mt-14">
        <Gallery items={photos} label="Prototype photos" />
      </div>

      <div
        className="mx-auto mt-20"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <ul className="grid grid-cols-1 gap-x-[var(--gutter)] md:grid-cols-2">
          {MILESTONES.map((m) => (
            <li
              key={m.text}
              className="flex items-baseline gap-4 border-t border-[color:var(--rule-on-dark)] py-5"
            >
              <span
                className={`w-12 shrink-0 font-mono uppercase ${
                  m.status === "Next" ? "text-blush" : "text-periwinkle"
                }`}
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                }}
              >
                {m.status}
              </span>
              <span
                className="text-white/90"
                style={{
                  fontSize: "var(--text-base)",
                  lineHeight: "var(--leading-snug)",
                }}
              >
                {m.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
