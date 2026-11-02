import type { Metadata } from "next";
import Image from "next/image";

import Gallery from "@/components/Gallery";
import Close from "@/components/home/Close";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Sparkle from "@/components/Sparkle";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Why Katherine Yao built Katalyze: an overflowing cabinet, irritated skin, and one question about why skincare doesn't work the way cooking does.",
};

const P = "text-white/80";
const P_STYLE = {
  fontSize: "var(--text-lg)",
  lineHeight: "var(--leading-body)",
};

const mono = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--track-label)",
} as const;

// In the order they happened. No dates are invented here.
const MILESTONES = [
  {
    title: "Asked first",
    body: "Surveyed about 75 people. Seven in ten said their skin changes with the weather. Almost eight in ten had bought something that didn't work for them.",
  },
  {
    title: "Built it",
    body: "A working six-channel prototype: three bases (toner, serum, cream) and three actives, each pumped on its own.",
  },
  {
    title: "Pitched it",
    body: "Reached the Pitching Round of the Diamond Challenge.",
  },
  {
    title: "Recognized",
    body: "Finalist in the Blue Ocean Student Entrepreneur Competition.",
  },
];

const ROLES = [
  ["Founder · Katherine Yao", "Product, design, financial planning, supplier sourcing"],
  ["Manufacturing partner", "Building the hardware"],
  ["Formulation partner", "The base formulas and actives"],
  ["Development partner", "The app and software"],
];

export default function StoryPage() {
  const portrait = images.founder.portrait;

  return (
    <main className="flex flex-1 flex-col bg-midnight text-white">
      <PageHero
        label="Our story"
        title={
          <>
            It started with an
            <br />
            overflowing cabinet.
          </>
        }
        lede="Katalyze is a solo-founder company, started by Katherine Yao and built with outside partners for manufacturing, formulation and development."
      />

      {/* The story, with the founder alongside. */}
      <section style={{ paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto grid grid-cols-1 items-start gap-12 md:grid-cols-12 md:gap-x-[var(--gutter)]"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <figure className="flex flex-col gap-3 md:sticky md:top-24 md:col-span-4">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="(min-width: 768px) 30vw, 100vw"
              priority
              className="w-full object-cover"
              style={{ borderRadius: "var(--r-lg)", aspectRatio: "4 / 5" }}
            />
            <figcaption
              className="flex items-center justify-between font-mono uppercase text-periwinkle"
              style={mono}
            >
              <span>Katherine Yao</span>
              <span>Founder</span>
            </figcaption>
          </figure>

          <div
            className="flex flex-col md:col-span-7 md:col-start-6"
            style={{ gap: "var(--s-8)" }}
          >
            <Reveal>
              <p className={P} style={P_STYLE}>
                Serums, creams, half-used bottles bought for a skin type that
                had already changed by the time they arrived, and skin that
                stayed irritated no matter which combination I tried next.
              </p>
            </Reveal>
            <Reveal>
              <p className={P} style={P_STYLE}>
                Eventually the problem became obvious: it was never the
                products. Every formula on that shelf was static, and skin
                isn&apos;t. It reacts to weather, stress, sleep and the season,
                while the bottle in the cabinet stays exactly the same until it
                runs out.
              </p>
            </Reveal>
            <Reveal>
              <blockquote
                className="border-l border-blush/60 pl-6 font-display font-extralight italic text-white"
                style={{
                  fontSize: "var(--text-3xl)",
                  lineHeight: "var(--leading-tight)",
                }}
              >
                Why can&apos;t skincare be as dynamic and fresh as the food we
                cook in our kitchens?
              </blockquote>
            </Reveal>
            <Reveal>
              <p className={P} style={P_STYLE}>
                That question became Katalyze: a device that reads your skin
                and mixes a single fresh dose, instead of asking you to guess
                which pre-made formula might fit today. I didn&apos;t want to
                build it on a hunch, so I asked people first, then built it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What's happened so far, drawn as a short constellation. */}
      <section
        className="bg-[color:var(--canvas-deep)]"
        style={{ paddingBlock: "var(--s-24)" }}
      >
        <div
          className="mx-auto flex flex-col gap-14"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <h2
            className="max-w-2xl font-display font-extralight"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            So far.
          </h2>
          <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-[var(--gutter)]">
            <span
              aria-hidden="true"
              className="absolute top-[7px] right-0 left-0 hidden h-px bg-gradient-to-r from-periwinkle/60 via-periwinkle/30 to-blush/60 md:block"
            />
            {MILESTONES.map((m, i) => (
              <Reveal
                key={m.title}
                delayMs={i * 120}
                className="relative flex flex-col gap-4"
              >
                <span
                  className={`relative z-10 w-fit bg-[color:var(--canvas-deep)] pr-2 ${
                    i === MILESTONES.length - 1 ? "text-blush" : "text-white"
                  }`}
                >
                  <Sparkle size={15} />
                </span>
                <p className="font-mono uppercase text-periwinkle" style={mono}>
                  0{i + 1}
                </p>
                <h3
                  className="font-display font-extralight"
                  style={{ fontSize: "var(--text-2xl)", lineHeight: 1.1 }}
                >
                  {m.title}
                </h3>
                <p
                  className="text-[color:var(--muted-on-dark)]"
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {m.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Behind the scenes: Katherine's own photos, floating on a track. */}
      <section className="overflow-hidden" style={{ paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto grid grid-cols-1 items-end gap-6 md:grid-cols-12 md:gap-x-[var(--gutter)]"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <Reveal className="md:col-span-6">
            <h2
              className="font-display font-extralight"
              style={{
                fontSize: "var(--text-3xl)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              Behind the scenes.
            </h2>
          </Reveal>
          <p
            className="max-w-md text-[color:var(--muted-on-dark)] md:col-span-5 md:col-start-8"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            Wiring the first prototype by hand, and a visit to see how
            clinics analyse skin today.
          </p>
        </div>
        <div className="mt-6">
          <Gallery
            variant="float"
            label="Behind-the-scenes photos"
            items={[
              {
                ...images.story.wiring1,
                title: "Wiring the controller",
                text: "Every pump runs off one board, wired by hand.",
              },
              {
                ...images.story.wiring2,
                title: "Six channels, laid out",
                text: "Each pump gets its own lines before it goes in the housing.",
              },
              {
                ...images.story.visia,
                title: "Research: a clinic's skin imaging",
                text: "How professional skin analysis works today. Katalyze doesn't scan faces; it reads one fingertip.",
              },
              {
                ...images.story.visiaScreen,
                title: "What a clinic scan looks like",
                text: "Detailed, but a once-in-a-while snapshot. Katalyze is built for every morning.",
              },
              {
                ...images.story.wiring3,
                title: "Tubing in",
                text: "Fitting the lines that carry each ingredient to the dish.",
              },
            ]}
          />
        </div>
      </section>

      {/* Who builds it. */}
      <section style={{ paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-[var(--gutter)]"
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          <Reveal className="flex flex-col gap-4 md:col-span-4">
            <h2
              className="font-display font-extralight"
              style={{
                fontSize: "var(--text-3xl)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              One founder,<span className="text-periwinkle"> a few good partners.</span>
            </h2>
          </Reveal>
          <dl className="flex flex-col md:col-span-7 md:col-start-6">
            {ROLES.map(([who, what]) => (
              <Reveal
                key={who}
                className="grid grid-cols-1 gap-1 border-t border-[color:var(--rule-on-dark)] py-5 sm:grid-cols-2 sm:gap-8"
              >
                <dt style={{ fontSize: "var(--text-base)" }}>{who}</dt>
                <dd
                  className="text-[color:var(--muted-on-dark)]"
                  style={{ fontSize: "var(--text-base)" }}
                >
                  {what}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Close />
    </main>
  );
}
