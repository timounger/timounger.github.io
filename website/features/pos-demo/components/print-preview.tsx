/**
 * Decorative "Artikel Druckvorschau" window: a monospace table listing every
 * programmed article (name, tax group, price, deposit). Opened from the
 * printouts menu (Admin only); purely visual.
 *
 * @module
 */
"use client";

import { X } from "lucide-react";
import { type ReactElement } from "react";
import { T } from "../i18n/translations";
import { gridNumberAt } from "../lib/grid-sort";
import { type Article, type ArticleGrid, type Lang } from "../types";

/** Props for the {@link PrintPreview} component. */
export interface PrintPreviewProps {
  /** Current UI language. */
  lang: Lang;
  /** The programmed article grid to list. */
  articles: ArticleGrid;
  /** Closes the preview window. */
  onClose: () => void;
}

/**
 * Formats a euro amount like the printout, e.g. "3.00 €".
 *
 * @param n - amount in euro
 * @returns the formatted string
 */
function fmtPrice(n: number): string {
  return `${n.toFixed(2)} €`;
}

/**
 * Renders the article print-preview window.
 *
 * @returns the preview window element
 */
export function PrintPreview({ lang, articles, onClose }: PrintPreviewProps): ReactElement {
  const t = T[lang];
  const rows: { article: Article; n: number }[] = [];
  articles.grid.forEach((a, i) => {
    if (a) rows.push({ article: a, n: gridNumberAt(i, articles.rows, articles.cols) });
  });
  rows.sort((x, y) => x.n - y.n);

  /** Renders one monospace table row (header reuses this with left-aligned cells). */
  const sep = <span className="px-1 text-slate-300 dark:text-slate-600">|</span>;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="flex h-full max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-900">
        {/* Title bar */}
        <div className="flex items-center justify-between bg-[#1f2937] px-3 py-1.5 text-white">
          <div className="flex items-center gap-2 text-xs">
            <img src="/pos-demo/app.png" alt="" className="h-4 w-4" />
            <span className="font-medium">{t.previewTitle}</span>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded p-1 hover:bg-[#e81123]">
            <X size={14} />
          </button>
        </div>

        {/* Body: article table on the left, grey panel with the close button on the right */}
        <div className="flex min-h-0 flex-1">
          {/* Article table */}
          <div className="min-h-0 flex-[2] overflow-auto whitespace-pre border-r border-[#a8a8a8] bg-white px-4 py-3 font-mono text-[12px] leading-snug text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {/* Header */}
            <div className="flex font-semibold">
              <span className="w-[20ch]">Name</span>
              {sep}
              <span className="w-[7ch]">Group</span>
              {sep}
              <span className="w-[9ch]">Price</span>
              {sep}
              <span className="w-[9ch]">Deposit</span>
              {sep}
              <span className="w-[5ch]">Cut</span>
            </div>
            <div className="my-1 border-b border-slate-300 dark:border-slate-600" />
            {/* Rows */}
            {rows.map(({ article }) => (
              <div key={article.name} className="flex">
                <span className="w-[20ch] truncate">{article.name}</span>
                {sep}
                <span className="w-[7ch] text-center">{article.taxGroup}</span>
                {sep}
                <span className="w-[9ch] text-right">{fmtPrice(article.price)}</span>
                {sep}
                <span className="w-[9ch] text-right">{article.deposit ? fmtPrice(article.deposit) : ""}</span>
                {sep}
                <span className="w-[5ch]" />
              </div>
            ))}
          </div>

          {/* Right panel: title and the big close button */}
          <div className="flex flex-1 flex-col bg-[#eef0f2] dark:bg-slate-800">
            <div className="flex flex-1 items-center justify-center p-4 text-center">
              <span className="text-2xl font-light text-slate-700 dark:text-slate-200">{t.previewTitle}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#1976d2] py-6 text-xl font-medium text-white transition hover:bg-[#1565c0]"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
