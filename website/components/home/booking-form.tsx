/**
 * Booking inquiry form with a date-range picker that prefills a mailto request.
 *
 * @module
 */
"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, CheckCircle2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

/** Recipient email address the prefilled inquiry is addressed to. */
const OWNER_EMAIL = "bonprinter@gmx.de";

/** Maximum number of devices selectable in the booking form. */
const MAX_DEVICES = 20;

/** Submission state of the booking form: initial vs. mail draft opened. */
type Status = { kind: "idle" } | { kind: "submitted" };

/**
 * Booking form with a date-range picker and contact fields. On submit it
 * builds a prefilled mailto link and opens the user's email client; no data is
 * sent to any server.
 */
export default function BookingForm(): ReactElement {
  const [range, setRange] = useState<DateRange | undefined>();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [form, setForm] = useState({
    name: "",
    verein: "",
    ort: "",
    telefon: "",
    event: "",
    anzahl: "1",
    nachricht: "",
  });

  const canSubmit = Boolean(range?.from && range?.to && form.name && form.verein && form.ort && form.anzahl);

  /**
   * Builds the prefilled inquiry email body from the form state and opens the
   * user's mail client via a mailto link, then marks the form as submitted.
   *
   * @param e - the form submit event
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!range?.from || !range?.to) return;

    const zeitraum = `${toGermanDate(range.from)} - ${toGermanDate(range.to)}`;

    const body = [
      "Hallo Timo,",
      "",
      `Verein: ${form.verein}`,
      `Ort: ${form.ort}`,
      form.event ? `Event: ${form.event}` : null,
      `Wunschzeitraum: ${zeitraum}`,
      `Anzahl: ${form.anzahl}`,
      "",
      "Nachricht:",
      form.nachricht || "(keine)",
      "",
      `Grüße, ${form.name}`,
      form.telefon ? `Telefon: ${form.telefon}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const mailto = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(
      "Anfrage Wertmarkendrucker",
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setStatus({ kind: "submitted" });
  }

  if (status.kind === "submitted") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/40">
        <CheckCircle2 className="mx-auto text-green-600 dark:text-green-400" size={48} />
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Mail-Programm geöffnet</h3>
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          Bitte senden Sie die vorausgefüllte E-Mail in Ihrem Mail-Programm ab.
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Falls sich nichts geöffnet hat, schreiben Sie bitte direkt an{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="text-brand-600 underline dark:text-brand-400">
            {OWNER_EMAIL}
          </a>
          .
        </p>
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="btn-secondary mt-6">
          Neue Anfrage
        </button>
      </div>
    );
  }

  // Shared Tailwind class string for the form input fields.
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <div className="grid gap-8 rounded-3xl border-2 border-slate-400 bg-white p-6 shadow-xl sm:p-8 lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
          <Calendar size={20} className="text-brand-600 dark:text-brand-400" />
          <h3 className="text-lg font-semibold">Wunschzeitraum wählen</h3>
        </div>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          locale={de}
          numberOfMonths={1}
          disabled={{ before: new Date() }}
          weekStartsOn={1}
        />
        {range?.from && range?.to && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Ausgewählt: <strong>{toGermanDate(range.from)}</strong> - <strong>{toGermanDate(range.to)}</strong>
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Verfügbarkeit prüfe ich nach Eingang Ihrer Anfrage persönlich und melde mich zeitnah.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Anfrage-Daten</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            type="text"
            placeholder="Ihr Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            type="tel"
            placeholder="Telefon"
            value={form.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="text"
            placeholder="Verein *"
            value={form.verein}
            onChange={(e) => setForm({ ...form, verein: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="text"
            placeholder="Ort *"
            value={form.ort}
            onChange={(e) => setForm({ ...form, ort: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Event / Festname"
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
            className={`${inputClass} sm:col-span-2`}
          />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Anzahl an Wertmarkendruckern *
          </span>
          <input
            required
            type="number"
            min={1}
            max={MAX_DEVICES}
            step={1}
            value={form.anzahl}
            onChange={(e) => {
              const n = e.target.value;
              if (n === "") {
                setForm({ ...form, anzahl: "" });
                return;
              }
              const clamped = Math.min(MAX_DEVICES, Math.max(1, Number(n)));
              setForm({ ...form, anzahl: String(clamped) });
            }}
            className={`${inputClass} sm:w-32`}
          />
        </label>
        <textarea
          placeholder="Nachricht (optional)"
          rows={3}
          value={form.nachricht}
          onChange={(e) => setForm({ ...form, nachricht: e.target.value })}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anfrage per E-Mail senden
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Beim Klick öffnet sich Ihr Mail-Programm mit allen Angaben vorausgefüllt. Sie senden die E-Mail dann selbst
          ab.
        </p>
      </form>
    </div>
  );
}

/**
 * Formats a date as a German-style day.month.year string.
 *
 * @param d - the date to format
 * @returns the formatted date string (dd.MM.yyyy)
 */
function toGermanDate(d: Date): string {
  return format(d, "dd.MM.yyyy");
}
