"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/*
 * Shooting stars, used as punctuation rather than wallpaper:
 *  - now and then a meteor crosses the whole screen as you reach a new
 *    section, and a rare one while you read,
 *  - pressing a primary button throws off a few sparks.
 * One fixed 2D canvas that only runs while something is in flight, so it
 * costs nothing at rest. Off entirely under reduced motion.
 */

type Meteor = {
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  len: number;
  t0: number;
  dur: number;
  w: number;
  warm: boolean;
};
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t0: number;
  life: number;
  size: number;
  warm: boolean;
};

const PERI = "138,141,179";
const BLUSH = "232,204,210";
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function star(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // The four-point sparkle from the K mark.
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

export default function ShootingStars() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const meteors: Meteor[] = [];
    const sparks: Spark[] = [];
    let raf = 0;
    let lastY = window.scrollY;

    const launch = (x: number, y: number, opts: Partial<Meteor> = {}) => {
      // Full-screen streaks: each one crosses the whole viewport.
      const angle = (22 + Math.random() * 16) * (Math.PI / 180);
      const dist = Math.hypot(W, H) * 1.25;
      meteors.push({
        x0: x,
        y0: y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        len: 280 + Math.random() * 180,
        t0: performance.now(),
        dur: 1700 + Math.random() * 500,
        w: 2.2,
        warm: Math.random() < 0.35,
        ...opts,
      });
      start();
    };

    const burst = (x: number, y: number) => {
      const now = performance.now();
      for (let i = 0; i < 9; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 0.06 + Math.random() * 0.12;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 0.04,
          t0: now,
          life: 600 + Math.random() * 500,
          size: 3 + Math.random() * 4,
          warm: i % 3 !== 0,
        });
      }
      start();
    };

    const draw = (now: number) => {
      g.clearRect(0, 0, W, H);
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const t = (now - m.t0) / m.dur;
        if (t >= 1) {
          meteors.splice(i, 1);
          continue;
        }
        const p = ease(t);
        const hx = m.x0 + m.dx * p;
        const hy = m.y0 + m.dy * p;
        const d = Math.hypot(m.dx, m.dy);
        // Tail grows in, then the whole streak fades as it burns out.
        const tail = m.len * Math.min(1, t * 3) * (1 - t * 0.5);
        const tx = hx - (m.dx / d) * tail;
        const ty = hy - (m.dy / d) * tail;
        const alpha = t < 0.12 ? t / 0.12 : 1 - Math.pow((t - 0.12) / 0.88, 2);
        const col = m.warm ? BLUSH : PERI;
        const grad = g.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, `rgba(${col},0)`);
        grad.addColorStop(0.7, `rgba(${col},${0.35 * alpha})`);
        grad.addColorStop(1, `rgba(255,255,255,${0.95 * alpha})`);
        // a wide, faint underglow first, then the bright core
        g.strokeStyle = `rgba(${col},${0.12 * alpha})`;
        g.lineWidth = m.w * 5;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(hx - (m.dx / d) * tail * 0.6, hy - (m.dy / d) * tail * 0.6);
        g.lineTo(hx, hy);
        g.stroke();
        g.strokeStyle = grad;
        g.lineWidth = m.w;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(tx, ty);
        g.lineTo(hx, hy);
        g.stroke();
        // Head: a soft glow and the sparkle glyph.
        const glow = g.createRadialGradient(hx, hy, 0, hx, hy, 52);
        glow.addColorStop(0, `rgba(255,255,255,${0.8 * alpha})`);
        glow.addColorStop(0.25, `rgba(${col},${0.35 * alpha})`);
        glow.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = glow;
        g.beginPath();
        g.arc(hx, hy, 52, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = `rgba(255,255,255,${alpha})`;
        star(g, hx, hy, 6);
        // A few embers shed along the way.
        if (Math.random() < 0.18 && t < 0.8) {
          sparks.push({
            x: hx,
            y: hy,
            vx: (Math.random() - 0.5) * 0.02,
            vy: 0.01 + Math.random() * 0.02,
            t0: now,
            life: 700,
            size: 1.5 + Math.random() * 1.5,
            warm: m.warm,
          });
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const t = (now - s.t0) / s.life;
        if (t >= 1) {
          sparks.splice(i, 1);
          continue;
        }
        const dt = now - s.t0;
        const x = s.x + s.vx * dt;
        const y = s.y + s.vy * dt + 0.00008 * dt * dt;
        const col = s.warm ? BLUSH : "255,255,255";
        const r = s.size * (1 - t * 0.6);
        g.fillStyle = `rgba(${col === BLUSH ? BLUSH : PERI},${0.18 * (1 - t)})`;
        g.beginPath();
        g.arc(x, y, r * 2.4, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = `rgba(${col},${1 - t})`;
        star(g, x, y, r);
      }
    };

    const loop = (now: number) => {
      draw(now);
      if (meteors.length || sparks.length) raf = requestAnimationFrame(loop);
      else {
        raf = 0;
        g.clearRect(0, 0, W, H);
      }
    };
    function start() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    // Sections: a meteor across the top of each one as it scrolls in.
    let lastLaunch = 0;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        const down = window.scrollY >= lastY;
        lastY = window.scrollY;
        for (const e of entries) {
          if (!e.isIntersecting || seen.has(e.target) || !down) continue;
          seen.add(e.target);
          const now = performance.now();
          if (now - lastLaunch < 9000 || Math.random() < 0.5) continue;
          lastLaunch = now;
          launch(W * (-0.15 + Math.random() * 0.45), -30);
        }
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    const watch = () =>
      document
        .querySelectorAll("main section")
        .forEach((s) => s !== document.querySelector("main section") && io.observe(s));
    watch();

    // The occasional one while you read.
    let idle = 0;
    const ambient = () => {
      idle = window.setTimeout(() => {
        if (!document.hidden && document.documentElement.dataset.gate !== "open")
          launch(W * (-0.2 + Math.random() * 0.6), -30, {
            w: 1.6,
          });
        ambient();
      }, 14000 + Math.random() * 12000);
    };
    ambient();

    // Stardust: a few tiny sparkles fall off the pointer as it moves.
    const fine = matchMedia("(pointer: fine)").matches;
    let px = -1;
    let py = -1;
    let travelled = 0;
    const onMove = (e: PointerEvent) => {
      if (!fine || e.pointerType !== "mouse") return;
      if (px >= 0) travelled += Math.hypot(e.clientX - px, e.clientY - py);
      px = e.clientX;
      py = e.clientY;
      if (travelled < 34 || sparks.length > 40) return;
      travelled = 0;
      sparks.push({
        x: px + (Math.random() - 0.5) * 10,
        y: py + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.015,
        vy: 0.004 + Math.random() * 0.012,
        t0: performance.now(),
        life: 750 + Math.random() * 450,
        size: 1.4 + Math.random() * 1.8,
        warm: Math.random() < 0.2,
      });
      start();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Sparks off primary buttons.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(".btn-primary");
      if (el) burst(e.clientX, e.clientY);
    };
    window.addEventListener("click", onClick);
    // Other parts of the page can ask for sparks (the blend demo does).
    const onBurst = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (d) burst(d.x, d.y);
    };
    window.addEventListener("katalyze:burst", onBurst);

    // When the intro's curtain lifts, one long meteor opens the page.
    const root = document.documentElement;
    const mo = new MutationObserver(() => {
      if (root.classList.contains("intro-done")) {
        mo.disconnect();
        launch(-W * 0.05, -30, { len: 460, w: 2.6, dur: 2000, warm: true });
      }
    });
    if (!root.classList.contains("intro-done"))
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("katalyze:burst", onBurst);
    };
  }, [pathname]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
