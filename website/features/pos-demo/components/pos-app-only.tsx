/**
 * App-only view: renders just the BonPrinter application (the white POS box),
 * without the device frame, the website chrome or the explanatory text, filling
 * the window. Entry point for the standalone desktop (.exe) build.
 *
 * The app fills the window via fill mode: the menu bar stays at its constant
 * (desktop) size and only the body stretches to the available space.
 *
 * @module
 */
"use client";

import { useCallback, useState, type ReactElement } from "react";
import { type UserConfig } from "../types";
import { BonPrinterApp, type PosContext } from "./bon-printer-app";

/** Props for the {@link PosAppOnly} component. */
export interface PosAppOnlyProps {
  /** Raw article config text (articles.ini), loaded at build time. */
  articleText: string;
  /** Login users, loaded from user.ini at build time. */
  users: UserConfig;
}

/**
 * Renders the BonPrinter application filling the whole window (fill mode),
 * applying its scoped light/dark theme class.
 *
 * @returns the app-only element
 */
export function PosAppOnly({ articleText, users }: PosAppOnlyProps): ReactElement {
  const [demoDark, setDemoDark] = useState(false);
  /** Tracks the app's dark-mode flag so the scoped theme class can follow it. */
  const handleContext = useCallback((ctx: PosContext) => setDemoDark(ctx.demoDark), []);

  return (
    <div className={`h-full w-full overflow-hidden ${demoDark ? "pos-dark bg-[#0a0a0a]" : "pos-light bg-[#e5e5e5]"}`}>
      <BonPrinterApp
        articleText={articleText}
        users={users}
        onContext={handleContext}
        hideTitleBar
        initialUser={null}
        hideToasts
        enablePrinter
        fillMode
      />
    </div>
  );
}
