import type { MetadataRoute } from "next";

// Production domain is katalyzeskin.com. NEXT_PUBLIC_SITE_URL overrides it
// (e.g. for preview deploys).
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.katalyzeskin.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/how-it-works", "/pricing", "/story", "/investors", "/quick"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
