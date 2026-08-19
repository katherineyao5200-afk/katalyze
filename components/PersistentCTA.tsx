"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import WaitlistForm from "@/components/WaitlistForm";

const DISMISS_KEY = "katalyze-persistent-cta-dismissed";

export default function PersistentCTA() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [inlineFormVisible, setInlineFormVisible] = useState(false);

  useEffect(() => {
    // sessionStorage isn't available during SSR; sync the real value once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "true");
  }, []);

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

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  if (dismissed || inlineFormVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end sm:px-0 sm:pb-0">
      {expanded ? (
        <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-periwinkle/20 bg-navy-900 p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <p className="font-sans text-body text-cream">Get early access.</p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 font-sans text-body text-periwinkle transition-colors duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:text-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 rounded-sm"
            >
              ✕
            </button>
          </div>
          <WaitlistForm source="persistent" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={expanded}
          className="w-full rounded-full bg-blush px-6 py-3 font-sans text-body font-medium text-navy-900 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 focus-visible:ring-offset-blush sm:w-auto"
        >
          Get early access
        </button>
      )}
    </div>
  );
}
