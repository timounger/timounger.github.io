/**
 * Landing page composing the home sections.
 *
 * @module
 */

import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Stats from "@/components/home/stats";
import BookingSection from "@/components/home/booking-section";
import Pricing from "@/components/home/pricing";
import { type ReactElement } from "react";

/**
 * Landing page composing the home sections: hero, features, stats, pricing
 * and the booking section.
 */
export default function HomePage(): ReactElement {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <Pricing />
      <BookingSection />
    </>
  );
}
