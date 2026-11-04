import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import WaitlistForm from "@/components/WaitlistForm";
import { CARTRIDGE_TINT } from "@/lib/tints";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Quick read",
  description:
    "Katalyze in two minutes: what it is, how it works, the research, the business model and where it stands. No animations.",
};

/*
 * The whole site as one page for readers on a clock (admissions officers,
 * investors). Still pictures and plain type, no reveals, canvases or
 * scroll effects. Figures match the homepage and the investors
 * page (pitch deck, Sep 2026). Product claims follow the site's rules.
 */

const label = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--track-label)",
} as const;

const FACTS = [
  ["What", "A countertop skincare device that mixes one fresh dose for your skin each morning."],
  ["Stage", "Pre-launch. Working six-channel prototype, tested with simulated liquids. Not in public markets yet."],
  ["Founder", "Katherine Yao, solo founder, working with outside manufacturing, formulation and development partners."],
  ["Price (planned)", "$279 device, refill plans from $25 a month."],
];

const STEPS = [
  ["Read", "Rest a fingertip on the pad for about 3 seconds. It compares the reading with your own usual: a relative hydration trend, not a clinical number."],
  ["Mix", "Your reading, local weather and a quick check-in go to a rules engine that picks the blend inside pre-set safe ranges. Six pumps dose by weight. AI only explains the blend in plain words."],
  ["Apply", "One dose lands in a small dish. You scoop it with a fingertip and apply it yourself. The device never touches your skin and doesn't scan your face."],
  ["Learn", "Tomorrow's blend follows the trend, so the formula changes when your skin does."],
];

const CARTRIDGES = [
  ["Bases", "Toner, serum, cream"],
  ["Actives", "Hyaluronic acid (holds water), niacinamide (oil balance, even tone), ceramide (barrier)"],
];

const SURVEY = [
  ["71.2%", "say their skin changes with the season or weather"],
  ["78%", "have bought a product that didn't work for them"],
  ["78.1%", "say too many options is their biggest struggle"],
  ["68.5%", "find a device that reads and mixes very or extremely appealing"],
  ["60.3%", "would probably or definitely buy it if available today"],
];

const BUSINESS = [
  ["Model", "Sell the device once ($279, about $51 to make at the first run), then monthly cartridge refills: $25 Basic, $45 Full, $89 Premium. Luxury hotels are a later B2B channel."],
  ["Market", "$185B global skincare; $56B personalized-beauty segment growing 14.8% a year (TBRC, 2026)."],
  ["Competition", "Perso (L'Oréal) estimates from a photo, Lesielle mixes but you set it, Function of Beauty and Curology are fixed after signup. Katalyze is the one that measures every morning."],
  ["Projections", "Breakeven in Year 2; $7.68M revenue and +$1.48M EBIT by Year 5. These are projections, not results."],
  ["Raise", "$450K to take Katalyze from prototype to a first run of about 2,000 units."],
];

const MILESTONES = [
  ["Done", "Market research survey, about 75 respondents"],
  ["Done", "Six-channel prototype built and tested with simulated liquids"],
  ["Done", "Pitching Round, Diamond Challenge 2026"],
  ["Done", "Finalist (top 2%), Blue Ocean Student Entrepreneur Competition 2026"],
  ["Next", "Move from simulated liquids to real ingredients"],
  ["Next", "Manufacturing partner for a first run of about 2,000 units"],
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-4 border-t border-[color:var(--rule-on-dark)] py-10 md:grid-cols-12 md:gap-x-[var(--gutter)]">
      <h2 className="font-mono uppercase text-periwinkle md:col-span-3" style={label}>
        {title}
      </h2>
      <div className="md:col-span-9">{children}</div>
    </section>
  );
}

function Rows({ rows, wide = false }: { rows: string[][]; wide?: boolean }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([k, v]) => (
        <div
          key={k + v}
          className={`grid gap-1 border-b border-[color:var(--rule-on-dark)] py-3 last:border-b-0 ${wide ? "sm:grid-cols-[7rem_1fr]" : "sm:grid-cols-[10rem_1fr]"} sm:gap-6`}
        >
          <dt className="text-white" style={{ fontSize: "var(--text-sm)" }}>
            {k}
          </dt>
          <dd className="text-white/75" style={{ fontSize: "var(--text-sm)", lineHeight: 1.55 }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function QuickPage() {
  return (
    <main className="flex flex-1 flex-col bg-midnight text-white">
      <header className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover"
          style={{ backgroundImage: `url(${images.mood.ritual.src})`, backgroundPosition: "60% 40%" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(90deg, rgb(21 24 46 / 0.95), rgb(31 36 65 / 0.7) 60%, rgb(31 36 65 / 0.5)), linear-gradient(180deg, transparent 70%, var(--midnight))",
          }}
        />
        <div
          className="mx-auto grid w-full grid-cols-1 items-center gap-10 md:grid-cols-12"
          style={{ maxWidth: "1100px", paddingInline: "var(--margin)", paddingBlock: "calc(var(--s-16) + 64px) var(--s-16)" }}
        >
          <div className="md:col-span-7">
            <p className="font-mono uppercase text-periwinkle" style={label}>
              Quick read · about 2 minutes
            </p>
            <h1
              className="mt-4 font-display font-extralight"
              style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1 }}
            >
              Katalyze, on one page.
            </h1>
            <p className="mt-6 max-w-xl text-white/80" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}>
              Most skincare is chosen once and used for months, while skin
              changes week to week. Katalyze is a countertop device that checks
              your skin from one fingertip each morning and mixes a fresh dose
              from six cartridges to match.
            </p>
            <p className="mt-4 text-white/55" style={{ fontSize: "var(--text-xs)" }}>
              Prefer the full version? <Link href="/" className="text-blush underline underline-offset-4">Go to the homepage</Link>.
            </p>
          </div>
          <div className="md:col-span-5">
            <Image
              src={images.product.poster.src}
              width={images.product.poster.width}
              height={images.product.poster.height}
              alt="The planned Katalyze device: a white countertop unit with six cartridges behind a frosted window and a dose dish at the front"
              priority
              className="h-auto w-full scale-110 drop-shadow-[0_30px_40px_rgb(0_0_0/0.5)] md:scale-[1.4]"
            />
          </div>
        </div>
      </header>

      <div
        className="mx-auto w-full"
        style={{ maxWidth: "1100px", paddingInline: "var(--margin)", paddingBottom: "var(--s-24)" }}
      >
        <div>
          <Block title="At a glance">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_140px]">
              <Rows rows={FACTS} />
              <div className="relative hidden aspect-[3/4] overflow-hidden rounded-xl sm:block">
                <Image
                  src={images.founder.portrait.src}
                  alt={images.founder.portrait.alt}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </div>
            </div>
          </Block>
          <Block title="How it works">
            <ol className="flex flex-col">
              {STEPS.map(([k, v], i) => (
                <li key={k} className="grid gap-1 border-b border-[color:var(--rule-on-dark)] py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <span className="text-white" style={{ fontSize: "var(--text-sm)" }}>
                    {i + 1}. {k}
                  </span>
                  <span className="text-white/75" style={{ fontSize: "var(--text-sm)", lineHeight: 1.55 }}>
                    {v}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
          <Block title="Inside">
            <div className="mb-6 flex items-end gap-3" aria-hidden="true">
              {Object.entries(CARTRIDGE_TINT).map(([code, c], i) => (
                <span
                  key={code}
                  className="block w-8 rounded-t-[10px] rounded-b-[6px] shadow-[inset_4px_0_6px_rgb(255_255_255/0.5),inset_-4px_0_8px_rgb(31_36_65/0.3)]"
                  style={{ height: i < 3 ? 72 : 48, background: `linear-gradient(180deg, color-mix(in oklab, ${c} 50%, white), ${c})` }}
                />
              ))}
            </div>
            <Rows rows={CARTRIDGES} />
          </Block>
          <Block title="The research">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {SURVEY.map(([v, t]) => (
                <li key={v + t} className="flex items-baseline gap-4">
                  <span className="w-20 shrink-0 font-display font-extralight text-white" style={{ fontSize: "var(--text-xl)" }}>
                    {v}
                  </span>
                  <span className="text-white/75" style={{ fontSize: "var(--text-sm)", lineHeight: 1.45 }}>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-white/45" style={{ fontSize: "var(--text-xs)" }}>
              From Katherine&apos;s own survey of about 75 skincare users, 2026.
            </p>
          </Block>
          <Block title="The business">
            <Rows rows={BUSINESS} />
            <p className="mt-4 text-white/60" style={{ fontSize: "var(--text-xs)" }}>
              Full numbers, use of funds and roadmap: <Link href="/investors" className="text-blush underline underline-offset-4">Investors page</Link>.
            </p>
          </Block>
          <Block title="Where it stands">
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[images.prototype.front, images.prototype.pumps, images.prototype.electronics].map((im) => (
                <div key={im.src} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-indigo/30">
                  <Image src={im.src} alt={im.alt} fill sizes="(min-width: 768px) 240px, 30vw" className="object-cover" />
                </div>
              ))}
            </div>
            <Rows rows={MILESTONES} wide />
          </Block>
          <Block title="What it doesn't do">
            <p className="text-white/75" style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
              It doesn&apos;t scan your face, it isn&apos;t a medical device, it
              never touches your skin, and AI doesn&apos;t pick your formula.
              No efficacy claims are made; no trials have been run yet.
            </p>
          </Block>
          <Block title="Join the waitlist">
            <p className="mb-4 text-white/75" style={{ fontSize: "var(--text-sm)" }}>
              The first run is about 2,000 units. The waitlist hears first.
            </p>
            <WaitlistForm source="quick" />
          </Block>
        </div>
      </div>
    </main>
  );
}
