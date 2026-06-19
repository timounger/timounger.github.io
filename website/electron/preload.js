/**
 * Electron preload: exposes a tiny settings bridge to the renderer so the web
 * app can persist settings in the Windows registry (under HKCU\Software\BON_WEB)
 * via the main process. Reads are synchronous (a few small values at startup).
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bonprinterSettings", {
  getSync: (section, key) => ipcRenderer.sendSync("settings:get", { section, key }),
  set: (section, key, value) => ipcRenderer.send("settings:set", { section, key, value }),
});
