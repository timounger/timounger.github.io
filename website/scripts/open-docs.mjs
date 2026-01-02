/**
 * Opens the generated TypeDoc documentation in the default browser.
 *
 * Cross-platform: Windows (start), macOS (open), Linux (xdg-open). Exits with
 * an error if the documentation has not been generated yet.
 *
 * @module
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/** Absolute path to the generated documentation entry HTML file. */
const file = resolve("docs/api/index.html");

if (!existsSync(file)) {
  console.error(`Documentation not found: ${file}. Run "npm run docs" first.`);
  process.exit(1);
}

/** Platform-specific shell command that opens a file in the default app. */
const command =
  process.platform === "win32"
    ? `start "" "${file}"`
    : process.platform === "darwin"
      ? `open "${file}"`
      : `xdg-open "${file}"`;

execSync(command, { shell: true, stdio: "ignore" });
