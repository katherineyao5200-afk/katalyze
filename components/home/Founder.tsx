import Image from "next/image";
import Link from "next/link";

import DitherField from "@/components/DitherField";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import Lead from "@/components/Lead";

// Portrait at its full shape on the left, the founder's own words on
// the right. Admissions readers come for this section.
export default function Founder() {
  const portrait = images.founder.portrait;

  return (
    <section
      className="relative overflow-hidden bg-midnight"
      style={{ paddingBlock: "var(--s-24)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 items-center gap-y-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        {/* The whole portrait at its own 2:3 shape, so nothing is cropped. */}
        <Reveal variant="scale" className="col-span-12 md:col-span-5">
          <figure className="relative mx-auto w-full max-w-sm md:max-w-none">
            {/* The glowing aura, as a halo behind the portrait. */}
            <span aria-hidden="true" className="absolute -inset-[14%]">
              <DitherField
                variant="aura"
                density={0.75}
                className="absolute inset-0 [mask-image:radial-gradient(closest-side,black_60%,transparent)]"
              />
            </span>
            <Image
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="(min-width: 768px) 40vw, 90vw"
              className="relative h-auto w-full"
              style={{ borderRadius: "var(--r-lg)" }}
            />
            <figcaption
              className="absolute bottom-4 left-4 rounded-full bg-midnight/70 px-3 py-1 font-mono uppercase text-white backdrop-blur-sm"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              Katherine Yao, founder
            </figcaption>
          </figure>
        </Reveal>

        <Reveal className="col-span-12 flex flex-col justify-center gap-6 md:col-span-6 md:col-start-7">
          <p
            className="max-w-lg font-display font-extralight italic text-white"
            style={{
              fontSize: "var(--text-2xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            &ldquo;Why can&apos;t skincare be as dynamic and fresh as the food
            we cook in our kitchens?&rdquo;
          </p>
          <p
            className="max-w-lg text-white/80"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            <Lead text="Katherine ran the survey, designed the device and built the prototype. Katalyze is a one-person company, working with outside partners for hardware, formulation and software." />
          </p>
          <Link
            href="/story"
            className="w-fit border-b border-blush/40 pb-1 text-blush transition-colors hover:border-blush"
            style={{ fontSize: "var(--text-sm)" }}
          >
            Read the full story
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
