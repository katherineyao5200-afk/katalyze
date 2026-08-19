import type { MetadataRoute } from "next";

// No production domain is confirmed yet (see docs/PRD.md §14 open items).
// Set NEXT_PUBLIC_SITE_URL once one is; this falls back to localhost so the
// route still builds and validates in the meantime.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/how-it-works", "/pricing", "/story"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
