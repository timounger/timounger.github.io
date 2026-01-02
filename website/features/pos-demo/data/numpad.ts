/**
 * Numpad layout builder for the POS demo.
 *
 * @module
 */

/**
 * Builds the numpad layout (row-major); empty cells are null.
 *
 * @param withDot - in change mode, show a decimal point between "0" and "00"
 * @returns the grid cells, each a digit/symbol string or null for a gap
 */
export function numpadCells(withDot: boolean): (string | null)[] {
  return [
    null,
    null,
    null,
    null,
    null,
    null,
    "7",
    "8",
    "9",
    null,
    null,
    null,
    "4",
    "5",
    "6",
    null,
    null,
    null,
    "1",
    "2",
    "3",
    null,
    null,
    null,
    "0",
    withDot ? "." : null,
    "00",
    null,
    null,
    null,
  ];
}
