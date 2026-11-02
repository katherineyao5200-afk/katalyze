"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type GalleryItem = {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  text?: string;
};

/*
 * A horizontal gallery: photos at one height on a track you drag, swipe
 * or step through with the arrows. "float" sets the cards at slight
 * angles and lets them drift (the behind-the-scenes look); "row" keeps
 * them straight. Snaps to each photo. Under reduced motion nothing drifts.
 */
export default function Gallery({
  items,
  variant = "row",
  label,
}: {
  items: GalleryItem[];
  variant?: "row" | "float";
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const float = variant === "float";

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      const kids = Array.from(el.children) as HTMLElement[];
      let best = 0;
      kids.forEach((k, i) => {
        if (Math.abs(k.offsetLeft - el.scrollLeft - el.clientWidth * 0.08) <
          Math.abs(kids[best].offsetLeft - el.scrollLeft - el.clientWidth * 0.08))
          best = i;
      });
      setIndex(best);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Drag to scroll with a mouse (touch already swipes natively).
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const go = (d: number) => {
    const el = track.current;
    if (!el) return;
    const i = Math.max(0, Math.min(items.length - 1, index + d));
    const kid = el.children[i] as HTMLElement | undefined;
    if (kid)
      el.scrollTo({
        left: kid.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft),
        behavior: "smooth",
      });
  };

  return (
    <div className="flex flex-col gap-8" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        data-cursor="Drag"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        className={`gallery-track flex cursor-grab snap-x snap-mandatory overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-blush active:cursor-grabbing ${
          float ? "gap-10 py-14" : "gap-5 py-2"
        }`}
        style={{
          paddingInline: "max(var(--margin), calc((100vw - var(--max-w)) / 2 + var(--margin)))",
          scrollPaddingInline:
            "max(var(--margin), calc((100vw - var(--max-w)) / 2 + var(--margin)))",
        }}
      >
        {items.map((it, i) => {
          const ratio = it.width / it.height;
          const tilt = float ? [-3, 2.4, -1.6, 3, -2.2][i % 5] : 0;
          const lift = float ? [0, 36, -14, 24, -6][i % 5] : 0;
          return (
            <figure
              key={it.src}
              className={`group flex shrink-0 snap-start flex-col gap-4 ${float ? "gallery-float" : ""}`}
              style={
                {
                  "--tilt": `${tilt}deg`,
                  "--lift": `${lift}px`,
                  animationDelay: `${i * -1.7}s`,
                } as React.CSSProperties
              }
            >
              <div
                className="gallery-photo relative overflow-hidden bg-midnight"
                style={{
                  height: float
                    ? "clamp(260px, 42vh, 420px)"
                    : "clamp(300px, 56vh, 540px)",
                  aspectRatio: `${ratio}`,
                  borderRadius: "var(--r-lg)",
                }}
              >
                <Image
                  src={it.src}
                  alt={it.alt}
                  width={it.width}
                  height={it.height}
                  draggable={false}
                  sizes="(min-width: 1024px) 40vw, 80vw"
                  className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-4 font-mono text-white/90"
                  style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <figcaption className="flex max-w-xs flex-col gap-1">
                <span className="text-white" style={{ fontSize: "var(--text-sm)" }}>
                  {it.title}
                </span>
                {it.text && (
                  <span
                    className="text-[color:var(--muted-on-dark)]"
                    style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-snug)" }}
                  >
                    {it.text}
                  </span>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div
        className="mx-auto flex w-full items-center gap-6"
        style={{ maxWidth: "var(--max-w)", paddingInline: "var(--margin)" }}
      >
        <span className="font-mono tabular-nums text-periwinkle" style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}>
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <span className="relative h-px flex-1 bg-[color:var(--rule-on-dark)]" aria-hidden="true">
          <span
            className="absolute inset-y-0 left-0 bg-white shadow-[0_0_8px_rgb(255_255_255/0.6)]"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className="glass grid size-11 place-items-center rounded-full text-white disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === items.length - 1}
            aria-label="Next photo"
            className="glass grid size-11 place-items-center rounded-full text-white disabled:opacity-40"
          >
            →
          </button>
        </span>
      </div>
    </div>
  );
}
