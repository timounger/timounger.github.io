/**
 * Admin-only "Konfiguration" menu in the POS menu bar: users / articles
 * actions, output directory, COM-port and paper-width selections, and a SumUp
 * connect entry. Purely decorative - the entries and radio selections only
 * track their own state and have no real effect.
 *
 * @module
 */
"use client";

import { ChevronRight } from "lucide-react";
import { useState, type ReactElement } from "react";
import { T } from "../i18n/translations";
import { type Lang } from "../types";

/** Highest COM port offered for the printer connection. */
const PRINTER_COM_MAX = 10;
/** Highest COM port offered for the card reader and the customer display. */
const PERIPHERAL_COM_MAX = 5;
/** Shared classes for a leaf (action / plain) menu entry. */
const LEAF_BTN = "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700";
/** Shared classes for a submenu flyout panel. */
const FLYOUT =
  "absolute left-full top-0 z-40 ml-px w-52 rounded-md border border-[#a8a8a8] bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-800";

/** A single radio option: its label and whether it is shown disabled (grayed). */
interface RadioOption {
  /** The option label. */
  label: string;
  /** Whether the option is disabled (unavailable but currently selected). */
  disabled: boolean;
}

/**
 * Builds the static COM-port list COM1..COMn (used as the web fallback when no
 * hardware bridge reports the actually available ports).
 *
 * @param max - highest COM port number
 * @returns the port labels (without "None")
 */
function staticComPorts(max: number): string[] {
  return Array.from({ length: max }, (_, i) => `COM${i + 1}`);
}

/**
 * Builds a radio option list: "None" first, then the available entries, and -
 * when the current selection is not available - the selection appended at the
 * end as a disabled (grayed) entry, so it stays visible and selected (mirrors
 * the reference project's group_available_menu).
 *
 * @param available - the currently available entries (ports or readers)
 * @param current - the currently selected value
 * @returns the radio options to render
 */
function buildOptions(available: string[], current: string): RadioOption[] {
  const options: RadioOption[] = [
    { label: "None", disabled: false },
    ...available.map((label) => ({ label, disabled: false })),
  ];
  if (current !== "None" && !available.includes(current)) {
    options.push({ label: current, disabled: true });
  }
  return options;
}

/**
 * Classes for a submenu parent row (with the chevron).
 *
 * @param active - whether its submenu is open
 * @returns the className string
 */
function subBtn(active: boolean): string {
  return `flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-700 ${
    active ? "bg-[#f0f0f0] dark:bg-slate-700" : ""
  }`;
}

/** Props for the {@link ConfigMenu} component. */
export interface ConfigMenuProps {
  /** Current UI language. */
  lang: Lang;
  /** Whether the app renders in dark mode (selects the icon variant). */
  demoDark: boolean;
  /** Selected printer COM port ("None" or "COMx"); drives the real print bridge. */
  printerPort: string;
  /** Selects a new printer COM port. */
  setPrinterPort: (value: string) => void;
  /** Selected paper width ("58 mm" or "80 mm"); drives the real print bridge. */
  paperWidth: string;
  /** Selects a new paper width. */
  setPaperWidth: (value: string) => void;
  /** Selected smart-card (NFC) reader COM port ("None" or "COMx"). */
  cardReader: string;
  /** Selects a new smart-card reader COM port. */
  setCardReader: (value: string) => void;
  /** Selected customer-display COM port ("None" or "COMx"). */
  displayPort: string;
  /** Selects a new customer-display COM port. */
  setDisplayPort: (value: string) => void;
  /** True in the desktop build: use the bridges' real available ports/readers. */
  liveHardware: boolean;
  /** COM ports the printer bridge currently reports as available. */
  availablePorts: string[];
  /** PC/SC readers the NFC bridge currently reports as available. */
  availableReaders: string[];
  /** Opens the article config editor (Konfiguration -> Artikel -> Bearbeiten). */
  onEditArticles: () => void;
}

/**
 * Renders the admin configuration menu (menu-bar button plus its dropdown).
 *
 * @returns the configuration menu element
 */
export function ConfigMenu({
  lang,
  demoDark,
  printerPort,
  setPrinterPort,
  paperWidth,
  setPaperWidth,
  cardReader,
  setCardReader,
  displayPort,
  setDisplayPort,
  liveHardware,
  availablePorts,
  availableReaders,
  onEditArticles,
}: ConfigMenuProps): ReactElement {
  const t = T[lang];
  // In the desktop build use the bridges' real lists; on the website fall back
  // to the static COM list so the (decorative) menu still looks populated.
  const printerOptions = liveHardware ? availablePorts : staticComPorts(PRINTER_COM_MAX);
  const peripheralOptions = liveHardware ? availablePorts : staticComPorts(PERIPHERAL_COM_MAX);
  const readerOptions = liveHardware ? availableReaders : staticComPorts(PERIPHERAL_COM_MAX);
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  /**
   * Resolves a themed pos-demo icon path by base name.
   *
   * @param name - icon base name
   * @returns the icon URL
   */
  const iconSrc = (name: string): string => `/pos-demo/${name}_${demoDark ? "dark" : "light"}.png`;
  /**
   * A small 18px menu icon for the given base name.
   *
   * @param name - icon base name
   * @returns the icon element
   */
  const icon = (name: string): ReactElement => <img src={iconSrc(name)} alt="" className="h-[18px] w-[18px]" />;
  /** Closes the menu and any open submenu. */
  const close = (): void => {
    setOpen(false);
    setOpenSub(null);
  };
  /**
   * Toggles a submenu open or closed by its key.
   *
   * @param key - the submenu key
   */
  const toggleSub = (key: string): void => setOpenSub((s) => (s === key ? null : key));

  /**
   * Renders a submenu of action entries (edit, import, ...), using the
   * context-specific icons (e.g. user_edit, articles_import). Only the entry
   * whose handler is given is functional; the rest are decorative.
   *
   * @param label - the parent row label
   * @param key - the submenu key
   * @param base - icon base (e.g. "user" or "articles")
   * @param onEdit - optional handler for the "edit" entry
   * @returns the submenu element
   */
  const actionSub = (label: string, key: string, base: string, onEdit?: () => void): ReactElement => {
    const items = [
      { iconName: `${base}_edit`, label: t.edit, onClick: onEdit },
      { iconName: `${base}_import`, label: t.import, onClick: undefined },
      { iconName: `${base}_export`, label: t.export, onClick: undefined },
      { iconName: `${base}_reset`, label: t.resetDefaults, onClick: undefined },
      { iconName: "editor", label: t.editor, onClick: undefined },
    ];
    return (
      <div className="relative">
        <button type="button" onClick={() => toggleSub(key)} className={subBtn(openSub === key)}>
          <span className="flex items-center gap-2">
            {icon(base)}
            {label}
          </span>
          <ChevronRight size={16} className="text-slate-400" />
        </button>
        {openSub === key && (
          <div className={FLYOUT}>
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                className={LEAF_BTN}
                onClick={
                  it.onClick
                    ? () => {
                        it.onClick?.();
                        close();
                      }
                    : undefined
                }
              >
                {icon(it.iconName)}
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders a submenu of radio options that tracks the chosen value. Disabled
   * options (unavailable but still selected) are grayed out and not clickable.
   *
   * @param label - the parent row label
   * @param key - the submenu key
   * @param base - icon base for the parent row
   * @param options - the radio options (label + disabled flag)
   * @param value - the currently selected option
   * @param setValue - selects a new option
   * @returns the submenu element
   */
  const radioSub = (
    label: string,
    key: string,
    base: string,
    options: RadioOption[],
    value: string,
    setValue: (v: string) => void,
  ): ReactElement => (
    <div className="relative">
      <button type="button" onClick={() => toggleSub(key)} className={subBtn(openSub === key)}>
        <span className="flex items-center gap-2">
          {icon(base)}
          {label}
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      {openSub === key && (
        <div className={`${FLYOUT} max-h-56 overflow-y-auto`}>
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              disabled={opt.disabled}
              onClick={() => setValue(opt.label)}
              className={`${LEAF_BTN} ${opt.disabled ? "cursor-default text-slate-400 dark:text-slate-500" : ""}`}
            >
              <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-slate-400 dark:border-slate-500">
                {value === opt.label && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
              </span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className={`rounded px-2 py-0.5 hover:bg-[#e5e5e5] dark:hover:bg-slate-700 ${
          open ? "bg-[#e5e5e5] dark:bg-slate-700" : ""
        }`}
      >
        {t.config}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={close}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute left-0 top-full z-30 mt-1 w-60 rounded-md border border-[#a8a8a8] bg-white py-1 text-slate-700 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            {actionSub(t.configUsers, "users", "user")}
            {actionSub(t.configArticles, "articles", "articles", onEditArticles)}
            <button type="button" className={LEAF_BTN}>
              {icon("change_folder")}
              <span>{t.outputDir}</span>
            </button>
            {radioSub(
              t.printerPort,
              "printerPort",
              "printer",
              buildOptions(printerOptions, printerPort),
              printerPort,
              setPrinterPort,
            )}
            {radioSub(
              t.paperWidth,
              "paperWidth",
              "paper",
              [
                { label: "58 mm", disabled: false },
                { label: "80 mm", disabled: false },
              ],
              paperWidth,
              setPaperWidth,
            )}
            {radioSub(
              t.cardReader,
              "cardReader",
              "nfc",
              buildOptions(readerOptions, cardReader),
              cardReader,
              setCardReader,
            )}
            {radioSub(
              t.displayPort,
              "displayPort",
              "display",
              buildOptions(peripheralOptions, displayPort),
              displayPort,
              setDisplayPort,
            )}
            <button type="button" className={LEAF_BTN}>
              <img src="/pos-demo/sumup.png" alt="" className="h-[18px] w-[18px]" />
              <span>{t.sumupConnect}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
