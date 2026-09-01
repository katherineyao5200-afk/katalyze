import Image from "next/image";
import Link from "next/link";

import { images } from "@/lib/images";
import WaitlistForm from "@/components/WaitlistForm";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/story", label: "Our Story" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--rule-on-dark)] bg-midnight">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <Link
          href="/"
          className={`inline-flex min-h-11 items-center ${focusRing}`}
        >
          <Image
            src={images.logo.nav.src}
            alt={images.logo.nav.alt}
            width={images.logo.nav.width}
            height={images.logo.nav.height}
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Footer">
          <ul
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-flex min-h-11 items-center py-2 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:text-white ${focusRing}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <p className="text-white" style={{ fontSize: "var(--text-base)" }}>
            Our first production run is limited. The waitlist hears first.
          </p>
          <WaitlistForm source="footer" className="w-full" trackVisibility />
        </div>

        <p className="font-mono text-2xs text-periwinkle tracking-[var(--track-label)]">
          &copy; {year} Katalyze. Your catalyst to better skin.
        </p>
      </div>
    </footer>
  );
}
