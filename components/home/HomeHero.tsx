"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

import DitherField from "@/components/DitherField";
import type { AnchorId } from "@/components/home/DeviceModel";
import HeroHeadline from "@/components/HeroHeadline";
import StarRing from "@/components/home/StarRing";
import WaitlistForm from "@/components/WaitlistForm";
import { images } from "@/lib/images";

// three.js is large: load it in its own chunk after the page is up, so it
// never delays the first paint or the page becoming interactive.
const DeviceModel = dynamic(() => import("@/components/home/DeviceModel"), {
  ssr: false,
});

// Readouts on the device render. Box positions are percentages of the
// image frame and point at parts that are really there.
type Annotation = {
  id: AnchorId;
  label: string;
  value: string;
  detail?: string; // a second, quieter line
  side: "left" | "right";
  at: number; // scroll progress where it appears
};

const ANNOTATIONS: Annotation[] = [
  {
    id: "cartridges",
    label: "6 cartridges",
    value: "3 bases: toner, serum, cream",
    detail: "3 actives: smaller, concentrated ingredients",
    side: "right",
    at: 0.3,
  },
  {
    id: "controls",
    label: "Controls",
    value: "Display and buttons",
    side: "left",
    at: 0.42,
  },
  {
    id: "cup",
    label: "Dose dish",
    value: "One fresh dose, in a small dish",
    side: "right",
    at: 0.54,
  },
];

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const useIsDesktop = () => useMedia("(min-width: 1024px)");

// Reference: alethia's pinned specimen hero and sharplink's annotated
// object. The section is 320vh tall; a 100vh stage stays pinned while the
// scroll drives three beats: the promise, the device read part by part,
// then the one line that sums it up.
export default function HomeHero() {
  // Reduced motion gets the static hero, with no pinning or scrubbing.
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  if (reduce) return <StaticHero />;
  return <ScrollHero />;
}

function ScrollHero() {
  const ref = useRef<HTMLElement>(null);
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // A little spring so the stage glides rather than ticks.
  const p = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.4,
  });

  // Beat 1: the promise leaves.
  const introOpacity = useTransform(p, [0, 0.16, 0.24], [1, 1, 0]);
  const introY = useTransform(p, [0, 0.24], ["0vh", "-8vh"]);

  // The device: off to the right (desktop) or dimmed behind (phone),
  // then centred and full, then dimmed behind the closing line.
  const deviceX = useTransform(
    p,
    [0, 0.26],
    desktop ? ["20vw", "0vw"] : ["0vw", "0vw"],
  );
  const deviceScale = useTransform(
    p,
    [0, 0.26, 0.72, 1],
    desktop ? [0.78, 1, 1, 1.1] : [0.9, 1, 1, 1.08],
  );
  const deviceOpacity = useTransform(
    p,
    [0, 0.2, 0.7, 0.82],
    desktop ? [1, 1, 1, 0.16] : [0, 1, 1, 0.14],
  );
  const glowOpacity = useTransform(
    p,
    [0, 0.3, 0.7, 0.85],
    [0.35, 0.8, 0.8, 0.3],
  );

  // Beat 3: the summary line.
  const outroOpacity = useTransform(p, [0.74, 0.84], [0, 1]);
  const outroY = useTransform(p, [0.74, 0.86], ["4vh", "0vh"]);

  // Each label is pinned by the 3D model to the part it names.
  const cartridgesRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const cupRef = useRef<HTMLDivElement>(null);
  const anchors = useMemo(
    () => ({ cartridges: cartridgesRef, controls: controlsRef, cup: cupRef }),
    [],
  );
  // ...and framed by a box that tracks the part's outline as it turns.
  const cartridgesBox = useRef<HTMLDivElement>(null);
  const controlsBox = useRef<HTMLDivElement>(null);
  const cupBox = useRef<HTMLDivElement>(null);
  const boxes = useMemo(
    () => ({ cartridges: cartridgesBox, controls: controlsBox, cup: cupBox }),
    [],
  );
  const [webgl, setWebgl] = useState(true);
  const onUnsupported = useCallback(() => setWebgl(false), []);
  const [modelReady, setModelReady] = useState(false);
  const onModelReady = useCallback(() => setModelReady(true), []);
  // Fetch the 3D code as soon as the browser has a free moment (during
  // the intro, if it plays), without competing with the first paint.
  useEffect(() => {
    const load = () => void import("@/components/home/DeviceModel");
    if (!window.requestIdleCallback) {
      const t = window.setTimeout(load, 300);
      return () => clearTimeout(t);
    }
    const id = window.requestIdleCallback(load, { timeout: 800 });
    return () => window.cancelIdleCallback(id);
  }, []);

  const [beat, setBeat] = useState(1);
  useMotionValueEvent(p, "change", (v) => {
    setBeat(v < 0.24 ? 1 : v < 0.74 ? 2 : 3);
  });

  return (
    <section
      ref={ref}
      aria-label="Introducing Katalyze"
      className="relative bg-[color:var(--canvas-deep)]"
      style={{ height: "320vh" }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Atmosphere */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[image:var(--grad-haze-dark)] opacity-60"
        />
        <div
          aria-hidden="true"
          className="grain pointer-events-none absolute inset-0"
        />
        {/* Living dithered field: drifts, twinkles, ripples under the
            pointer. Quieter behind the copy so the words stay clean. */}
        <DitherField
          density={0.85}
          className="absolute inset-0 opacity-80 [mask-image:linear-gradient(100deg,rgb(0_0_0/0.25)_0%,rgb(0_0_0/0.25)_32%,black_62%)]"
        />

        {/* The device, in 3D. Labels are pinned to its parts. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-16">
          <motion.div
            className="relative"
            style={{
              x: deviceX,
              scale: deviceScale,
              opacity: deviceOpacity,
              width: desktop ? "min(66vw, 120vh)" : "100vw",
              height: desktop ? "76vh" : "54svh",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <StarRing className="aspect-square h-[125%] max-w-none shrink-0" />
            </div>
            <motion.span
              aria-hidden="true"
              className="absolute inset-[10%] bg-[image:var(--grad-point)] blur-3xl"
              style={{ opacity: glowOpacity }}
            />
            {webgl ? (
              <>
                {/* A still of the first frame, on screen at once while the
                    live model loads; it fades as the model takes over. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images.product.poster.src}
                  alt=""
                  aria-hidden="true"
                  fetchPriority="high"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
                  style={{ opacity: modelReady ? 0 : 1 }}
                />
                <DeviceModel
                  progress={p}
                  anchors={anchors}
                  boxes={boxes}
                  onUnsupported={onUnsupported}
                  onReady={onModelReady}
                  className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex justify-center">
                <div
                  className="relative h-full"
                  style={{ aspectRatio: "1080 / 1440" }}
                >
                  <DevicePlate />
                </div>
              </div>
            )}

            {webgl &&
              ANNOTATIONS.map((a) => (
                <AnnotationMark
                  key={a.id}
                  a={a}
                  p={p}
                  desktop={desktop}
                  anchorRef={anchors[a.id]}
                  boxRef={boxes[a.id]}
                />
              ))}
          </motion.div>
        </div>

        {/* Beat 1: the promise */}
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{
            opacity: introOpacity,
            y: introY,
            pointerEvents: beat === 1 ? "auto" : "none",
          }}
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
          >
            <div className="flex max-w-xl flex-col gap-6 pt-16">
              <p
                className="font-mono uppercase text-periwinkle"
                style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
              >
                Personalized skincare · In development
              </p>
              <HeroHeadline compact />
              <p
                className="max-w-md text-white/85"
                style={{
                  fontSize: "var(--text-lg)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                <strong className="font-medium text-white">
                  One device instead of a shelf of skincare.
                </strong>
                <span className="block pt-1 text-[0.88em] opacity-75">
                  Katalyze sits on your counter. Each morning you touch its sensor
                  pad, it checks if your skin is drier than usual, and it mixes one
                  fresh dose to match.
                </span>
              </p>
              <WaitlistForm
                source="hero"
                trackVisibility
                className="mt-2 max-w-md"
              />
              <p
                className="text-[color:var(--muted-on-dark)]"
                style={{ fontSize: "var(--text-sm)" }}
              >
                Designed and built by Katherine Yao, student founder.{" "}
                <Link
                  href="/story"
                  className="text-blush underline decoration-blush/40 underline-offset-4 transition-colors hover:decoration-blush"
                >
                  Read the story
                </Link>
                <span className="md:hidden">
                  {" · "}
                  <Link href="/quick" className="text-blush underline decoration-blush/40 underline-offset-4">
                    Quick read
                  </Link>
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Phone readouts: one caption at a time under the device */}
        {!desktop && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center px-[var(--margin)]">
            {ANNOTATIONS.map((a, i) => (
              <PhoneCaption
                key={a.id}
                a={a}
                next={ANNOTATIONS[i + 1]?.at ?? 0.72}
                p={p}
              />
            ))}
          </div>
        )}

        {/* Beat 3: the summary */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-center"
          style={{ opacity: outroOpacity, y: outroY }}
        >
          <div className="flex flex-col items-center gap-5 px-[var(--margin)]">
            <p
              className="font-display font-extralight text-white"
              style={{
                fontSize: "var(--text-display)",
                lineHeight: "var(--leading-display)",
              }}
            >
              Skin changes daily.
              <br />
              <em className="italic">So should your formula.</em>
            </p>
            <p
              className="max-w-md text-white/80"
              style={{
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-body)",
              }}
            >
              About three seconds on the sensor. About a minute, start to
              finish.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Fallback when WebGL is unavailable: the render, masked so its pale
// studio sweep falls off into the navy.
function DevicePlate() {
  const device = images.product.deviceHero;
  const mask =
    "radial-gradient(ellipse 44% 29% at 50% 57%, #000 60%, transparent 100%)";
  return (
    <div className="absolute inset-0">
      <Image
        src={device.src}
        alt={device.alt}
        fill
        priority
        sizes="(min-width: 1024px) 56vh, 80vw"
        className="object-cover"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      />
    </div>
  );
}

function AnnotationMark({
  a,
  p,
  desktop,
  anchorRef,
  boxRef,
}: {
  a: Annotation;
  p: MotionValue<number>;
  desktop: boolean;
  anchorRef: RefObject<HTMLDivElement | null>;
  boxRef: RefObject<HTMLDivElement | null>;
}) {
  const show = useTransform(p, [a.at, a.at + 0.06, 0.72, 0.78], [0, 1, 1, 0]);
  const line = useTransform(p, [a.at + 0.02, a.at + 0.08], [0, 1]);
  const right = a.side === "right";

  // Box and anchor are positioned every frame by DeviceModel (px).
  return (
    <>
      <motion.div
        ref={boxRef}
        aria-hidden="true"
        className="absolute border border-white/45"
        style={{ opacity: show, left: 0, top: 0 }}
      >
        {[
          "-left-[3px] -top-[3px]",
          "-right-[3px] -top-[3px]",
          "-left-[3px] -bottom-[3px]",
          "-right-[3px] -bottom-[3px]",
        ].map((c) => (
          <span
            key={c}
            className={`absolute block h-[5px] w-[5px] bg-white ${c}`}
          />
        ))}
        <span
          className="absolute -top-5 left-0 font-mono uppercase text-white/70"
          style={{ fontSize: "0.625rem", letterSpacing: "var(--track-label)" }}
        >
          {a.label.slice(1, 3)}
        </span>
      </motion.div>
      <motion.div
        ref={anchorRef}
        data-side={a.side}
        className="absolute h-0 w-0"
        style={{ opacity: show, left: 0, top: 0 }}
      >
        <span
          aria-hidden="true"
          className="absolute -left-[3px] -top-[3px] block h-[7px] w-[7px] bg-blush shadow-[0_0_10px_rgb(232_204_210/0.9)]"
        />
        {desktop && (
          <div
            className={`absolute top-0 flex -translate-y-1/2 items-center ${
              right ? "left-3" : "right-3 flex-row-reverse"
            }`}
          >
            <motion.span
              className="block h-px w-24 bg-periwinkle/80"
              style={{ scaleX: line, originX: right ? 0 : 1 }}
            />
            {/* A dark plate keeps the label readable over the glow. */}
            <span
              className={`flex flex-col gap-0.5 whitespace-nowrap rounded-md border border-white/10 bg-[color:var(--canvas-deep)]/85 px-3 py-2 shadow-[0_8px_24px_rgb(10_12_28/0.5)] backdrop-blur-md ${right ? "ml-3" : "mr-3 items-end text-right"}`}
            >
              <span
                className="font-mono uppercase text-periwinkle"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--track-label)",
                }}
              >
                {a.label}
              </span>
              <span
                className="text-white"
                style={{ fontSize: "var(--text-base)" }}
              >
                {a.value}
              </span>
              {a.detail && (
                <span
                  className="text-white"
                  style={{ fontSize: "var(--text-base)" }}
                >
                  {a.detail}
                </span>
              )}
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
}

function PhoneCaption({
  a,
  next,
  p,
}: {
  a: Annotation;
  next: number;
  p: MotionValue<number>;
}) {
  const opacity = useTransform(
    p,
    [a.at, a.at + 0.04, next - 0.02, next],
    [0, 1, 1, 0],
  );
  return (
    <motion.div
      className="absolute bottom-0 flex flex-col items-center text-center"
      style={{ opacity }}
    >
      <span
        className="font-mono uppercase text-periwinkle"
        style={{
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--track-label)",
        }}
      >
        {a.label}
      </span>
      <span className="text-white" style={{ fontSize: "var(--text-base)" }}>
        {a.value}
      </span>
      {a.detail && (
        <span className="text-white" style={{ fontSize: "var(--text-base)" }}>
          {a.detail}
        </span>
      )}
    </motion.div>
  );
}

function StaticDevice() {
  const [webgl, setWebgl] = useState(true);
  const onUnsupported = useCallback(() => setWebgl(false), []);
  return webgl ? (
    <DeviceModel
      onUnsupported={onUnsupported}
      className="mx-auto aspect-[4/3] w-full max-w-xl"
    />
  ) : (
    <div
      className="relative mx-auto w-full max-w-md"
      style={{ aspectRatio: "1080 / 1440" }}
    >
      <DevicePlate />
    </div>
  );
}

// No pinning, no scroll scrubbing: the same content laid out once.
function StaticHero() {
  return (
    <section
      aria-label="Introducing Katalyze"
      className="relative overflow-hidden bg-[color:var(--canvas-deep)]"
      style={{ paddingBlock: "var(--s-16) var(--s-24)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[image:var(--grad-haze-dark)] opacity-60"
      />
      <div
        className="relative mx-auto grid grid-cols-12 items-center gap-y-12"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-6">
          <p
            className="font-mono uppercase text-periwinkle"
            style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
          >
            <span aria-hidden="true" className="hint-dot relative size-1.5 rounded-full bg-blush" />
            Personalized skincare device · In development
          </p>
          <HeroHeadline compact />
          <p
            className="max-w-md text-white/85"
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-body)",
            }}
          >
            <strong className="font-medium text-white">
              One device instead of a shelf of skincare.
            </strong>
            <span className="block pt-1 text-[0.88em] opacity-75">
              Katalyze sits on your counter. Each morning you touch its sensor
              pad, it checks if your skin is drier than usual, and it mixes one
              fresh dose to match.
            </span>
          </p>
          <WaitlistForm
            source="hero"
            trackVisibility
            className="mt-2 max-w-md"
          />
          <p
            className="text-[color:var(--muted-on-dark)]"
            style={{ fontSize: "var(--text-sm)" }}
          >
            Designed and built by Katherine Yao, student founder.{" "}
            <Link
              href="/story"
              className="text-blush underline decoration-blush/40 underline-offset-4"
            >
              Read the story
            </Link>
            <span className="md:hidden">
              {" · "}
              <Link href="/quick" className="text-blush underline decoration-blush/40 underline-offset-4">
                Quick read
              </Link>
            </span>
          </p>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <StaticDevice />
          <dl className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-4">
            {ANNOTATIONS.map((a) => (
              <div key={a.id} className="flex flex-col">
                <dt
                  className="font-mono uppercase text-periwinkle"
                  style={{
                    fontSize: "var(--text-2xs)",
                    letterSpacing: "var(--track-label)",
                  }}
                >
                  {a.label}
                </dt>
                <dd
                  className="text-white/85"
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  {a.value}
                  {a.detail && (
                    <>
                      <br />
                      {a.detail}
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
