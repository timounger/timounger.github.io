/**
 * Corrects hash-anchor scrolling after a client-side navigation to a page with
 * a "#section" target. Next.js scrolls once on navigation, but late layout
 * shifts (images, fonts) can move the target, so the browser ends up at the
 * wrong section. This re-scrolls a few times shortly after mount - and stops as
 * soon as the user scrolls themselves.
 *
 * @module
 */
"use client";

import { useEffect } from "react";

/** Number of re-scroll corrections after mount. */
const RETRY_COUNT = 3;
/** Spacing between re-scroll corrections, in milliseconds. */
const RETRY_STEP_MS = 200;
/** Re-scroll delays (ms) after mount to survive late layout shifts. */
const RETRY_DELAYS = Array.from({ length: RETRY_COUNT }, (_, i) => (i + 1) * RETRY_STEP_MS);

/** Scrolls to the URL hash target after mount, correcting late layout shifts. */
export default function HashScroll(): null {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    let userScrolled = false;
    /** Marks that the user took over scrolling, so we stop correcting. */
    const onUserScroll = () => {
      userScrolled = true;
    };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    window.addEventListener("keydown", onUserScroll);
    /** Scrolls the target element into view unless the user already scrolled. */
    const scrollToTarget = () => {
      if (!userScrolled) document.getElementById(id)?.scrollIntoView();
    };
    scrollToTarget();
    const timers = RETRY_DELAYS.map((delay) => window.setTimeout(scrollToTarget, delay));
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    };
  }, []);
  return null;
}
