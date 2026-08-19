import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

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

export const metadata: Metadata = {
  title: "Katalyze",
  description: "Your catalyst to better skin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${migra.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
