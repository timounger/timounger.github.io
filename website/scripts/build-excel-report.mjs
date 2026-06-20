/**
 * Builds electron/bin/excel_report.exe, the helper that turns a PrintLog.csv
 * into the Excel report. The engine is selected with the EXCEL_ENGINE env var
 * ("python" by default, "rust" to use the rust_xlsxwriter port). Both produce
 * the same excel_report.exe, so the rest of the build is unaffected.
 *
 * @module
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";

/** Selected Excel engine: "python" (default) or "rust". */
const engine = (process.env.EXCEL_ENGINE ?? "python").toLowerCase();
/** Where the bundled helper exe must end up. */
const OUTPUT = "electron/bin/excel_report.exe";

/**
 * Runs a shell command, exiting the process if it fails.
 *
 * @param command - the command line to run
 */
function run(command) {
  const result = spawnSync(command, { stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (engine === "rust") {
  run("cargo build --release --manifest-path tools/excel-report-rs/Cargo.toml");
  mkdirSync("electron/bin", { recursive: true });
  copyFileSync("tools/excel-report-rs/target/release/excel_report.exe", OUTPUT);
} else {
  run(
    "python -m PyInstaller --onefile --collect-all openpyxl " +
      "--distpath electron/bin --workpath build/pyi --specpath build/pyi tools/excel-report/excel_report.py",
  );
}
console.log(`Built ${OUTPUT} with engine: ${engine}`);
