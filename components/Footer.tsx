import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/story", label: "Our Story" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm";

const label = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--track-label)",
} as const;

// Reference: sharplink / alethia footers. Columns up top, an oversized
// wordmark across the bottom, the legal lines small and quiet.
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-[color:var(--rule-on-dark)] bg-[color:var(--canvas-deep)]">
      <div
        className="mx-auto grid grid-cols-12 gap-y-12 pt-20"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          columnGap: "var(--gutter)",
        }}
      >
        <div className="col-span-12 flex flex-col gap-4 md:col-span-5">
          <p className="font-mono uppercase text-periwinkle" style={label}>
            Katalyze
          </p>
          <p
            className="max-w-sm text-white"
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Katalyze reads your skin each morning and mixes one fresh dose to
            match it. Join the waitlist to hear first when the first run opens.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="col-span-6 flex flex-col gap-4 md:col-span-3 md:col-start-8"
        >
          <p className="font-mono uppercase text-periwinkle" style={label}>
            Pages
          </p>
          <ul
            className="flex flex-col text-white/80"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-flex min-h-10 items-center transition-colors duration-[var(--dur-fast)] hover:text-blush ${focusRing}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-6 flex flex-col gap-4 md:col-span-2">
          <p className="font-mono uppercase text-periwinkle" style={label}>
            Status
          </p>
          <ul
            className="flex flex-col gap-2 text-white/80"
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-body)",
            }}
          >
            <li>Working prototype</li>
            <li>Not yet for sale</li>
            <li>First run: about 2,000 units</li>
          </ul>
        </div>

        <div
          className="col-span-12 flex flex-col gap-1 border-t border-[color:var(--rule-on-dark)] pt-6 text-[color:var(--faint-on-dark)] md:flex-row md:justify-between md:gap-8"
          style={{
            fontSize: "var(--text-xs)",
            lineHeight: "var(--leading-body)",
          }}
        >
          <p className="max-w-2xl">
            Katalyze is in development and not yet for sale; prices shown are
            planned launch prices. Founded by Katherine Yao, working with
            external hardware, formulation and software partners. Waitlist
            emails are used only for launch news, and you can unsubscribe at any
            time.
          </p>
          <p className="shrink-0 font-mono uppercase" style={label}>
            &copy; {year} Katalyze
          </p>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the page edge. */}
      <p
        aria-hidden="true"
        className="mt-10 -mb-[0.22em] text-center font-display font-extralight leading-none text-white/[0.06] select-none"
        style={{
          fontSize: "clamp(96px, 24vw, 420px)",
          letterSpacing: "-0.02em",
        }}
      >
        Katalyze
      </p>
    </footer>
  );
}
