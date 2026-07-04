/**
 * Privacy-friendly analytics via GoatCounter (cookieless, no personal data).
 * Only active when the NEXT_PUBLIC_GOATCOUNTER env var (the GoatCounter site
 * code, e.g. "bonprinter") is set, so local/dev builds are not tracked.
 *
 * Counts the initial page load (via count.js) and each client-side navigation,
 * and exposes {@link trackGoatEvent} for custom conversion events.
 *
 * @module
 */
"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, type ReactElement } from "react";

declare global {
  /** Global window, augmented with the GoatCounter counter API. */
  interface Window {
    /** GoatCounter counter injected by count.js (present once the script loads). */
    goatcounter?: { count: (options: { path?: string; title?: string; event?: boolean }) => void };
  }
}

/** GoatCounter site code (subdomain), e.g. "bonprinter"; empty disables tracking. */
const CODE = process.env.NEXT_PUBLIC_GOATCOUNTER;

/**
 * Records a custom GoatCounter event (e.g. a form submission conversion).
 *
 * @param path - short event identifier (shown in the dashboard)
 * @param title - human-readable event title
 */
export function trackGoatEvent(path: string, title: string): void {
  if (typeof window !== "undefined") window.goatcounter?.count({ path, title, event: true });
}

/** Loads GoatCounter and counts client-side navigations (no-op without a code). */
export default function GoatCounter(): ReactElement | null {
  const pathname = usePathname();
  const isFirst = useRef(true);
  useEffect(() => {
    if (!CODE) return;
    // The initial page view is counted by count.js on load; count later navigations.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.goatcounter?.count({ path: pathname });
  }, [pathname]);

  if (!CODE) return null;
  return (
    <Script
      data-goatcounter={`https://${CODE}.goatcounter.com/count`}
      src="https://gc.zgo.at/count.js"
      strategy="afterInteractive"
    />
  );
}
