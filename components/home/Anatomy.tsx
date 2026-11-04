"use client";

import dynamic from "next/dynamic";
import { useMotionValue, useScroll, useTransform } from "motion/react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { Layer } from "@/components/home/DeviceModel";
import Hint from "@/components/Hint";

// three.js is large: load it in its own chunk after the page is up, so it
// never delays the first paint or the page becoming interactive.
const DeviceModel = dynamic(() => import("@/components/home/DeviceModel"), {
  ssr: false,
});

// The planned design, part by part. Facts from the product engineering
// spec; nothing here claims a finished, tested product.
const PARTS: {
  layer: Layer;
  n: string;
  name: string;
  note: string;
  side: "left" | "right";
}[] = [
  {
    layer: "glass",
    n: "01",
    name: "Frosted window",
    note: "A frosted panel. You see each cartridge's colour, not the machinery.",
    side: "left",
  },
  {
    layer: "cartridges",
    n: "02",
    name: "Six cartridges",
    note: "Six refillable containers of skincare ingredients. Each one only fits its own slot.",
    side: "left",
  },
  {
    layer: "controls",
    n: "03",
    name: "Display and status light",
    note: "Ready, mixing, done. Everything else lives in the app.",
    side: "left",
  },
  {
    layer: "tray",
    n: "04",
    name: "Dose dish",
    note: "Your skincare comes out here, measured by weight. The tray lifts out to clean.",
    side: "right",
  },
  {
    layer: "shell",
    n: "05",
    name: "Housing",
    note: "The outer shell. The finger sensor is on top, and six small pumps sit inside.",
    side: "right",
  },
];

function subscribe(cb: () => void) {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

// Reference: exploded-view anatomy diagrams (kat's key-switch pick).
// Scroll pulls the device apart into its layers; drag turns it.
export default function Anatomy() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrolled = useTransform(scrollYProgress, [0.08, 0.62], [0, 1], {
    clamp: true,
  });
  const fixed = useMotionValue(1);
  const explode = reduced ? fixed : scrolled;

  const refs = {
    glass: useRef<HTMLDivElement>(null),
    cartridges: useRef<HTMLDivElement>(null),
    controls: useRef<HTMLDivElement>(null),
    tray: useRef<HTMLDivElement>(null),
    shell: useRef<HTMLDivElement>(null),
  };
  // Stable identity so the 3D scene isn't rebuilt on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const labels = useMemo(() => refs, []);
  const [webgl, setWebgl] = useState(true);
  const onUnsupported = useCallback(() => setWebgl(false), []);

  return (
    <>
      <section
        ref={ref}
        aria-labelledby="anatomy-title"
        className="relative bg-[color:var(--canvas-deep)] text-white"
        style={{ height: reduced || !webgl ? "auto" : "260vh" }}
      >
        <div
          className={`${reduced || !webgl ? "" : "sticky top-0 h-[100svh]"} flex flex-col overflow-hidden`}
        >
          <div
            className="mx-auto flex w-full flex-col gap-4 pt-28 lg:flex-row lg:items-end lg:justify-between"
            style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
          >
            <h2
              id="anatomy-title"
              className="max-w-xl font-display font-extralight"
              style={{
                fontSize: "var(--text-3xl)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              What&apos;s under the shell.
            </h2>
            <p
              className="max-w-sm text-[color:var(--muted-on-dark)]"
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-body)",
              }}
            >
              The planned design, opened up.
            </p>
            {webgl && <Hint>Drag to turn · scroll to open</Hint>}
          </div>

          {webgl && (
            <div className="relative h-[58svh] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
              <DeviceModel
                mode="anatomy"
                explode={explode}
                labels={labels}
                onUnsupported={onUnsupported}
                className="absolute inset-0"
              />
              {/* Labels pinned to each layer (desktop) */}
              {PARTS.map((p) => (
                <div
                  key={p.layer}
                  ref={refs[p.layer as keyof typeof refs]}
                  aria-hidden="true"
                  data-side={p.side}
                  className="anat-label pointer-events-none absolute top-0 left-0 hidden lg:block"
                  style={{ opacity: 0 }}
                >
                  <span className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-[color:var(--canvas-deep)]" />
                  <span className="anat-line" />
                  <span className="anat-text">
                    <span
                      className="label text-periwinkle"
                      style={{
                        fontSize: "var(--text-2xs)",
                        letterSpacing: "var(--track-label)",
                      }}
                    >
                      {p.n} · {p.name}
                    </span>
                    <span
                      className="text-white/80"
                      style={{ fontSize: "var(--text-xs)", lineHeight: 1.45 }}
                    >
                      {p.note}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* The same parts as a list: phones, and anyone without WebGL */}
      </section>
      <div className="bg-[color:var(--canvas-deep)] text-white">
        <ol
          className={`mx-auto grid w-full grid-cols-1 gap-x-8 gap-y-5 pb-12 sm:grid-cols-2 ${webgl ? "lg:sr-only" : "pt-12 lg:grid-cols-3"}`}
          style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
        >
          {PARTS.map((p) => (
            <li
              key={p.layer}
              className="flex gap-4 border-t border-[color:var(--rule-on-dark)] pt-3"
            >
              <span
                className="font-mono text-periwinkle"
                style={{ fontSize: "var(--text-2xs)" }}
              >
                {p.n}
              </span>
              <span className="flex flex-col gap-1">
                <span style={{ fontSize: "var(--text-sm)" }}>{p.name}</span>
                <span
                  className="text-[color:var(--muted-on-dark)]"
                  style={{ fontSize: "var(--text-xs)", lineHeight: 1.5 }}
                >
                  {p.note}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
