/**
 * Printed-articles log (PrintLog.csv). In the desktop build (.exe) every printout
 * is appended to a CSV next to the exe (same format as the reference project) and
 * the report ("Abrechnen") is built from it; the file is cleared afterwards.
 *
 * On the website there is no file access (the bridge is absent), so all calls are
 * no-ops and reads return an empty list.
 *
 * @module
 */
"use client";

/** Print-log bridge injected by the Electron preload in the desktop build. */
interface PrintLogApi {
  /** Appends rows (the header is written automatically on first write). */
  append: (rows: (string | number)[][]) => void;
  /** Reads all rows (including the header row), or [] when no file exists. */
  read: () => string[][];
  /** Deletes the log file (after a report has been created). */
  clear: () => void;
  /** Creates a report folder (copies the log + writes the config), returns its path. */
  createReport: (configText: string) => string | null;
}

declare global {
  /** Global window, augmented with the desktop build's print-log bridge. */
  interface Window {
    /** Present only inside the desktop build (set by electron/preload.js). */
    bonprinterPrintLog?: PrintLogApi;
  }
}

/**
 * Appends printed-article rows to the log (desktop build only).
 *
 * @param rows - rows matching the header (Count, Name, Number, Group, Total, User, Date, Printer)
 */
export function appendPrintLog(rows: (string | number)[][]): void {
  if (typeof window !== "undefined") window.bonprinterPrintLog?.append(rows);
}

/**
 * Reads all log rows (including the header), or [] on the website / when empty.
 *
 * @returns the raw CSV rows
 */
export function readPrintLog(): string[][] {
  if (typeof window === "undefined") return [];
  return window.bonprinterPrintLog?.read() ?? [];
}

/** Clears the log file (desktop build only). */
export function clearPrintLog(): void {
  if (typeof window !== "undefined") window.bonprinterPrintLog?.clear();
}

/**
 * Creates a report folder in the output directory: copies the print log into it
 * and writes the current article config, then clears the log (desktop build).
 *
 * @param configText - the article config (articles.ini content) to archive
 * @returns the created folder path, or null on the website / on failure
 */
export function createReportFolder(configText: string): string | null {
  if (typeof window === "undefined") return null;
  return window.bonprinterPrintLog?.createReport(configText) ?? null;
}
