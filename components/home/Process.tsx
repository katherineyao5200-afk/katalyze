"use client";

import Lead from "@/components/Lead";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import StepScene from "@/components/home/StepScene";

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Read",
    body: "Three seconds on the pad. Katalyze compares today with your usual, so it knows whether your skin is drier or more hydrated than normal.",
  },
  {
    n: "02",
    title: "Mix",
    body: "Your reading, the local weather and a quick check-in set the blend. Six pumps measure each ingredient by weight, always inside safe ranges.",
  },
  {
    n: "03",
    title: "Apply",
    body: "A fresh dose lands in a small dish. Scoop it up with a fingertip, like any serum.",
  },
  {
    n: "04",
    title: "Learn",
    body: "Every reading nudges tomorrow's blend. Your formula moves when your skin does.",
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
    <section
      className="bg-midnight text-white"
      style={{ paddingBlock: "var(--s-24)" }}
    >
      <div
        className="mx-auto grid grid-cols-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <div className="col-span-12 flex flex-col gap-6 md:col-span-8">
          <h2
            className="font-display font-extralight"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            About a minute.<span className="text-periwinkle"> Every morning.</span>
          </h2>
        </div>

        {/* cols 1-5: pinned device */}
        <div className="col-span-12 md:col-span-5">
          <div className="sticky top-24 hidden h-[78vh] flex-col justify-center gap-6 md:flex">
            {/* The active step, drawn: replays each time the step changes. */}
            <StepScene
              key={active}
              step={active}
              className="w-full max-w-[440px]"
            />
            <div className="flex max-w-xs gap-2" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span
                  key={s.n}
                  className={`h-px flex-1 transition-colors duration-[var(--dur-base)] ${
                    i <= active ? "bg-blush" : "bg-[color:var(--rule-on-dark)]"
                  }`}
                />
              ))}
            </div>
            <p
              className="font-mono uppercase text-periwinkle"
              style={{
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--track-label)",
              }}
            >
              {STEPS[active].n} · {STEPS[active].title}
            </p>
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
              <StepScene
                key={i === active ? "on" : "off"}
                step={i}
                className="mb-2 w-full max-w-[320px] md:hidden"
              />
              <span
                className="font-mono uppercase text-periwinkle"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                }}
              >
                [Step {step.n}]
              </span>
              <h3
                className="font-display font-extralight"
                style={{
                  fontSize: "var(--text-display)",
                  lineHeight: "var(--leading-display)",
                }}
              >
                {step.title}
              </h3>
              <p
                className="max-w-md text-[color:var(--muted-on-dark)]"
                style={{
                  fontSize: "var(--text-base)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                <Lead text={step.body} />
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
