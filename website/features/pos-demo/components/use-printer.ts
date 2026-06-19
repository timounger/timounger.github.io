/**
 * React hook that connects to the local printer bridge over WebSocket and lets
 * the app print individual receipts and open the cash drawer. The browser cannot
 * talk to a serial printer directly, so a small local bridge (see
 * tools/printer-bridge) receives the print jobs and drives the ESC/POS printer.
 *
 * Only active in the desktop build (the bridge runs locally there); the public
 * website passes `enabled = false`, so it never tries to connect.
 *
 * @module
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type OrderLine } from "../types";

/** Reconnect delay after a closed or failed connection, in milliseconds. */
const RETRY_MS = 4000;
/** Default WebSocket port the printer bridge listens on. */
const PRINTER_PORT = 8766;
/** localStorage key remembering the website printer opt-in across visits. */
const STORAGE_KEY = "bonprinter-print";
/** `?print` values that turn website printing off and clear the saved setting. */
const OFF_VALUES = ["0", "off", "false", "no"];

/**
 * Resolves the printer-bridge port. In the desktop build (forced) it is always
 * on; on the website it is opt-in via `?print` (persisted in localStorage, just
 * like the `?nfc` RFID login). `?print=off` disables it again.
 *
 * @param forced - desktop build: always connect
 * @returns the port to connect to, or null when printing is disabled
 */
function resolvePort(forced: boolean): number | null {
  if (forced) return PRINTER_PORT;
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.has("print")) {
    const value = (params.get("print") ?? "").toLowerCase();
    if (OFF_VALUES.includes(value)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const port = Number(value) || PRINTER_PORT;
    localStorage.setItem(STORAGE_KEY, String(port));
    return port;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? null : Number(stored) || PRINTER_PORT;
}

/** Metadata sent with a print job (printed on every bon). */
export interface PrintMeta {
  /** Cashier / user name printed on the receipt. */
  user: string;
  /** Date string printed on the receipt. */
  date: string;
  /** Whether the price is printed (Free users print without a price). */
  showPrice: boolean;
  /** First receipt header line, printed centered atop every bon. */
  header1: string;
  /** Second receipt header line, printed centered atop every bon. */
  header2: string;
}

/** Imperative handle returned by {@link usePrinter}. */
export interface PrinterBridge {
  /** Prints one receipt per item amount for the given order lines. */
  printOrder: (lines: OrderLine[], meta: PrintMeta) => void;
  /** Kicks the cash drawer. */
  openDrawer: () => void;
  /** COM ports the bridge currently sees as available (empty when not connected). */
  availablePorts: string[];
  /** Whether the printer bridge is enabled (desktop build or website `?print`). */
  active: boolean;
}

/**
 * Connects to the local printer bridge and returns an imperative handle to print
 * receipts and open the cash drawer. The selected COM port and paper width are
 * (re)sent whenever they change or the connection (re)opens.
 *
 * @param enabled - whether to connect to the bridge at all (desktop build only)
 * @param comPort - selected printer COM port (e.g. "COM3"), or null to disable
 * @param paperWidth - paper width in mm (58 or 80)
 * @returns a stable {@link PrinterBridge} handle
 */
export function usePrinter(enabled: boolean, comPort: string | null, paperWidth: number): PrinterBridge {
  const socketRef = useRef<WebSocket | null>(null);
  const portRef = useRef(comPort);
  const widthRef = useRef(paperWidth);
  portRef.current = comPort;
  widthRef.current = paperWidth;
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [active, setActive] = useState(false);

  /**
   * Sends a JSON message to the bridge when the socket is open.
   *
   * @param message - the message object to send
   */
  const send = useCallback((message: object): void => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }, []);

  useEffect(() => {
    const port = resolvePort(enabled);
    setActive(port !== null);
    if (port === null) return undefined;
    let stopped = false;
    let timer: number | undefined;
    /** Opens the socket and reconnects automatically when it closes. */
    const connect = (): void => {
      if (stopped) return;
      const socket = new WebSocket(`ws://127.0.0.1:${port}`);
      socketRef.current = socket;
      socket.onopen = () => {
        send({ type: "port", port: portRef.current });
        send({ type: "width", width: widthRef.current });
      };
      socket.onmessage = (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : "";
          const data: unknown = JSON.parse(raw);
          const ports = (data as { ports?: unknown })?.ports;
          if (Array.isArray(ports)) setAvailablePorts(ports.filter((p): p is string => typeof p === "string"));
        } catch {
          // ignore malformed messages
        }
      };
      socket.onclose = () => {
        socketRef.current = null;
        setAvailablePorts([]);
        if (!stopped) timer = window.setTimeout(connect, RETRY_MS);
      };
      socket.onerror = () => socket.close();
    };
    connect();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled, send]);

  // Push port / paper-width changes to the bridge (a no-op while not connected).
  useEffect(() => {
    send({ type: "port", port: comPort });
  }, [comPort, send]);
  useEffect(() => {
    send({ type: "width", width: paperWidth });
  }, [paperWidth, send]);

  const printOrder = useCallback(
    (lines: OrderLine[], meta: PrintMeta): void => {
      send({
        type: "print",
        user: meta.user,
        date: meta.date,
        header1: meta.header1,
        header2: meta.header2,
        lines: lines.map((line) => ({
          // Use the name as shown in the order table (newlines stripped, not truncated).
          name: line.name.replace(/\n/g, ""),
          price: line.price,
          qty: line.qty,
          showPrice: meta.showPrice,
        })),
      });
    },
    [send],
  );

  const openDrawer = useCallback((): void => send({ type: "drawer" }), [send]);

  return useMemo(
    () => ({ printOrder, openDrawer, availablePorts, active }),
    [printOrder, openDrawer, availablePorts, active],
  );
}
