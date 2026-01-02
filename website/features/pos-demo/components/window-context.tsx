/**
 * Shared minimize/restore state for the simulated desktop window, so the app's
 * title-bar button, the taskbar and the desktop icon can all control the same
 * window.
 *
 * @module
 */
"use client";

import { createContext, useContext } from "react";

/** Minimize/restore and start-menu controls for the simulated desktop. */
export interface WindowState {
  /** Whether the app window is currently minimized. */
  minimized: boolean;
  /** Minimizes the app window (reveals the desktop). */
  minimize: () => void;
  /** Restores the app window (hides the desktop). */
  restore: () => void;
  /** Toggles between minimized and restored. */
  toggle: () => void;
  /** Whether the app window is currently closed (not running). */
  closed: boolean;
  /** Closes the app window (reveals the desktop; reopening starts logged out). */
  close: () => void;
  /** Opens the app window (clears the closed and minimized states). */
  open: () => void;
  /** Whether the start menu is currently open. */
  startOpen: boolean;
  /** Toggles the start menu open/closed. */
  toggleStart: () => void;
  /** Closes the start menu. */
  closeStart: () => void;
  /** Whether the calendar flyout is currently open. */
  calendarOpen: boolean;
  /** Toggles the calendar flyout open/closed. */
  toggleCalendar: () => void;
  /** Closes the calendar flyout. */
  closeCalendar: () => void;
  /** Whether the on-screen keyboard is currently open. */
  keyboardOpen: boolean;
  /** Toggles the on-screen keyboard open/closed. */
  toggleKeyboard: () => void;
  /** Closes the on-screen keyboard. */
  closeKeyboard: () => void;
}

/** No-op default so consumers also work without a surrounding provider. */
const FALLBACK: WindowState = {
  minimized: false,
  minimize: () => undefined,
  restore: () => undefined,
  toggle: () => undefined,
  closed: false,
  close: () => undefined,
  open: () => undefined,
  startOpen: false,
  toggleStart: () => undefined,
  closeStart: () => undefined,
  calendarOpen: false,
  toggleCalendar: () => undefined,
  closeCalendar: () => undefined,
  keyboardOpen: false,
  toggleKeyboard: () => undefined,
  closeKeyboard: () => undefined,
};

/** Context carrying the simulated window's minimize/restore state. */
export const WindowContext = createContext<WindowState>(FALLBACK);

/**
 * Accesses the simulated window's minimize/restore controls.
 *
 * @returns the current window state
 */
export function useWindowState(): WindowState {
  return useContext(WindowContext);
}
