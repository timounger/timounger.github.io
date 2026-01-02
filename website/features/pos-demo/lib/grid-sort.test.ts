/**
 * Unit tests for the article grid ranking and ordering helpers.
 *
 * @module
 */
import { describe, expect, it } from "vitest";
import type { Article, OrderLine } from "../types";
import { buildArticleRank, gridNumberAt, sortByGrid } from "./grid-sort";

/**
 * Builds a minimal article cell for tests.
 *
 * @param name - article name
 * @returns an article with the given name and default price/tax group
 */
function article(name: string): Article {
  return { name, price: 1, taxGroup: 1 };
}

/**
 * Builds a minimal order line for tests.
 *
 * @param name - article name
 * @returns an order line with the given name and a quantity of one
 */
function line(name: string): OrderLine {
  return { name, price: 1, qty: 1, taxGroup: 1 };
}

describe("gridNumberAt", () => {
  // 2 rows x 3 cols, numbering bottom-left = 1 and up each column
  it("numbers the bottom-left cell as 1", () => {
    // bottom-left of a 2x3 grid is row 1 (second row), col 0 -> index 3
    expect(gridNumberAt(3, 2, 3)).toBe(1);
  });

  it("numbers the top-left cell as 2 (one up the first column)", () => {
    expect(gridNumberAt(0, 2, 3)).toBe(2);
  });

  it("continues numbering in the next column", () => {
    // bottom of second column (row 1, col 1) -> index 4
    expect(gridNumberAt(4, 2, 3)).toBe(3);
  });
});

describe("buildArticleRank", () => {
  it("ranks the bottom-left article lowest and skips empty cells", () => {
    const grid: (Article | null)[] = [article("top"), null, article("bottom"), article("next")];
    const rank = buildArticleRank(grid, 2, 2);
    expect(rank["bottom"]).toBeLessThan(rank["top"]);
    expect(rank["next"]).toBeGreaterThan(rank["bottom"]);
    expect(Object.keys(rank)).not.toContain("undefined");
  });
});

describe("sortByGrid", () => {
  it("orders lines by their grid rank and puts unknown articles last", () => {
    const grid: (Article | null)[] = [article("a"), article("b")];
    const rank = buildArticleRank(grid, 1, 2);
    const sorted = sortByGrid([line("unknown"), line("b"), line("a")], rank);
    expect(sorted.map((l) => l.name)).toEqual(["a", "b", "unknown"]);
  });

  it("does not mutate the input array", () => {
    const input = [line("b"), line("a")];
    const rank = buildArticleRank([article("a"), article("b")], 1, 2);
    sortByGrid(input, rank);
    expect(input.map((l) => l.name)).toEqual(["b", "a"]);
  });
});
