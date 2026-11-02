"use client";

import { usePathname } from "next/navigation";

// The quick-read page is deliberately plain: no smooth-scroll hijack,
// meteors or cursor light there.
export default function QuietOnQuick({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/quick") return null;
  return <>{children}</>;
}
