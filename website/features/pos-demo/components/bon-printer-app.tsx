/**
 * Interactive BonPrinter POS terminal: login, article booking and printing.
 *
 * @module
 */
"use client";

import { ChevronRight, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { LOGIN } from "../data/login";
import { numpadCells } from "../data/numpad";
import { T } from "../i18n/translations";
import { readSetting, writeSetting } from "../lib/app-settings";
import { euro } from "../lib/euro";
import { buildArticleRank, gridNumberAt, sortByGrid } from "../lib/grid-sort";
import { multiline } from "../lib/multiline";
import { parseArticleGrid } from "../lib/parse-articles";
import { appendPrintLog, clearPrintLog, createReportFolder, readPrintLog } from "../lib/print-log";
import { playSound, type SoundName } from "../lib/sound";
import { ArticleEditor } from "./article-editor";
import { ConfigMenu } from "./config-menu";
import { ExplorerWindow } from "./explorer-window";
import { PrintPreview } from "./print-preview";
import { useNfcLogin } from "./use-nfc-login";
import { usePrinter } from "./use-printer";
import { useWindowState } from "./window-context";
import {
  DEFAULT_LANG,
  LANGUAGES,
  type Article,
  type Lang,
  type LoginCell,
  type NumpadMode,
  type OrderLine,
  type UserConfig,
} from "../types";

/** Total paper roll length in meters. */
const PAPER_ROLL_M = 80;
/** Paper already used at session start / after a reset, in meters. */
const PAPER_START_M = 0.5;
/** Paper consumed per printed item, in meters. */
const PAPER_PER_ITEM_M = 0.04;
/** Maximum number of items that can be printed in one go. */
const MAX_PRINT_ITEMS = 50;
/** Paper width (mm) for the narrow / wide receipt option, sent to the print bridge. */
const PAPER_WIDTH_58 = 58;
const PAPER_WIDTH_80 = 80;
/** Receipt character width per paper size (matches the print bridge LINE_WIDTHS). */
const LINE_WIDTH_58 = 34;
const LINE_WIDTH_80 = 48;
/** Number of columns in PrintLog.csv (Count..Printer); shorter rows are ignored. */
const PRINT_LOG_COLUMNS = 8;
/** Maximum length of the numeric input field. */
const NUM_INPUT_MAX_LEN = 8;
/** Auto theme: hour (inclusive) from which daytime/light mode starts. */
const DAY_START_HOUR = 7;
/** Auto theme: hour (inclusive) from which nighttime/dark mode starts. */
const NIGHT_START_HOUR = 19;
/** Toast auto-hide delay in milliseconds. */
const TOAST_MS = 1600;
/** Status line auto-hide delay in milliseconds. */
const STATUS_MS = 3000;
/** Long-press duration in milliseconds that marks an article. */
const LONG_PRESS_MS = 1000;
/** Code required for the Admin-only factory reset (change to your own secret). */
const RESET_CODE = "0000";

/** Build timestamp (UTC), injected at build time via next.config. */
const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? "dev";
/** Short git commit hash of the build, injected via next.config. */
const BUILD_COMMIT = process.env.NEXT_PUBLIC_GIT_COMMIT ?? "dev";

/**
 * Formats a date for the receipt header as "YYYY/MM/DD HH:MM:SS".
 *
 * @param date - the date to format
 * @returns the formatted timestamp
 */
function formatBonDate(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const ymd = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  const hms = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${ymd} ${hms}`;
}

/** State of the running app that the demo page needs for its explanatory text. */
export interface PosContext {
  /** Whether no user is currently logged in. */
  loggedOut: boolean;
  /** Currently selected UI language. */
  lang: Lang;
  /** Whether the app currently renders in dark mode. */
  demoDark: boolean;
  /** Amount sent to the card terminal (euro); 0 until card payment is triggered. */
  terminalAmount: number;
  /** Last printed bon (name + price) to show on the device printer; null = none yet. */
  lastBon: { name: string; price: number } | null;
  /** Current receipt header lines (live from the edited article config). */
  header1: string;
  header2: string;
}

/** Props for the {@link BonPrinterApp} component. */
export interface BonPrinterAppProps {
  /** Raw article config text (articles.ini format); parsed and editable in-app. */
  articleText: string;
  /** Login users, loaded from user.ini. */
  users: UserConfig;
  /** Called whenever the app's login status, language or theme changes. */
  onContext?: (ctx: PosContext) => void;
  /** Hide the app's own title bar (used in the standalone desktop build, where
   * the OS window already provides one). */
  hideTitleBar?: boolean;
  /** User logged in on first render; null starts logged out. Defaults to "Local". */
  initialUser?: string | null;
  /** Suppress the toast pop-ups (e.g. "Wertmarken gedruckt") - used in the
   * standalone desktop build, where they are not wanted. */
  hideToasts?: boolean;
  /** Connect to the local printer bridge so printouts drive a real ESC/POS
   * printer and the cash drawer (desktop build only). */
  enablePrinter?: boolean;
  /** Fill the parent: the app box fills the window, the menu bar stays constant
   * (desktop style) and only the body stretches (desktop build only). */
  fillMode?: boolean;
}

/**
 * Interactive simulation of the BonPrinter POS application: login grid, article
 * keypad, numpad, order list and the printouts/settings/help menus.
 *
 * @returns the app window element
 */
export function BonPrinterApp({
  articleText: initialArticleText,
  users,
  onContext,
  hideTitleBar,
  initialUser = "Local",
  hideToasts,
  enablePrinter,
  fillMode,
}: BonPrinterAppProps): ReactElement {
  // Article config as editable text; the grid is derived from it. In the desktop
  // build it is loaded from / saved to the Windows registry (see the effect
  // below); on the website it comes from articles.ini and edits stay in-session.
  const [articleText, setArticleText] = useState(initialArticleText);
  const articles = useMemo(() => parseArticleGrid(articleText), [articleText]);
  const { grid, rows, cols } = articles;
  const articleRank = useMemo(() => buildArticleRank(grid, rows, cols), [grid, rows, cols]);
  const [articleEditorOpen, setArticleEditorOpen] = useState(false);
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.bonprinterSettings?.getSync("CONFIGURATION", "ITEMS") : null;
    if (stored) setArticleText(stored);
  }, []);
  /**
   * Applies and persists an edited article config (registry in the desktop build).
   *
   * @param text - the new article config text
   */
  const saveArticles = useCallback((text: string) => {
    setArticleText(text);
    window.bonprinterSettings?.set("CONFIGURATION", "ITEMS", text);
    setArticleEditorOpen(false);
  }, []);
  // Fill mode (desktop build): stretch only the body to fill the area below the
  // constant menu bar, so the menu bar stays at its natural size (desktop style).
  const bodyContainerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyScale, setBodyScale] = useState({ x: 1, y: 1 });
  useEffect(() => {
    if (!fillMode) return undefined;
    const container = bodyContainerRef.current;
    const body = bodyRef.current;
    if (!container || !body) return undefined;
    /** Recomputes the body X/Y scale so it fills the area below the menu bar. */
    const update = () => {
      const bodyWidth = body.offsetWidth;
      const bodyHeight = body.offsetHeight;
      if (bodyWidth === 0 || bodyHeight === 0) return;
      setBodyScale({ x: container.clientWidth / bodyWidth, y: container.clientHeight / bodyHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(body);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [fillMode]);
  const [user, setUser] = useState<string | null>(initialUser);
  const [order, setOrder] = useState<OrderLine[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ index: number; mode: "line" | "qty" | "one" } | null>(null);
  const [printed, setPrinted] = useState(false);
  const [numpadMode, setNumpadMode] = useState<NumpadMode>(null);
  const [numInput, setNumInput] = useState("");
  const [changeResult, setChangeResult] = useState<{ total: number; given: number; back: number } | null>(null);
  const [paperUsed, setPaperUsed] = useState(PAPER_START_M);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"normal" | "warn">("normal");
  const statusTimer = useRef<number | null>(null);
  // articles highlighted orange (shared across users); pre-marked from articles.ini (mark = true)
  const [marked, setMarked] = useState<Set<string>>(() => new Set(grid.flatMap((c) => (c?.mark ? [c.name] : []))));
  // active deposit (Pfand) count per amount, keyed by the amount as a string
  const [deposits, setDeposits] = useState<Record<string, number>>({});
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  // user key currently entering a PIN (null = not in PIN entry), and the entered digits
  const [pwUser, setPwUser] = useState<string | null>(null);
  const [pwInput, setPwInput] = useState("");
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const listRef = useRef<HTMLDivElement | null>(null); // scrollable container of the article list
  const [addTick, setAddTick] = useState(0); // increments on every article entry

  // Scroll the article list back to the top after each entry
  useEffect(() => {
    if (addTick === 0) return;
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [addTick]);
  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmPaper, setConfirmPaper] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [demoTheme, setDemoTheme] = useState("Hell");
  const [demoLang, setDemoLang] = useState<Lang>(DEFAULT_LANG);
  const [showPrices, setShowPrices] = useState(true);
  const [openSub, setOpenSub] = useState<null | "theme" | "lang">(null);
  // Printouts menu
  const [printoutsMenuOpen, setPrintoutsMenuOpen] = useState(false);
  // "Combine report" submenu inside the printouts menu (Admin only, decorative)
  const [combineSubOpen, setCombineSubOpen] = useState(false);
  const [interimOpen, setInterimOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [printHistory, setPrintHistory] = useState<Record<string, (OrderLine & { cancelled: boolean })[]>>({});
  // Desktop build: load the persisted print log (PrintLog.csv next to the exe)
  // into the history so a report ("Abrechnen") includes sales from earlier runs.
  useEffect(() => {
    const rows = readPrintLog();
    const loaded: Record<string, (OrderLine & { cancelled: boolean })[]> = {};
    for (const row of rows) {
      if (row.length < PRINT_LOG_COLUMNS) continue;
      const qty = parseInt(row[0], 10);
      if (!qty || qty <= 0) continue; // skips the header and malformed rows
      const total = parseFloat(row[4]) || 0;
      const cashier = row[5] ?? "";
      if (!cashier) continue;
      // A negative total marks a cancellation (Storno); store the positive price
      // with the cancelled flag so the report nets it out the same way.
      (loaded[cashier] ??= []).push({
        name: row[1] ?? "",
        price: Math.abs(total) / qty,
        qty,
        taxGroup: parseInt(row[3], 10) || 1,
        cancelled: total < 0,
      });
    }
    if (Object.keys(loaded).length > 0) setPrintHistory(loaded);
  }, []);
  // Whether any sales have been recorded yet (drives the interim/report menu items):
  // empty until something is printed, and emptied again once a report is created.
  const hasSales = Object.values(printHistory).some((lines) => lines.length > 0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // Admin-only factory reset dialog: code entry and a wrong-code flag
  const [resetOpen, setResetOpen] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetError, setResetError] = useState(false);
  // Admin-only simulated File Explorer showing the reports folder
  const [explorerOpen, setExplorerOpen] = useState(false);
  // Admin-only article print-preview window
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  // Admin toggle (on by default): when on, the report printouts (interim, report,
  // void) are shown; when off they are removed for everyone, which also hides the
  // whole printouts menu for non-admin users.
  const [printReportActive, setPrintReportActive] = useState(true);
  // Admin toggle (off by default, decorative): "PC register" mode
  const [pcRegisterActive, setPcRegisterActive] = useState(false);
  // Konfiguration menu: COM ports, paper width and the card/display peripherals.
  // The printer port and paper width drive the real print bridge in the desktop
  // build. All of these (plus the SETTINGS below) are persisted across restarts:
  // Windows registry in the .exe (HKCU\Software\BON_WEB\BonPrinter, same keys as
  // the reference project), localStorage on the website.
  const [printerPort, setPrinterPort] = useState("None");
  const [paperWidth, setPaperWidth] = useState("58 mm");
  const [cardReader, setCardReader] = useState("None");
  const [displayPort, setDisplayPort] = useState("None");
  useEffect(() => {
    /**
     * Loads a stored string setting into state.
     *
     * @param section - registry section (e.g. "PRINTER")
     * @param key - registry value name
     * @param storageKey - localStorage fallback key
     * @param apply - state setter to call with the stored value
     */
    const loadText = (section: string, key: string, storageKey: string, apply: (v: string) => void): void => {
      const value = readSetting(section, key, storageKey);
      if (value !== null) apply(value);
    };
    /**
     * Loads a stored boolean setting into state ("true"/"false").
     *
     * @param key - registry value name (in the SETTINGS section)
     * @param storageKey - localStorage fallback key
     * @param apply - state setter to call with the parsed boolean
     */
    const loadBool = (key: string, storageKey: string, apply: (v: boolean) => void): void => {
      const value = readSetting("SETTINGS", key, storageKey);
      if (value !== null) apply(value === "true");
    };
    loadText("PRINTER", "com_port", "bonprinter-printer-port", setPrinterPort);
    loadText("PRINTER", "paper_width", "bonprinter-paper-width", setPaperWidth);
    loadText("PRINTER", "reader", "bonprinter-card-reader", setCardReader);
    loadText("PRINTER", "display_port", "bonprinter-display-port", setDisplayPort);
    loadBool("sound", "bonprinter-sound", setSoundOn);
    loadBool("show_price", "bonprinter-show-price", setShowPrices);
    loadBool("print_report", "bonprinter-print-report", setPrintReportActive);
    loadBool("pos_mode", "bonprinter-pos-mode", setPcRegisterActive);
    loadText("SETTINGS", "darkmode", "bonprinter-theme", setDemoTheme);
    loadText("SETTINGS", "language", "bonprinter-language", (value) => {
      if (value === "English" || value === "Deutsch") setDemoLang(value);
    });
  }, []);
  const changePrinterPort = useCallback((value: string) => {
    setPrinterPort(value);
    writeSetting("PRINTER", "com_port", "bonprinter-printer-port", value);
  }, []);
  const changePaperWidth = useCallback((value: string) => {
    setPaperWidth(value);
    writeSetting("PRINTER", "paper_width", "bonprinter-paper-width", value);
  }, []);
  const changeCardReader = useCallback((value: string) => {
    setCardReader(value);
    writeSetting("PRINTER", "reader", "bonprinter-card-reader", value);
  }, []);
  const changeDisplayPort = useCallback((value: string) => {
    setDisplayPort(value);
    writeSetting("PRINTER", "display_port", "bonprinter-display-port", value);
  }, []);
  const changeSoundOn = useCallback((value: boolean) => {
    setSoundOn(value);
    writeSetting("SETTINGS", "sound", "bonprinter-sound", String(value));
  }, []);
  const changeShowPrices = useCallback((value: boolean) => {
    setShowPrices(value);
    writeSetting("SETTINGS", "show_price", "bonprinter-show-price", String(value));
  }, []);
  const changePrintReportActive = useCallback((value: boolean) => {
    setPrintReportActive(value);
    writeSetting("SETTINGS", "print_report", "bonprinter-print-report", String(value));
  }, []);
  const changePcRegisterActive = useCallback((value: boolean) => {
    setPcRegisterActive(value);
    writeSetting("SETTINGS", "pos_mode", "bonprinter-pos-mode", String(value));
  }, []);
  const changeDemoTheme = useCallback((value: string) => {
    setDemoTheme(value);
    writeSetting("SETTINGS", "darkmode", "bonprinter-theme", value);
  }, []);
  const changeDemoLang = useCallback((value: Lang) => {
    setDemoLang(value);
    writeSetting("SETTINGS", "language", "bonprinter-language", value);
  }, []);
  const printer = usePrinter(
    !!enablePrinter,
    printerPort === "None" ? null : printerPort,
    paperWidth.startsWith("58") ? PAPER_WIDTH_58 : PAPER_WIDTH_80,
  );
  const [reportMode, setReportMode] = useState(false);
  const [cardPayments, setCardPayments] = useState<Record<string, number>>({});
  const [cardPaidThisPrint, setCardPaidThisPrint] = useState(false);
  // amount sent to the card terminal (set on EC payment, reset with the session)
  const [terminalAmount, setTerminalAmount] = useState(0);
  // last printed bon shown on the device printer (website demo); null until printed
  const [lastBon, setLastBon] = useState<{ name: string; price: number } | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { minimize, close } = useWindowState();
  const [confirmClose, setConfirmClose] = useState(false);

  /** Closes the settings menu and any open submenu. */
  function closeSettings() {
    setSettingsOpen(false);
    setOpenSub(null);
  }

  const loggedOut = user === null;
  const freeMode = user === "Free";
  // Host and Admin share the manager view: no article grid, just the report.
  const isManager = user === "Host" || user === "Admin";
  // Admin has the extra rights Host does not (e.g. the factory reset).
  const isAdmin = user === "Admin";
  // Reset is reachable as Admin, or while logged out with Admin selected (so a
  // forgotten Admin password can still be recovered via the reset code).
  const canReset = isAdmin || (loggedOut && pwUser === "Admin");
  const isOperator = !!user && /^B\d+$/.test(user);

  // RFID/NFC login: map every configured card UID (normalized) to its user, and
  // log that user in when the local NFC bridge reports a matching card.
  const uidToUser = useMemo(() => {
    const map = new Map<string, string>();
    for (const [key, cfg] of Object.entries(users)) {
      for (const id of cfg.uid ?? []) map.set(id.replace(/\s+/g, "").toUpperCase(), key);
    }
    return map;
  }, [users]);
  const lang = demoLang;
  const t = T[lang];
  const availableReaders = useNfcLogin((uid, notify) => {
    const norm = uid.replace(/\s+/g, "").toUpperCase();
    if (isManager) {
      // Admin/Host: copy the scanned card UID to the clipboard and show it.
      void navigator.clipboard?.writeText(uid).catch(() => undefined);
      showStatus(`${t.cardId}: ${uid}`);
      notify("success");
    } else if (!loggedOut) {
      // A regular user is already logged in: switching via card is not allowed,
      // so reject the tap (two orange beeps) instead of logging anyone in.
      notify("blocked");
    } else {
      // Logged out: log in the matching user (or signal an unknown card).
      const key = uidToUser.get(norm);
      if (key !== undefined) {
        playSfx("unlock");
        setUser(key);
        resetSession();
        notify("success");
      } else {
        notify("fail");
      }
    }
  });
  /**
   * Translates an internal theme key into its localized menu label.
   *
   * @param v - internal theme key (e.g. "Hell", "Dunkel")
   * @returns the localized label for the current language
   */
  const themeLabel = (v: string) =>
    ({ Automatisch: t.auto, Hell: t.light, Dunkel: t.dark, Systemstandard: t.system })[v] ?? v;

  /**
   * Computes whether the demo renders in dark mode for the selected theme.
   *
   * @remarks
   * Hell/Dunkel are static. Systemstandard follows the website and Automatisch
   * uses the time of day - both are client-dependent and only evaluated after
   * mount, otherwise a hydration mismatch occurs.
   * @returns true if dark mode should be active
   */
  function computeDemoDark(): boolean {
    let result: boolean;
    switch (demoTheme) {
      case "Dunkel":
        result = true;
        break;
      case "Hell":
        result = false;
        break;
      case "Systemstandard":
        result = mounted && resolvedTheme === "dark";
        break;
      default: {
        // "Automatisch": light by day, dark at night
        if (!mounted) {
          result = false;
        } else {
          const h = new Date().getHours();
          result = h < DAY_START_HOUR || h >= NIGHT_START_HOUR;
        }
      }
    }
    return result;
  }
  const demoDark = computeDemoDark();
  /**
   * Builds the icon path for the current theme (light or dark variant).
   *
   * @param name - base icon name (without theme suffix or extension)
   * @returns the public path to the matching themed icon
   */
  const iconSrc = (name: string) => `/pos-demo/${name}_${demoDark ? "dark" : "light"}.png`;
  // Play a sound effect for key presses, gated on the sound setting.
  const playSfx = (name: SoundName) => {
    if (soundOn) playSound(name);
  };

  // Report login status, language and theme to the demo page (for its explanatory text)
  useEffect(() => {
    onContext?.({
      loggedOut,
      lang,
      demoDark,
      terminalAmount,
      lastBon,
      header1: articles.header1,
      header2: articles.header2,
    });
  }, [onContext, loggedOut, lang, demoDark, terminalAmount, lastBon, articles.header1, articles.header2]);

  const articlesTotal = order.reduce((sum, l) => sum + l.price * l.qty, 0);
  // Deposit (Pfand) lines shown after the articles, sorted by amount ascending.
  const depositRows = Object.entries(deposits)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, amount: Number(key), count }))
    .sort((a, b) => a.amount - b.amount);
  const depositTotal = depositRows.reduce((sum, d) => sum + d.amount * d.count, 0);
  const total = articlesTotal + depositTotal;
  const paperRemaining = Math.max(0, PAPER_ROLL_M - paperUsed);
  const paperPercent = Math.max(0, Math.round((paperRemaining / PAPER_ROLL_M) * 100));

  /**
   * Shows a short-lived toast message.
   *
   * @param msg - text to display; it disappears automatically after a moment
   */
  function showToast(msg: string) {
    if (hideToasts) return;
    setToast(msg);
    window.setTimeout(() => setToast(null), TOAST_MS);
  }

  /**
   * Shows a message in the status bar for a few seconds.
   *
   * @param msg - text to display
   * @param tone - visual emphasis; "warn" highlights the message
   */
  function showStatus(msg: string, tone: "normal" | "warn" = "normal") {
    if (statusTimer.current !== null) {
      clearTimeout(statusTimer.current);
    }
    setStatusMsg(msg);
    setStatusTone(tone);
    statusTimer.current = window.setTimeout(() => {
      setStatusMsg(null);
      statusTimer.current = null;
    }, STATUS_MS);
  }

  /** Clears the current order and all transient session state (selection, numpad, etc.). */
  function resetSession() {
    setOrder([]);
    setPrinted(false);
    setSelected(null);
    setChangeResult(null);
    setNumpadMode(null);
    setNumInput("");
    setMultiplier(1);
    setCancelled(false);
    setCardPaidThisPrint(false);
    setDeposits({});
    setSelectedDeposit(null);
    setPwUser(null);
    setPwInput("");
    setTerminalAmount(0);
  }

  /** Logs the current user out and resets the session. */
  function handleLock() {
    playSfx("touch");
    setUser(null);
    resetSession();
  }

  /**
   * Factory reset (Admin only): clears all collected data and settings back to
   * their defaults, logs out and closes the app window.
   */
  function resetToDefault() {
    setUser(null);
    resetSession();
    setPrintHistory({});
    clearPrintLog(); // wipe the persisted print log on factory reset (desktop build)
    setCardPayments({});
    setMarked(new Set(grid.flatMap((c) => (c?.mark ? [c.name] : []))));
    setPaperUsed(PAPER_START_M);
    // Reset the persisted settings (registry / localStorage) back to defaults too.
    changeSoundOn(false);
    changeDemoTheme("Hell");
    changeDemoLang(DEFAULT_LANG);
    changeShowPrices(true);
    setReportMode(false);
    changePrintReportActive(true);
    changePcRegisterActive(false);
    changePrinterPort("None");
    changePaperWidth("58 mm");
    changeCardReader("None");
    changeDisplayPort("None");
    setResetOpen(false);
    setResetInput("");
    setResetError(false);
    setHelpOpen(false);
    close();
  }

  /** Validates the entered reset code and runs the reset, or flags a wrong code. */
  function submitReset() {
    if (resetInput === RESET_CODE) {
      resetToDefault();
    } else {
      setResetError(true);
    }
  }

  /**
   * Resolves a login cell to its user.ini key, or null for digit keys.
   *
   * @param cell - the login key
   * @returns the user key ("B1", "Admin", …) or null for digit keys
   */
  function loginKey(cell: LoginCell): string | null {
    let key: string | null = null;
    if (cell.t === "op") key = cell.label;
    else if (cell.t === "sp") key = cell.id;
    return key;
  }

  /**
   * Classifies a user's password: direct login, numeric PIN, or locked.
   *
   * @param key - user key, or null for digit keys
   * @returns "none" (direct login), "numeric" (PIN) or "locked"
   */
  function pwKind(key: string | null): "none" | "numeric" | "locked" {
    let kind: "none" | "numeric" | "locked" = "locked";
    if (key !== null) {
      const cfg = users[key];
      if (cfg !== undefined) {
        const pw = cfg.pw ?? "";
        if (pw === "") kind = "none";
        else if (/^\d+$/.test(pw)) kind = "numeric";
      }
    }
    return kind;
  }

  /**
   * Returns the configured name for an operator slot (B1..B15), or null when
   * none is set. Only operators carry a name in user.ini.
   *
   * @param key - user key
   * @returns the operator name, or null
   */
  function operatorName(key: string): string | null {
    return /^B\d+$/.test(key) ? (users[key]?.name ?? null) : null;
  }

  /**
   * Handles a tap on a login user: logs in directly when no password is set,
   * or starts PIN entry when a numeric password is set. Locked users do nothing.
   *
   * @param cell - the login key that was pressed
   */
  function handleLogin(cell: LoginCell) {
    const key = loginKey(cell);
    const kind = pwKind(key);
    if (key !== null && kind === "none") {
      playSfx("unlock");
      setUser(key);
      resetSession();
    } else if (key !== null && kind === "numeric") {
      playSfx("touch");
      setPwUser(key);
      setPwInput("");
    }
  }

  /**
   * Appends a digit to the current PIN entry and logs in once it matches.
   * One digit too many restarts the entry.
   *
   * @param d - the pressed digit
   */
  function handlePwDigit(d: string) {
    playSfx("touch");
    if (pwUser !== null) {
      const pw = users[pwUser]?.pw ?? "";
      const next = pwInput + d;
      if (next.length > pw.length) {
        setPwInput(d);
      } else if (next.length === pw.length && next === pw) {
        playSfx("unlock");
        setUser(pwUser);
        resetSession();
      } else {
        setPwInput(next);
      }
    }
  }

  /** Removes the last entered PIN digit during password entry. */
  function handlePwDelete() {
    playSfx("clear");
    setPwInput(pwInput.slice(0, -1));
  }

  /** Clears the last printout still shown after an operator logged out. */
  function clearReview() {
    playSfx("clear");
    resetSession();
  }

  /**
   * Starts the long-press timer for an article. A 1 second press toggles the
   * orange highlight for that article (the highlight is persisted).
   *
   * @param name - article name being pressed
   */
  function startPress(name: string) {
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      setMarked((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    }, LONG_PRESS_MS);
  }
  /** Cancels a pending long-press timer (called on pointer up or leave). */
  function endPress() {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  /**
   * Adds an article to the order, honoring the current quantity multiplier and
   * free mode. After a printout it starts a fresh order instead of appending.
   *
   * @param a - the article to add
   */
  function addArticle(a: Article) {
    playSfx("touch");
    setSelected(null);
    setSelectedDeposit(null);
    setChangeResult(null);
    const price = freeMode ? 0 : a.price;
    const depositKey = a.deposit ? String(a.deposit) : null;
    if (printed) {
      setPrinted(false);
      setCancelled(false);
      setCardPaidThisPrint(false);
      setOrder([{ name: a.name, price, qty: multiplier, taxGroup: a.taxGroup, deposit: a.deposit }]);
      setDeposits(depositKey ? { [depositKey]: multiplier } : {});
      setMultiplier(1);
      setAddTick((n) => n + 1);
    } else {
      setOrder((prev) => {
        const existing = prev.find((l) => l.name === a.name);
        let next: OrderLine[];
        if (existing) {
          next = prev.map((l) => (l.name === a.name ? { ...l, qty: l.qty + multiplier } : l));
        } else {
          next = sortByGrid(
            [...prev, { name: a.name, price, qty: multiplier, taxGroup: a.taxGroup, deposit: a.deposit }],
            articleRank,
          );
        }
        return next;
      });
      if (depositKey) {
        setDeposits((d) => ({ ...d, [depositKey]: (d[depositKey] ?? 0) + multiplier }));
      }
      setMultiplier(1);
      setAddTick((n) => n + 1);
    }
  }

  /**
   * Handles the "X" key: opens quantity entry when idle, and confirms the
   * entered quantity as the multiplier when already in quantity mode.
   */
  function handleX() {
    playSfx("touch");
    if (numpadMode === "qty") {
      const n = parseInt(numInput, 10);
      setMultiplier(n >= 1 ? n : 1);
      setNumpadMode(null);
      setNumInput("");
    } else if (numpadMode === null) {
      setNumInput("");
      setNumpadMode("qty");
      setSelected(null);
    }
  }

  /**
   * Handles the change ("RCH") key: opens change entry after a printout, and
   * computes the change (given minus total) when already in change mode.
   */
  function handleRch() {
    playSfx("touch");
    if (numpadMode === "change") {
      const given = parseFloat(numInput || "0");
      const g = isNaN(given) ? 0 : given;
      setChangeResult({ total, given: g, back: g - total });
      setNumpadMode(null);
      setNumInput("");
    } else if (numpadMode === null && printed) {
      setNumInput("");
      setChangeResult(null);
      setNumpadMode("change");
      setSelected(null);
    }
  }

  /**
   * Appends a digit (or decimal point) to the numpad input, enforcing valid
   * number formatting: single decimal point, at most two decimals, max length.
   *
   * @param d - the pressed key, a digit, "00" or "."
   */
  function pressDigit(d: string) {
    playSfx("touch");
    setNumInput((prev) => {
      let result: string;
      if (d === ".") {
        if (prev.includes(".")) {
          result = prev;
        } else {
          result = prev === "" ? "0." : prev + ".";
        }
      } else {
        let next = prev + d;
        if (!prev.includes(".")) {
          next = next.replace(/^0+(?=\d)/, "");
        }
        let tooManyDecimals = false;
        if (next.includes(".")) {
          const [intPart, decPart] = next.split(".");
          if (decPart.length > 2) {
            tooManyDecimals = true;
          } else {
            next = intPart + "." + decPart;
          }
        }
        result = tooManyDecimals ? prev : next.slice(0, NUM_INPUT_MAX_LEN);
      }
      return result;
    });
  }

  /**
   * Selects a cell in the order list for the next delete action.
   *
   * @param i - index of the order line
   * @param mode - which part is selected: whole "line", "qty" or single "one"
   */
  function selectAt(i: number, mode: "line" | "qty" | "one") {
    setSelected({ index: i, mode });
    setSelectedDeposit(null);
  }

  /**
   * Removes one deposit unit of the given amount.
   *
   * @param key - deposit amount key
   */
  const removeOneDeposit = (key: string) => {
    setDeposits((d) => {
      const next = { ...d };
      const count = (next[key] ?? 0) - 1;
      if (count > 0) next[key] = count;
      else delete next[key];
      return next;
    });
  };

  /**
   * Caps each deposit count to the number of remaining articles carrying it.
   *
   * @param lines - the current order lines after a change
   */
  const capDepositsTo = (lines: OrderLine[]) => {
    setDeposits((d) => {
      const next: Record<string, number> = {};
      for (const [key, count] of Object.entries(d)) {
        const max = lines.reduce((s, l) => (l.deposit === Number(key) ? s + l.qty : s), 0);
        const capped = Math.min(count, max);
        if (capped > 0) next[key] = capped;
      }
      return next;
    });
  };

  /**
   * Handles the delete ("ENTF") key: removes the whole order when nothing is
   * selected, the selected line, or one unit depending on the selection mode.
   */
  function handleEntf() {
    playSfx("clear");
    if (selectedDeposit !== null) {
      // a deposit row is selected: remove one deposit unit
      removeOneDeposit(selectedDeposit);
      setSelectedDeposit(null);
    } else if (order.length !== 0 && !printed) {
      let next = order;
      if (selected === null) {
        next = [];
      } else {
        const { index, mode } = selected;
        const line = order[index];
        if (!line) {
          setSelected(null);
        } else if (mode === "line") {
          // Price selected: delete the whole line
          next = order.filter((_, i) => i !== index);
          setSelected(null);
        } else if (line.qty > 1) {
          // Quantity/name selected: remove one unit
          next = order.map((l, i) => (i === index ? { ...l, qty: l.qty - 1 } : l));
          if (mode === "one") setSelected(null); // name selected: the cursor disappears
          // quantity selected ("qty"): the cursor stays for repeated deletes
        } else {
          next = order.filter((_, i) => i !== index);
          setSelected(null);
        }
      }
      setOrder(next);
      // deleting articles caps the deposits to the remaining article count
      capDepositsTo(next);
    }
  }

  /**
   * Appends the current order to the user's print history.
   *
   * @param isCancelled - whether the lines are recorded as a cancellation
   */
  function recordPrint(isCancelled: boolean) {
    if (user) {
      const lines = order.map((l) => ({ ...l, cancelled: isCancelled }));
      setPrintHistory((prev) => ({ ...prev, [user]: [...(prev[user] ?? []), ...lines] }));
    }
  }

  /**
   * Performs a printout (normal or cancellation): consumes paper, records history, shows
   * feedback and locks the order. Operators and Free are logged out afterwards.
   *
   * @param isCancelled - whether this is a cancellation instead of a normal printout
   */
  function doPrint(isCancelled: boolean) {
    const count = order.reduce((s, l) => s + l.qty, 0);
    if (count > MAX_PRINT_ITEMS) {
      showStatus(t.maxItems, "warn");
    } else {
      playSfx("cash");
      setPaperUsed((p) => p + count * PAPER_PER_ITEM_M);
      recordPrint(isCancelled);
      if (!isCancelled && articles.printArticle) {
        // Drive the real ESC/POS printer (desktop build): one bon per item amount.
        // Non-Free users always print the price; Free users only when configured.
        printer.printOrder(order, {
          user: user ?? "",
          date: formatBonDate(new Date()),
          showPrice: !freeMode || articles.printFreePrice,
          header1: articles.header1,
          header2: articles.header2,
        });
        // Show the last printed bon on the device printer (website demo): the
        // order line whose article has the highest grid number is printed last.
        // The name is truncated exactly like the printout (line width / 2 chars).
        const lineWidth = paperWidth.startsWith("58") ? LINE_WIDTH_58 : LINE_WIDTH_80;
        const nameMax = Math.floor(lineWidth / 2);
        let lastName = "";
        let lastPrice = 0;
        let highestNumber = -1;
        for (const line of order) {
          const index = grid.findIndex((cell) => cell?.name === line.name);
          if (index === -1) continue;
          const number = gridNumberAt(index, rows, cols);
          if (number > highestNumber) {
            highestNumber = number;
            lastName = line.name.replace(/\n/g, "").slice(0, nameMax);
            lastPrice = line.price;
          }
        }
        if (lastName) setLastBon({ name: lastName, price: lastPrice });
      }
      {
        // Persist the sale to PrintLog.csv next to the exe (desktop build); the
        // report is built from it. Columns match the reference PRINT_FILE_HEADER.
        // A cancellation (Storno) is logged with printer "None" and a negative total.
        const logDate = formatBonDate(new Date());
        const logRows = order.map((line) => {
          const index = grid.findIndex((cell) => cell?.name === line.name);
          const articleNumber = index === -1 ? 0 : gridNumberAt(index, rows, cols);
          const total = (isCancelled ? -1 : 1) * line.price * line.qty;
          return [
            line.qty,
            line.name.replace(/\n/g, " "),
            articleNumber,
            line.taxGroup,
            total.toFixed(2),
            user ?? "",
            logDate,
            isCancelled ? "None" : printerPort,
          ];
        });
        appendPrintLog(logRows);
      }
      showToast(t.printed);
      showStatus(`${isCancelled ? t.statusVoid : t.statusPrinted} ${user ?? ""}`);
      if (isOperator) {
        // Operators (B1-B15) are logged out, but the printed order and total stay
        // visible so the last printout can still be reviewed; the next login clears it.
        setUser(null);
        setSelected(null);
        setCancelled(isCancelled);
        setPrinted(true);
      } else if (freeMode) {
        // Free is logged out and the session is cleared right away
        setUser(null);
        resetSession();
      } else {
        setSelected(null);
        setCancelled(isCancelled);
        setPrinted(true);
      }
    }
  }

  /**
   * Handles the print/open key: opens the cash drawer when the order is empty
   * or already printed, otherwise prints the current order.
   */
  function handlePrintOrOpen() {
    if (printed || order.length === 0) {
      playSfx("touch");
      printer.openDrawer();
      showToast(t.drawerOpened);
      showStatus(t.statusDrawer);
    } else {
      doPrint(false);
    }
  }

  /**
   * Records the current total as a card payment for the user, once per printout
   * (not in cancellation or free mode).
   */
  function handleCardPayment() {
    playSfx("touch");
    if (user && printed && !cardPaidThisPrint && !cancelled && !freeMode) {
      const amount = total;
      setCardPayments((prev) => ({ ...prev, [user]: (prev[user] ?? 0) + amount }));
      setTerminalAmount(amount);
      setCardPaidThisPrint(true);
      showToast(t.cardPayment);
      showStatus(t.statusCard);
    }
  }

  /** Opens the cancellation confirmation dialog for the current order. */
  function startCancel() {
    if (order.length !== 0 && !printed) {
      setConfirmCancel(true);
      setPrintoutsMenuOpen(false);
    }
  }

  // exact original colors
  const blue = "text-[#1976d2] dark:text-[#5fa8ee]";
  const grey = "text-[#bdbdbd] dark:text-slate-600";
  const cellBg = "bg-white dark:bg-slate-900";
  const cellBorder = "border border-[#a8a8a8] dark:border-slate-700"; // border only for filled cells

  const actionsDisabled = loggedOut || numpadMode !== null;
  // X active: to start a new order (also after a printout) OR to confirm in quantity mode
  const xDisabled = loggedOut || isManager || numpadMode === "change";
  // RCH active: to open (after a printout, not in free mode) OR to confirm in change mode
  const rchDisabled = loggedOut || isManager || numpadMode === "qty" || (numpadMode === null && (!printed || freeMode));

  /**
   * Returns the Tailwind classes for a login key based on its type/id.
   *
   * @param cell - the login key to style
   * @param locked - whether the key is locked (non-numeric password, not selectable)
   * @param active - whether this key is the user currently entering a PIN
   * @returns the CSS class string for that key
   */
  function loginCellClass(cell: LoginCell, locked: boolean, active: boolean): string {
    let result: string;
    if (cell.t === "num") {
      result =
        pwUser !== null
          ? `${cellBg} ${blue} hover:bg-[#f5f9ff] dark:hover:bg-slate-800`
          : `${cellBg} ${grey} cursor-default`;
    } else if (cell.t === "op") {
      // operator slots keep their light-blue background; locked ones are not clickable
      result = locked
        ? `${blue} bg-[#bcdcf7] dark:bg-sky-900/50`
        : `${blue} bg-[#bcdcf7] hover:bg-[#a9d0f0] dark:bg-sky-900/50 dark:hover:bg-sky-900/70`;
    } else {
      switch (cell.id) {
        case "Admin":
          result = "bg-[#e53935] text-white hover:bg-[#d32f2f]";
          break;
        case "Host":
          result = "bg-[#9e3030] text-white hover:bg-[#883030]";
          break;
        case "Free":
          result = "bg-[#1f9e1f] text-white hover:bg-[#1a8a1a]";
          break;
        case "Local":
          result = "bg-[#1565d0] text-white hover:bg-[#1257b8]";
          break;
        case "SmartCard":
          result = "bg-[#cccccc] text-[#888888] cursor-default dark:bg-slate-700 dark:text-slate-500";
          break;
      }
    }
    return active ? `${result} ring-2 ring-inset ring-yellow-400` : result;
  }

  // Article background (green in free mode)
  const articleBg = freeMode
    ? "bg-[#86efac] hover:bg-[#6ee7a0] dark:bg-green-700/50 dark:hover:bg-green-700/70"
    : `${cellBg} hover:bg-[#f5f9ff] dark:hover:bg-slate-800`;

  return (
    <div className={fillMode ? "h-full w-full" : "overflow-x-auto"}>
      <div
        className={
          fillMode
            ? "relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-slate-900"
            : "relative w-[740px] overflow-hidden rounded-lg border-2 border-[#8a8f96] bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900"
        }
      >
        {/* Title bar (hidden in the standalone desktop build) */}
        {!hideTitleBar && (
          <div className="flex items-center justify-between bg-[#f8f8f8] px-3 py-1.5 text-sm dark:bg-slate-800">
            <span className="flex select-none items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              <img src="/pos-demo/app.png" alt="" className="h-4 w-4" />
              BonPrinter
            </span>
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
              {/* Minimize button: a wide horizontal bar */}
              <button
                type="button"
                onClick={minimize}
                className="flex h-3 w-3 items-center justify-center transition hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Minimieren"
              >
                <span className="block h-[1.5px] w-2.5 rounded-full bg-current" />
              </button>
              {/* Restore/fullscreen icon: two overlapping squares */}
              <span className="relative inline-block h-3 w-3" aria-label="Vollbild">
                <span className="absolute right-0 top-0 h-[9px] w-[9px] border border-current" />
                <span className="absolute bottom-0 left-0 h-[9px] w-[9px] border border-current bg-[#f8f8f8] dark:bg-slate-800" />
              </span>
              {/* Close button */}
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="flex h-3 w-3 items-center justify-center text-sm leading-none transition hover:text-[#d32f2f]"
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Menu bar (stays at constant size in fill mode) */}
        <div className="flex shrink-0 gap-1 border-b border-[#a8a8a8] bg-[#f8f8f8] px-2 py-1 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {(loggedOut
            ? ["Einstellungen", "Hilfe"]
            : [
                ...(isAdmin || printReportActive ? ["Ausdrucke"] : []),
                ...(isAdmin ? ["Konfiguration"] : []),
                "Einstellungen",
                "Hilfe",
              ]
          ).map((label) =>
            label === "Konfiguration" ? (
              <ConfigMenu
                key={label}
                lang={lang}
                demoDark={demoDark}
                printerPort={printerPort}
                setPrinterPort={changePrinterPort}
                paperWidth={paperWidth}
                setPaperWidth={changePaperWidth}
                cardReader={cardReader}
                setCardReader={changeCardReader}
                displayPort={displayPort}
                setDisplayPort={changeDisplayPort}
                liveHardware={printer.active}
                availablePorts={printer.availablePorts}
                availableReaders={availableReaders}
                onEditArticles={() => setArticleEditorOpen(true)}
              />
            ) : label === "Einstellungen" ? (
              <div key={label} className="relative">
                <button
                  type="button"
                  onClick={() => (settingsOpen ? closeSettings() : setSettingsOpen(true))}
                  className={`rounded px-2 py-0.5 hover:bg-[#e5e5e5] dark:hover:bg-slate-700 ${
                    settingsOpen ? "bg-[#e5e5e5] dark:bg-slate-700" : ""
                  }`}
                >
                  {t.settings}
                </button>
                {settingsOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Menü schließen"
                      onClick={closeSettings}
                      className="fixed inset-0 z-20 cursor-default"
                    />
                    <div className="absolute left-0 top-full z-30 mt-1 w-60 rounded-md border border-[#a8a8a8] bg-white py-1 text-slate-700 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => changeSoundOn(!soundOn)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                      >
                        <img src={iconSrc(soundOn ? "sound" : "sound_mute")} alt="" className="h-[18px] w-[18px]" />
                        <span>{t.sound}</span>
                      </button>
                      {/* Theme submenu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenSub(openSub === "theme" ? null : "theme")}
                          className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700 ${
                            openSub === "theme" ? "bg-[#f0f0f0] dark:bg-slate-700" : ""
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <img src={iconSrc("theme")} alt="" className="h-[18px] w-[18px]" />
                            {t.theme}
                          </span>
                          <ChevronRight size={16} className="text-slate-400" />
                        </button>
                        {openSub === "theme" && (
                          <div className="absolute left-full top-0 z-40 ml-px w-44 rounded-md border border-[#a8a8a8] bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-800">
                            {["Automatisch", "Hell", "Dunkel", "Systemstandard"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  changeDemoTheme(opt);
                                  closeSettings();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={demoTheme === opt}
                                  readOnly
                                  className="pointer-events-none h-4 w-4 accent-brand-600"
                                />
                                <span>{themeLabel(opt)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Language submenu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenSub(openSub === "lang" ? null : "lang")}
                          className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700 ${
                            openSub === "lang" ? "bg-[#f0f0f0] dark:bg-slate-700" : ""
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <img src={iconSrc("language")} alt="" className="h-[18px] w-[18px]" />
                            {t.language}
                          </span>
                          <ChevronRight size={16} className="text-slate-400" />
                        </button>
                        {openSub === "lang" && (
                          <div className="absolute left-full top-0 z-40 ml-px w-40 rounded-md border border-[#a8a8a8] bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-800">
                            {LANGUAGES.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  changeDemoLang(opt);
                                  closeSettings();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={demoLang === opt}
                                  readOnly
                                  className="pointer-events-none h-4 w-4 accent-brand-600"
                                />
                                <img
                                  src={`/pos-demo/language_${opt === "Deutsch" ? "german" : "english"}.png`}
                                  alt=""
                                  className="h-4 w-4"
                                />
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-[#f0f0f0] dark:hover:bg-slate-700">
                        <input
                          type="checkbox"
                          checked={showPrices}
                          onChange={(e) => changeShowPrices(e.target.checked)}
                          className="h-4 w-4 accent-brand-600"
                        />
                        <span>{t.showPrices}</span>
                      </label>
                      <div className="my-1 border-t border-[#e0e0e0] dark:border-slate-700" />
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmPaper(true);
                          closeSettings();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                      >
                        <img src={iconSrc("paper_change")} alt="" className="h-[18px] w-[18px]" />
                        <span>{t.paperChanged}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : label === "Ausdrucke" ? (
              <div key={label} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setPrintoutsMenuOpen((o) => !o);
                    setCombineSubOpen(false);
                  }}
                  className={`rounded px-2 py-0.5 hover:bg-[#e5e5e5] dark:hover:bg-slate-700 ${
                    printoutsMenuOpen ? "bg-[#e5e5e5] dark:bg-slate-700" : ""
                  }`}
                >
                  {t.printouts}
                </button>
                {printoutsMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Menü schließen"
                      onClick={() => {
                        setPrintoutsMenuOpen(false);
                        setCombineSubOpen(false);
                      }}
                      className="fixed inset-0 z-20 cursor-default"
                    />
                    <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md border border-[#a8a8a8] bg-white py-1 text-slate-700 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {printReportActive && (
                        <button
                          type="button"
                          disabled={!hasSales}
                          onClick={() => {
                            setReportMode(false);
                            setInterimOpen(true);
                            setPrintoutsMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${
                            hasSales
                              ? "hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                              : "text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          <img src={iconSrc("status")} alt="" className="h-[18px] w-[18px]" />
                          <span>{t.interimItem}</span>
                        </button>
                      )}
                      {printReportActive &&
                        (isManager ? (
                          <>
                            <div className="my-1 border-t border-[#e0e0e0] dark:border-slate-700" />
                            <button
                              type="button"
                              disabled={!hasSales}
                              onClick={() => {
                                setReportMode(true);
                                setInterimOpen(true);
                                setPrintoutsMenuOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${
                                hasSales
                                  ? "hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                                  : "text-slate-400 dark:text-slate-600"
                              }`}
                            >
                              <img src={iconSrc("report")} alt="" className="h-[18px] w-[18px]" />
                              <span>{t.reportItem}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={startCancel}
                            disabled={order.length === 0 || printed}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${
                              order.length === 0 || printed
                                ? "text-slate-400 dark:text-slate-600"
                                : "hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                            }`}
                          >
                            <img src={iconSrc("cancellation")} alt="" className="h-[18px] w-[18px]" />
                            <span>{t.voidItem}</span>
                          </button>
                        ))}
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setExplorerOpen(true);
                              setPrintoutsMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                          >
                            <img src={iconSrc("open_folder")} alt="" className="h-[18px] w-[18px]" />
                            <span>{t.openFolder}</span>
                          </button>
                          {/* Combine report: submenu with two (decorative, non-functional) entries */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setCombineSubOpen((o) => !o)}
                              className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700 ${
                                combineSubOpen ? "bg-[#f0f0f0] dark:bg-slate-700" : ""
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <img src={iconSrc("combine")} alt="" className="h-[18px] w-[18px]" />
                                {t.combineReport}
                              </span>
                              <ChevronRight size={16} className="text-slate-400" />
                            </button>
                            {combineSubOpen && (
                              <div className="absolute left-full top-0 z-40 ml-px w-60 rounded-md border border-[#a8a8a8] bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-800">
                                <button
                                  type="button"
                                  className="flex w-full items-center px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                                >
                                  <span>{t.payoutManual}</span>
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-center px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                                >
                                  <span>{t.payoutAuto}</span>
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Print file (decorative, non-functional) */}
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                          >
                            <img src={iconSrc("print_file")} alt="" className="h-[18px] w-[18px]" />
                            <span>{t.printFile}</span>
                          </button>
                          {/* Print preview: tabular overview of all programmed articles */}
                          <button
                            type="button"
                            onClick={() => {
                              setPrintPreviewOpen(true);
                              setPrintoutsMenuOpen(false);
                              setCombineSubOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                          >
                            <img src={iconSrc("print_preview")} alt="" className="h-[18px] w-[18px]" />
                            <span>{t.printPreview}</span>
                          </button>
                          {/* Toggle: hide the report printouts (interim / report) for everyone */}
                          <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-[#f0f0f0] dark:hover:bg-slate-700">
                            <input
                              type="checkbox"
                              checked={printReportActive}
                              onChange={(e) => changePrintReportActive(e.target.checked)}
                              className="h-4 w-4 accent-brand-600"
                            />
                            <span>{t.printReportActivate}</span>
                          </label>
                          {/* PC register toggle (decorative, non-functional) */}
                          <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-[#f0f0f0] dark:hover:bg-slate-700">
                            <input
                              type="checkbox"
                              checked={pcRegisterActive}
                              onChange={(e) => changePcRegisterActive(e.target.checked)}
                              className="h-4 w-4 accent-brand-600"
                            />
                            <span>{t.pcRegisterActivate}</span>
                          </label>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div key={label} className="relative">
                <button
                  type="button"
                  onClick={() => setHelpOpen((o) => !o)}
                  className={`rounded px-2 py-0.5 hover:bg-[#e5e5e5] dark:hover:bg-slate-700 ${
                    helpOpen ? "bg-[#e5e5e5] dark:bg-slate-700" : ""
                  }`}
                >
                  {t.help}
                </button>
                {helpOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Menü schließen"
                      onClick={() => setHelpOpen(false)}
                      className="fixed inset-0 z-20 cursor-default"
                    />
                    <div className="absolute left-0 top-full z-30 mt-1 w-40 rounded-md border border-[#a8a8a8] bg-white py-1 text-slate-700 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setAboutOpen(true);
                          setHelpOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                      >
                        <img src="/pos-demo/app.png" alt="" className="h-[18px] w-[18px]" />
                        <span>{t.about}</span>
                      </button>
                      {canReset && (
                        <>
                          <div className="my-1 border-t border-[#e0e0e0] dark:border-slate-700" />
                          <button
                            type="button"
                            onClick={() => {
                              setResetInput("");
                              setResetError(false);
                              setResetOpen(true);
                              setHelpOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700"
                          >
                            <RotateCcw size={18} className="text-slate-500 dark:text-slate-400" />
                            <span>{t.resetItem}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ),
          )}
        </div>

        {/* Body: in fill mode it is stretched to fill the area below the menu bar */}
        <div ref={bodyContainerRef} className={fillMode ? "relative min-h-0 flex-1 overflow-hidden" : "contents"}>
          <div
            ref={bodyRef}
            className={fillMode ? "absolute left-0 top-0 w-[740px]" : "contents"}
            style={
              fillMode ? { transform: `scale(${bodyScale.x}, ${bodyScale.y})`, transformOrigin: "top left" } : undefined
            }
          >
            <div className="grid grid-cols-[1.7fr_1fr]">
              {/* LEFT */}
              <div className="flex flex-col border-r border-[#a8a8a8] bg-white dark:border-slate-700 dark:bg-slate-900">
                {/* Grid: login / numpad / articles */}
                <div className="grid auto-rows-[68px] grid-cols-6">
                  {loggedOut
                    ? LOGIN.map((cell, i) => {
                        const isNum = cell.t === "num";
                        const key = loginKey(cell);
                        const locked = !isNum && pwKind(key) === "locked";
                        const active = key !== null && key === pwUser;
                        const name = cell.t === "op" ? operatorName(cell.label) : null;
                        const label = name ? `${cell.label}\n${name}` : cell.label;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => (isNum ? handlePwDigit(cell.label) : handleLogin(cell))}
                            disabled={locked || (isNum && pwUser === null)}
                            className={`flex flex-col items-center justify-center px-1 text-center text-[13px] font-medium leading-tight transition ${locked ? "" : "active:scale-95"} ${cellBorder} ${loginCellClass(cell, locked, active)}`}
                          >
                            {multiline(label)}
                          </button>
                        );
                      })
                    : isManager
                      ? Array.from({ length: grid.length }, (_, i) => (
                          <div
                            key={i}
                            className={`flex select-none items-center justify-center text-lg font-medium ${cellBorder} ${cellBg} text-slate-400 dark:text-slate-500`}
                          >
                            {gridNumberAt(i, rows, cols)}
                          </div>
                        ))
                      : numpadMode
                        ? numpadCells(numpadMode === "change").map((d, i) =>
                            d ? (
                              <button
                                key={i}
                                type="button"
                                onClick={() => pressDigit(d)}
                                className={`flex items-center justify-center text-2xl font-semibold transition active:scale-95 ${cellBorder} ${cellBg} ${blue} hover:bg-[#f5f9ff] dark:hover:bg-slate-800`}
                              >
                                {d}
                              </button>
                            ) : (
                              <div key={i} />
                            ),
                          )
                        : grid.map((cell, i) =>
                            cell ? (
                              <button
                                key={i}
                                type="button"
                                onPointerDown={() => startPress(cell.name)}
                                onPointerUp={endPress}
                                onPointerLeave={endPress}
                                onClick={() => {
                                  if (longPressFired.current) {
                                    longPressFired.current = false;
                                    return;
                                  }
                                  addArticle(cell);
                                }}
                                className={`flex select-none flex-col items-center justify-center px-1 text-center text-[12px] font-medium leading-tight transition active:scale-95 ${cellBorder} ${blue} ${
                                  marked.has(cell.name)
                                    ? "bg-[#fdba74] hover:bg-[#fcb265] dark:bg-orange-700/50 dark:hover:bg-orange-700/70"
                                    : articleBg
                                }`}
                                // bg/fg from articles.ini override the default colors (orange mark keeps priority)
                                style={marked.has(cell.name) ? undefined : { backgroundColor: cell.bg, color: cell.fg }}
                              >
                                <span className="block">{multiline(cell.name)}</span>
                                {showPrices && <span className="mt-1 block">{euro(cell.price)}</span>}
                              </button>
                            ) : (
                              <div key={i} />
                            ),
                          )}
                </div>

                {/* Action keys */}
                <div className="grid auto-rows-[68px] grid-cols-6">
                  <button
                    type="button"
                    onClick={handleLock}
                    disabled={loggedOut}
                    className={`flex items-center justify-center ${cellBorder} ${cellBg} ${
                      loggedOut
                        ? "text-[#bdbdbd] dark:text-slate-600"
                        : "text-slate-800 hover:bg-[#f5f5f5] dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                    title={loggedOut ? "Abgemeldet" : "Benutzer abmelden"}
                  >
                    <img src={iconSrc("lock")} alt="Lock" className={`h-8 w-8 ${loggedOut ? "opacity-30" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleX}
                    disabled={xDisabled}
                    className={`flex items-center justify-center text-2xl font-semibold ${cellBorder} ${cellBg} hover:bg-[#f5f9ff] dark:hover:bg-slate-800 ${
                      xDisabled ? grey : blue
                    }`}
                    title="Menge (Multiplikator)"
                  >
                    X
                  </button>
                  <button
                    type="button"
                    onClick={handleRch}
                    disabled={rchDisabled}
                    className={`flex items-center justify-center text-xl font-semibold ${cellBorder} ${cellBg} hover:bg-[#f5f9ff] dark:hover:bg-slate-800 ${
                      rchDisabled ? grey : blue
                    }`}
                    title="Rückgeld berechnen (nach dem Drucken)"
                  >
                    {t.calc}
                  </button>
                  {(() => {
                    const pwMode = pwUser !== null;
                    // after an operator logout the last printout stays visible: Entf clears it
                    const reviewMode = loggedOut && pwUser === null && order.length > 0;
                    const cardMode =
                      articles.ec &&
                      !loggedOut &&
                      printed &&
                      !cancelled &&
                      !freeMode &&
                      !numpadMode &&
                      !cardPaidThisPrint;
                    const entfDisabled = loggedOut || isManager || (!numpadMode && (order.length === 0 || printed));
                    const cardDisabled = loggedOut || isManager;
                    const disabled = pwMode
                      ? pwInput.length === 0
                      : reviewMode
                        ? false
                        : cardMode
                          ? cardDisabled
                          : entfDisabled;
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          pwMode
                            ? handlePwDelete()
                            : reviewMode
                              ? clearReview()
                              : cardMode
                                ? handleCardPayment()
                                : numpadMode
                                  ? setNumInput("")
                                  : handleEntf()
                        }
                        disabled={disabled}
                        className={`flex items-center justify-center text-xl font-semibold ${cellBorder} ${cellBg} ${
                          cardMode
                            ? disabled
                              ? grey
                              : `${blue} hover:bg-[#f5f9ff] dark:hover:bg-slate-800`
                            : disabled
                              ? "text-[#e6b3b3] dark:text-slate-600"
                              : "text-[#d32f2f] hover:bg-[#fff5f5] dark:text-[#f87171] dark:hover:bg-slate-800"
                        }`}
                        title={
                          pwMode || numpadMode
                            ? "Eingabe löschen"
                            : reviewMode
                              ? "Anzeige löschen"
                              : cardMode
                                ? "Kartenzahlung verbuchen"
                                : "Position(en) löschen"
                        }
                      >
                        {cardMode ? <img src="/pos-demo/ec.png" alt="EC" className="h-12 w-12" /> : t.clear}
                      </button>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={handlePrintOrOpen}
                    disabled={actionsDisabled || isManager}
                    className={`col-span-2 flex items-center justify-center text-3xl font-bold ${cellBorder} ${cellBg} hover:bg-[#f5f9ff] dark:hover:bg-slate-800 ${
                      actionsDisabled || isManager ? grey : blue
                    }`}
                    title={order.length === 0 || printed ? "Kassenlade öffnen" : "Wertmarken drucken"}
                  >
                    {order.length === 0 || printed ? t.open : t.print}
                  </button>
                </div>
              </div>

              {/* RIGHT: order table + display field */}
              <div className="relative">
                <div className="absolute inset-0 flex flex-col">
                  <div ref={listRef} className="min-h-0 flex-1 overflow-auto">
                    <div className="grid grid-cols-[2.5rem_1fr_5rem] text-[15px]">
                      <div className="sticky top-0 z-10 select-none border-b border-r border-[#a8a8a8] bg-[#e0e0e0] px-2 py-1.5 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        n
                      </div>
                      <div className="sticky top-0 z-10 select-none border-b border-r border-[#a8a8a8] bg-[#e0e0e0] px-2 py-1.5 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {t.article}
                      </div>
                      <div className="sticky top-0 z-10 select-none border-b border-[#a8a8a8] bg-[#e0e0e0] px-2 py-1.5 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {t.price}
                      </div>

                      {order.map((l, i) => {
                        const sel = selected?.index === i;
                        const m = sel ? selected!.mode : null;
                        const cellHi = "bg-[#bcdcf7] font-bold dark:bg-slate-600";
                        const rowBg = sel
                          ? "bg-[#e3f0fc] dark:bg-slate-800"
                          : marked.has(l.name)
                            ? "bg-[#fdba74] dark:bg-orange-700/40"
                            : "";
                        const hover = printed ? "cursor-default" : "hover:bg-[#eef6fd] dark:hover:bg-slate-700";
                        return (
                          <div key={i} className="contents">
                            <button
                              type="button"
                              onClick={() => selectAt(i, "qty")}
                              disabled={printed}
                              className={`border-b border-r border-[#c2c2c2] px-2 py-1 text-right text-slate-900 dark:border-slate-800 dark:text-slate-100 ${
                                m === "qty" ? cellHi : rowBg || hover
                              }`}
                            >
                              {l.qty}
                            </button>
                            <button
                              type="button"
                              onClick={() => selectAt(i, "one")}
                              disabled={printed}
                              className={`min-w-0 truncate border-b border-r border-[#c2c2c2] px-2 py-1 text-left text-slate-900 dark:border-slate-800 dark:text-slate-100 ${
                                m === "one" ? cellHi : rowBg || hover
                              }`}
                            >
                              {l.name.replace(/\n/g, "")}
                            </button>
                            <button
                              type="button"
                              onClick={() => selectAt(i, "line")}
                              disabled={printed}
                              className={`border-b border-[#c2c2c2] px-2 py-1 text-right tabular-nums text-slate-900 dark:border-slate-800 dark:text-slate-100 ${
                                m === "line" ? cellHi : rowBg || hover
                              }`}
                            >
                              {euro(l.price * l.qty)}
                            </button>
                          </div>
                        );
                      })}
                      {/* Deposit (Pfand) rows: red, always last, sorted by amount */}
                      {depositRows.map((d) => {
                        const sel = selectedDeposit === d.key;
                        const rowBg = sel ? "bg-[#e3f0fc] dark:bg-slate-800" : "";
                        const hover = printed ? "cursor-default" : "hover:bg-[#eef6fd] dark:hover:bg-slate-700";
                        const red = "text-[#d32f2f] dark:text-[#f87171]";
                        const pick = () => {
                          setSelectedDeposit(d.key);
                          setSelected(null);
                        };
                        return (
                          <div key={`deposit-${d.key}`} className="contents">
                            <button
                              type="button"
                              onClick={pick}
                              disabled={printed}
                              className={`border-b border-r border-[#c2c2c2] px-2 py-1 text-right dark:border-slate-800 ${red} ${rowBg || hover}`}
                            >
                              {d.count}
                            </button>
                            <button
                              type="button"
                              onClick={pick}
                              disabled={printed}
                              className={`min-w-0 truncate border-b border-r border-[#c2c2c2] px-2 py-1 text-left dark:border-slate-800 ${red} ${rowBg || hover}`}
                            >
                              PFAND ({euro(d.amount)})
                            </button>
                            <button
                              type="button"
                              onClick={pick}
                              disabled={printed}
                              className={`border-b border-[#c2c2c2] px-2 py-1 text-right tabular-nums dark:border-slate-800 ${red} ${rowBg || hover}`}
                            >
                              {euro(d.amount * d.count)}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Display field at the bottom right (green after printing) */}
                  <div
                    className={`flex h-[84px] flex-col justify-center border-t border-[#a8a8a8] px-4 dark:border-slate-700 ${
                      cancelled && numpadMode === null && !changeResult
                        ? "bg-[#fecaca] dark:bg-red-900/40"
                        : printed && cardPaidThisPrint && numpadMode === null && !changeResult
                          ? "bg-[#bfdbfe] dark:bg-blue-900/40"
                          : printed && numpadMode === null && !changeResult
                            ? "bg-[#bbf7d0] dark:bg-green-800/40"
                            : ""
                    }`}
                  >
                    {changeResult ? (
                      <div className="space-y-0.5 text-right text-sm tabular-nums text-slate-900 dark:text-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t.toPay}</span>
                          <span>{euro(changeResult.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t.given}</span>
                          <span>{euro(changeResult.given)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-500 dark:text-slate-400">{t.change}</span>
                          <span className={changeResult.back >= 0 ? blue : "text-[#d32f2f]"}>
                            {changeResult.back >= 0 ? euro(changeResult.back) : t.tooLittle}
                          </span>
                        </div>
                      </div>
                    ) : pwUser !== null ? (
                      pwInput.length === 0 ? (
                        <div className="flex items-center justify-start">
                          <span className="truncate text-3xl font-semibold text-slate-700 dark:text-slate-200">
                            {operatorName(pwUser) ? `${pwUser} (${operatorName(pwUser)})` : pwUser}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-start">
                          <span className="text-4xl font-bold tracking-[0.3em] text-slate-900 dark:text-white">
                            {"•".repeat(pwInput.length)}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className={`flex items-center ${numpadMode ? "justify-start" : "justify-end"}`}>
                        <span className="text-4xl font-bold tabular-nums text-slate-900 dark:text-white">
                          {numpadMode === "qty"
                            ? numInput || "0"
                            : numpadMode === "change"
                              ? `${numInput || "0"} €`
                              : multiplier > 1
                                ? `${multiplier} x`
                                : euro(total)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status bar (stays constant in fill mode, like the menu bar) */}
        <div
          className={`flex select-none items-center justify-between border-t border-[#a8a8a8] bg-[#f0f0f0] px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 ${fillMode ? "shrink-0" : ""}`}
        >
          <span
            className={
              statusMsg && statusTone === "warn" ? "font-semibold text-orange-500 dark:text-orange-400" : undefined
            }
          >
            {statusMsg ??
              `${t.user}: ${user ? (operatorName(user) ? `${user} (${operatorName(user)})` : user) : "None"}`}
          </span>
          <span>
            {t.paperStatus}: {paperPercent}% ({paperRemaining.toFixed(2)}/{PAPER_ROLL_M.toFixed(2)} m)
          </span>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-16 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-700">
            {toast}
          </div>
        )}

        {/* Close confirmation */}
        {confirmClose && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-800">
              <div className="border-b border-[#a8a8a8] bg-[#f0f0f0] px-4 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">
                {t.close}
              </div>
              <div className="p-5 text-center">
                <p className="text-slate-800 dark:text-slate-100">{t.areYouSure}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClose(false);
                      setUser(null);
                      resetSession();
                      close();
                    }}
                    className="btn-primary flex-1"
                  >
                    {t.yes}
                  </button>
                  <button type="button" onClick={() => setConfirmClose(false)} className="btn-secondary flex-1">
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paper-changed confirmation */}
        {confirmPaper && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-800">
              <div className="border-b border-[#a8a8a8] bg-[#f0f0f0] px-4 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">
                {t.resetPaperTitle}
              </div>
              <div className="p-5 text-center">
                <p className="text-slate-800 dark:text-slate-100">{t.areYouSure}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaperUsed(PAPER_START_M);
                      setConfirmPaper(false);
                    }}
                    className="btn-primary flex-1"
                  >
                    {t.yes}
                  </button>
                  <button type="button" onClick={() => setConfirmPaper(false)} className="btn-secondary flex-1">
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation confirmation */}
        {confirmCancel && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-800">
              <div className="border-b border-[#a8a8a8] bg-[#f0f0f0] px-4 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">
                {t.voidTitle}
              </div>
              <div className="p-5 text-center">
                <p className="text-slate-800 dark:text-slate-100">{t.areYouSure}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      doPrint(true);
                      setConfirmCancel(false);
                    }}
                    className="btn-primary flex-1"
                  >
                    {t.yes}
                  </button>
                  <button type="button" onClick={() => setConfirmCancel(false)} className="btn-secondary flex-1">
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interim-status dialog */}
        {interimOpen &&
          (() => {
            /** Aggregated order item shown in the interim/report view. */
            type Item = { name: string; price: number; qty: number; cancelled: boolean; taxGroup: number };
            const usersToShow = isManager
              ? Object.keys(printHistory).filter((u) => (printHistory[u]?.length ?? 0) > 0)
              : user
                ? [user]
                : [];
            /**
             * Aggregates a user's print history into items, net sum and card total.
             *
             * @param u - user name to aggregate the history for
             * @returns the aggregated items with net sum and card payment total
             */
            const aggForUser = (u: string) => {
              const hist = printHistory[u] || [];
              const m: Record<string, Item> = {};
              for (const l of hist) {
                const key = (l.cancelled ? "S|" : "N|") + l.name;
                if (!m[key])
                  m[key] = { name: l.name, price: l.price, qty: 0, cancelled: l.cancelled, taxGroup: l.taxGroup };
                m[key].qty += l.qty;
              }
              const items = Object.values(m).filter((a) => a.qty !== 0);
              const sum = items.reduce((s, a) => s + (a.cancelled ? -1 : 1) * a.price * a.qty, 0);
              const card = cardPayments[u] ?? 0;
              return { items, sum, card };
            };
            const sections = usersToShow
              .map((u) => ({ user: u, ...aggForUser(u) }))
              .filter((s) => s.items.length > 0 || s.card > 0);
            const grandTotal = sections.reduce((s, sec) => s + sec.sum, 0);
            const grandCard = sections.reduce((s, sec) => s + sec.card, 0);
            // Split a section's items by tax group (with a per-group sum)
            /**
             * Builds the localized label for a tax group.
             *
             * @param g - tax group number
             * @returns the localized group label (e.g. "Group 1")
             */
            const groupLabel = (g: number) => `${t.group} ${g}`;
            /**
             * Groups items by tax group, sorted ascending, each with its sum.
             *
             * @param items - the aggregated items to group
             * @returns one entry per tax group with its items and net sum
             */
            const groupsOf = (items: Item[]) => {
              const m = new Map<number, Item[]>();
              for (const it of items) {
                const arr = m.get(it.taxGroup);
                if (arr) arr.push(it);
                else m.set(it.taxGroup, [it]);
              }
              return [...m.entries()]
                .sort((a, b) => a[0] - b[0])
                .map(([group, its]) => ({
                  group,
                  items: its,
                  sum: its.reduce((s, a) => s + (a.cancelled ? -1 : 1) * a.price * a.qty, 0),
                }));
            };
            const titel = reportMode ? t.reportTitle : t.interimTitle;
            const benutzerLabel = isManager ? t.allUsers : (user ?? "");
            /** Closes the dialog; in report mode it also resets the collected statistics. */
            const closeInterim = () => {
              setInterimOpen(false);
              if (reportMode) {
                setPrintHistory({});
                setCardPayments({});
                setReportMode(false);
                // Archive the report in the output folder (copies the log + writes
                // the article config) and clears the log (desktop build).
                createReportFolder(articleText);
              }
            };
            return (
              <div className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-slate-900">
                {/* Title bar */}
                <div className="flex items-center justify-between border-b border-[#a8a8a8] bg-[#f8f8f8] px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{t.printoutStatus}</span>
                  <button
                    type="button"
                    onClick={closeInterim}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-[1.6fr_1fr]">
                  {/* Left: monospace report */}
                  <div className="m-2 overflow-auto rounded border border-[#a8a8a8] p-3 font-mono text-[12px] leading-relaxed text-slate-800 dark:border-slate-700 dark:text-slate-200">
                    <div className="font-semibold"># {t.printoutStatus}</div>
                    {sections.length === 0 ? (
                      <div className="mt-3 text-slate-500 dark:text-slate-400">{t.nothingPrinted}</div>
                    ) : (
                      sections.map((sec) => (
                        <div key={sec.user} className="mt-3">
                          <div className="font-semibold">### {sec.user}</div>
                          <div>
                            {t.total}: {euro(sec.sum)}
                          </div>
                          {sec.card > 0 && (
                            <div>
                              {t.inclCard}: {euro(sec.card)}
                            </div>
                          )}
                          <div className="mt-1 space-y-1.5">
                            {groupsOf(sec.items).map((g) => (
                              <div key={g.group}>
                                <div className="font-semibold">
                                  {groupLabel(g.group)}: {euro(g.sum)}
                                </div>
                                <div className="space-y-0.5">
                                  {g.items.map((a) => (
                                    <div
                                      key={(a.cancelled ? "S" : "N") + a.name}
                                      className={a.cancelled ? "text-[#d32f2f] dark:text-[#f87171]" : ""}
                                    >
                                      {a.qty} x {(a.cancelled ? t.voidPrefix + " " : "") + a.name.replace(/\n/g, "")}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right: summary + actions */}
                  <div className="flex flex-col border-l border-[#a8a8a8] dark:border-slate-700">
                    <div className="flex-1 px-4 py-6 text-center">
                      <h3 className="text-xl text-slate-800 dark:text-slate-100">{titel}</h3>
                      <p className="mt-4 text-lg text-slate-700 dark:text-slate-200">
                        {t.user}: {benutzerLabel}
                      </p>
                      <p className="text-lg text-slate-700 dark:text-slate-200">
                        {t.total}: {euro(grandTotal)}
                      </p>
                      {grandCard > 0 && (
                        <p className="text-lg text-slate-700 dark:text-slate-200">
                          {t.inclCard}: {euro(grandCard)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled
                      className="border-t border-[#a8a8a8] py-3 text-lg text-[#bdbdbd] dark:border-slate-700 dark:text-slate-600"
                    >
                      {t.openFolder}
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(reportMode ? t.reportPrinted : t.interimPrinted)}
                      className="border-t border-[#a8a8a8] py-3 text-lg text-[#1976d2] hover:bg-[#f5f9ff] dark:border-slate-700 dark:text-[#5fa8ee] dark:hover:bg-slate-800"
                    >
                      {t.printLabel}
                    </button>
                    <button
                      type="button"
                      onClick={closeInterim}
                      className="bg-[#1976d2] py-3 text-lg font-semibold text-white hover:bg-[#1565c0]"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Help / About dialog */}
        {aboutOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-800">
              <div className="border-b border-[#a8a8a8] bg-[#f0f0f0] px-4 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">
                {t.about}
              </div>
              <div className="p-6 text-center">
                <img src="/pos-demo/app.png" alt="" className="mx-auto h-14 w-14" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">BonPrinter</p>
                <p className="mt-1 text-sm text-brand-600 dark:text-brand-300">{t.liveDemo}</p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  © {new Date().getFullYear()} Timo Unger
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Build {BUILD_TIME} ({BUILD_COMMIT})
                </p>
                <button type="button" onClick={() => setAboutOpen(false)} className="btn-primary mt-6 w-full">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {resetOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-800">
              <div className="border-b border-[#a8a8a8] bg-[#f0f0f0] px-4 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">
                {t.resetTitle}
              </div>
              <div className="p-5">
                <label htmlFor="reset-code" className="block text-sm text-slate-600 dark:text-slate-300">
                  {t.resetPrompt}
                </label>
                <input
                  id="reset-code"
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={resetInput}
                  onChange={(e) => {
                    setResetInput(e.target.value);
                    setResetError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitReset();
                  }}
                  className="mt-2 w-full rounded border border-[#a8a8a8] bg-white px-3 py-2 text-center text-lg tracking-widest text-slate-800 outline-none focus:border-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                {resetError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{t.resetWrong}</p>}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetOpen(false);
                      setResetInput("");
                      setResetError(false);
                    }}
                    className="flex-1 rounded border border-[#a8a8a8] px-3 py-2 text-slate-700 hover:bg-[#f0f0f0] dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {t.cancel}
                  </button>
                  <button type="button" onClick={submitReset} className="btn-primary flex-1">
                    {t.resetItem}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {explorerOpen && <ExplorerWindow lang={lang} onClose={() => setExplorerOpen(false)} />}

        {printPreviewOpen && (
          <PrintPreview lang={lang} articles={articles} onClose={() => setPrintPreviewOpen(false)} />
        )}

        {articleEditorOpen && <ArticleEditor lang={lang} value={articleText} onClose={saveArticles} />}
      </div>
    </div>
  );
}
