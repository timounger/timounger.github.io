/**
 * Pricing section with the price card and list of included services.
 *
 * @module
 */

import { Check } from "lucide-react";
import { type ReactElement } from "react";

/** Items included in the rental price, listed in the pricing card. */
const includes = [
  "Konfiguration und Lieferung (Umkreis ca. 20 km)",
  "Persönliche Einweisung vor Ort",
  "Thermorollen in ausreichender Menge",
  "Optional: SumUp Kartenterminal",
  "Individuelles Bondesign",
];

/** Renders the pricing section with the price card and the list of inclusions. */
export default function Pricing(): ReactElement {
  return (
    <section id="pricing" className="bg-slate-50/70 py-20 dark:bg-slate-900/70">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Preise</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Transparent und fair. Für mehrtägige Events und mehrere Geräte erstelle ich Ihnen gerne ein individuelles
            Angebot.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-3xl bg-white p-8 shadow-xl ring-2 ring-slate-400 sm:p-10 dark:bg-slate-950 dark:ring-slate-800">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">50 €</span>
            <span className="text-slate-600 dark:text-slate-400">pro Box / Einsatztag</span>
          </div>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            zzgl. einmalig <strong>50 €</strong> für Konfiguration und Einweisung
            <sup className="ml-0.5 font-normal text-slate-400 dark:text-slate-500">*</sup>
          </p>

          <ul className="mt-8 space-y-3">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                  <Check size={14} />
                </span>
                <span className="text-slate-700 dark:text-slate-300">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
            * Alle Preise netto, zzgl. gesetzlicher Umsatzsteuer.
            <br />
            Transaktionsgebühren von SumUp erfolgen separat über den Anbieter.
          </p>
        </div>
      </div>
    </section>
  );
}
