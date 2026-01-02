/**
 * Client-side wrapper around the next-themes provider for light/dark theming.
 *
 * @module
 */
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps, ReactElement } from "react";

/**
 * Thin client-side wrapper around next-themes' provider, forwarding all props
 * to enable light/dark theming for the app.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>): ReactElement {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
