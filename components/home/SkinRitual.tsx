import Reveal from "@/components/Reveal";

/*
 * Straight after the hero, so nobody wonders what category this is: a
 * line drawing of someone smoothing a fingertip of the dose onto a cheek,
 * beside ordinary skin days and what the blend does about each. The drawing is
 * about applying skincare, never about scanning: nothing is measured on
 * the face.
 */
const DAYS = [
  { day: "Tight after a night with the heating on", dose: "more cream, more hyaluronic acid" },
  { day: "Shiny by lunchtime in a humid August", dose: "more toner, a little niacinamide" },
  { day: "Red and touchy after a windy walk", dose: "more ceramide" },
  { day: "A normal Tuesday", dose: "mostly serum, everything near your usual" },
];

function Face() {
  return (
    <svg viewBox="0 0 300 360" className="skin-face h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3dfe3" stopOpacity="0.28" />
          <stop offset="1" stopColor="#e8ccd2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dab" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#efe2ec" />
        </radialGradient>
      </defs>
      <ellipse cx="184" cy="196" rx="52" ry="44" fill="url(#cheek)" className="skin-glow" />
      <g fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* hair */}
        <path pathLength={1} className="draw" style={{ animationDelay: "0ms" }} d="M128 34 C 76 44, 46 112, 62 186 C 72 232, 98 262, 112 300 C 118 318, 112 340, 100 356" strokeOpacity="0.55" />
        <path pathLength={1} className="draw" style={{ animationDelay: "120ms" }} d="M128 34 C 150 30, 176 34, 194 48" strokeOpacity="0.55" />
        {/* profile: forehead, nose, lips, chin, jaw, neck */}
        <path
          pathLength={1}
          className="draw"
          style={{ animationDelay: "200ms" }}
          d="M194 48 C 206 62, 212 80, 211 100 C 210 116, 208 128, 214 140 L 236 184 C 240 192, 236 198, 226 198 C 220 202, 226 210, 224 214 C 232 218, 234 224, 226 229 C 231 234, 230 240, 222 243 C 216 250, 220 262, 214 272 C 206 288, 182 294, 162 290 C 146 287, 136 300, 134 330 L 132 356"
        />
        {/* closed eye and brow */}
        <path pathLength={1} className="draw" style={{ animationDelay: "500ms" }} d="M180 130 C 188 136, 197 136, 203 130" />
        <path pathLength={1} className="draw" style={{ animationDelay: "560ms" }} d="M184 135 l -3 5 M191 137 l -1 5 M198 136 l 1 5" strokeOpacity="0.7" />
        <path pathLength={1} className="draw" style={{ animationDelay: "620ms" }} d="M174 114 C 186 107, 199 107, 208 113" strokeOpacity="0.8" />
        {/* ear */}
        <path pathLength={1} className="draw" style={{ animationDelay: "680ms" }} d="M128 162 C 118 150, 104 160, 108 180 C 112 196, 126 198, 132 188" strokeOpacity="0.7" />
        {/* the hand: an index finger smoothing the dose onto the cheek */}
        <path
          pathLength={1}
          className="draw"
          style={{ animationDelay: "800ms" }}
          d="M150 356 C 158 310, 168 260, 176 222 C 179 210, 192 208, 194 220 C 192 252, 184 300, 178 356"
          stroke="var(--blush)"
        />
        <path pathLength={1} className="draw" style={{ animationDelay: "900ms" }} d="M178 222 C 182 216, 188 216, 190 222" stroke="var(--blush)" strokeOpacity="0.7" />
        <path pathLength={1} className="draw" style={{ animationDelay: "950ms" }} d="M196 300 C 206 290, 214 300, 210 316 L 204 356" stroke="var(--blush)" strokeOpacity="0.55" />
      </g>
      {/* the dab of product on the cheek */}
      <ellipse cx="196" cy="198" rx="9" ry="5.5" fill="url(#dab)" className="skin-dab" />
      <circle cx="193" cy="196" r="1.6" fill="white" className="skin-dab" />
    </svg>
  );
}

export default function SkinRitual() {
  return (
    <section className="relative overflow-hidden bg-midnight" style={{ paddingBlock: "var(--s-24) var(--s-16)" }}>
      <div
        className="mx-auto grid grid-cols-1 items-center gap-y-12 md:grid-cols-12"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)", columnGap: "var(--gutter)" }}
      >
        <Reveal className="relative mx-auto aspect-[5/6] w-full max-w-[380px] md:col-span-5 md:max-w-none">
          <div
            aria-hidden="true"
            className="absolute inset-[-10%] rounded-full"
            style={{ background: "radial-gradient(closest-side, rgb(232 204 210 / 0.16), transparent)" }}
          />
          <Face />
        </Reveal>

        <div className="flex flex-col gap-8 md:col-span-6 md:col-start-7">
          <Reveal className="flex flex-col gap-5">
            <h2
              className="font-display font-extralight text-white"
              style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
            >
              Your skin isn&apos;t the same two mornings in a row.
            </h2>
            <p
              className="max-w-md text-[color:var(--muted-on-dark)]"
              style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
            >
              Most of us still reach for the same jar either way. Katalyze
              mixes a small, fresh dose each morning instead, and you smooth it
              on like any moisturizer.
            </p>
          </Reveal>
          <Reveal>
            <dl className="border-t border-[color:var(--rule-on-dark)]">
              {DAYS.map((d) => (
                <div
                  key={d.day}
                  className="grid grid-cols-1 gap-1 border-b border-[color:var(--rule-on-dark)] py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
                >
                  <dt className="text-white" style={{ fontSize: "var(--text-base)" }}>
                    {d.day}
                  </dt>
                  <dd className="text-periwinkle sm:text-right" style={{ fontSize: "var(--text-sm)" }}>
                    {d.dose}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
