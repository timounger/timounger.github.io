/**
 * Decorative Windows 11 File Explorer window showing the (empty) folder where
 * the BonPrinter reports are stored. Opened from the printouts menu (Admin
 * only); purely visual.
 *
 * @module
 */
"use client";

import { ChevronRight, Folder, Search, Minus, Square, X } from "lucide-react";
import { type ReactElement } from "react";
import { T } from "../i18n/translations";
import { type Lang } from "../types";

/** Props for the {@link ExplorerWindow} component. */
export interface ExplorerWindowProps {
  /** Current UI language. */
  lang: Lang;
  /** Closes the explorer window. */
  onClose: () => void;
}

/** Name of the opened folder (last path segment). */
const FOLDER_NAME = "BonPrinter";
/** Breadcrumb segments of the shown path C:\Users\BonPrinter\BonPrinter. */
const PATH_SEGMENTS = ["C:", "Users", "BonPrinter", FOLDER_NAME];

/**
 * Renders the simulated File Explorer window for the (empty) reports folder.
 *
 * @returns the explorer window element
 */
export function ExplorerWindow({ lang, onClose }: ExplorerWindowProps): ReactElement {
  const t = T[lang];
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-[#f3f3f3] shadow-2xl ring-1 ring-black/20 dark:bg-[#202020] dark:ring-white/10">
        {/* Title bar */}
        <div className="flex items-center justify-between bg-[#eaeaea] px-3 py-1.5 dark:bg-[#2b2b2b]">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <Folder size={14} strokeWidth={1.5} className="text-[#c8881f]" fill="#f6c64b" />
            <span className="font-medium">{FOLDER_NAME}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span className="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10" aria-hidden>
              <Minus size={13} />
            </span>
            <span className="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10" aria-hidden>
              <Square size={11} />
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="rounded p-1 hover:bg-[#e81123] hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Address bar with breadcrumb path and a search box */}
        <div className="flex items-center gap-2 border-b border-black/10 bg-[#f8f8f8] px-3 py-1.5 dark:border-white/10 dark:bg-[#272727]">
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded border border-black/15 bg-white px-2 py-1 text-[11px] text-slate-700 dark:border-white/15 dark:bg-[#1b1b1b] dark:text-slate-200">
            {PATH_SEGMENTS.map((seg, i) => (
              <span key={seg + i} className="flex min-w-0 items-center">
                <span className="truncate">{seg}</span>
                {i < PATH_SEGMENTS.length - 1 && <ChevronRight size={12} className="mx-0.5 shrink-0 text-slate-400" />}
              </span>
            ))}
          </div>
          <div className="hidden items-center gap-1 rounded border border-black/15 bg-white px-2 py-1 text-[11px] text-slate-400 sm:flex dark:border-white/15 dark:bg-[#1b1b1b]">
            <Search size={12} />
            <span>
              {t.searchIn} {FOLDER_NAME}
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_120px_90px_70px] gap-2 border-b border-black/10 bg-[#f3f3f3] px-3 py-1.5 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:bg-[#202020] dark:text-slate-400">
          <span>{t.colName}</span>
          <span>{t.colModified}</span>
          <span>{t.colType}</span>
          <span className="text-right">{t.colSize}</span>
        </div>

        {/* Empty folder */}
        <div className="flex min-h-[160px] flex-1 items-center justify-center bg-white text-[12px] text-slate-400 dark:bg-[#191919] dark:text-slate-500">
          {t.emptyFolder}
        </div>

        {/* Status bar */}
        <div className="border-t border-black/10 bg-[#f3f3f3] px-3 py-1 text-[11px] text-slate-500 dark:border-white/10 dark:bg-[#202020] dark:text-slate-400">
          0 {t.itemsLabel}
        </div>
      </div>
    </div>
  );
}
