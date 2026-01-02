/**
 * Generates the PWA web app manifest served at /manifest.webmanifest.
 *
 * @module
 */

import type { MetadataRoute } from "next";

/** Force static generation - required for the static export (`output: "export"`). */
export const dynamic = "force-static";

/** Builds the PWA web app manifest served at /manifest.webmanifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BonPrinter Box - Wertmarkendrucker mieten",
    short_name: "BonPrinter Box",
    description: "Wertmarkendrucker-Vermietung für Vereinsfeste, Festivals und Events.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1565d0",
    lang: "de-DE",
    icons: [{ src: "/img/favicon.png", sizes: "32x32", type: "image/png", purpose: "any" }],
  };
}
