"use client";

import { useEffect } from "react";

/*
 * Moves the specular highlight on glass controls (.glass, .btn-primary)
 * to sit under the pointer, so the material catches light the way a real
 * pane does. One delegated listener for the whole page, writes two CSS
 * variables on the hovered control only.
 */
export default function GlassLight() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return;
    let last: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(
        ".glass, .btn-primary",
      ) as HTMLElement | null;
      if (last && last !== el) {
        last.style.removeProperty("--gx");
        last.style.removeProperty("--gy");
      }
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
