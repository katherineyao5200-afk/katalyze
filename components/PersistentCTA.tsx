"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { openWaitlist } from "@/components/WaitlistModal";

export default function PersistentCTA() {
  const pathname = usePathname();
  const [inlineFormVisible, setInlineFormVisible] = useState(false);

  // Layout persists across client-side navigation, so re-scan for inline
  // forms whenever the route changes rather than only once on mount.
  useEffect(() => {
    const inlineForms = document.querySelectorAll("[data-inline-form]");
    // Reset before re-subscribing: the previous route's forms are gone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInlineFormVisible(false);
    if (inlineForms.length === 0) return;

    const visible = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }
        setInlineFormVisible(visible.size > 0);
      },
      { threshold: 0.1 },
    );

    inlineForms.forEach((form) => observer.observe(form));
    return () => observer.disconnect();
  }, [pathname]);

  if (inlineFormVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex lg:hidden justify-center px-4 pb-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end sm:px-0 sm:pb-0">
      <button
        type="button"
        onClick={openWaitlist}
        aria-haspopup="dialog"
        className="btn-primary w-full rounded-full px-6 py-3 font-medium sm:w-auto"
        style={{ fontSize: "var(--text-base)" }}
      >
        Get early access <span aria-hidden="true" className="btn-arrow">→</span>
      </button>
    </div>
  );
}
