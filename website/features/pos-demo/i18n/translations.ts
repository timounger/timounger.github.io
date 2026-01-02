/**
 * UI translation tables for the POS demo languages.
 *
 * @module
 */

import type { Lang } from "../types";
import de from "./de.json";
import en from "./en.json";

/**
 * UI translation table: maps each supported language to its key/value strings.
 *
 * @remarks
 * The strings live in de.json / en.json (user-facing, kept in their respective
 * language). `en.json` must structurally match `de.json` - otherwise this fails
 * to type-check.
 *
 * @internal
 */
export const T = { Deutsch: de, English: en } satisfies Record<Lang, typeof de>;
