/**
 * Pure parser that turns articles.ini text into the article grid. Kept free of
 * any Node/filesystem imports so it can run both server-side (the build-time
 * loader) and client-side (the in-app article editor).
 *
 * @module
 */
import type { Article, ArticleGrid } from "../types";

/** Number of grid columns (fixed 6x5 grid as on the POS device). */
export const COLS = 6;
/** Number of grid rows (fixed 6x5 grid as on the POS device). */
export const ROWS = 5;

/** Key names recognized inside an articles.ini section (single source of truth). */
const INI_KEY = {
  name: "name",
  price: "price",
  taxGroup: "tax_group",
  bg: "bg",
  fg: "fg",
  mark: "mark",
  deposit: "deposit",
} as const;

/**
 * Builds the article grid from raw INI text (pure, no file access).
 *
 * @param text - the raw articles.ini content
 * @returns the populated article grid together with its dimensions
 */
export function parseArticleGrid(text: string): ArticleGrid {
  const header = sectionEntries(text, "Header");
  const tax = sectionEntries(text, "Tax");
  const prints = sectionEntries(text, "Prints");
  return {
    grid: buildGrid(parseCells(text)),
    rows: ROWS,
    cols: COLS,
    header1: header.header1 ?? "",
    header2: header.header2 ?? "",
    ec: /^true$/i.test(tax.ec ?? ""),
    // both default to true (only an explicit "false" turns them off)
    printArticle: !/^false$/i.test(prints.print_article ?? ""),
    printFreePrice: !/^false$/i.test(prints.print_free_price ?? ""),
  };
}

/**
 * Reads the "key = value" entries of a named (non-numeric) section such as
 * [Header] or [Tax]. Keys are lower-cased.
 *
 * @param text - the raw articles.ini content
 * @param section - the section name (without brackets), case-insensitive
 * @returns the section's entries keyed by their lower-cased key
 */
function sectionEntries(text: string, section: string): Record<string, string> {
  const target = `[${section.toLowerCase()}]`;
  const entries: Record<string, string> = {};
  let inSection = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (isIgnored(line)) continue;
    if (/^\[.+\]$/.test(line)) {
      inSection = line.toLowerCase() === target;
    } else if (inSection) {
      const eq = line.indexOf("=");
      if (eq !== -1) entries[line.slice(0, eq).trim().toLowerCase()] = line.slice(eq + 1).trim();
    }
  }
  return entries;
}

/**
 * Parses the INI text into a map of article number to article.
 *
 * @param text - the raw articles.ini content
 * @returns the parsed cells keyed by their section number
 */
function parseCells(text: string): Record<number, Article> {
  const cells: Record<number, Article> = {};
  let current: number | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const section = parseSectionNumber(line);

    if (isIgnored(line)) {
      // skip blank lines and comments
    } else if (section !== null) {
      current = section;
    } else if (current !== null) {
      const cell = (cells[current] ??= { name: "", price: 0, taxGroup: 1 });
      applyEntry(cell, line);
    }
  }

  return cells;
}

/**
 * Places parsed cells into a fixed-size grid by their article number.
 *
 * @param cells - parsed cells keyed by section number
 * @returns the row-major grid (null = empty cell)
 */
function buildGrid(cells: Record<number, Article>): (Article | null)[] {
  const grid: (Article | null)[] = Array.from({ length: ROWS * COLS }, () => null);

  for (const [pos, cell] of Object.entries(cells)) {
    const idx = posToIndex(Number(pos));
    if (cell.name && idx >= 0 && idx < grid.length) {
      grid[idx] = cell;
    }
  }

  return grid;
}

/**
 * Applies a single "key = value" line to the given cell.
 *
 * @param cell - the article being filled
 * @param line - trimmed "key = value" line
 */
function applyEntry(cell: Article, line: string): void {
  const eq = line.indexOf("=");
  if (eq !== -1) {
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    switch (key) {
      case INI_KEY.name:
        cell.name = value.replace(/\\n/g, "\n");
        break;
      case INI_KEY.price:
        cell.price = parseFloat(value.replace(",", "."));
        break;
      case INI_KEY.taxGroup:
        cell.taxGroup = parseInt(value, 10) || 1;
        break;
      case INI_KEY.bg:
        if (value) cell.bg = normalizeColor(value);
        break;
      case INI_KEY.fg:
        if (value) cell.fg = normalizeColor(value);
        break;
      case INI_KEY.mark:
        if (/^true$/i.test(value)) cell.mark = true;
        break;
      case INI_KEY.deposit: {
        const amount = parseFloat(value.replace(",", "."));
        if (amount > 0) cell.deposit = amount;
        break;
      }
    }
  }
}

/**
 * Normalizes a color value: keeps valid hex colors as-is, but strips a stray
 * leading "#" from color names so that e.g. "#orange" becomes the CSS name
 * "orange". Bare names ("orange", "black") pass through unchanged.
 *
 * @param value - raw color string from the INI
 * @returns a CSS-usable color string
 */
function normalizeColor(value: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : value.replace(/^#/, "");
}

/**
 * Converts a POS article number into the row-major grid index.
 *
 * @remarks
 * The numbering runs column by column from bottom-left upwards.
 *
 * @param pos - article number (1..30)
 * @returns index in the row-major grid (0 = top left)
 */
function posToIndex(pos: number): number {
  const k = pos - 1;
  const col = Math.floor(k / ROWS);
  const row = ROWS - 1 - (k % ROWS);
  return row * COLS + col;
}

/**
 * Tells whether a line should be ignored (blank line or comment).
 *
 * @param line - trimmed line
 * @returns true for empty lines and comments (";" or "#")
 */
function isIgnored(line: string): boolean {
  return line === "" || line.startsWith(";") || line.startsWith("#");
}

/**
 * Parses a section header like "[3]" into its number.
 *
 * @param line - trimmed line
 * @returns the section number, or null if the line is not a section header
 */
function parseSectionNumber(line: string): number | null {
  const match = line.match(/^\[(\d+)\]$/);
  return match ? Number(match[1]) : null;
}
