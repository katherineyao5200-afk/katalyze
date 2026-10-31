import type { Metadata } from "next";
import Image from "next/image";

import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Why Katherine Yao built Katalyze: an overflowing cabinet, irritated skin, and one question about why skincare doesn't work the way cooking does.",
};

const P = "text-white/80";
const P_STYLE = { fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" };

export default function StoryPage() {
  const portrait = images.founder.portrait;

  return (
    <main className="flex flex-1 flex-col bg-midnight">
      <section style={{ paddingInline: "var(--margin)", paddingBlock: "var(--s-24)" }}>
        <div
          className="mx-auto grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,58ch)_minmax(0,22rem)] md:justify-center"
        >
          <div className="flex flex-col" style={{ gap: "var(--s-8)" }}>
            <h1
              className="font-display font-extralight text-white"
              style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
            >
              Our story.
            </h1>

            <p className={P} style={P_STYLE}>
              Katalyze started with an overflowing bathroom cabinet. Serums,
              creams, half-used bottles bought for a skin type that had
              already changed by the time they arrived, and skin that stayed
              irritated no matter which combination I tried next.
            </p>

            <p className={P} style={P_STYLE}>
              Eventually the problem became obvious: it was never the
              products. It was that every formula on that shelf was static,
              and skin isn&apos;t. It reacts to weather, stress, sleep and the
              season, while the bottle in the cabinet stays exactly the same
              until it runs out.
            </p>

            <p
              className="font-display font-extralight italic text-periwinkle"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              &ldquo;Why can&apos;t skincare be as dynamic and fresh as the
              food we cook in our kitchens?&rdquo;
            </p>

            <p className={P} style={P_STYLE}>
              That question became Katalyze: a device that reads your skin
              and mixes a single fresh dose, instead of asking you to guess
              which pre-made formula might fit today.
            </p>

            <p className={P} style={P_STYLE}>
              I didn&apos;t want to build it on a hunch, so I surveyed about
              75 people first. Seven in ten said their skin changes with the
              weather. Almost eight in ten had bought something that
              didn&apos;t work for them. Then I built a working six-channel
              prototype. Along the way, Katalyze reached the Pitching Round
              of the Diamond Challenge and was a finalist in the Blue Ocean
              Student Entrepreneur Competition.
            </p>

            <p className="text-periwinkle" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}>
              Katalyze is a solo-founder company. I lead product, design,
              financial planning and supplier sourcing, and work with
              external partners for hardware, formulation and software.
            </p>
          </div>

          <figure className="flex flex-col gap-3 md:sticky md:top-24">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="(min-width: 768px) 22rem, 100vw"
              priority
              className="w-full max-w-sm object-cover"
              style={{ borderRadius: "var(--r-lg)", aspectRatio: "4 / 5" }}
            />
            <figcaption className="text-periwinkle" style={{ fontSize: "var(--text-sm)" }}>
              Katherine Yao, founder
            </figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
