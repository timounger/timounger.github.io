/**
 * Site footer with brand info, contact details, links and copyright.
 *
 * @module
 */

import Link from "next/link";
import { type ReactElement } from "react";

/** Shared Tailwind class string for the footer column headings. */
const headingClass = "font-semibold text-slate-900 dark:text-white";
/** Shared Tailwind class string for the footer links. */
const linkClass = "inline-block py-1 hover:text-brand-600 dark:hover:text-brand-400";

/**
 * Site footer with brand info, contact details, legal and about links, and the
 * copyright line.
 */
export default function Footer(): ReactElement {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="container-page py-10 text-sm text-slate-600 dark:text-slate-400">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className={headingClass}>BonPrinter Box</p>
            <p className="mt-2">Wertmarkendrucker mieten für Events</p>
            <p className="mt-2">
              <Link href="/demo" className={linkClass}>
                Live-Demo
              </Link>
            </p>
          </div>
          <div>
            <p className={headingClass}>Kontakt</p>
            <p className="mt-2">Timo Unger</p>
            <p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Nordring+16%2C+73269+Hochdorf"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Nordring 16, 73269 Hochdorf
              </a>
            </p>
            <p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Nordring+16%2C+73269+Hochdorf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1 font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Route in Google Maps öffnen →
              </a>
            </p>
            <p className="mt-2">
              <a href="tel:+491718431465" className={linkClass}>
                +49 171 8431465
              </a>
            </p>
            <p>
              <a href="mailto:bonprinter@gmx.de" className={linkClass}>
                bonprinter@gmx.de
              </a>
            </p>
          </div>
          <div>
            <p className={headingClass}>Rechtliches</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/impressum" className={linkClass}>
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className={linkClass}>
                  Datenschutz
                </Link>
              </li>
            </ul>
            <p className={`${headingClass} mt-4`}>Über</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/about" className={linkClass}>
                  Über mich
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          © {new Date().getFullYear()} Timo Unger
        </div>
      </div>
    </footer>
  );
}
