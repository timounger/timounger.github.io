/**
 * Hero section with headline, badges, call-to-action buttons and gallery.
 *
 * @module
 */

import { MapPin } from "lucide-react";
import Link from "next/link";
import { type ReactElement } from "react";
import HeroGallery from "./hero-gallery";

/**
 * Hero section with the headline, badges, call-to-action buttons and the
 * image gallery.
 */
export default function Hero(): ReactElement {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 to-white/30 dark:from-slate-900/80 dark:to-slate-950/40">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 md:py-24 lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              Event-Vermietung
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <MapPin size={14} />
              Raum Esslingen &amp; Umgebung
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
            Wertmarkendrucker mieten für Ihr Event
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Verkaufspreisberechnung, Pfandsystem, Rückgeldrechner und SumUp-Kartenzahlung - alles in einer Box.
            Individuell gestaltbare Bons.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <Link href="#booking" className="btn-primary w-full">
              Jetzt anfragen
            </Link>
            <Link href="/demo" className="btn-secondary w-full">
              Live-Demo
            </Link>
          </div>
        </div>

        <HeroGallery />
      </div>
    </section>
  );
}
