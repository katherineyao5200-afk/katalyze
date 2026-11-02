import Image from "next/image";
import Link from "next/link";

import { images } from "@/lib/images";

/*
 * The short version, straight after the hero, for readers who need the
 * facts in one screen (admissions officers, investors): what it is, who
 * made it, what's been done, where it stands. Facts only, from the pitch
 * deck (Sep 2026); no adjectives.
 */
const FACTS = [
  {
    k: "What it is",
    v: "A countertop device that checks your skin's hydration from a fingertip each morning and mixes one fresh dose of skincare from six cartridges.",
  },
  {
    k: "Who built it",
    v: "Katherine Yao, student and solo founder. She ran the research, designed the device and built the working prototype, with outside partners for manufacturing, formulation and software.",
  },
  {
    k: "Done so far",
    v: [
      "Surveyed about 75 skincare users",
      "Built a working six-channel prototype (tested with simulated liquids)",
      "Finalist, top 2%: Blue Ocean Student Entrepreneur Competition 2026",
      "Pitching Round: Diamond Challenge 2026",
    ],
  },
  {
    k: "Where it stands",
    v: "Pre-launch and not for sale. Next: real ingredients, then a first production run of about 2,000 units.",
  },
];

export default function Facts() {
  const portrait = images.founder.portrait;
  return (
    <section
      aria-labelledby="facts-title"
      className="bg-midnight text-white"
      style={{ paddingBlock: "var(--s-16) var(--s-24)" }}
    >
      <div
        className="mx-auto grid grid-cols-1 gap-10 md:grid-cols-12"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)", columnGap: "var(--gutter)" }}
      >
        <div className="flex items-start gap-5 md:col-span-4 md:flex-col">
          <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl md:w-40">
            <Image src={portrait.src} alt={portrait.alt} fill sizes="160px" className="object-cover" />
          </div>
          <div className="flex flex-col gap-3">
            <h2
              id="facts-title"
              className="font-display font-extralight"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              The short version
            </h2>
            <p className="text-white/60" style={{ fontSize: "var(--text-sm)" }}>
              More:{" "}
              <Link href="/story" className="text-blush underline underline-offset-4">Story</Link>
              {" · "}
              <Link href="/quick" className="text-blush underline underline-offset-4">One-page summary</Link>
              {" · "}
              <Link href="/investors" className="text-blush underline underline-offset-4">Investors</Link>
            </p>
          </div>
        </div>

        <dl className="flex flex-col border-t border-[color:var(--rule-on-dark)] md:col-span-8">
          {FACTS.map((f) => (
            <div
              key={f.k}
              className="grid grid-cols-1 gap-2 border-b border-[color:var(--rule-on-dark)] py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
            >
              <dt className="text-periwinkle" style={{ fontSize: "var(--text-sm)" }}>
                {f.k}
              </dt>
              <dd className="text-white/85" style={{ fontSize: "var(--text-base)", lineHeight: 1.55 }}>
                {Array.isArray(f.v) ? (
                  <ul className="flex flex-col gap-1.5">
                    {f.v.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden="true" className="text-periwinkle">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  f.v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
