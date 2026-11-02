"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import Reveal from "@/components/Reveal";

const DeviceModel = dynamic(() => import("@/components/home/DeviceModel"), {
  ssr: false,
});

/*
 * The device at home: on a stone worktop, morning light from a window,
 * a glass of water and a plant beside it. Full-bleed, one line of copy.
 */
export default function Counter() {
  const [webgl, setWebgl] = useState(true);
  const onUnsupported = useCallback(() => setWebgl(false), []);

  return (
    <section
      aria-labelledby="counter-title"
      className="relative isolate overflow-hidden bg-[color:var(--canvas-deep)] text-white"
    >
      <div className="relative h-[92svh] min-h-[560px] w-full">
        {webgl && (
          <DeviceModel
            mode="counter"
            onUnsupported={onUnsupported}
            className="absolute inset-0"
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--canvas-deep) 0%, rgb(21 24 46 / 0.4) 30%, transparent 50%, transparent 85%, var(--canvas-deep) 100%)",
          }}
        />
        <Reveal
          className="absolute inset-x-0 top-0 mx-auto flex flex-col gap-4"
          style={{
            maxWidth: "var(--max-w)",
            paddingInline: "var(--margin)",
            paddingTop: "var(--s-24)",
          }}
        >
          <h2
            id="counter-title"
            className="max-w-2xl font-display font-extralight"
            style={{
              fontSize: "var(--text-3xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Made for the counter.
            <span className="text-periwinkle"> Not the cabinet.</span>
          </h2>
          <p
            className="max-w-md text-white/75"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Soft-matte white on a navy base, with the sensor on top and the cup
            at the front. The planned design, shown in a home.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
