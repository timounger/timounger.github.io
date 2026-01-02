/**
 * Decorative Windows 11 style on-screen (touch) keyboard, opened from the
 * taskbar keyboard icon. The keys are non-functional - it is purely visual.
 *
 * @module
 */
"use client";

import { type ReactElement } from "react";

/** Keyboard rows in a German QWERTZ layout. */
const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "ß"],
  ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"],
  ["y", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
];

/**
 * Renders a read-only on-screen keyboard panel above the taskbar.
 *
 * @returns the keyboard element
 */
export function TouchKeyboard(): ReactElement {
  return (
    <div className="absolute bottom-[46px] left-1/2 z-[60] w-2/3 -translate-x-1/2 select-none rounded-xl border border-white/10 bg-[#2a2a2a]/95 p-2 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-1">
        {ROWS.map((row, r) => (
          <div key={`row-${r}`} className="flex justify-center gap-1">
            {row.map((keyLabel) => (
              <button
                key={keyLabel}
                type="button"
                className="flex h-8 min-w-[2rem] flex-1 items-center justify-center rounded-md bg-white/10 text-sm text-zinc-200 transition hover:bg-white/20"
              >
                {keyLabel}
              </button>
            ))}
          </div>
        ))}
        {/* Bottom row: spacebar */}
        <div className="flex justify-center gap-1">
          <button
            type="button"
            className="h-8 w-2/3 rounded-md bg-white/10 transition hover:bg-white/20"
            aria-label="Leertaste"
          />
        </div>
      </div>
    </div>
  );
}
