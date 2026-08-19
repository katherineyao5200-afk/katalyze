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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-near-black rounded-sm";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-near-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <Link href="/" className={focusRing}>
          <Image
            src={images.logo.nav.src}
            alt={images.logo.nav.alt}
            width={images.logo.nav.width}
            height={images.logo.nav.height}
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-body text-cream">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:text-blush ${focusRing}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <p className="font-sans text-body text-cream">
            Our first production run is limited. The waitlist hears first.
          </p>
          <WaitlistForm source="footer" className="w-full" trackVisibility />
        </div>

        <p className="font-sans text-eyebrow text-periwinkle">
          &copy; {year} Katalyze. Your catalyst to better skin.
        </p>
      </div>
    </footer>
  );
}
