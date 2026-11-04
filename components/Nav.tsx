"use client";

import { LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { openWaitlist } from "@/components/WaitlistModal";
import { images } from "@/lib/images";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/story", label: "Story" },
  { href: "/investors", label: "Investors" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

/*
 * Plain type, no capsule: the links sit straight on the page, and a thin
 * line glides under the current (or hovered) one. Once you scroll, a soft
 * scrim fades in behind the bar so the links stay readable over anything.
 */
export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  // Over a light section the bar turns to dark-on-frost.
  const [light, setLight] = useState(false);
  useEffect(() => {
    const els = document.querySelectorAll("[data-nav='light']");
    if (!els.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLight(false);
      return;
    }
    const on = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
        setLight(on.size > 0);
      },
      { rootMargin: "0px 0px -94% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active =
    NAV_LINKS.find((l) =>
      l.href === "/" ? pathname === "/" : pathname.startsWith(l.href),
    )?.href ?? null;
  const lit = hover ?? active;

  return (
    <header className="pointer-events-none sticky top-0 z-50 h-0">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 transition-opacity duration-700"
        style={{
          opacity: scrolled ? 1 : 0,
          background: light
            ? "linear-gradient(180deg, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0))"
            : "linear-gradient(180deg, rgb(21 24 46 / 0.85), rgb(21 24 46 / 0))",
        }}
      />
      <nav
        aria-label="Primary"
        className="pointer-events-auto relative mx-auto flex max-w-[var(--max-w)] items-center justify-between gap-2 sm:gap-4 px-[var(--margin)] transition-[padding] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ paddingTop: scrolled ? 12 : 20 }}
      >
        <Link
          href="/"
          className={`inline-flex min-h-11 items-center rounded-full ${focusRing}`}
        >
          <Image
            src={light ? images.logo.navDark.src : images.logo.nav.src}
            alt={images.logo.nav.alt}
            width={images.logo.nav.width}
            height={images.logo.nav.height}
            priority
            className="h-8 w-auto transition-opacity duration-500"
          />
        </Link>

        <LayoutGroup id="nav">
          <ul
            className="flex items-center gap-1 sm:gap-3"
            onMouseLeave={() => setHover(null)}
          >
            {NAV_LINKS.map((link) => {
              const isActive = link.href === active;
              return (
                <li
                  key={link.href}
                  // On phones the logo is the way home, which frees room.
                  className={`relative ${link.href === "/" ? "hidden sm:block" : ""}`}
                >
                  {lit === link.href && (
                    <motion.span
                      layoutId="nav-pane"
                      aria-hidden="true"
                      className={`absolute inset-x-2 bottom-1 h-px sm:inset-x-3 ${
                        light ? "bg-midnight" : "bg-white"
                      }`}
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setHover(link.href)}
                    className={`relative inline-flex min-h-9 items-center whitespace-nowrap px-2 text-[13px] transition-colors duration-300 sm:px-4 sm:text-[length:var(--text-sm)] ${
                      light
                        ? isActive
                          ? "text-midnight"
                          : "text-midnight/60 hover:text-midnight"
                        : isActive
                          ? "text-white"
                          : "text-white/65 hover:text-white"
                    } ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>

        <button
          type="button"
          onClick={openWaitlist}
          aria-haspopup="dialog"
          className="btn-primary hidden min-h-10 items-center gap-1.5 rounded-full px-5 font-medium lg:inline-flex"
          style={{ fontSize: "var(--text-sm)" }}
        >
          Get early access <span aria-hidden="true" className="btn-arrow">→</span>
        </button>
      </nav>
    </header>
  );
}
