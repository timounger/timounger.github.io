/**
 * Full-screen demo page that loads the article grid and renders the POS demo.
 *
 * @module
 */

import ThemeToggle from "@/components/theme/theme-toggle";
import { PosDemo } from "@/features/pos-demo";
import { loadArticleGrid } from "@/features/pos-demo/data/load-articles";
import { loadUsers } from "@/features/pos-demo/data/load-users";
import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type ReactElement } from "react";

/** Page-specific metadata for the live demo page. */
export const metadata: Metadata = {
  title: "Kasse live testen",
  description:
    "Probieren Sie die BonPrinter-Kassensoftware direkt im Browser aus: Artikel buchen, Rückgeld berechnen und Wertmarken drucken.",
  alternates: { canonical: "/demo/" },
  openGraph: {
    title: "BonPrinter Box - Live-Demo der Kassensoftware",
    description: "Im Browser ausprobieren: Artikel buchen, Rückgeld berechnen, Wertmarken drucken.",
    url: "/demo/",
  },
};

/**
 * Renders the full-screen live demo page with a top bar (title and close link)
 * and the interactive POS demo loaded with the article grid.
 */
export default function DemoPage(): ReactElement {
  const articles = loadArticleGrid();
  const users = loadUsers();
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-slate-100 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <span className="font-semibold text-slate-900 dark:text-white">BonPrinter Live-Demo</span>
        <div className="flex items-center gap-2">
          <Link href="/#booking" className="btn-primary px-4 py-1.5 text-sm">
            Jetzt mieten
          </Link>
          <ThemeToggle />
          <Link
            href="/"
            aria-label="Demo schließen und zur Startseite"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <X size={18} />
            Schließen
          </Link>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto overflow-x-clip">
        <div className="mx-auto max-w-[1000px] px-4 py-6">
          <PosDemo articles={articles} users={users} />
        </div>
      </div>
    </div>
  );
}
