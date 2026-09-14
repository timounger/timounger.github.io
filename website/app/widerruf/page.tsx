/**
 * Right of withdrawal (Widerrufsbelehrung) page for consumer distance contracts.
 *
 * @module
 */

import type { Metadata } from "next";
import Link from "next/link";
import { type ReactElement } from "react";

/** Page-specific metadata for the right of withdrawal page (noindex). */
export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description: "Widerrufsrecht und Muster-Widerrufsformular für Verbraucher bei Fernabsatzverträgen.",
  alternates: { canonical: "/widerruf/" },
  robots: { index: false, follow: true },
};

/** Shared Tailwind class string for the inline links on this page. */
const linkClass = "inline-block py-1 text-brand-600 hover:underline dark:text-brand-400";
/** Shared Tailwind class string for section headings. */
const headingClass = "mt-10 text-2xl font-semibold text-slate-900 dark:text-white";
/** Shared Tailwind class string for body paragraphs. */
const textClass = "mt-4 text-slate-700 dark:text-slate-300";
/** Shared Tailwind class string for the boxed sample withdrawal form. */
const boxClass =
  "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

/** Renders the right of withdrawal notice and the sample withdrawal form. */
export default function WiderrufPage(): ReactElement {
  return (
    <section className="py-16">
      <div className="container-page max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Widerrufsbelehrung
        </h1>
        <p className={textClass}>
          Diese Belehrung gilt für <strong>Verbraucher</strong> im Sinne des § 13 BGB, die einen Vertrag mit mir
          ausschließlich über Fernkommunikationsmittel (z. B. E-Mail oder Telefon) abschließen.
        </p>

        <h2 className={headingClass}>Widerrufsrecht</h2>
        <p className={textClass}>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
          Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
        </p>
        <p className={textClass}>Um Ihr Widerrufsrecht auszuüben, müssen Sie mir</p>
        <p className={textClass}>
          Timo Unger - Software Engineering
          <br />
          Nordring 16, 73269 Hochdorf
          <br />
          E-Mail:{" "}
          <a href="mailto:bonprinter@gmx.de" className={linkClass}>
            bonprinter@gmx.de
          </a>
          <br />
          Telefon:{" "}
          <a href="tel:+491718431465" className={linkClass}>
            +49 171 8431465
          </a>
        </p>
        <p className={textClass}>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren
          Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende
          Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
        </p>
        <p className={textClass}>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts
          vor Ablauf der Widerrufsfrist absenden.
        </p>

        <h2 className={headingClass}>Folgen des Widerrufs</h2>
        <p className={textClass}>
          Wenn Sie diesen Vertrag widerrufen, habe ich Ihnen alle Zahlungen, die ich von Ihnen erhalten habe,
          einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine
          andere Art der Lieferung als die von mir angebotene, günstigste Standardlieferung gewählt haben), unverzüglich
          und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf
          dieses Vertrags bei mir eingegangen ist. Für diese Rückzahlung verwende ich dasselbe Zahlungsmittel, das Sie
          bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes
          vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p className={textClass}>
          Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie mir
          einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie mich von der Ausübung
          des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im
          Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
        </p>

        <h2 className={headingClass}>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
        <p className={textClass}>
          Ihr Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von Dienstleistungen vorzeitig, wenn ich die
          Dienstleistung vollständig erbracht habe und mit der Ausführung der Dienstleistung erst begonnen habe, nachdem
          Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie
          Ihr Widerrufsrecht bei vollständiger Vertragserfüllung verlieren.
        </p>

        <h2 className={headingClass}>Hinweis für Unternehmer</h2>
        <p className={textClass}>
          Bei Verträgen mit Unternehmern (§ 14 BGB), juristischen Personen des öffentlichen Rechts oder
          öffentlich-rechtlichen Sondervermögen besteht kein gesetzliches Widerrufsrecht. Für diese Verträge gelten
          ausschließlich die individuell vereinbarten Bedingungen.
        </p>

        <h2 className={headingClass}>Muster-Widerrufsformular</h2>
        <p className={textClass}>
          Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.
        </p>
        <div className={boxClass}>
          <p>An Timo Unger - Software Engineering, Nordring 16, 73269 Hochdorf, E-Mail: bonprinter@gmx.de</p>
          <p className="mt-4">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der
            folgenden Dienstleistung (*)
          </p>
          <p className="mt-4">Bestellt am (*) / erhalten am (*)</p>
          <p className="mt-4">Name des/der Verbraucher(s)</p>
          <p className="mt-4">Anschrift des/der Verbraucher(s)</p>
          <p className="mt-4">Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
          <p className="mt-4">Datum</p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">(*) Unzutreffendes streichen.</p>
        </div>

        <h2 className={headingClass}>Weitere Informationen</h2>
        <p className={textClass}>
          Angaben zum Anbieter finden Sie im{" "}
          <Link href="/impressum" className={linkClass}>
            Impressum
          </Link>
          , Informationen zur Verarbeitung personenbezogener Daten in der{" "}
          <Link href="/datenschutz" className={linkClass}>
            Datenschutzerklärung
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
