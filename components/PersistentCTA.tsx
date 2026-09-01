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
        <div
          className="flex w-full max-w-sm flex-col gap-3 border border-[color:var(--rule-on-dark)] p-5 shadow-xl backdrop-blur-md"
          style={{
            borderRadius: "var(--r-lg)",
            backgroundColor: "var(--panel)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-white" style={{ fontSize: "var(--text-base)" }}>
              Get early access.
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-periwinkle transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:text-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm"
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
          className="w-full bg-white px-6 py-3 font-medium text-midnight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          style={{ borderRadius: "var(--r-md)", fontSize: "var(--text-base)" }}
        >
          Get early access
        </button>
      )}
    </div>
  );
}
