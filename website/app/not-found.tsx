/**
 * Custom 404 (not found) page.
 *
 * @module
 */

import Link from "next/link";
import { type ReactElement } from "react";

/** Renders the branded 404 page with links back to the start and the live demo. */
export default function NotFound(): ReactElement {
  return (
    <section className="flex min-h-[60vh] items-center py-20">
      <div className="container-page max-w-xl text-center">
        <p className="text-6xl font-bold tracking-tight text-brand-600 sm:text-7xl dark:text-brand-400">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Seite nicht gefunden
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Diese Seite gibt es leider nicht (mehr). Vielleicht hilft einer der folgenden Links weiter.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary px-5 py-2.5">
            Zur Startseite
          </Link>
          <Link
            href="/demo"
            className="rounded-lg border-2 border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            Live-Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
