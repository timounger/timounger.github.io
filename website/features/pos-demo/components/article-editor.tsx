/**
 * Article configuration editor: a plain text editor for the articles.ini-style
 * config. Opened from Konfiguration -> Artikel -> Bearbeiten (Admin only).
 * Closing saves: the text is parsed, applied live and persisted (Windows
 * registry in the desktop build).
 *
 * @module
 */
"use client";

import { X } from "lucide-react";
import { useState, type ReactElement } from "react";
import { T } from "../i18n/translations";
import { type Lang } from "../types";

/** Props for the {@link ArticleEditor} component. */
export interface ArticleEditorProps {
  /** Current UI language. */
  lang: Lang;
  /** The current article config text to edit. */
  value: string;
  /** Closes the editor; the (possibly edited) text is saved and applied. */
  onClose: (text: string) => void;
}

/**
 * Renders the article config text editor window.
 *
 * @returns the editor window element
 */
export function ArticleEditor({ lang, value, onClose }: ArticleEditorProps): ReactElement {
  const t = T[lang];
  const [text, setText] = useState(value);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="flex h-full max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-900">
        {/* Title bar */}
        <div className="flex items-center justify-between bg-[#1f2937] px-3 py-1.5 text-white">
          <div className="flex items-center gap-2 text-xs">
            <img src="/pos-demo/app.png" alt="" className="h-4 w-4" />
            <span className="font-medium">{t.editArticlesTitle}</span>
          </div>
          <button
            type="button"
            onClick={() => onClose(text)}
            aria-label={t.close}
            className="rounded p-1 hover:bg-[#e81123]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Editable text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="min-h-0 flex-1 resize-none bg-white px-4 py-3 font-mono text-[12px] leading-snug text-slate-800 outline-none dark:bg-slate-900 dark:text-slate-200"
        />

        {/* Save & close */}
        <button
          type="button"
          onClick={() => onClose(text)}
          className="bg-[#1976d2] py-4 text-lg font-medium text-white transition hover:bg-[#1565c0]"
        >
          {t.saveClose}
        </button>
      </div>
    </div>
  );
}
