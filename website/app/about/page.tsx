/**
 * About page with a personal introduction and project background.
 *
 * @module
 */

import type { Metadata } from "next";
import { type ReactElement } from "react";

/** Page-specific metadata for the about page. */
export const metadata: Metadata = {
  title: "Über mich - Timo Unger",
  description: "Softwareentwickler mit Leidenschaft für Automatisierung und benutzerfreundliche Anwendungen.",
  alternates: { canonical: "/about/" },
};

/** Renders the "about" page with a personal introduction and project background. */
export default function AboutPage(): ReactElement {
  return (
    <section className="py-16">
      <div className="container-page max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">Über mich</h1>
        <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Hallo, mein Name ist <strong>Timo Unger</strong> und ich bin Softwareentwickler mit einer besonderen
            Leidenschaft für die Automatisierung von Prozessen.
          </p>
          <p>
            Mit fundierten Kenntnissen in der Entwicklung von Softwarelösungen, sowohl im Frontend als auch im Backend,
            setze ich meine Fähigkeiten ein, um innovative und benutzerfreundliche Anwendungen zu entwickeln.
          </p>
          <p>
            Stets auf dem neuesten Stand der Technik, verfolge ich aktuelle Trends und Technologien, um mein Fachwissen
            kontinuierlich zu erweitern.
          </p>
          <p>
            Die <strong>BonPrinter Box</strong> ist ein Herzensprojekt von mir: Ich entwickle die Software dafür
            komplett selbst und baue auch die Hardware - also die Boxen - in Eigenregie. So habe ich jedes Detail in der
            Hand und kann auf individuelle Wünsche flexibel eingehen.
          </p>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Die BonPrinter Box lässt sich auch als vollwertige <strong>Registrierkasse</strong> einsetzen. In diesem
            Fall ist eine zertifizierte technische Sicherheitseinrichtung (TSE) gesetzlich erforderlich.
          </p>
        </div>
      </div>
    </section>
  );
}
