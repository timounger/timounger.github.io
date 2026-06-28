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
import Faq from "@/components/home/faq";
import HashScroll from "@/components/util/hash-scroll";
import { type ReactElement } from "react";

/**
 * Landing page composing the home sections: hero, features, stats, pricing,
 * FAQ and the booking section.
 */
export default function HomePage(): ReactElement {
  return (
    <>
      <HashScroll />
      <Hero />
      <Features />
      <Stats />
      <Pricing />
      <Faq />
      <BookingSection />
    </>
  );
}
