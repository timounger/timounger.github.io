/**
 * Server-side loader that reads articles.ini and builds the article grid.
 * The actual parsing lives in lib/parse-articles (Node-free, reusable client-side).
 *
 * @module
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ArticleGrid } from "../types";
import { parseArticleGrid } from "../lib/parse-articles";

export { parseArticleGrid } from "../lib/parse-articles";

/** Absolute path to the articles.ini file, resolved at build time. */
const INI_PATH = path.join(process.cwd(), "features", "pos-demo", "data", "articles.ini");

/**
 * Reads the raw articles.ini text (used as the initial article config / editor
 * seed; on the website it is the only source).
 *
 * @returns the raw articles.ini content
 */
export function loadArticleText(): string {
  return readFileSync(INI_PATH, "utf8");
}

/**
 * Reads articles.ini and builds the article grid (section [n] = article number n).
 *
 * @returns the populated article grid together with its dimensions
 */
export function loadArticleGrid(): ArticleGrid {
  return parseArticleGrid(loadArticleText());
}
