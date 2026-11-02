import Reveal from "@/components/Reveal";

// Verbatim from the pitch deck (v9, p.17). Don't paraphrase or trim them
// into something they didn't say.
const QUOTES = [
  {
    quote:
      "Personalized skincare is an industry trend, and KATALYZE effectively fills the market gap for on-demand and home-based customized skincare. The product design reflects the team member's insight into consumer needs and their sensitivity to the industry.",
    name: "Jessica Tang",
    role: "Regional Sales Manager, MAC China",
  },
  {
    quote:
      "This keen awareness of life's pain points and bold application of cutting-edge technology not only usher in the 'precision era' of skincare but also allows us to glimpse the vibrant vitality of youth through scientific and technological innovation.",
    name: "Fu Tao",
    role: "Shanghai Kevin Kathy Biomedical Research Center",
  },
];

// Oversized-numeral device: the competition result at architectural
// scale, cropped by the left edge, then the two industry quotes.
export default function Voices() {
  return (
    <section
      className="relative overflow-hidden bg-[image:var(--grad-haze-dark)]"
      style={{ paddingBlock: "var(--s-24) var(--s-32)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 gap-y-16"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        {/* cols 1-6: the result */}
        <Reveal className="col-span-12 flex flex-col gap-4 lg:col-span-6">
          <p
            className="-ml-[0.06em] font-display font-extralight leading-none text-white"
            style={{
              fontSize: "clamp(6rem, 18vw, 16rem)",
              letterSpacing: "var(--track-display)",
            }}
          >
            Top <em className="italic">2%</em>
          </p>
          <p
            className="max-w-sm text-[color:var(--muted-on-dark)]"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Finalist, Blue Ocean Student Entrepreneur Competition 2026.
          </p>
          <dl className="mt-6 flex max-w-md flex-col gap-1 border-t border-[color:var(--rule-on-dark)] pt-6">
            <dt
              className="font-mono uppercase text-periwinkle"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              Diamond Challenge 2026
            </dt>
            <dd
              className="text-white"
              style={{
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Advanced to the Pitching Round, chosen from hundreds of
              submissions worldwide.
            </dd>
            <dd
              className="text-[color:var(--faint-on-dark)]"
              style={{ fontSize: "var(--text-xs)" }}
            >
              University of Delaware, Horn Entrepreneurship
            </dd>
          </dl>
        </Reveal>

        {/* cols 8-12: what industry readers said */}
        <div className="col-span-12 flex flex-col gap-10 lg:col-span-5 lg:col-start-8 lg:pt-16">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} variant="fade" delayMs={i * 120}>
              <figure className="flex flex-col gap-4 border-l border-periwinkle/40 pl-6">
                <blockquote
                  className="font-display font-extralight italic text-white"
                  style={{
                    fontSize: "var(--text-lg)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption style={{ fontSize: "var(--text-sm)" }}>
                  <span className="font-medium text-white">{q.name}</span>
                  <span className="text-[color:var(--muted-on-dark)]">
                    {" "}
                    · {q.role}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
