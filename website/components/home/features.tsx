/**
 * Features section rendering the grid of product feature cards.
 *
 * @module
 */

import { Calculator, CreditCard, Monitor, Printer, ShieldCheck, Users } from "lucide-react";
import { type ReactElement } from "react";

/** Feature cards shown in the features grid (icon, title and description). */
const features = [
  {
    icon: Printer,
    title: "Individuelles Design",
    description: "Wertmarken drucken mit speziell entworfenem Logo.",
  },
  {
    icon: Calculator,
    title: "Rückgeldberechnung",
    description:
      "Erhaltenen Betrag eingeben - das Wechselgeld erscheint sofort. Schneller Service ohne Rechenfehler, auch wenn's am Stand mal stressig wird.",
  },
  {
    icon: CreditCard,
    title: "SumUp Kartenterminal",
    description:
      "Bargeldlos kassieren auf Wunsch: Mit dem optionalen SumUp-Terminal zahlen Gäste per Karte, Apple Pay oder Google Pay - niemand muss mehr zum Geldautomat.",
  },
  {
    icon: ShieldCheck,
    title: "Pfandsystem",
    description: "Integriertes Pfandsystem für Gläser, Becher und Zubehör.",
  },
  {
    icon: Users,
    title: "Benutzerauthentifizierung",
    description:
      "Mehrere Bediener mit eigenen Logins und individuellen Berechtigungen - kontaktlose Anmeldung für schnellen Wechsel.",
  },
  {
    icon: Monitor,
    title: "Kundendisplay",
    description:
      "Zeigt Ihren Gästen den Verkaufspreis übersichtlich an - kein Nachfragen, kein Rätselraten an der Kasse.",
  },
];

/** Renders the features section as a responsive grid of feature cards. */
export default function Features(): ReactElement {
  return (
    <section id="features" className="py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Alles drin, was Sie für Ihr Event brauchen
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Die BonPrinter Box ist mehr als nur ein Drucker - sie ist Ihr komplettes Verkaufssystem.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border-2 border-slate-400 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
