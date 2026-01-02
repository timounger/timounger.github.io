/**
 * Generates the XML sitemap served at /sitemap.xml.
 *
 * @module
 */

import type { MetadataRoute } from "next";

/** Force static generation - required for the static export (`output: "export"`). */
export const dynamic = "force-static";

/** Base site URL used to build the absolute page and image URLs. */
const BASE = "https://timounger.github.io";

/** Absolute URLs of the gallery images referenced from the home page entry. */
const galleryImages = [
  `${BASE}/img/bonprinterbox_front.webp`,
  `${BASE}/img/article_view.webp`,
  `${BASE}/img/staff.webp`,
  `${BASE}/img/printer.webp`,
  `${BASE}/img/nfc.webp`,
  `${BASE}/img/sumup.webp`,
];

/** Builds the XML sitemap entries for all public pages served at /sitemap.xml. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0, images: galleryImages },
    { url: `${BASE}/demo/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about/`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/impressum/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
