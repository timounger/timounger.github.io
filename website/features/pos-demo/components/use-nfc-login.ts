/**
 * React hook that connects to a local NFC bridge over WebSocket and forwards
 * scanned card UIDs to a callback. The browser cannot talk to a PC/SC reader
 * directly, so a small local bridge (see tools/nfc-bridge) reads the UID and
 * pushes it here.
 *
 * Enabled by opening the page once with the `?nfc` parameter; the choice is
 * stored in localStorage, so later visits stay enabled without the parameter
 * (public demo visitors who never use `?nfc` are unaffected). `?nfc=8765` sets
 * an explicit port; `?nfc=off` disables it again. Reconnects automatically.
 *
 * @module
 */
"use client";

import { useEffect, useRef, useState } from "react";

/** Reconnect delay after a closed or failed connection, in milliseconds. */
const RETRY_MS = 4000;
/** Default bridge port used when `?nfc` carries no numeric value. */
const DEFAULT_PORT = 8765;
/** localStorage key remembering the enabled bridge port across visits. */
const STORAGE_KEY = "bonprinter-nfc-port";
/** `?nfc` values that turn the RFID login off and clear the saved setting. */
const OFF_VALUES = ["0", "off", "false", "no"];

/**
 * Resolves the bridge port from the URL (`?nfc` / `?nfc=8765`), persisting it so
 * later visits stay enabled without the parameter. `?nfc=off` disables it again.
 *
 * @returns the port to connect to, or null when the RFID login is disabled
 */
function resolvePort(): number | null {
  const params = new URLSearchParams(window.location.search);
  if (params.has("nfc")) {
    const value = (params.get("nfc") ?? "").toLowerCase();
    if (OFF_VALUES.includes(value)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const port = Number(value) || DEFAULT_PORT;
    localStorage.setItem(STORAGE_KEY, String(port));
    return port;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? null : Number(stored) || DEFAULT_PORT;
}

/** Result of an NFC scan, signalled back to the reader for LED/buzzer feedback. */
export type NfcResult = "success" | "fail" | "blocked";

/**
 * Subscribes to card UIDs from the local NFC bridge (only when enabled via `?nfc`).
 *
 * @param onUid - called with each scanned UID and a `notify(result)` callback that
 *   signals the result back to the reader (green / red / two orange beeps)
 * @returns the PC/SC readers the bridge currently sees (empty when not connected)
 */
export function useNfcLogin(onUid: (uid: string, notify: (result: NfcResult) => void) => void): string[] {
  const callback = useRef(onUid);
  callback.current = onUid;
  const [availableReaders, setAvailableReaders] = useState<string[]>([]);
  useEffect(() => {
    const port = resolvePort();
    if (port === null) return undefined;
    const url = `ws://127.0.0.1:${port}`;
    let socket: WebSocket | null = null;
    let timer: number | undefined;
    let stopped = false;

    /**
     * Sends the scan result to the bridge so the reader can beep/blink.
     *
     * @param result - the scan outcome ("success" / "fail" / "blocked")
     */
    const notify = (result: NfcResult): void => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ feedback: result }));
      }
    };

    /** Opens the socket and reconnects automatically when it closes. */
    const connect = (): void => {
      if (stopped) return;
      socket = new WebSocket(url);
      socket.onmessage = (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : "";
          const data: unknown = JSON.parse(raw);
          const uid = (data as { uid?: unknown })?.uid;
          if (typeof uid === "string") callback.current(uid, notify);
          const readers = (data as { readers?: unknown })?.readers;
          if (Array.isArray(readers)) {
            setAvailableReaders(readers.filter((r): r is string => typeof r === "string"));
          }
        } catch {
          // ignore malformed messages
        }
      };
      socket.onclose = () => {
        setAvailableReaders([]);
        if (!stopped) timer = window.setTimeout(connect, RETRY_MS);
      };
      socket.onerror = () => socket?.close();
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      socket?.close();
    };
  }, []);
  return availableReaders;
}
