/**
 * Decorative Windows 11 style calendar flyout showing the current month,
 * opened from the taskbar clock. Read-only - nothing is selectable.
 *
 * @module
 */
"use client";

import { type ReactElement } from "react";

/** Number of days per week (grid columns). */
const DAYS_PER_WEEK = 7;
/** Weekday headers, Monday first. */
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
/** German month names. */
const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/**
 * Renders a read-only calendar of the current month, with today highlighted.
 *
 * @returns the calendar flyout element
 */
export function CalendarFlyout(): ReactElement {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const leading = (firstWeekday + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK; // shift so Monday is first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="absolute bottom-[46px] right-2 z-[60] w-64 select-none rounded-xl border border-white/10 bg-[#2a2a2a]/95 p-3 text-zinc-200 shadow-2xl backdrop-blur">
      <div className="mb-2 px-1 text-sm font-medium">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="font-medium text-zinc-400">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={`cell-${i}`}
            className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${
              day === today ? "bg-[#2b88d8] font-semibold text-white" : ""
            }`}
          >
            {day ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
