import Image from "next/image";
import Link from "next/link";

import Chip from "@/components/home/Chip";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

// Full-bleed split: portrait edge to edge on the left half, the founder's
// own words on the right. Admissions readers come for this section.
export default function Founder() {
  const portrait = images.founder.portrait;

  return (
    <section className="grid grid-cols-1 bg-white md:grid-cols-2">
      <div className="relative min-h-[28rem] md:min-h-[44rem]">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
        <p
          className="absolute bottom-4 left-4 rounded-full bg-midnight/70 px-3 py-1 font-mono uppercase text-white backdrop-blur-sm"
          style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
        >
          [Katherine Yao · Founder]
        </p>
      </div>

      <Reveal
        className="flex flex-col justify-center gap-6"
        style={{ padding: "var(--s-16) var(--margin)" }}
      >
        <Chip>The founder</Chip>
        <p
          className="max-w-lg font-display font-extralight italic text-midnight"
          style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
        >
          &ldquo;Why can&apos;t skincare be as dynamic and fresh as the food
          we cook in our kitchens?&rdquo;
        </p>
        <p
          className="max-w-lg text-[color:var(--muted-on-light)]"
          style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
        >
          Katherine started Katalyze after a cabinet full of half-used
          bottles, each bought for a skin type that had already changed.
          She ran the survey, designed the device and built the working
          prototype. Katalyze is a solo-founder company: she leads product,
          design, financial planning and supplier sourcing, and works with
          external partners for hardware, formulation and software.
        </p>
        <Link
          href="/story"
          className="w-fit border-b border-indigo/40 pb-1 text-indigo transition-colors hover:border-indigo"
          style={{ fontSize: "var(--text-sm)" }}
        >
          Read the full story
        </Link>
      </Reveal>
    </section>
  );
}
