/**
 * Stats section rendering the grid of key figures.
 *
 * @module
 */

import { Calendar, Info, Package, Receipt, Sparkles, Users } from "lucide-react";
import { type ReactElement } from "react";

/** A single key figure shown in the stats grid. */
type Stat = {
  /** Icon component rendered above the value. */
  icon: typeof Calendar;
  /** Highlighted figure or short value text. */
  value: string;
  /** Caption describing the value. */
  label: string;
  /** Optional small italic note shown below the label. */
  note?: string;
  /** Optional tooltip text for an info button next to the note. */
  tooltip?: string;
};
/** Key figures displayed in the stats section. */
const stats: Stat[] = [
  { icon: Calendar, value: "Seit 2022", label: "regelmäßig im Einsatz" },
  { icon: Users, value: "30+", label: "zufriedene Vereine" },
  { icon: Package, value: "bis zu 17", label: "Geräte verfügbar", note: "mehr auf Anfrage produzierbar" },
  { icon: Sparkles, value: "Laufend", label: "neue Features & Verbesserungen" },
  {
    icon: Receipt,
    value: "2-in-1",
    label: "auch als Registrierkasse nutzbar",
    note: "TSE erforderlich",
    tooltip: "Mit TSE-Server ggf. nur ein TSE-Zertifikat nötig",
  },
];

/** Renders the stats section as a grid of key-figure cards. */
export default function Stats(): ReactElement {
  return (
    <section className="py-12">
      <div className="container-page">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(({ icon: Icon, value, label, note, tooltip }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-400 bg-white p-6 text-center shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-slate-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Icon size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{label}</p>
              {note && (
                <p className="mt-1 inline-flex items-center justify-center gap-1 text-xs italic text-slate-500 dark:text-slate-400">
                  {note}
                  {tooltip && (
                    <button
                      type="button"
                      title={tooltip}
                      aria-label={tooltip}
                      className="cursor-help not-italic text-slate-400 hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      <Info size={12} />
                    </button>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
