"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import DeviceIllustration, { type DevicePart } from "@/components/DeviceIllustration";
import Chip from "@/components/home/Chip";

const STEPS: { n: string; title: string; body: string; part: DevicePart | null }[] = [
  {
    n: "01",
    title: "Read",
    body: "Rest a fingertip on the capacitive pad for about three seconds. It tracks whether your skin is drier or more hydrated than your usual. A trend, not a clinical number.",
    part: null,
  },
  {
    n: "02",
    title: "Mix",
    body: "The app combines that reading with local weather and a quick morning check-in. Rules set at setup keep every blend inside a safe range. Six pumps then measure each ingredient by weight.",
    part: "window",
  },
  {
    n: "03",
    title: "Apply",
    body: "One dose lands in the cup. You apply it yourself. The device never touches your skin.",
    part: "tray",
  },
  {
    n: "04",
    title: "Learn",
    body: "Each day's reading and check-in shape the next blend, so the formula keeps up with your skin.",
    part: "display",
  },
];

// Reference: alethia's pinned specimen. Full-bleed dark band, the device
// pinned in cols 1-5 while the steps scroll past in cols 7-12.
export default function Process() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = refs.current.indexOf(entry.target as HTMLLIElement);
            if (i !== -1) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-midnight text-white" style={{ paddingBlock: "var(--s-24)" }}>
      <div
        className="mx-auto grid grid-cols-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <div className="col-span-12 flex flex-col gap-6 md:col-span-8">
          <Chip tone="dark">How it works</Chip>
          <h2
            className="font-display font-extralight"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Four steps, every morning.
            <br />
            <em className="italic">About a minute.</em>
          </h2>
        </div>

        {/* cols 1-5: pinned device */}
        <div className="col-span-12 md:col-span-5">
          <div className="sticky top-24 hidden h-[70vh] items-center md:flex">
            <div className="device-sway w-full max-w-md">
              <DeviceIllustration activePart={STEPS[active].part} />
            </div>
          </div>
        </div>

        {/* cols 7-12: steps */}
        <ol className="col-span-12 flex flex-col md:col-span-6 md:col-start-7">
          {STEPS.map((step, i) => (
            <li
              key={step.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="flex flex-col gap-3 border-t border-[color:var(--rule-on-dark)] py-10 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-soft)] md:min-h-[55vh] md:justify-center"
              style={{ opacity: i === active ? 1 : 0.4 }}
            >
              <span
                className="font-mono uppercase text-periwinkle"
                style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
              >
                [Step {step.n}]
              </span>
              <h3
                className="font-display font-extralight"
                style={{ fontSize: "var(--text-display)", lineHeight: "var(--leading-display)" }}
              >
                {step.title}
              </h3>
              <p
                className="max-w-md text-white/75"
                style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}
              >
                {step.body}
              </p>
            </li>
          ))}
          <li className="pt-6">
            <Link
              href="/how-it-works"
              className="text-blush underline decoration-blush/40 underline-offset-4 transition-colors hover:decoration-blush"
              style={{ fontSize: "var(--text-sm)" }}
            >
              The full walkthrough
            </Link>
          </li>
        </ol>
      </div>
    </section>
  );
}
