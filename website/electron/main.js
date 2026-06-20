/**
 * Electron main process: wraps the static Next export (../out) in a desktop
 * window so the BonPrinter demo can ship as a Windows .exe (same web code).
 *
 * A small custom `app://` protocol serves the exported files, which keeps the
 * absolute asset paths (/_next/...) working and provides a secure context (so
 * the RFID bridge over ws://127.0.0.1 is allowed).
 */
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const { spawn, execFileSync } = require("node:child_process");
const { app, BrowserWindow, protocol, net, ipcMain } = require("electron");

const OUT_DIR = path.join(__dirname, "..", "out");
// Registry root for persisted settings (mirrors the reference project, but under
// the name "BON_WEB"): HKCU\Software\BON_WEB\BonPrinter\<section>\<key>.
const REG_ROOT = "HKCU\\Software\\BON_WEB\\BonPrinter";
// Values in this section (the article/user config text) are stored Base64-encoded
// so multi-line and non-ASCII content survives the reg.exe round-trip intact.
const BASE64_SECTION = "CONFIGURATION";
/** The bundled bridge helper processes (NFC reader + ESC/POS printer). */
const bridgeProcesses = [];
/** Bundled helper executables started alongside the app. */
const BRIDGE_EXES = ["nfc_bridge.exe", "printer_bridge.exe"];
const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 820;
// Minimum window size (from the reference project: DEFAULT_WIN_WIDTH/HEIGHT); the
// window cannot be scaled smaller than this.
const MIN_WINDOW_WIDTH = 720;
const MIN_WINDOW_HEIGHT = 450;
// App-only page (just the BonPrinter application, no device frame / website).
// ?nfc enables the RFID login by default in the desktop app.
const START_URL = "app://-/kiosk/?nfc";

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

/**
 * Maps an app:// request to a file inside the export and returns its contents.
 * Directory / extensionless paths resolve to their index.html.
 */
function handleAppRequest(request) {
  const { pathname } = new URL(request.url);
  let filePath = decodeURIComponent(pathname);
  if (!path.extname(filePath)) {
    filePath = `${filePath.replace(/\/?$/, "/")}index.html`;
  }
  return net.fetch(pathToFileURL(path.join(OUT_DIR, filePath)).toString());
}

/** Creates the main application window and loads the demo. */
function createWindow() {
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: "BonPrinter",
    icon: path.join(__dirname, "icon.ico"),
    autoHideMenuBar: true,
    backgroundColor: "#ffffff",
    webPreferences: { contextIsolation: true, preload: path.join(__dirname, "preload.js") },
  });
  // Keep the window title fixed ("BonPrinter"); don't let the page <title> override it.
  win.on("page-title-updated", (event) => event.preventDefault());
  win.loadURL(START_URL);
}

/** Starts the bundled helper bridges (NFC + printer) without extra setup. */
function startBridge() {
  const baseDir = app.isPackaged ? process.resourcesPath : path.join(__dirname, "bin");
  for (const name of BRIDGE_EXES) {
    try {
      const child = spawn(path.join(baseDir, name), [], { windowsHide: true, stdio: "ignore" });
      child.on("error", (err) => console.error(`${name} failed:`, err.message));
      bridgeProcesses.push(child);
    } catch (err) {
      console.error(`${name} could not start:`, err.message);
    }
  }
}

/** Stops the bundled helper bridge processes. */
function stopBridge() {
  for (const child of bridgeProcesses) {
    if (child && !child.killed) child.kill();
  }
  bridgeProcesses.length = 0;
}

/**
 * Builds the full registry path for a settings section (group).
 *
 * @param {string} section settings section / group name
 * @returns {string} the registry key path
 */
function regPath(section) {
  return section ? `${REG_ROOT}\\${section}` : REG_ROOT;
}

/**
 * Reads a setting from the Windows registry via reg.exe.
 *
 * @param {string} section settings section / group name
 * @param {string} key value name
 * @returns {string|null} the stored value, or null when unset
 */
function readSetting(section, key) {
  try {
    const out = execFileSync("reg", ["query", regPath(section), "/v", key], {
      encoding: "utf8",
      windowsHide: true,
    });
    const lines = out.split(/\r?\n/);
    const idx = lines.findIndex((l) => /\bREG_\w+\b/.test(l));
    if (idx === -1) return null;
    const match = lines[idx].match(/\bREG_\w+\s+(.*)$/);
    let value = match ? match[1] : "";
    // REG_SZ values may span multiple lines; the data continues on the following
    // lines up to the trailing blank line reg.exe adds.
    const rest = lines.slice(idx + 1);
    while (rest.length && rest[rest.length - 1].trim() === "") rest.pop();
    if (rest.length) value += `\n${rest.join("\n")}`;
    if (section === BASE64_SECTION) {
      try {
        return Buffer.from(value, "base64").toString("utf8");
      } catch {
        return value;
      }
    }
    return value;
  } catch {
    return null; // key / path missing -> reg.exe exits non-zero
  }
}

/**
 * Writes a setting to the Windows registry via reg.exe.
 *
 * @param {string} section settings section / group name
 * @param {string} key value name
 * @param {string} value value to store
 */
function writeSetting(section, key, value) {
  try {
    const stored = section === BASE64_SECTION ? Buffer.from(String(value), "utf8").toString("base64") : String(value);
    execFileSync("reg", ["add", regPath(section), "/v", key, "/t", "REG_SZ", "/d", stored, "/f"], {
      windowsHide: true,
    });
  } catch (err) {
    console.error("settings write failed:", err.message);
  }
}

ipcMain.on("settings:get", (event, { section, key }) => {
  event.returnValue = readSetting(section, key);
});
ipcMain.on("settings:set", (_event, { section, key, value }) => writeSetting(section, key, value));

// Printed-articles log (PrintLog.csv), stored next to the exe like the reference
// project; the report ("Abrechnen") is built from it and clears it afterwards.
const PRINT_LOG_HEADER = ["Count", "Article Name", "Article Number", "Group", "Total Price", "User", "Date", "Printer"];

/**
 * Returns the PrintLog.csv path next to the (portable) exe; the project dir in dev.
 *
 * @returns {string} absolute path to PrintLog.csv
 */
function printLogPath() {
  const baseDir = app.isPackaged
    ? process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath)
    : process.cwd();
  return path.join(baseDir, "PrintLog.csv");
}

/**
 * Escapes a CSV field: strips line breaks and replaces the ";" delimiter so the
 * semicolon-separated file stays parseable.
 *
 * @param {*} value field value
 * @returns {string} the sanitized field
 */
function csvField(value) {
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .replace(/;/g, ",");
}

ipcMain.on("printlog:append", (_event, rows) => {
  try {
    const file = printLogPath();
    const lines = [];
    if (!fs.existsSync(file)) lines.push(PRINT_LOG_HEADER.join(";"));
    for (const row of rows) lines.push(row.map(csvField).join(";"));
    fs.appendFileSync(file, `${lines.join("\r\n")}\r\n`, "utf8");
  } catch (err) {
    console.error("print log append failed:", err.message);
  }
});

ipcMain.on("printlog:read", (event) => {
  try {
    const file = printLogPath();
    event.returnValue = fs.existsSync(file)
      ? fs
          .readFileSync(file, "utf8")
          .split(/\r?\n/)
          .filter((line) => line.length > 0)
          .map((line) => line.split(";"))
      : [];
  } catch {
    event.returnValue = [];
  }
});

ipcMain.on("printlog:clear", () => {
  try {
    const file = printLogPath();
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (err) {
    console.error("print log clear failed:", err.message);
  }
});

// Create a report folder in the output directory (~/BonPrinter) like the
// reference project: copy the print log into it, write the current article
// config (articles.ini), then clear the print log. Returns the folder path.
ipcMain.on("report:create", (event, configText) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const suffix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}h${pad(now.getMinutes())}m${pad(now.getSeconds())}s`;
    const folder = path.join(app.getPath("home"), "BonPrinter", `PrintReport_${suffix}`);
    fs.mkdirSync(folder, { recursive: true });
    const logFile = printLogPath();
    const csvCopy = path.join(folder, `PrintLog_${suffix}.csv`);
    const iniCopy = path.join(folder, "articles.ini");
    if (fs.existsSync(logFile)) fs.copyFileSync(logFile, csvCopy);
    if (typeof configText === "string") fs.writeFileSync(iniCopy, configText, "utf8");
    // Create the Excel report (openpyxl tool) alongside the CSV, then clear the log.
    if (fs.existsSync(csvCopy)) {
      const excelExe = app.isPackaged
        ? path.join(process.resourcesPath, "excel_report.exe")
        : path.join(__dirname, "bin", "excel_report.exe");
      try {
        execFileSync(excelExe, [csvCopy, path.join(folder, `PrintReport_${suffix}.xlsx`), iniCopy], {
          windowsHide: true,
        });
      } catch (err) {
        console.error("excel report failed:", err.message);
      }
    }
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile); // clear the log for the next report
    event.returnValue = folder;
  } catch (err) {
    console.error("report create failed:", err.message);
    event.returnValue = null;
  }
});

app.whenReady().then(() => {
  protocol.handle("app", handleAppRequest);
  startBridge();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", stopBridge);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
