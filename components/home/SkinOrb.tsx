"use client";

import { useEffect, useRef } from "react";

import { CARTRIDGE_TINT, type CartridgeCode } from "@/lib/tints";

/*
 * Today's blend as a living sphere of light: six glowing blobs, one per
 * cartridge in its own colour, swirling inside a glass orb. Each blob's
 * size is that ingredient's share of the mix, and they ease to new sizes
 * when the day changes. Canvas 2D only (no WebGL), paused off-screen,
 * drawn once and held still under reduced motion.
 */

const CODES: CartridgeCode[] = ["B-01", "B-02", "B-03", "A-01", "A-02", "A-03"];

export default function SkinOrb({
  mix,
  className = "",
}: {
  /** Six shares, 0-1, in CODES order. */
  mix: number[];
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef(mix);
  useEffect(() => {
    target.current = mix;
  }, [mix]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = target.current.slice();
    // The cartridge tints, pushed to fuller colour so they read as light
    // rather than milk once they blend.
    const rgb = CODES.map((c) => {
      const n = parseInt(CARTRIDGE_TINT[c].slice(1), 16);
      const v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      const avg = (v[0] + v[1] + v[2]) / 3;
      return v.map((x) => Math.max(0, Math.min(255, Math.round(avg + (x - avg) * 3.2 - 25))));
    });
    // Seeded orbits so every blob has its own path.
    const orbits = CODES.map((_, i) => ({
      r: 0.18 + ((i * 37) % 11) / 60,
      speed: 0.12 + ((i * 53) % 7) / 50,
      phase: i * 1.05,
      wobble: 0.05 + (i % 3) * 0.02,
    }));
    const sparks = Array.from({ length: 26 }, (_, i) => ({
      a: i * 2.39,
      r: 0.1 + ((i * 29) % 17) / 22,
      s: 0.15 + (i % 5) * 0.05,
      tw: i * 0.7,
    }));

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const t0 = last;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = reduced ? 4 : (now - t0) / 1000;
      for (let i = 0; i < 6; i++) cur[i] += (target.current[i] - cur[i]) * (1 - Math.exp(-dt * 3.2));
      if (reduced) for (let i = 0; i < 6; i++) cur[i] = target.current[i];

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.4;
      ctx.clearRect(0, 0, w, h);

      // Outer halo, tinted by the dominant ingredient.
      let top = 0;
      for (let i = 1; i < 6; i++) if (cur[i] > cur[top]) top = i;
      const [hr, hg, hb] = rgb[top];
      const halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.45);
      halo.addColorStop(0, `rgba(${hr},${hg},${hb},0.4)`);
      halo.addColorStop(0.45, `rgba(${hr},${hg},${hb},0.12)`);
      halo.addColorStop(1, "rgba(21,24,46,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // The glass: a dark core, clipped so the light stays inside.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      const core = ctx.createRadialGradient(cx, cy - R * 0.2, R * 0.1, cx, cy, R);
      core.addColorStop(0, "#262c52");
      core.addColorStop(1, "#11142a");
      ctx.fillStyle = core;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // The six ingredients, swirling.
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 6; i++) {
        const o = orbits[i];
        const a = o.phase + t * o.speed * (i % 2 ? -1 : 1);
        const rr = R * (o.r + Math.sin(t * 0.7 + i) * o.wobble);
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a * 1.3) * rr * 0.85;
        const size = R * (0.18 + cur[i] * 0.5) * (1 + Math.sin(t * 1.1 + i * 2) * 0.04);
        const [r, g, b] = rgb[i];
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        const k = 0.15 + cur[i] * 0.55;
        grad.addColorStop(0, `rgba(${r},${g},${b},${k})`);
        grad.addColorStop(0.45, `rgba(${r},${g},${b},${k * 0.45})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      // A bright heart where the ingredients meet.
      const heart = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.3);
      heart.addColorStop(0, `rgba(255,255,255,${0.32 + pulse * 0.12})`);
      heart.addColorStop(0.35, `rgba(${hr},${hg},${hb},0.22)`);
      heart.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = heart;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      // Points of light drifting through the mix.
      for (const s of sparks) {
        const a = s.a + t * s.s;
        const x = cx + Math.cos(a) * s.r * R * 0.9;
        const y = cy + Math.sin(a * 0.9) * s.r * R * 0.8;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + s.tw));
        ctx.fillStyle = `rgba(255,255,255,${0.12 * tw})`;
        ctx.beginPath();
        ctx.arc(x, y, 4 + tw * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.75 * tw})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.1 + tw * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Glass rim and highlights.
      const rim = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
      rim.addColorStop(0, "rgba(255,255,255,0)");
      rim.addColorStop(1, "rgba(200,205,245,0.35)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(230,232,255,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
      const spec = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.45, 0, cx - R * 0.38, cy - R * 0.45, R * 0.45);
      spec.addColorStop(0, "rgba(255,255,255,0.35)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      // A thin orbit ring around the glass.
      ctx.strokeStyle = "rgba(138,141,179,0.35)";
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.18, R * 0.36, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const ma = t * 0.5;
      ctx.fillStyle = "rgba(232,204,210,0.95)";
      ctx.beginPath();
      const mx = Math.cos(ma) * R * 1.18;
      const my = Math.sin(ma) * R * 0.36;
      ctx.arc(cx + mx * Math.cos(-0.35) - my * Math.sin(-0.35), cy + mx * Math.sin(-0.35) + my * Math.cos(-0.35), 3, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);
    raf = requestAnimationFrame(draw);
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    canvas.addEventListener("redraw", redraw);
    return () => {
      canvas.removeEventListener("redraw", redraw);
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  // Reduced motion: redraw once when the day changes.
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ref.current?.dispatchEvent(new Event("redraw"));
  }, [mix]);

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
