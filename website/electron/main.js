/**
 * Electron main process: wraps the static Next export (../out) in a desktop
 * window so the BonPrinter demo can ship as a Windows .exe (same web code).
 *
 * A small custom `app://` protocol serves the exported files, which keeps the
 * absolute asset paths (/_next/...) working and provides a secure context (so
 * the RFID bridge over ws://127.0.0.1 is allowed).
 */
const path = require("node:path");
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
