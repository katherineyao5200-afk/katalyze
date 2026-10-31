import Image from "next/image";

import Chip from "@/components/home/Chip";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Real milestones only, from the pitch deck (v9, Sep 2026). Add rows as
// they actually happen; never pre-date one.
const MILESTONES = [
  { status: "Done", text: "Market research survey with about 75 respondents" },
  { status: "Done", text: "Six-channel prototype built and tested with simulated liquids" },
  { status: "Done", text: "Finalist (top 2%), Blue Ocean Student Entrepreneur Competition 2026" },
  { status: "Next", text: "Move from simulated liquids to real ingredients" },
  { status: "Next", text: "Lock in a manufacturing partner for a first run of about 2,000 units" },
];

function PhotoCard({
  photo,
  label,
  className = "",
}: {
  photo: { src: string; width: number; height: number; alt: string };
  label: string;
  className?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden bg-midnight ${className}`}
      style={{ borderRadius: "var(--r-lg)" }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="(min-width: 1024px) 30vw, 90vw"
        className="h-full w-full object-cover"
      />
      <figcaption
        className="absolute left-4 top-4 rounded-full bg-midnight/70 px-3 py-1 font-mono uppercase text-white backdrop-blur-sm"
        style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
      >
        [{label}]
      </figcaption>
    </figure>
  );
}

// Reference: alethia's full-bleed image cards with bracketed labels set
// inside the photo. Dark band; photos 1-7, milestones 9-12.
export default function Progress() {
  const { front, pumps, electronics } = images.prototype;

  return (
    <section className="bg-midnight text-white" style={{ paddingBlock: "var(--s-32) var(--s-40)" }}>
      <div
        className="mx-auto grid grid-cols-12 gap-y-16"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <Reveal className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <Chip tone="dark">Where it stands</Chip>
          <h2
            className="font-display font-extralight"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            The prototype works.
            <br />
            <em className="italic">Next, real ingredients.</em>
          </h2>
        </Reveal>

        <Reveal
          variant="scale"
          className="col-span-12 grid grid-cols-2 gap-3 lg:col-span-7"
        >
          <PhotoCard photo={front} label="Prototype" className="row-span-2 aspect-[3/4] sm:aspect-auto" />
          <PhotoCard photo={pumps} label="Six pumps" className="aspect-square" />
          <PhotoCard photo={electronics} label="Controller" className="aspect-square" />
        </Reveal>

        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4 lg:col-start-9">
          <p
            className="text-white/75"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
          >
            Each bottle feeds its own pump and tube, so no two ingredients
            share a path. The controller weighs every dose as it
            dispenses. So far it has run on simulated liquids, to prove the
            mechanics before anything touches skin.
          </p>
          <div role="list" className="flex flex-col">
            {MILESTONES.map((m, i) => (
              <Reveal
                key={m.text}
                variant="slide"
                delayMs={i * 70}
                role="listitem"
                className="flex items-baseline gap-4 border-t border-[color:var(--rule-on-dark)] py-4"
              >
                <span
                  className={`w-12 shrink-0 font-mono uppercase ${
                    m.status === "Next" ? "text-blush" : "text-periwinkle"
                  }`}
                  style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
                >
                  {m.status}
                </span>
                <span
                  className="text-white/85"
                  style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-snug)" }}
                >
                  {m.text}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
