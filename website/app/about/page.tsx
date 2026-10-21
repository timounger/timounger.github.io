/**
 * About page with a personal introduction.
 *
 * @module
 */

import { Heart, Lightbulb, Ruler, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { type ReactElement } from "react";

/** Page-specific metadata for the about page. */
export const metadata: Metadata = {
  title: "Über mich - Timo Unger",
  description: "Softwareentwickler mit Leidenschaft für Automatisierung und benutzerfreundliche Anwendungen.",
  alternates: { canonical: "/about/" },
};

/** Topics shown as cards below the introduction (icon, title and text). */
const topics = [
  {
    icon: Lightbulb,
    title: "Neugier auf Neues",
    text: "Ich probiere gern Neues aus. Neue Programmiersprachen und Frameworks reizen mich genauso wie neue Hardware: Ich schaue mir genau an, was ein Gerät kann, teste seine Möglichkeiten und überlege, wie es sich sinnvoll in eigene Projekte einbinden lässt.",
  },
  {
    icon: Ruler,
    title: "Liebe zum Detail",
    text: "Besonderen Wert lege ich auf eine durchdachte Softwarearchitektur und klare Codierrichtlinien. Da lässt mein innerer Monk nicht locker, bis jedes Detail an seinem Platz ist.",
  },
  {
    icon: Sparkles,
    title: "Mit KI-Unterstützung",
    text: "Seit mich künstliche Intelligenz bei der Entwicklung unterstützt, macht mir das Ganze noch mehr Freude - und ich kann noch mehr Ideen umsetzen.",
  },
];

/** Renders the "about" page with a personal introduction. */
export default function AboutPage(): ReactElement {
  return (
    <section className="py-16">
      <div className="container-page max-w-5xl">
        <div className="flex flex-col gap-8 md:flex-row-reverse md:items-center md:justify-between">
          <img
            src="/img/about.webp"
            alt="Timo Unger"
            width={256}
            height={256}
            className="h-48 w-48 shrink-0 rounded-2xl object-cover shadow-lg ring-1 ring-slate-200 sm:h-56 sm:w-56 dark:ring-slate-800"
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">Über mich</h1>
            <p className="mt-6 text-xl leading-relaxed text-slate-700 sm:text-2xl dark:text-slate-300">
              Ich bin <strong className="text-slate-900 dark:text-white">Timo Unger</strong> und arbeite als
              Softwareentwickler - hauptsächlich mit den Programmiersprachen C und Python.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-4 rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-6 dark:bg-brand-900/30">
          <Heart size={28} className="shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nebenberuflich aus Leidenschaft</h2>
            <p className="mt-2 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Programmieren ist für mich aber weit mehr als ein Beruf - es ist mein Hobby. In meiner Freizeit arbeite
              ich nebenberuflich an eigenen Projekten wie diesem, am liebsten an solchen, die lästige Handarbeit
              automatisieren. Mein Schwerpunkt liegt dabei auf Windows-Programmen für Finanzen und Buchhaltung.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {topics.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border-2 border-slate-400 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Icon size={24} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
