/**
 * Simplified Windows 11 start menu: a search field and a few pinned apps
 * (BonPrinter, a folder and settings). Opens above the taskbar's Start button.
 *
 * @module
 */
"use client";

import { Folder, Search, Settings } from "lucide-react";
import { type ReactElement } from "react";
import { useWindowState } from "./window-context";

/**
 * Renders the start menu overlay. The BonPrinter tile restores the app; the
 * other tiles are decorative.
 *
 * @returns the start menu element
 */
export function StartMenu(): ReactElement {
  const { open, closeStart } = useWindowState();
  /** Opens the BonPrinter app and closes the menu. */
  const openApp = () => {
    open();
    closeStart();
  };

  return (
    <div className="absolute bottom-[46px] left-1/2 z-[60] w-72 -translate-x-1/2 select-none rounded-xl border border-white/10 bg-[#2a2a2a]/95 p-3 text-zinc-200 shadow-2xl backdrop-blur">
      {/* Search field */}
      <div className="mb-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/10">
        <Search size={13} />
        <span>Nach Apps suchen</span>
      </div>

      {/* Pinned apps */}
      <div className="mb-1.5 text-[11px] font-medium text-zinc-400">Angeheftet</div>
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={openApp}
          className="flex flex-col items-center gap-1 rounded-lg p-2 transition hover:bg-white/10"
        >
          <img src="/pos-demo/app.png" alt="" className="h-7 w-7" />
          <span className="text-[10px]">BonPrinter</span>
        </button>
        {/* Ordner and Einstellungen are decorative (not clickable) */}
        <div className="flex flex-col items-center gap-1 rounded-lg p-2">
          <Folder size={26} strokeWidth={1.5} className="text-[#c8881f]" fill="#f6c64b" />
          <span className="text-[10px]">Ordner</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg p-2">
          <Settings size={26} className="text-zinc-200" />
          <span className="text-[10px]">Einstellungen</span>
        </div>
      </div>
    </div>
  );
}
