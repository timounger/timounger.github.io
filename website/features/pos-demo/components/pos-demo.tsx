/**
 * Demo page wrapper rendering the POS app alongside explanatory text.
 *
 * @module
 */
"use client";

import { useCallback, useState, type ReactElement } from "react";
import { T } from "../i18n/translations";
import { parseArticleGrid } from "../lib/parse-articles";
import { DEFAULT_LANG, type UserConfig } from "../types";
import { BonPrinterApp, type PosContext } from "./bon-printer-app";
import { DeviceFrame } from "./device-frame";

/** Props for the {@link PosDemo} component. */
export interface PosDemoProps {
  /** Raw article config text (articles.ini), loaded by the page at build time. */
  articleText: string;
  /** Login users, loaded from user.ini by the page at build time. */
  users: UserConfig;
}

/**
 * Demo page around the BonPrinter application: renders the app (white box) and
 * the explanatory text below it. The text belongs to the demo page, not the app.
 *
 * @returns the demo page element
 */
export default function PosDemo({ articleText, users }: PosDemoProps): ReactElement {
  // Initial header from the build-time config; the live header (and everything
  // else) then comes from the app via onContext, so editing it updates the bon.
  const [ctx, setCtx] = useState<PosContext>(() => {
    const articles = parseArticleGrid(articleText);
    return {
      loggedOut: false,
      lang: DEFAULT_LANG,
      demoDark: false,
      terminalAmount: 0,
      lastBon: null,
      header1: articles.header1,
      header2: articles.header2,
    };
  });
  /** Receives the latest app context (login status, language, theme) from the app. */
  const handleContext = useCallback((c: PosContext) => setCtx(c), []);

  const { loggedOut, lang, demoDark, terminalAmount, lastBon, header1, header2 } = ctx;
  const t = T[lang];

  return (
    <div className={`space-y-4 ${demoDark ? "pos-dark" : "pos-light"}`}>
      <DeviceFrame
        lang={lang}
        terminalAmount={terminalAmount}
        showBon={lastBon !== null}
        bonHeader1={header1}
        bonHeader2={header2}
        bonName={lastBon?.name ?? ""}
        bonPrice={lastBon?.price ?? 0}
      >
        <BonPrinterApp articleText={articleText} users={users} onContext={handleContext} />
      </DeviceFrame>

      {/* Description below the window - depends on login status and language */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {loggedOut ? (
          lang === "English" ? (
            <>
              Select <strong>Local</strong> for the cashier · <strong>Free</strong> prints free tokens for helpers ·{" "}
              <strong>B1-B15</strong> for staff - they are logged out automatically after each printout and log in
              contactlessly via a wristband with an NFC chip on the real device · <strong>Host</strong>: here all
              users&apos; printouts can be viewed and the statistics reset via the report.
            </>
          ) : (
            <>
              <strong>Local</strong> auswählen für den Kassierer · <strong>Free</strong> druckt kostenlose Wertmarken
              für Helfer · <strong>B1-B15</strong> für die Bedienung - diese melden sich nach einem Druckvorgang
              automatisch ab und am echten Gerät kontaktlos per Armband mit NFC-Chip · <strong>Host</strong>: hier
              lassen sich die Ausdrucke aller Benutzer einsehen und die Statistik per Bericht zurücksetzen.
            </>
          )
        ) : lang === "English" ? (
          <>
            <strong>🔒 Lock</strong> logs the user out · <strong>X</strong> sets a quantity (X → number → X) ·{" "}
            <strong>{t.calc}</strong> calculates the change (after printing) ·{" "}
            <strong className="text-[#d32f2f] dark:text-[#f87171]">{t.clear}</strong> clears the whole input or selected
            items · <strong>{t.print}</strong> prints the tokens.
          </>
        ) : (
          <>
            <strong>🔒 Schloss</strong> meldet den Benutzer ab · <strong>X</strong> setzt eine Menge (X → Zahl → X) ·{" "}
            <strong>{t.calc}</strong> berechnet das Rückgeld (nach dem Drucken) ·{" "}
            <strong className="text-[#d32f2f] dark:text-[#f87171]">{t.clear}</strong> löscht die gesamte Eingabe oder
            ausgewählte Positionen · <strong>{t.print}</strong> gibt die Wertmarken aus.
          </>
        )}
      </p>
    </div>
  );
}
