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
      className="corner-link fixed bottom-6 left-6 z-40 hidden items-center gap-2 text-white mix-blend-difference md:flex"
      style={{ fontSize: "var(--text-xs)" }}
    >
      <span className="underline decoration-white/40 underline-offset-4">Quick read</span>
      <span className="opacity-60">2 min, no animations</span>
    </Link>
  );
}
