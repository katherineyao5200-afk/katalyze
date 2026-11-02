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
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

/*
 * A floating glass capsule. The page shows through it; the current page
 * is marked by a lit pane that glides between links as you move around
 * the site. The bar tightens once you scroll past the top.
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
      <nav
        aria-label="Primary"
        className="pointer-events-auto mx-auto flex max-w-[var(--max-w)] items-center justify-between gap-2 sm:gap-4 px-[var(--margin)] transition-[padding] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]"
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
            className={`glass flex items-center rounded-full p-1 ${light ? "glass-light" : ""}`}
            onMouseLeave={() => setHover(null)}
          >
            {NAV_LINKS.map((link) => {
              const isActive = link.href === active;
              return (
                <li key={link.href} className="relative">
                  {lit === link.href && (
                    <motion.span
                      layoutId="nav-pane"
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full ${
                        light
                          ? "bg-midnight/[0.08]"
                          : "bg-white/[0.11] shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]"
                      }`}
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setHover(link.href)}
                    className={`relative inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-2.5 transition-colors duration-300 sm:px-4 ${
                      light
                        ? isActive
                          ? "text-midnight"
                          : "text-midnight/60 hover:text-midnight"
                        : isActive
                          ? "text-white"
                          : "text-white/65 hover:text-white"
                    } ${focusRing}`}
                    style={{ fontSize: "var(--text-sm)" }}
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
