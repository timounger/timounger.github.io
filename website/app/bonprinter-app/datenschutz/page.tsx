/**
 * Privacy policy of the BonPrinter Android app.
 *
 * Separate from the privacy policy of this website: Google Play links to it from the store
 * listing, and the app opens it from its settings. The URL must therefore never change.
 *
 * @module
 */

import type { Metadata } from "next";
import { type ReactElement } from "react";

/** Page-specific metadata for the app privacy policy page (noindex). */
export const metadata: Metadata = {
  title: "Datenschutzerklärung BonPrinter App",
  description: "Datenschutzerklärung der Android-App BonPrinter: keine Datenerhebung, kein Internetzugriff.",
  alternates: { canonical: "/bonprinter-app/datenschutz/" },
  robots: { index: false, follow: true },
};

/** Shared Tailwind class string for the inline links on this page. */
const linkClass = "inline-block py-1 text-brand-600 hover:underline dark:text-brand-400";
/** Shared Tailwind class string for section headings. */
const headingClass = "mt-10 text-2xl font-semibold text-slate-900 dark:text-white";
/** Shared Tailwind class string for body paragraphs. */
const textClass = "mt-4 text-slate-700 dark:text-slate-300";
/** Shared Tailwind class string for bullet lists. */
const listClass = "mt-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300";
/** Shared Tailwind class string for the date line below a title. */
const dateClass = "mt-2 text-sm text-slate-500 dark:text-slate-400";

/** Renders the privacy policy of the BonPrinter Android app, German first, then English. */
export default function BonPrinterAppPrivacyPage(): ReactElement {
  return (
    <section className="py-16">
      <div className="container-page max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Datenschutzerklärung
        </h1>
        <p className={dateClass}>
          BonPrinter (Android-App) &middot; Stand: 1. November 2026 &middot;{" "}
          <a href="#en" className={linkClass}>
            English version
          </a>
        </p>

        <h2 className={headingClass}>Kurz gefasst</h2>
        <p className={textClass}>
          BonPrinter erhebt keine personenbezogenen Daten, sendet nichts an Server und hat keinen Zugriff auf das
          Internet. Alles, was in der App entsteht &ndash; Artikelliste, Einstellungen und Verkäufe &ndash; bleibt auf
          dem Gerät.
        </p>

        <h2 className={headingClass}>Verantwortlicher</h2>
        <p className={textClass}>
          Timo Unger
          <br />
          Nordring 16, 73269 Hochdorf
          <br />
          E-Mail:{" "}
          <a href="mailto:bonprinter@gmx.de" className={linkClass}>
            bonprinter@gmx.de
          </a>
        </p>

        <h2 className={headingClass}>Welche Daten die App verarbeitet</h2>
        <p className={textClass}>
          Ausschließlich die Angaben, die der Betreiber selbst eingibt oder die beim Kassieren entstehen:
        </p>
        <ul className={listClass}>
          <li>Artikelnamen, Preise, Warengruppen und Farben der Tasten</li>
          <li>Gerätename, Kopfzeilen des Bons und die übrigen Einstellungen</li>
          <li>Verkäufe mit Zeitpunkt, Artikel, Menge, Preis und Zahlart</li>
        </ul>
        <p className={textClass}>
          Diese Daten stehen in keinem Bezug zu einzelnen Personen. Es werden weder Kundendaten noch Kennungen des
          Geräts oder des Nutzers erfasst.
        </p>

        <h2 className={headingClass}>Wo die Daten liegen</h2>
        <p className={textClass}>
          In der App-eigenen Datenbank auf dem Gerät. Eine Übertragung an den Anbieter oder an Dritte findet nicht
          statt. Die App besitzt keine Berechtigung für den Internetzugriff, eine Übertragung ist ihr technisch nicht
          möglich.
        </p>
        <p className={textClass}>
          Auch die automatische Sicherung von Android ist abgeschaltet: Weder die Sicherung in die Google-Cloud noch die
          Übernahme auf ein neues Gerät nimmt Daten dieser App mit.
        </p>

        <h2 className={headingClass}>Dateien, die der Betreiber selbst erzeugt</h2>
        <p className={textClass}>
          Beim Abrechnen legt die App im Ordner <em>Dokumente/BonPrinter</em> des Geräts einen Bericht ab (Buchungen als
          CSV, eine Zusammenfassung und die Artikelliste). Ebenso lässt sich die Artikelliste als Datei aus- und wieder
          einlesen. Was mit diesen Dateien geschieht, bestimmt allein der Betreiber des Geräts.
        </p>

        <h2 className={headingClass}>Angeschlossene Geräte</h2>
        <p className={textClass}>
          Über ein USB-Kabel spricht die App mit einem Bondrucker und einem Kundendisplay. Dabei werden nur die Daten
          des jeweiligen Bons beziehungsweise die angezeigte Summe übermittelt. Im Kellner-Betrieb übergibt die App eine
          Bestellung per NFC an eine BonPrinter-Kasse in Reichweite &ndash; ebenfalls ohne Umweg über ein Netz.
        </p>

        <h2 className={headingClass}>Berechtigungen</h2>
        <ul className={listClass}>
          <li>
            <strong>NFC</strong> &ndash; um eine Bestellung an eine Kasse zu übergeben. Ohne NFC-Hardware läuft die App
            weiter, nur diese Übergabe entfällt.
          </li>
          <li>
            <strong>USB</strong> &ndash; um Bondrucker und Kundendisplay anzusprechen; die Freigabe erfragt Android für
            jedes Gerät einzeln.
          </li>
        </ul>
        <p className={textClass}>Weitere Berechtigungen fordert die App nicht an.</p>

        <h2 className={headingClass}>Löschung</h2>
        <p className={textClass}>
          Mit dem Entfernen der App werden alle in ihr gespeicherten Daten gelöscht. Zuvor ausgelagerte Berichte und
          Artikellisten bleiben als Dateien im Speicher des Geräts erhalten und lassen sich dort löschen.
        </p>

        <h2 className={headingClass}>Ihre Rechte</h2>
        <p className={textClass}>
          Da keine personenbezogenen Daten erhoben werden, bestehen keine Daten, über die Auskunft zu erteilen wäre.
          Fragen dazu beantworten wir gern unter der oben genannten Adresse.
        </p>

        <hr className="mt-16 border-slate-200 dark:border-slate-700" />

        <div lang="en">
          <h1 id="en" className="mt-16 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Privacy Policy
          </h1>
          <p className={dateClass}>BonPrinter (Android app) &middot; Last updated: 1 November 2026</p>

          <h2 className={headingClass}>In short</h2>
          <p className={textClass}>
            BonPrinter collects no personal data, sends nothing to any server and has no internet access. Everything
            created in the app &ndash; article list, settings and sales &ndash; stays on the device.
          </p>

          <h2 className={headingClass}>Controller</h2>
          <p className={textClass}>
            Timo Unger
            <br />
            Nordring 16, 73269 Hochdorf
            <br />
            E-mail:{" "}
            <a href="mailto:bonprinter@gmx.de" className={linkClass}>
              bonprinter@gmx.de
            </a>
          </p>

          <h2 className={headingClass}>What the app processes</h2>
          <p className={textClass}>
            Only what the operator enters or what results from taking payment: article names, prices, tax groups and
            button colors; the device name, receipt header lines and the remaining settings; sales with time, article,
            quantity, price and payment type. None of this relates to an identifiable person. No customer data and no
            device or user identifiers are collected.
          </p>

          <h2 className={headingClass}>Where the data is kept</h2>
          <p className={textClass}>
            In the app&apos;s own database on the device. Nothing is transmitted to the provider or to third parties;
            the app holds no internet permission, so transmission is technically impossible. Android&apos;s automatic
            backup is switched off as well: neither cloud backup nor device-to-device transfer takes any of this
            app&apos;s data along.
          </p>

          <h2 className={headingClass}>Files the operator creates</h2>
          <p className={textClass}>
            When settling up, the app writes a report into the <em>Documents/BonPrinter</em> folder (bookings as CSV, a
            summary and the article list); the article list can also be exported and imported. What happens to those
            files is up to the operator.
          </p>

          <h2 className={headingClass}>Connected devices</h2>
          <p className={textClass}>
            Over USB the app talks to a receipt printer and a customer display, sending only the receipt in question and
            the total on show. In waiter mode it hands an order to a BonPrinter till over NFC &ndash; again without any
            network in between.
          </p>

          <h2 className={headingClass}>Permissions</h2>
          <p className={textClass}>
            NFC, to hand an order to a till, and USB, to address printer and display &ndash; Android asks for each
            device separately. The app requests nothing else.
          </p>

          <h2 className={headingClass}>Deletion</h2>
          <p className={textClass}>
            Uninstalling the app deletes everything stored in it. Reports and article lists exported beforehand remain
            as files on the device and can be deleted there.
          </p>

          <h2 className={headingClass}>Your rights</h2>
          <p className={textClass}>
            As no personal data is collected, there is no data to give information about. Questions are welcome at the
            address above.
          </p>
        </div>
      </div>
    </section>
  );
}
