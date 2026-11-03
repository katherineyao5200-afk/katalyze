"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// For visitors short on time (an admissions reader, an investor): one
// tap to a plain, single-page summary with no transitions.
export default function QuickReadButton() {
  const pathname = usePathname();
  if (pathname === "/quick") return null;
  return (
    <Link
      href="/quick"
      data-cursor="Skip the show"
      className="glass fixed bottom-24 left-4 z-40 hidden items-center md:flex gap-2 rounded-full px-4 py-2.5 text-white md:bottom-6 md:left-6"
      style={{ fontSize: "var(--text-xs)" }}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
        <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Quick read
      <span className="text-white/50">· 2 min, no animations</span>
    </Link>
  );
}
