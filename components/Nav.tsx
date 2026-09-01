"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { images } from "@/lib/images";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/story", label: "Our Story" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // §7: transparent over the hero, gaining a blurred midnight backdrop
    // after 80px of scroll.
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-[var(--dur-base)] ease-[var(--ease-soft)] ${
        scrolled
          ? "bg-midnight/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4"
      >
        <Link
          href="/"
          className={`inline-flex min-h-11 items-center ${focusRing}`}
        >
          <Image
            src={images.logo.nav.src}
            alt={images.logo.nav.alt}
            width={images.logo.nav.width}
            height={images.logo.nav.height}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center py-2 underline-offset-[6px] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] ${
                    isActive
                      ? "text-white underline decoration-blush"
                      : "text-white/70 no-underline hover:text-white"
                  } ${focusRing}`}
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
