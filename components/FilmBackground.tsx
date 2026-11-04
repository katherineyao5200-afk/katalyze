"use client";

import { useEffect, useRef, useState } from "react";

/*
 * A full-bleed, muted, looping film behind a section, the way cinematic
 * product sites set real footage under their headlines. The video only
 * loads once the section is near the screen, pauses when it scrolls away,
 * and shows its poster still under reduced motion. With no `src` yet it
 * renders nothing, so a section can carry the slot before the footage
 * exists (paths live in lib/images.ts).
 */
export default function FilmBackground({
  src,
  poster,
  className = "",
  position = "50% 50%",
}: {
  src: string | null;
  poster?: string | null;
  className?: string;
  position?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          if (!reduce) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      aria-hidden="true"
      muted
      loop
      playsInline
      preload="none"
      poster={poster ?? undefined}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ objectPosition: position }}
    >
      {near && <source src={src} type="video/mp4" />}
    </video>
  );
}
