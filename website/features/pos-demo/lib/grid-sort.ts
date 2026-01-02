/**
 * Article grid ranking and ordering helpers.
 *
 * @module
 */

import type { Article, OrderLine } from "../types";

/** Rank assigned to articles that are not part of the grid (sorted last). */
const UNRANKED = 999;

/** Maps an article name to its rank (sort position) within the grid. */
export type ArticleRank = Record<string, number>;

/**
 * Builds a rank lookup that orders articles like the keypad on the device:
 * bottom-left = 1, then up the column, then on to the next column.
 *
 * @param grid - row-major list of grid cells (null = empty cell)
 * @param rows - number of grid rows
 * @param cols - number of grid columns
 * @returns a lookup from article name to its rank (lower comes first)
 */
export function buildArticleRank(grid: (Article | null)[], rows: number, cols: number): ArticleRank {
  const rank: ArticleRank = {};
  grid.forEach((cell, idx) => {
    if (cell) {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      rank[cell.name] = col * rows + (rows - 1 - row);
    }
  });
  return rank;
}

/**
 * Returns a copy of the order lines sorted by their grid rank.
 *
 * @param arr - order lines to sort
 * @param rank - rank lookup from {@link buildArticleRank}
 * @returns a new sorted array; unknown articles are placed at the end
 */
export function sortByGrid(arr: OrderLine[], rank: ArticleRank): OrderLine[] {
  return [...arr].sort((a, b) => (rank[a.name] ?? UNRANKED) - (rank[b.name] ?? UNRANKED));
}

/**
 * Computes the article number shown for a given grid cell index.
 *
 * @param idx - row-major index of the cell (0 = top left)
 * @param rows - number of grid rows
 * @param cols - number of grid columns
 * @returns the 1-based article number (1 = bottom left, counting up the column)
 */
export function gridNumberAt(idx: number, rows: number, cols: number): number {
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  return col * rows + (rows - 1 - row) + 1;
}
