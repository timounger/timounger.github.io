/**
 * Decorative Windows 11 style taskbar shown at the bottom of the device screen,
 * making the POS app look like a running desktop application.
 *
 * @module
 */
"use client";

import { Folder, Globe, Keyboard, Search } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";
import { useWindowState } from "./window-context";

/** Clock refresh interval in milliseconds. */
const CLOCK_REFRESH_MS = 30000;
/** The four panes of the Windows logo. */
const LOGO_PANES = 4;

/**
 * Provides the current local time ("HH:MM") and date ("DD.MM.YYYY"), updated
 * periodically.
 *
 * @remarks
 * Starts empty so the server-rendered and first client render match (no
 * hydration mismatch); the real values are filled in after mount.
 * @returns the current time and date strings, empty before mount
 */
function useClock(): { time: string; date: string } {
  const [clock, setClock] = useState({ time: "", date: "" });
  useEffect(() => {
    /** Reads the current time and date into padded "HH:MM" / "DD.MM.YYYY" strings. */
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      setClock({ time: `${hours}:${minutes}`, date: `${day}.${month}.${now.getFullYear()}` });
    };
    update();
    const id = window.setInterval(update, CLOCK_REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);
  return clock;
}

/**
 * Renders a stylized Windows 11 taskbar: centered Start logo, search box, File
 * Explorer and the BonPrinter app (marked as open). Purely decorative.
 *
 * @returns the taskbar element
 */
export function WindowsTaskbar(): ReactElement {
  const { time, date } = useClock();
  const { toggle, closed, open, toggleStart, toggleCalendar, toggleKeyboard } = useWindowState();
  return (
    <div className="relative flex select-none items-center justify-between bg-[#1f1f1f]/95 px-3 py-px backdrop-blur">
      {/* Left spacer balances the right-hand tray so the icon group stays centered */}
      <div className="w-32 shrink-0" />

      {/* Centered icon group */}
      <div className="flex items-center gap-1.5">
        {/* Start: Windows logo */}
        <button
          type="button"
          onClick={toggleStart}
          className="rounded p-[5px] transition hover:bg-white/10"
          aria-label="Start"
        >
          <div className="grid grid-cols-2 gap-[2px]">
            {Array.from({ length: LOGO_PANES }, (_, i) => (
              <span key={i} className="h-[7px] w-[7px] rounded-[1px] bg-[#2b88d8]" />
            ))}
          </div>
        </button>

        {/* Search box */}
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-0.5 text-xs text-zinc-300 ring-1 ring-white/10">
          <Search size={13} />
          <span>Suche</span>
        </div>

        {/* File Explorer (decorative, not clickable) */}
        <span className="select-none rounded p-[5px]" aria-label="Explorer">
          <Folder size={21} strokeWidth={1.5} className="text-[#c8881f]" fill="#f6c64b" />
        </span>

        {/* BonPrinter app - opens when closed, otherwise minimizes/restores; the underline marks it as running */}
        <button
          type="button"
          onClick={() => (closed ? open() : toggle())}
          className="relative rounded p-1 transition hover:bg-white/10"
          aria-label="BonPrinter"
        >
          <img src="/pos-demo/app.png" alt="" className="h-[22px] w-[22px]" />
          {!closed && (
            <span className="absolute -bottom-0.5 left-1/2 h-[3px] w-3.5 -translate-x-1/2 rounded-full bg-white/80" />
          )}
        </button>
      </div>

      {/* System tray: keyboard, network (no internet = globe), clock and date */}
      <div className="flex w-32 shrink-0 items-center justify-end gap-1 text-zinc-300">
        <button
          type="button"
          onClick={toggleKeyboard}
          className="select-none rounded p-1 transition hover:bg-white/10"
          aria-label="Bildschirmtastatur"
        >
          <Keyboard size={16} />
        </button>
        <span className="select-none rounded p-1" aria-label="Netzwerk (kein Internet)">
          <Globe size={16} />
        </span>
        <button
          type="button"
          onClick={toggleCalendar}
          className="flex select-none flex-col items-end justify-center rounded px-1 py-0.5 leading-tight transition hover:bg-white/10"
          aria-label="Kalender"
        >
          <span className="text-[10px] leading-tight">{time}</span>
          <span className="text-[9px] leading-tight">{date}</span>
        </button>
      </div>
    </div>
  );
}
