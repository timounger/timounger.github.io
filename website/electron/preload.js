/**
 * Electron preload: exposes small bridges to the renderer so the web app can
 * persist settings in the Windows registry (under HKCU\Software\BON_WEB) and
 * read/write the printed-articles log (PrintLog.csv, next to the exe) via the
 * main process. Reads are synchronous (a few small values at startup).
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bonprinterSettings", {
  getSync: (section, key) => ipcRenderer.sendSync("settings:get", { section, key }),
  set: (section, key, value) => ipcRenderer.send("settings:set", { section, key, value }),
});

contextBridge.exposeInMainWorld("bonprinterPrintLog", {
  append: (rows) => ipcRenderer.send("printlog:append", rows),
  read: () => ipcRenderer.sendSync("printlog:read"),
  clear: () => ipcRenderer.send("printlog:clear"),
  createReport: (configText) => ipcRenderer.sendSync("report:create", configText),
});
