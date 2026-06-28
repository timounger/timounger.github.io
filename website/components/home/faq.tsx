/**
 * FAQ section: common rental questions as an accessible native accordion, plus
 * matching Schema.org FAQPage structured data for rich search results.
 *
 * @module
 */

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { type ReactElement, type ReactNode } from "react";

/** A single FAQ entry: plain-text answer (for JSON-LD) and optional rich render. */
interface FaqItem {
  /** The question text. */
  question: string;
  /** Plain-text answer, also used for the FAQPage structured data. */
  answer: string;
  /** Optional richer answer for the UI (e.g. with links); falls back to answer. */
  render?: ReactNode;
}

/** Frequently asked questions with plain-text answers (also used for JSON-LD). */
const faqs: FaqItem[] = [
  {
    question: "Brauche ich Strom oder Internet?",
    answer:
      "Die Box benötigt lediglich einen normalen Stromanschluss - Internet ist nicht nötig. Auch die optionale Kartenzahlung funktioniert ohne Ihr WLAN, da das integrierte SumUp-Terminal über eine eigene Multi-SIM mobil verbunden ist. Das Drucken der Wertmarken läuft ohnehin komplett offline.",
  },
  {
    question: "Kann ich die Kasse vorher ausprobieren?",
    answer:
      "Ja. Die komplette Kassensoftware können Sie unverbindlich direkt im Browser über die Live-Demo testen. Gerne stelle ich sie Ihnen auch persönlich vor - bei mir oder direkt bei Ihnen vor Ort.",
    render: (
      <>
        Ja. Die komplette Kassensoftware können Sie unverbindlich direkt im Browser über die{" "}
        <Link href="/demo" className="text-brand-600 underline dark:text-brand-400">
          Live-Demo
        </Link>{" "}
        testen. Gerne stelle ich sie Ihnen auch persönlich vor - bei mir oder direkt bei Ihnen vor Ort.
      </>
    ),
  },
];

/** Schema.org FAQPage structured data built from the FAQ list. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

/** Renders the FAQ section (accordion) and its FAQPage JSON-LD. */
export default function Faq(): ReactElement {
  return (
    <section id="faq" className="py-20">
      <div className="container-page max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Häufige Fragen
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Antworten auf die häufigsten Fragen rund um die Miete der BonPrinter Box.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map(({ question, answer, render }) => (
            <details
              key={question}
              className="group rounded-2xl border-2 border-slate-400 bg-white px-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-slate-900 dark:text-white">
                {question}
                <ChevronDown
                  size={20}
                  className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-4 text-slate-600 dark:text-slate-300">{render ?? answer}</p>
            </details>
          ))}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </section>
  );
}
