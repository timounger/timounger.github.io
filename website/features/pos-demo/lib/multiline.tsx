/**
 * Helper that renders newline-separated labels as stacked block spans.
 *
 * @module
 */

import { type ReactElement } from "react";

/**
 * Renders a label that may contain newlines as separate block-level spans,
 * so each part appears on its own line.
 *
 * @param label - text whose "\n" characters mark line breaks
 * @returns one block span per line
 */
export function multiline(label: string): ReactElement[] {
  return label.split("\n").map((part, idx) => (
    <span key={idx} className="block">
      {part}
    </span>
  ));
}
