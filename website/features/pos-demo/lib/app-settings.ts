/**
 * Persistent app settings. In the desktop build (.exe) settings are stored in
 * the Windows registry under HKCU\Software\BON_WEB\BonPrinter (mirroring the
 * reference project, but under the name "BON_WEB"), exposed by the Electron
 * preload as `window.bonprinterSettings`. On the website (no preload) the same
 * calls fall back to localStorage, so the public demo is unaffected.
 *
 * @module
 */
"use client";

/** Settings bridge injected by the Electron preload in the desktop build. */
interface BonSettingsApi {
  /** Reads a registry value (registry section + key), or null when unset. */
  getSync: (section: string, key: string) => string | null;
  /** Writes a registry value (registry section + key). */
  set: (section: string, key: string, value: string) => void;
}

declare global {
  /** Global window, augmented with the desktop build's settings bridge. */
  interface Window {
    /** Present only inside the desktop build (set by electron/preload.js). */
    bonprinterSettings?: BonSettingsApi;
  }
}

/**
 * Reads a persisted setting: Windows registry in the desktop build, otherwise
 * the localStorage fallback (website).
 *
 * @param section - registry section / group (e.g. "PRINTER")
 * @param key - registry value name (e.g. "com_port")
 * @param storageKey - localStorage key used as the web fallback
 * @returns the stored value, or null when unset
 */
export function readSetting(section: string, key: string, storageKey: string): string | null {
  if (typeof window === "undefined") return null;
  const api = window.bonprinterSettings;
  if (api) return api.getSync(section, key);
  return localStorage.getItem(storageKey);
}

/**
 * Persists a setting: Windows registry in the desktop build, otherwise the
 * localStorage fallback (website).
 *
 * @param section - registry section / group (e.g. "PRINTER")
 * @param key - registry value name (e.g. "com_port")
 * @param storageKey - localStorage key used as the web fallback
 * @param value - the value to store
 */
export function writeSetting(section: string, key: string, storageKey: string, value: string): void {
  if (typeof window === "undefined") return;
  const api = window.bonprinterSettings;
  if (api) api.set(section, key, value);
  else localStorage.setItem(storageKey, value);
}
