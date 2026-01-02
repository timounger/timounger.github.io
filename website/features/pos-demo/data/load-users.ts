/**
 * Server-side loader for the login users (user.ini).
 *
 * @module
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { User, UserConfig } from "../types";

/** Absolute path to the user.ini file, resolved at build time. */
const INI_PATH = path.join(process.cwd(), "features", "pos-demo", "data", "user.ini");

/** Key names recognized inside a user.ini section (single source of truth). */
const INI_KEY = {
  name: "name",
  pw: "pw",
} as const;

/**
 * Reads user.ini into a map of user key to its name and password.
 *
 * @returns the user configuration keyed by section name (e.g. "Admin", "B1")
 */
export function loadUsers(): UserConfig {
  return parseUsers(readFileSync(INI_PATH, "utf8"));
}

/**
 * Parses the INI text into a map of section name to user.
 *
 * @param text - the raw user.ini content
 * @returns the parsed users keyed by their section name
 */
export function parseUsers(text: string): UserConfig {
  const users: UserConfig = {};
  let current: string | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const section = parseSectionName(line);

    if (isIgnored(line)) {
      // skip blank lines and comments
    } else if (section !== null) {
      current = section;
      users[current] ??= {};
    } else if (current !== null) {
      applyEntry(users[current], line);
    }
  }

  return users;
}

/**
 * Applies a single "key = value" line to the given user.
 *
 * @param user - the user being filled
 * @param line - trimmed "key = value" line
 */
function applyEntry(user: User, line: string): void {
  const eq = line.indexOf("=");
  if (eq !== -1) {
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    switch (key) {
      case INI_KEY.name:
        if (value) user.name = value;
        break;
      case INI_KEY.pw:
        if (value) user.pw = value;
        break;
    }
  }
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
 * Parses a section header like "[Admin]" into its name.
 *
 * @param line - trimmed line
 * @returns the section name, or null if the line is not a section header
 */
function parseSectionName(line: string): string | null {
  const match = line.match(/^\[(.+)\]$/);
  return match ? match[1] : null;
}
