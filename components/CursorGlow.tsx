"use client";

import { useEffect, useRef } from "react";

/*
 * A soft light that follows the pointer, and a ring that opens around
 * anything you can use. Elements can name their gesture with
 * data-cursor="Drag" (or "Hold"), and the ring shows it. Mouse and
 * trackpad only; off on touch and under reduced motion. The system
 * cursor stays visible.
 */
const TARGETS =
  "a, button, label, input, select, textarea, summary, [role='button'], [data-cursor]";

export default function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (
      !matchMedia("(pointer: fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const g = glow.current!;
    const r = ring.current!;
    const t = tag.current!;
    let x = -200;
    let y = -200;
    let gx = x;
    let gy = y;
    let rx = x;
    let ry = y;
    let raf = 0;
    let shown = false;

    const loop = () => {
      gx += (x - gx) * 0.12;
      gy += (y - gy) * 0.12;
      rx += (x - rx) * 0.3;
      ry += (y - ry) * 0.3;
      g.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(x - gx) + Math.abs(y - gy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        gx = rx = x;
        gy = ry = y;
        document.documentElement.dataset.cursorGlow = "on";
      }
      const el = (e.target as Element | null)?.closest?.(TARGETS) as HTMLElement | null;
      const label = el?.dataset.cursor ?? "";
      r.dataset.state = el ? (label ? "label" : "hover") : "";
      if (t.textContent !== label) t.textContent = label;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      shown = false;
      delete document.documentElement.dataset.cursorGlow;
    };
    const onDown = () => r.setAttribute("data-press", "");
    const onUp = () => r.removeAttribute("data-press");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={glow} aria-hidden="true" className="cursor-glow" />
      <div ref={ring} aria-hidden="true" className="cursor-ring">
        <span ref={tag} className="cursor-tag" />
      </div>
    </>
  );
}
