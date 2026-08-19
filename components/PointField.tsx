"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

const PERIWINKLE = "138, 141, 179";
const BLUSH = "232, 204, 210";
const CONNECT_DISTANCE = 140;
const DRIFT_SPEED = 0.2;
const MOUSE_RADIUS = 200;

export default function PointField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Point[] = [];
    let rafId: number | null = null;
    let mouseX = -1000;
    let mouseY = -1000;

    function makePoints() {
      const area = width * height;
      const count = Math.max(40, Math.min(70, Math.round(area / 15000)));
      points = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * DRIFT_SPEED * Math.random(),
          vy: Math.sin(angle) * DRIFT_SPEED * Math.random(),
          color: Math.random() < 0.5 ? PERIWINKLE : BLUSH,
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
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.15;
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
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color}, 0.6)`;
        ctx!.fill();
      }
    }

    function step() {
      for (const p of points) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distToMouse = Math.hypot(dx, dy);
        if (distToMouse < MOUSE_RADIUS && distToMouse > 0) {
          p.vx += (dx / distToMouse) * 0.0015;
          p.vy += (dy / distToMouse) * 0.0015;
        }

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > DRIFT_SPEED) {
          p.vx = (p.vx / speed) * DRIFT_SPEED;
          p.vy = (p.vy / speed) * DRIFT_SPEED;
        }

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

    function startLoop() {
      if (rafId == null && !reducedMotion) rafId = requestAnimationFrame(step);
    }

    function stopLoop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
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
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(canvas);

    if (!reducedMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
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
