/**
 * Root layout defining global metadata, fonts and the theming providers.
 *
 * @module
 */

import GoatCounter from "@/components/analytics/goatcounter";
import SiteChrome from "@/components/layout/site-chrome";
import JsonLd from "@/components/seo/json-ld";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { type ReactElement } from "react";
import "./globals.css";

/** Inter web font loaded via next/font, applied to the document body. */
const inter = Inter({ subsets: ["latin"], display: "swap" });

/** Canonical production URL of the site, used as the metadata base. */
const SITE_URL = "https://timounger.github.io";
/** Default Open Graph / Twitter preview image path. */
const OG_IMAGE = "/img/bonprinterbox_front.webp";

/** Site-wide default metadata (title, description, SEO, Open Graph, icons). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BonPrinter Box - Wertmarkendrucker mieten für Events",
    template: "%s - BonPrinter Box",
  },
  description:
    "Mieten Sie professionelle Wertmarkendrucker für Ihr Event: individuelles Design, Kartenzahlung, Pfandsystem und Rückgeldrechner. Schnell anfragen.",
  keywords: [
    "Wertmarkendrucker mieten",
    "Bondrucker Vermietung",
    "Vereinsfest Kasse",
    "Festival Kasse mieten",
    "BonPrinter",
    "SumUp Kartenterminal",
    "Wertmarken Event",
    "Esslingen",
  ],
  authors: [{ name: "Timo Unger" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "BonPrinter Box - Wertmarkendrucker mieten",
    description:
      "Professionelle Wertmarkendrucker für Vereinsfeste und Events mieten. Mit Kartenzahlung, Pfandsystem und individuellem Bondesign.",
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "BonPrinter Box",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "BonPrinter Box" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BonPrinter Box - Wertmarkendrucker mieten",
    description:
      "Wertmarkendrucker für Vereinsfeste und Events mieten. Kartenzahlung, Pfandsystem, individuelles Bondesign.",
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
  category: "business",
  icons: {
    icon: "/img/favicon.png",
    shortcut: "/img/favicon.png",
    apple: "/img/favicon.png",
  },
  other: {
    "geo.region": "DE-BW",
    "geo.placename": "Hochdorf, Esslingen",
    "geo.position": "48.7167;9.4167",
    ICBM: "48.7167, 9.4167",
  },
};

/** Viewport configuration, including theme color per color scheme. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

/**
 * Root layout wrapping every page: sets the html/body shell, provides the
 * theme context and site chrome, and injects the JSON-LD structured data.
 */
export default function RootLayout({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <html lang="de" className={inter.className} suppressHydrationWarning>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
        <JsonLd />
        <GoatCounter />
      </body>
    </html>
  );
}
