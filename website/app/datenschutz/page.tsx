/**
 * Privacy policy (Datenschutzerklärung) page.
 *
 * @module
 */

import type { Metadata } from "next";
import Link from "next/link";
import { type ReactElement } from "react";

/** Page-specific metadata for the privacy policy page (noindex). */
export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten auf dieser Webseite gemäß DSGVO.",
  alternates: { canonical: "/datenschutz/" },
  robots: { index: false, follow: true },
};

/** Shared Tailwind class string for the inline links on this page. */
const linkClass = "inline-block py-1 text-brand-600 hover:underline dark:text-brand-400";
/** Shared Tailwind class string for section headings. */
const headingClass = "mt-10 text-2xl font-semibold text-slate-900 dark:text-white";
/** Shared Tailwind class string for body paragraphs. */
const textClass = "mt-4 text-slate-700 dark:text-slate-300";

/** Renders the privacy policy (Datenschutzerklärung) page. */
export default function DatenschutzPage(): ReactElement {
  return (
    <section className="py-16">
      <div className="container-page max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Datenschutzerklärung
        </h1>
        <p className={textClass}>
          Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. Nachfolgend informiere ich Sie gemäß der
          Datenschutz-Grundverordnung (DSGVO) über die Verarbeitung personenbezogener Daten beim Besuch dieser Webseite.
        </p>

        <h2 className={headingClass}>1. Verantwortlicher</h2>
        <p className={textClass}>
          Timo Unger &ndash; Software Engineering
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

        <h2 className={headingClass}>2. Hosting (GitHub Pages)</h2>
        <p className={textClass}>
          Diese Webseite wird als statische Seite bei <strong>GitHub Pages</strong> gehostet. Anbieter ist die GitHub
          Inc., 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, USA. Beim Aufruf der Seite verarbeitet GitHub
          technisch notwendige Verbindungsdaten (insbesondere Ihre IP-Adresse), um die Seite ausliefern zu können.
          Rechtsgrundlage ist das berechtigte Interesse an einer sicheren und effizienten Bereitstellung der Webseite
          (Art. 6 Abs. 1 lit. f DSGVO). Für die Übermittlung in die USA stützt sich GitHub auf Standardvertragsklauseln.
          Weitere Informationen finden Sie in der{" "}
          <a
            href="https://docs.github.com/de/site-policy/privacy-policies"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GitHub Privacy Policy
          </a>
          .
        </p>

        <h2 className={headingClass}>3. Server-Logfiles</h2>
        <p className={textClass}>
          Der Hosting-Anbieter erhebt und speichert automatisch Informationen in Server-Logfiles, die Ihr Browser
          übermittelt (z.&nbsp;B. IP-Adresse, Datum und Uhrzeit des Zugriffs, angeforderte Datei, Referrer, Browsertyp).
          Diese Daten dienen ausschließlich dem sicheren und stabilen Betrieb der Webseite und werden nicht mit anderen
          Datenquellen zusammengeführt.
        </p>

        <h2 className={headingClass}>4. Kontaktaufnahme &amp; Anfrageformular</h2>
        <p className={textClass}>
          Das Anfrage-Formular auf dieser Seite überträgt <strong>keine Daten an einen Server dieser Webseite</strong>.
          Beim Absenden wird lediglich Ihr lokales E-Mail-Programm mit vorausgefüllten Angaben geöffnet; die E-Mail
          versenden Sie eigenständig über Ihren gewohnten E-Mail-Anbieter. Wenn Sie mich per E-Mail oder Telefon
          kontaktieren, verarbeite ich Ihre Angaben zur Bearbeitung Ihrer Anfrage (Art. 6 Abs. 1 lit. b bzw. lit. f
          DSGVO). Die Daten werden gelöscht, sobald sie für den Zweck nicht mehr erforderlich sind und keine
          gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>

        <h2 className={headingClass}>5. Live-Demo (lokale Speicherung)</h2>
        <p className={textClass}>
          Die interaktive Kassen-Demo läuft vollständig in Ihrem Browser. Einstellungen (z.&nbsp;B. Sprache, Design,
          Konfiguration) werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert und{" "}
          <strong>nicht an einen Server übertragen</strong>. Sie können diese Daten jederzeit über die Einstellungen
          Ihres Browsers löschen.
        </p>

        <h2 className={headingClass}>6. Reichweitenmessung (GoatCounter)</h2>
        <p className={textClass}>
          Zur anonymen Reichweitenmessung nutze ich <strong>GoatCounter</strong>. GoatCounter arbeitet{" "}
          <strong>ohne Cookies</strong> und <strong>ohne dauerhafte Speicherung Ihrer IP-Adresse</strong>; es werden
          lediglich anonyme Statistiken (z.&nbsp;B. aufgerufene Seiten, Referrer, Browser/Land) erhoben, die keinen
          Rückschluss auf einzelne Personen zulassen. Ein Consent-Banner ist daher nicht erforderlich. Rechtsgrundlage
          ist das berechtigte Interesse an einer bedarfsgerechten Gestaltung der Webseite (Art. 6 Abs. 1 lit. f DSGVO).
          Details finden Sie in der{" "}
          <a
            href="https://www.goatcounter.com/help/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GoatCounter-Datenschutzerklärung
          </a>
          .
        </p>
        <p className={textClass}>
          Darüber hinaus setzt diese Webseite <strong>keine Marketing-Cookies</strong> und gibt keine personenbezogenen
          Daten zu Werbezwecken weiter.
        </p>

        <h2 className={headingClass}>7. Ihre Rechte</h2>
        <p className={textClass}>
          Sie haben im Rahmen der gesetzlichen Vorgaben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16),
          Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie ein
          Widerspruchsrecht (Art. 21). Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an die oben genannten
          Kontaktdaten.
        </p>

        <h2 className={headingClass}>8. Beschwerderecht bei der Aufsichtsbehörde</h2>
        <p className={textClass}>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig ist der{" "}
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Landesbeauftragte für den Datenschutz Baden-Württemberg
          </a>
          .
        </p>

        <h2 className={headingClass}>9. Aktualität</h2>
        <p className={textClass}>
          Diese Datenschutzerklärung wird bei Bedarf angepasst, um sie an geänderte rechtliche Anforderungen oder
          Änderungen der Webseite anzupassen. Das Impressum finden Sie{" "}
          <Link href="/impressum" className={linkClass}>
            hier
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
