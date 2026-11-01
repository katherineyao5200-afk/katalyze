"use client";

import { openWaitlist } from "@/components/WaitlistModal";

// A button that opens the waitlist pop-up. For server-rendered pages.
export default function WaitlistButton({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={openWaitlist}
      aria-haspopup="dialog"
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
