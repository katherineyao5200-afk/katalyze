"use client";

import { useEffect, useRef } from "react";

/*
 * The words of a morning routine, drawn slowly inward around the closing
 * line (a toned-down take on the black-hole typography study). Words ride
 * a flattened spiral, shrink and fade as they near the centre, then are
 * reborn at the rim. Runs only while on screen; one still frame under
 * reduced motion.
 */

const WORDS = [
  "hydration", "barrier", "niacinamide", "fresh", "humidity", "dry day",
  "fingertip", "dose", "base", "active", "morning", "weather", "trend",
  "your usual", "light", "rich", "calm", "cup", "refill", "today",
  "tomorrow", "pattern", "winter", "sleep", "one touch", "mix",
];

type W = { text: string; a: number; r: number; speed: number; size: number };

export default function WordVortex({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const resize = () => {
      const b = canvas.getBoundingClientRect();
      W = b.width;
      H = b.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let s = 7;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const count = W < 640 ? 18 : 44;
    const words: W[] = Array.from({ length: count }, (_, i) => ({
      text: WORDS[i % WORDS.length],
      a: rnd() * Math.PI * 2,
      r: 0.18 + rnd() * 0.82,
      speed: 0.6 + rnd() * 0.8,
      size: 0.8 + rnd() * 0.5,
    }));

    const font = getComputedStyle(document.body).getPropertyValue("--font-display") || "serif";

    const draw = (dt: number) => {
      g.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const Rx = W * 0.62;
      const Ry = Math.min(H * 0.45, Math.max(W * 0.26, H * 0.3));
      const k = W < 640 ? 0.72 : 1;
      for (const w of words) {
        // Inward drift speeds up near the centre; angle turns faster too.
        w.r -= dt * 0.000018 * w.speed * (1.4 - w.r);
        w.a += dt * 0.00007 * w.speed / (0.25 + w.r);
        if (w.r < 0.14) {
          w.r = 1;
          w.a = rnd() * Math.PI * 2;
        }
        const x = cx + Math.cos(w.a) * w.r * Rx;
        const y = cy + Math.sin(w.a) * w.r * Ry;
        // Fade in at the rim, out near the core, and stay quiet overall.
        const alpha =
          Math.min(1, (1 - w.r) / 0.15) * Math.min(1, (w.r - 0.14) / 0.3) * 0.22;
        if (alpha <= 0.005) continue;
        const px = Math.max(9, (13 + w.r * 22) * w.size * k);
        g.save();
        g.translate(x, y);
        g.rotate(w.a + Math.PI / 2);
        g.font = `italic 200 ${px}px ${font}, serif`;
        g.fillStyle = `rgba(138,141,179,${alpha})`;
        g.textAlign = "center";
        g.fillText(w.text, 0, 0);
        g.restore();
      }
    };

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      draw(last ? Math.min(64, now - last) : 16);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return;
      if (e.isIntersecting && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      } else if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);
    if (reduce) draw(0);
    const onResize = () => {
      resize();
      if (reduce) draw(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
