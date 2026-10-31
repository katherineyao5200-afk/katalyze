import Image from "next/image";

import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Real milestones only — every line here is sourced from the pitch deck
// (v9, Sep 2026). Add new rows as they actually happen; never pre-date one.
const MILESTONES = [
  {
    status: "Done",
    text: "Six-channel prototype built and tested with simulated liquids",
  },
  {
    status: "Done",
    text: "Market research survey with about 75 respondents",
  },
  {
    status: "Done",
    text: "Finalist (top 2%), Blue Ocean Student Entrepreneur Competition 2026",
  },
  {
    status: "Next",
    text: "Move from simulated liquids to real actives, and lock in a manufacturing partner",
  },
];

// Layout device: dark ground, photo plate + milestone column. The photos
// are the real working prototype — deliberately unretouched. A working
// rig with labeled pumps is more convincing than another render.
export default function Prototype() {
  const { front, electronics, pumps } = images.prototype;

  return (
    <section className="bg-midnight" style={{ paddingBlock: "var(--s-24)" }}>
      <div
        className="mx-auto grid grid-cols-12 gap-y-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-4 md:col-span-5">
          <p
            className="font-mono uppercase text-periwinkle"
            style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
          >
            Where it stands
          </p>
          <h2
            className="max-w-md font-display font-extralight text-white"
            style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
          >
            The prototype works. Now it gets real ingredients.
          </h2>
          <p
            className="max-w-md text-white/75"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            Each bottle feeds its own pump and tube, so no two ingredients
            ever share a path. The controller weighs every dose as it
            dispenses. It has run on simulated liquids so far, to prove
            the mechanics before anything touches skin.
          </p>

          <ol
            className="flex flex-col divide-y divide-[color:var(--rule-on-dark)]"
            style={{ marginTop: "var(--s-8)" }}
          >
            {MILESTONES.map((m) => (
              <li key={m.text} className="flex items-baseline gap-4 py-3">
                <span
                  className={`w-12 shrink-0 font-mono uppercase ${
                    m.status === "Next" ? "text-blush" : "text-periwinkle"
                  }`}
                  style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
                >
                  {m.status}
                </span>
                <span
                  className="text-white/80"
                  style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}
                >
                  {m.text}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal
          delayMs={120}
          variant="scale"
          className="col-span-12 grid grid-cols-2 gap-3 md:col-span-6 md:col-start-7"
        >
          <figure className="row-span-2">
            <Image
              src={front.src}
              alt={front.alt}
              width={front.width}
              height={front.height}
              sizes="(min-width: 768px) 25vw, 50vw"
              className="h-full w-full object-cover"
              style={{ borderRadius: "var(--r-lg)" }}
            />
          </figure>
          <figure>
            <Image
              src={pumps.src}
              alt={pumps.alt}
              width={pumps.width}
              height={pumps.height}
              sizes="(min-width: 768px) 25vw, 50vw"
              className="aspect-square w-full object-cover"
              style={{ borderRadius: "var(--r-lg)" }}
            />
          </figure>
          <figure>
            <Image
              src={electronics.src}
              alt={electronics.alt}
              width={electronics.width}
              height={electronics.height}
              sizes="(min-width: 768px) 25vw, 50vw"
              className="aspect-square w-full object-cover"
              style={{ borderRadius: "var(--r-lg)" }}
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
