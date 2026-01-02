/**
 * Unit tests for the articles.ini parser and grid builder.
 *
 * @module
 */
import { describe, expect, it } from "vitest";
import { parseArticleGrid } from "./load-articles";

describe("parseArticleGrid", () => {
  it("returns a grid sized to the fixed device dimensions", () => {
    const { grid, rows, cols } = parseArticleGrid("");
    expect(rows).toBe(5);
    expect(cols).toBe(6);
    expect(grid).toHaveLength(rows * cols);
    expect(grid.every((cell) => cell === null)).toBe(true);
  });

  it("parses name, price (comma or dot) and tax group", () => {
    const { grid } = parseArticleGrid("[1]\nname = Bier\nprice = 3,50\ntax_group = 2\n");
    const cell = grid.find((c) => c?.name === "Bier");
    expect(cell).toMatchObject({ name: "Bier", price: 3.5, taxGroup: 2 });
  });

  it("parses optional deposit, mark and colors", () => {
    const { grid } = parseArticleGrid(
      "[1]\nname = Glas\nprice = 1\ndeposit = 2,00\nmark = true\nbg = #orange\nfg = black\n",
    );
    const cell = grid.find((c) => c?.name === "Glas");
    expect(cell?.deposit).toBe(2);
    expect(cell?.mark).toBe(true);
    // a stray leading "#" is stripped from color names, hex stays intact
    expect(cell?.bg).toBe("orange");
    expect(cell?.fg).toBe("black");
  });

  it("converts escaped newlines in names to real line breaks", () => {
    const { grid } = parseArticleGrid("[1]\nname = Cola\\nZero\nprice = 1\n");
    const cell = grid.find((c) => c?.name.includes("Cola"));
    expect(cell?.name).toBe("Cola\nZero");
  });

  it("ignores sections without a name", () => {
    const { grid } = parseArticleGrid("[1]\nprice = 5\n");
    expect(grid.every((cell) => cell === null)).toBe(true);
  });
});
