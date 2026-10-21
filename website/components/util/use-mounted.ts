/**
 * Hook telling whether the component is rendering on the client after hydration.
 *
 * @module
 */
"use client";

import { useSyncExternalStore } from "react";

/** Never notifies: the mounted flag does not change after hydration. */
function subscribe(): () => void {
  return () => undefined;
}

/**
 * Returns false during server rendering and hydration, true afterwards. Use it to
 * render client-only values (e.g. the resolved theme) without a hydration mismatch.
 *
 * @returns whether client-only values may be rendered
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
