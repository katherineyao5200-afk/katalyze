import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";

import Footer from "@/components/Footer";
import Intro, { INTRO_BOOT } from "@/components/Intro";
import PageFX from "@/components/PageFX";
import MotionProvider from "@/components/MotionProvider";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import GlassLight from "@/components/GlassLight";
import ShootingStars from "@/components/ShootingStars";
import Nav from "@/components/Nav";
import PersistentCTA from "@/components/PersistentCTA";
import WaitlistModal from "@/components/WaitlistModal";
import SmoothScroll from "@/components/SmoothScroll";

const migra = localFont({
  variable: "--font-migra",
  display: "swap",
  src: [
    {
      path: "../public/fonts/Migra-Extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Migra-Extrabold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/MigraItalic-ExtralightItalic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/MigraItalic-ExtraboldItalic.woff2",
      weight: "800",
      style: "italic",
    },
  ],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = "Katalyze";
const description = "Your catalyst to better skin.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.katalyzeskin.com",
  ),
  title: {
    default: title,
    template: "%s | Katalyze",
  },
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
    images: ["/images/logo/horizontal-dark.png"],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/images/logo/horizontal-dark.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${migra.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT }} />
        <noscript>
          <style>{`.intro{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <Intro />
          <PageFX />
          <SmoothScroll />
          <Nav />
          {children}
          <Footer />
          <PersistentCTA />
          <WaitlistModal />
          <GlassLight />
          <ShootingStars />
          <CursorGlow />
          <ScrollProgress />
        </MotionProvider>
      </body>
    </html>
  );
}
