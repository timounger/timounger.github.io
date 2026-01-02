/**
 * Euro amount formatting helper.
 *
 * @module
 */

/**
 * Formats a number as a Euro amount with two decimals and a trailing sign.
 *
 * @param n - amount in Euro
 * @returns the amount with two decimals and a trailing euro sign
 * @example
 * euro(1.5); // returns "1.50" followed by the euro sign
 */
export function euro(n: number): string {
  return n.toFixed(2) + " €";
}
