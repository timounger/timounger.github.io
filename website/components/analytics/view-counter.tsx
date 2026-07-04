/**
 * Private page-view counter, fed by GoatCounter's counter endpoint. It is only
 * shown when the URL carries the "?stats" parameter (a secret owner-only URL),
 * so normal visitors never see it. Renders nothing until a count is available
 * (also invisible locally or if the counter endpoint is not enabled). Requires
 * the setting "Allow adding visitor counts to your website" in GoatCounter.
 *
 * @module
 */
"use client";

import { useEffect, useState, type ReactElement } from "react";

/** GoatCounter site code (subdomain); empty disables the counter. */
const CODE = process.env.NEXT_PUBLIC_GOATCOUNTER;
/** Special counter path for the whole-site total. */
const TOTAL_PATH = "TOTAL";
/** URL query parameter that reveals the counter (owner-only). */
const STATS_PARAM = "stats";

/** Shows the total site page-view count (only with "?stats" in the URL). */
export default function ViewCounter(): ReactElement | null {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    if (!CODE) return undefined;
    if (!new URLSearchParams(window.location.search).has(STATS_PARAM)) return undefined;
    let active = true;
    fetch(`https://${CODE}.goatcounter.com/counter/${TOTAL_PATH}.json`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { count?: string } | null) => {
        const digits = Number(String(data?.count ?? "").replace(/\D/g, ""));
        if (active && Number.isFinite(digits) && digits > 0) setCount(digits.toLocaleString("de-DE"));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!CODE || !count) return null;
  return <span>{count} Seitenaufrufe</span>;
}
