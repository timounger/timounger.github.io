/**
 * Generates the robots.txt rules served at /robots.txt.
 *
 * @module
 */

import type { MetadataRoute } from "next";

/** Force static generation - required for the static export (`output: "export"`). */
export const dynamic = "force-static";

/** Base site URL used to build the absolute sitemap reference. */
const BASE = "https://timounger.github.io";

/** Builds the robots.txt rules and sitemap reference served at /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
