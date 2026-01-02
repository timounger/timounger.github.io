/**
 * Simulated Windows 11 desktop shown while the app window is minimized:
 * a wallpaper with desktop icons (Recycle Bin and the BonPrinter app, which
 * reopens the window on double click).
 *
 * @remarks
 * The wallpaper is a CSS recreation evoking the default Windows 11 "Bloom"
 * background - the original image is copyrighted by Microsoft and is not bundled.
 *
 * @module
 */
"use client";

import { Trash2 } from "lucide-react";
import { type ReactElement } from "react";
import { useWindowState } from "./window-context";

/** Drop shadow used to keep the white icon labels readable on the wallpaper. */
const LABEL_SHADOW = "[text-shadow:0_1px_2px_rgba(0,0,0,0.7)]";
/** Number of translucent petals forming the central bloom. */
const PETAL_COUNT = 8;
/** Degrees in a full turn, for spacing the petals evenly. */
const FULL_TURN_DEG = 360;
/** Angle between two petals. */
const PETAL_STEP_DEG = FULL_TURN_DEG / PETAL_COUNT;
/** Gradient fill of a single bloom petal. */
const PETAL_BG =
  "radial-gradient(50% 55% at 50% 22%, rgba(125,205,255,0.55), rgba(46,120,224,0.22) 55%, transparent 80%)";
/** Deep blue radial base, like the Bloom wallpaper backdrop. */
const BACKDROP = "radial-gradient(120% 95% at 50% 52%, #0d56a0 0%, #07336a 42%, #041d3c 72%, #02101f 100%)";

/**
 * Renders the desktop overlay covering the app area when minimized.
 *
 * @returns the desktop element
 */
export function WindowsDesktop(): ReactElement {
  const { open } = useWindowState();
  return (
    <div className="absolute inset-0 z-50 select-none overflow-hidden" style={{ background: BACKDROP }}>
      {/* Central bloom: overlapping translucent petals plus a bright core */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
        {Array.from({ length: PETAL_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute h-44 w-24 rounded-[50%] blur-2xl"
            style={{
              background: PETAL_BG,
              transformOrigin: "50% 100%",
              transform: `translate(-50%, -100%) rotate(${i * PETAL_STEP_DEG}deg)`,
            }}
          />
        ))}
        <div
          className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(180,230,255,0.7), transparent 70%)" }}
        />
      </div>

      {/* Brand logo, top right - always white (inverted) */}
      <img
        src="/img/logo.svg"
        alt="BonPrinter Box"
        draggable={false}
        className="pointer-events-none absolute right-4 top-3 h-11 w-auto select-none opacity-90 brightness-0 drop-shadow invert"
      />

      {/* Desktop icons in a top-left column */}
      <div className="absolute left-3 top-3 flex flex-col gap-3">
        {/* Recycle Bin (decorative, not clickable) */}
        <div className="flex w-16 flex-col items-center gap-1 rounded p-1 text-center">
          <Trash2 size={26} className="text-white/90 drop-shadow" />
          <span className={`text-[11px] text-white ${LABEL_SHADOW}`}>Papierkorb</span>
        </div>

        {/* BonPrinter app - double click reopens the window */}
        <button
          type="button"
          onDoubleClick={open}
          className="flex w-16 flex-col items-center gap-1 rounded p-1 text-center transition hover:bg-white/15"
          title="Doppelklick zum Öffnen"
        >
          <img src="/pos-demo/app.png" alt="" className="h-7 w-7 drop-shadow" />
          <span className={`text-[11px] text-white ${LABEL_SHADOW}`}>BonPrinter</span>
        </button>
      </div>
    </div>
  );
}
