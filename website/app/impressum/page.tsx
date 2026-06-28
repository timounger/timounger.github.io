/**
 * Legal notice (Impressum) page.
 *
 * @module
 */

import type { Metadata } from "next";
import Link from "next/link";
import { type ReactElement } from "react";

/** Page-specific metadata for the legal notice page (noindex). */
export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung gemäß § 5 DDG.",
  alternates: { canonical: "/impressum/" },
  robots: { index: false, follow: true },
};

/** Shared Tailwind class string for the inline links on this page. */
const linkClass = "inline-block py-1 text-brand-600 hover:underline dark:text-brand-400";

/** Renders the legal notice (Impressum) and privacy policy page. */
export default function ImpressumPage(): ReactElement {
  return (
    <section className="py-16">
      <div className="container-page max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">Impressum</h1>

        <h2 className="mt-10 text-2xl font-semibold text-slate-900 dark:text-white">
          Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
        </h2>
        <p className="mt-4 text-slate-700 dark:text-slate-300">
          Timo Unger
          <br />
          Software Engineering
          <br />
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Nordring+16%2C+73269+Hochdorf"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Nordring 16, 73269 Hochdorf
          </a>
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300">
          <strong>Kontakt:</strong>
          <br />
          Mobil:{" "}
          <a href="tel:+491718431465" className={linkClass}>
            +49 171 8431465
          </a>
          <br />
          E-Mail:{" "}
          <a href="mailto:bonprinter@gmx.de" className={linkClass}>
            bonprinter@gmx.de
          </a>
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300">
          <strong>Umsatzsteuer-ID</strong> gemäß §27a UStG:
          <br />
          DE420673659
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-slate-900 dark:text-white">Datenschutz</h2>
        <p className="mt-4 text-slate-700 dark:text-slate-300">
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in der{" "}
          <Link href="/datenschutz" className={linkClass}>
            Datenschutzerklärung
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
