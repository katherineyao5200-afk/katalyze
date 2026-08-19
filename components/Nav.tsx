"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { images } from "@/lib/images";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/story", label: "Our Story" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-near-black rounded-sm";

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-near-black">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4"
      >
        <Link href="/" className={focusRing}>
          <Image
            src={images.logo.nav.src}
            alt={images.logo.nav.alt}
            width={images.logo.nav.width}
            height={images.logo.nav.height}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-body">
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
                  className={`transition-colors duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                    isActive ? "text-blush" : "text-cream hover:text-blush"
                  } ${focusRing}`}
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
