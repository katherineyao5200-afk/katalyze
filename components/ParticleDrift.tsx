"use client";

import { useEffect, useRef } from "react";

/**
 * A soft, ambient particle drift — lightweight canvas 2D, not the
 * pointer-interactive WebGL field in Hero (System A owns that per §11;
 * this is deliberately a much cheaper, quieter cousin, sized for a
 * section that just needs a little life, not a centerpiece). Sparse
 * dots drift slowly, faint hairlines connect nearby ones, brand colors
 * only. Pauses off-screen, respects prefers-reduced-motion.
 */

const PERIWINKLE = "138, 141, 179";
const BLUSH = "232, 204, 210";
const CONNECT_DISTANCE = 120;
const DRIFT_SPEED = 0.12;

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function ParticleDrift({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Point[] = [];
    let rafId: number | null = null;

    function makePoints() {
      const area = width * height;
      const count = Math.max(24, Math.min(48, Math.round(area / 22000)));
      points = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * DRIFT_SPEED * Math.random(),
          vy: Math.sin(angle) * DRIFT_SPEED * Math.random(),
          color: Math.random() < 0.7 ? PERIWINKLE : BLUSH,
        };
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      makePoints();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT_DISTANCE) {
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.12;
            ctx!.strokeStyle = `rgba(${PERIWINKLE}, ${opacity})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(points[i].x, points[i].y);
            ctx!.lineTo(points[j].x, points[j].y);
            ctx!.stroke();
          }
        }
      }

      for (const p of points) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color}, 0.5)`;
        ctx!.fill();
      }
    }

    function step() {
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
      draw();
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (rafId == null) rafId = requestAnimationFrame(step);
    }
    function stop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(canvas);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}
