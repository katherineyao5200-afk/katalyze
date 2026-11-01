"use client";

import { useEffect, useRef, useState } from "react";

import DitherField from "@/components/DitherField";
import WaitlistForm from "@/components/WaitlistForm";

const OPEN_EVENT = "katalyze:waitlist";

/** Opens the waitlist pop-up from anywhere on the site. */
export function openWaitlist() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * The waitlist pop-up. A native <dialog>, so focus stays inside it, Esc
 * closes it and the page behind is inert. Mounted once in the layout;
 * every "Get early access" button opens it with openWaitlist().
 */
export default function WaitlistModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => {
      const d = ref.current;
      if (!d || d.open) return;
      d.showModal();
      setOpen(true);
      document.documentElement.style.overflow = "hidden";
    };
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="waitlist-modal-title"
      onClose={() => {
        setOpen(false);
        document.documentElement.style.overflow = "";
      }}
      // A click on the backdrop (the dialog element itself) closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="waitlist-modal m-auto w-[min(560px,calc(100vw-2rem))] max-w-none overflow-hidden bg-transparent p-0 text-white"
      style={{ borderRadius: "var(--r-lg)" }}
    >
      <div className="relative isolate overflow-hidden border border-white/10 bg-[color:var(--canvas-deep)] px-7 pt-14 pb-8 sm:px-10 sm:pt-16 sm:pb-10">
        {/* the glow, rising from the bottom of the card */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {open && (
            <DitherField
              variant="aura"
              center={[0.5, 1.3]}
              density={0.8}
              className="absolute inset-0"
            />
          )}
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-periwinkle transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-blush"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="flex flex-col gap-5">
          <h2
            id="waitlist-modal-title"
            className="font-display font-extralight"
            style={{
              fontSize: "clamp(36px, 6vw, 56px)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Get early access.
          </h2>
          <p
            className="max-w-sm text-[color:var(--muted-on-dark)]"
            style={{
              fontSize: "var(--text-base)",
              lineHeight: "var(--leading-body)",
            }}
          >
            <strong className="font-medium text-white">
              The first run is about 2,000 units.
            </strong>{" "}
            Katalyze isn&apos;t for sale yet. Join the waitlist to hear first
            when it is.
          </p>
          <WaitlistForm source="persistent" className="mt-3 w-full" />
          <p
            className="text-[color:var(--faint-on-dark)]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Launch news only. Unsubscribe any time.
          </p>
        </div>
      </div>
    </dialog>
  );
}
