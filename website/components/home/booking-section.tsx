/**
 * Booking section wrapping the booking form with heading and intro text.
 *
 * @module
 */

import { type ReactElement } from "react";
import BookingForm from "./booking-form";

/**
 * Booking section with a heading, introductory text and the embedded booking
 * form; serves as the "#booking" anchor target.
 */
export default function BookingSection(): ReactElement {
  return (
    <section
      id="booking"
      className="bg-gradient-to-b from-white/40 to-brand-50/60 py-20 dark:from-slate-950/40 dark:to-slate-900/60"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Jetzt anfragen
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Wählen Sie Ihren Wunschzeitraum und schicken Sie mir eine kurze Nachricht. Ich prüfe die Verfügbarkeit und
            melde mich zeitnah bei Ihnen.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
