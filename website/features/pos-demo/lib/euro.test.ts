/**
 * Unit tests for the Euro formatting helper.
 *
 * @module
 */
import { describe, expect, it } from "vitest";
import { euro } from "./euro";

describe("euro", () => {
  it("formats whole amounts with two decimals and a trailing euro sign", () => {
    expect(euro(5)).toBe("5.00 €");
  });

  it("rounds to two decimals", () => {
    expect(euro(1.5)).toBe("1.50 €");
    expect(euro(2.345)).toBe("2.35 €");
  });

  it("handles zero and negative amounts", () => {
    expect(euro(0)).toBe("0.00 €");
    expect(euro(-3.2)).toBe("-3.20 €");
  });
});
