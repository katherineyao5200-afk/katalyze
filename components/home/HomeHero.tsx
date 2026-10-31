import Image from "next/image";
import Link from "next/link";

import Chip from "@/components/home/Chip";
import HeroHeadline from "@/components/HeroHeadline";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";
import { images } from "@/lib/images";

// Annotations on the device render. Positions are percentages of the
// image frame and point at things that are really there: the cartridge
// window and the cup tray.
const ANNOTATIONS = [
  {
    label: "[6 cartridges]",
    value: "3 base · 3 active",
    box: { left: "14%", top: "35%", width: "60%", height: "25%" },
    labelTop: "35%",
  },
  {
    label: "[Cup tray]",
    value: "One fresh dose",
    box: { left: "42%", top: "62%", width: "30%", height: "9%" },
    labelTop: "62%",
  },
];

// Reference: sharplink hero (one object, annotated) + alethia hero
// (left headline, readouts on leader lines) + truekind (plain promise
// and a single clear action). Light ground: the device is shot on white.
export default function HomeHero() {
  const device = images.product.deviceHero;

  return (
    <section
      className="column-rules relative overflow-hidden bg-[image:var(--grad-haze)]"
      style={{ paddingBlock: "var(--s-12) var(--s-24)" }}
    >
      <div
        className="mx-auto grid grid-cols-12 items-center gap-y-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        {/* cols 1-6: the promise */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-6">
          <Chip>Now developing · Working prototype</Chip>

          <HeroHeadline tone="light" />

          <p
            className="max-w-lg text-[color:var(--muted-on-light)]"
            style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-body)" }}
          >
            Katalyze is a countertop device that reads your skin with a
            fingertip sensor, then mixes one fresh dose of skincare to
            match it. Every day, not once at signup.
          </p>

          <WaitlistForm
            source="hero"
            tone="light"
            trackVisibility
            className="mt-2 max-w-md"
          />

          <p
            className="text-[color:var(--muted-on-light)]"
            style={{ fontSize: "var(--text-sm)" }}
          >
            Designed and built by Katherine Yao, student founder.{" "}
            <Link
              href="/story"
              className="text-indigo underline decoration-indigo/40 underline-offset-4 transition-colors hover:decoration-indigo"
            >
              Read the story
            </Link>
          </p>
        </div>

        {/* cols 7-12: the object, annotated */}
        <Reveal
          variant="scale"
          className="col-span-12 lg:col-span-6"
        >
          <div className="relative mx-auto w-full max-w-md lg:ml-[6%] lg:mr-auto">
            <div
              className="relative overflow-hidden border border-[color:var(--rule-on-light)] bg-white shadow-[0_2px_12px_rgb(31_36_65/0.12)]"
              style={{ borderRadius: "var(--r-lg)" }}
            >
              <Image
                src={device.src}
                alt={device.alt}
                width={device.width}
                height={device.height}
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="h-auto w-full"
              />

              {ANNOTATIONS.map((a) => (
                <span
                  key={a.label}
                  aria-hidden="true"
                  className="absolute border border-indigo/60"
                  style={a.box}
                />
              ))}
            </div>

            {/* Readouts sit outside the frame on wide screens and point
                back at their box with a hairline. */}
            {ANNOTATIONS.map((a) => (
              <div
                key={a.label}
                className="absolute hidden items-center lg:flex"
                style={{ top: a.labelTop, left: "100%" }}
              >
                <span className="leader block h-px w-10 bg-indigo/60" />
                <span className="ml-3 flex flex-col whitespace-nowrap">
                  <span
                    className="font-mono uppercase text-indigo"
                    style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
                  >
                    {a.label}
                  </span>
                  <span
                    className="text-[color:var(--muted-on-light)]"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {a.value}
                  </span>
                </span>
              </div>
            ))}

            {/* Phones: the same readouts as a caption row. */}
            <dl className="mt-4 grid grid-cols-2 gap-4 lg:hidden">
              {ANNOTATIONS.map((a) => (
                <div key={a.label} className="flex flex-col">
                  <dt
                    className="font-mono uppercase text-indigo"
                    style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
                  >
                    {a.label}
                  </dt>
                  <dd
                    className="text-[color:var(--muted-on-light)]"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {a.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
