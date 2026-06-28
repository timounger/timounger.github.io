/**
 * Skeuomorphic frame that makes the POS app look like the physical BonPrinter
 * Box: the app as the screen in a wide black monitor frame, a cash drawer below
 * it and an Epson receipt printer to the right.
 *
 * @module
 */
"use client";

import { AlertTriangle, ArrowDownToLine, Info, Power, Scroll } from "lucide-react";
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { T } from "../i18n/translations";
import { type Lang } from "../types";
import { CalendarFlyout } from "./calendar-flyout";
import { StartMenu } from "./start-menu";
import { TouchKeyboard } from "./touch-keyboard";
import { WindowContext, type WindowState } from "./window-context";
import { WindowsDesktop } from "./windows-desktop";
import { WindowsTaskbar } from "./windows-taskbar";

/** Props for the {@link DeviceFrame} component. */
export interface DeviceFrameProps {
  /** The POS application, rendered as the device screen. */
  children: ReactNode;
  /** Current UI language, for the device info tooltips. */
  lang: Lang;
  /** Amount shown on the SumUp terminal (euro), taken over on card payment. */
  terminalAmount: number;
  /** Whether a receipt is shown on the printer (only after something was printed). */
  showBon: boolean;
  /** First receipt header line shown on the printer (from articles.ini [Header]). */
  bonHeader1: string;
  /** Second receipt header line shown on the printer (from articles.ini [Header]). */
  bonHeader2: string;
  /** Article name shown on the printed receipt (last printed article). */
  bonName: string;
  /** Article price (euro) shown on the printed receipt (last printed article). */
  bonPrice: number;
}

/** Torn-paper edge for the receipt hanging out of the printer. */
const RECEIPT_TEAR = "polygon(0 0,100% 0,100% 92%,90% 100%,75% 92%,60% 100%,45% 92%,30% 100%,15% 92%,0 100%)";
/** Number of teeth on the printer's serrated paper tear edge. */
const TEAR_TEETH_COUNT = 18;
/** Height (in percent) of the flat band above the tear teeth. */
const TEETH_BASE_PCT = 45;
/** Full percentage span, for building the tear-teeth polygon. */
const FULL_PCT = 100;
/**
 * Builds a downward sawtooth clip-path (straight top, serrated bottom) for the
 * printer's paper tear edge.
 *
 * @param count - number of teeth across the width
 * @returns a CSS clip-path polygon value
 */
function tearTeeth(count: number): string {
  const step = FULL_PCT / count;
  const points = ["0% 0%", "100% 0%"];
  for (let i = count; i > 0; i -= 1) {
    points.push(`${i * step}% ${TEETH_BASE_PCT}%`, `${i * step - step / 2}% 100%`);
  }
  points.push(`0% ${TEETH_BASE_PCT}%`);
  return `polygon(${points.join(", ")})`;
}
/** Clip-path for the serrated paper tear edge. */
const TEAR_TEETH = tearTeeth(TEAR_TEETH_COUNT);
/** How far the printer extends to the right of the box, in pixels (for the fit-to-width scaling). */
const PRINTER_OVERHANG_PX = 230;
/** Small safety margin so the scaled device never touches the viewport edges. */
const VIEWPORT_PADDING_PX = 8;
/**
 * Builds the white-glazed spruce grain for a given line angle: several warm
 * wood-toned line layers at different spacings so the grain shines through the
 * white lacquer. The grain runs along the beam (0deg = horizontal lines).
 *
 * @param angle - direction of the grain lines in degrees
 * @returns a layered CSS background-image value
 */
function woodGrain(angle: number): string {
  return [
    `repeating-linear-gradient(${angle}deg, rgba(150,118,78,0.20) 0px, rgba(150,118,78,0.20) 1px, transparent 1px, transparent 5px)`,
    `repeating-linear-gradient(${angle}deg, rgba(125,95,58,0.14) 0px, rgba(125,95,58,0.14) 1px, transparent 1px, transparent 11px)`,
    `repeating-linear-gradient(${angle}deg, rgba(180,150,110,0.12) 0px, rgba(180,150,110,0.12) 2px, transparent 2px, transparent 17px)`,
  ].join(", ");
}
/** Grain angle in degrees for horizontal beams (lines run left to right). */
const GRAIN_HORIZONTAL_DEG = 0;
/** Grain angle in degrees for vertical beams (lines run top to bottom). */
const GRAIN_VERTICAL_DEG = 90;
/** Horizontal grain for the top/bottom beams (grain runs along their length). */
const WOOD_GRAIN_H = woodGrain(GRAIN_HORIZONTAL_DEG);
/** Vertical grain for the left/right beams (grain runs along their length). */
const WOOD_GRAIN_V = woodGrain(GRAIN_VERTICAL_DEG);

/**
 * Wraps the given app in a stylized BonPrinter Box (housing, cash drawer and
 * receipt printer). Purely decorative - the framed app stays fully interactive.
 *
 * @returns the framed device element
 */
export function DeviceFrame({
  children,
  lang,
  terminalAmount,
  showBon,
  bonHeader1,
  bonHeader2,
  bonName,
  bonPrice,
}: DeviceFrameProps): ReactElement {
  const t = T[lang];
  /** Terminal amount formatted like the SumUp display, e.g. "€ 25,50". */
  const terminalDisplay = `€ ${terminalAmount.toFixed(2).replace(".", ",")}`;
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  /** Closes every open flyout (start menu, calendar and keyboard). */
  const closeFlyouts = () => {
    setStartOpen(false);
    setCalendarOpen(false);
    setKeyboardOpen(false);
  };
  const windowState: WindowState = {
    minimized,
    minimize: () => setMinimized(true),
    restore: () => setMinimized(false),
    toggle: () => setMinimized((m) => !m),
    closed,
    close: () => setClosed(true),
    open: () => {
      setClosed(false);
      setMinimized(false);
    },
    startOpen,
    toggleStart: () => {
      setStartOpen((o) => !o);
      setCalendarOpen(false);
      setKeyboardOpen(false);
    },
    closeStart: () => setStartOpen(false),
    calendarOpen,
    toggleCalendar: () => {
      setCalendarOpen((o) => !o);
      setStartOpen(false);
      setKeyboardOpen(false);
    },
    closeCalendar: () => setCalendarOpen(false),
    keyboardOpen,
    toggleKeyboard: () => {
      setKeyboardOpen((o) => !o);
      setStartOpen(false);
      setCalendarOpen(false);
    },
    closeKeyboard: () => setKeyboardOpen(false),
  };

  // Scale the whole device down so it fits narrow viewports (desktop stays at scale 1).
  // The box is centred in the viewport and the printer overhangs to the right - that
  // overhang on the right half is what must still fit.
  const deviceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [box, setBox] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const device = deviceRef.current;
    if (!device) return undefined;
    /** Recomputes the scale from the viewport width and the measured box size. */
    const update = () => {
      const width = device.offsetWidth;
      const height = device.offsetHeight;
      const avail = document.documentElement.clientWidth - VIEWPORT_PADDING_PX;
      const halfNeeded = width / 2 + PRINTER_OVERHANG_PX;
      setScale(Math.min(1, avail / 2 / halfNeeded));
      setBox({ width, height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(device);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  // When scaled, centre the (over-wide) box via left/margin and collapse the freed height.
  const deviceStyle =
    scale < 1
      ? {
          left: "50%",
          marginLeft: -box.width / 2,
          marginBottom: -(box.height * (1 - scale)),
          transform: `scale(${scale})`,
          transformOrigin: "top center" as const,
        }
      : undefined;

  return (
    <WindowContext.Provider value={windowState}>
      <div className="pb-3 pt-1">
        {/* The box is centered; the printer hangs off to the right (absolute, not centered with it) */}
        <div ref={deviceRef} className={`relative w-fit ${scale < 1 ? "" : "mx-auto"}`} style={deviceStyle}>
          {/* 3D top face (top wooden plank). Depth 32px, thickness 24px -> angle arctan(32/24)=53deg.
              Front-left corner rounded with an elliptical radius (narrow + tall) so it tapers to a
              point and reaches down into the frame's rounded corner, closing flush. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-full z-0 h-6 origin-bottom rounded-tl-md bg-gradient-to-b from-[#f3ecda] via-[#ece2cc] to-[#dbd0b5]"
            style={{ transform: "skewX(-53deg)", borderBottomLeftRadius: "8px 8px", borderTopRightRadius: "16px 6px" }}
          />
          {/* 3D right face (right side). Complementary angle 37deg so its top edge meets the top face's right edge.
              Front-bottom corner rounded with an elliptical radius (wide + short) so it tapers into the
              frame's rounded bottom-right corner, closing flush. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-full z-0 w-[28px] origin-left rounded-br-md bg-gradient-to-r from-[#cabfa4] to-[#a99e80]"
            style={{ transform: "skewY(-37deg)", borderBottomLeftRadius: "22px 4px", borderTopRightRadius: "4px 22px" }}
          />
          {/* Corner fill behind the frame's rounded top-right corner: keeps the corner round but
              hides the otherwise-black triangle where the three flat faces meet in a point. */}
          <div className="pointer-events-none absolute right-0 top-0 z-0 h-3 w-3 bg-[#e0d4ba]" />
          {/* White-glazed spruce frame surrounding the whole device (rounded corners). At the
              top-right 3-way corner the top and right faces are tapered into this rounding so the
              corner stays round and the black triangle is filled. */}
          <div className="relative z-10 w-fit shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-[#efe6d2] via-[#e6dcc6] to-[#d6cab0] p-6 shadow-[0_18px_34px_rgba(0,0,0,0.3)] ring-1 ring-black/10">
            {/* Spruce grain on each beam, running along its length */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-6 opacity-80"
              style={{ backgroundImage: WOOD_GRAIN_H }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 opacity-80"
              style={{ backgroundImage: WOOD_GRAIN_H }}
            />
            <div
              className="pointer-events-none absolute bottom-6 left-0 top-6 w-6 opacity-80"
              style={{ backgroundImage: WOOD_GRAIN_V }}
            />
            <div
              className="pointer-events-none absolute bottom-6 right-0 top-6 w-6 opacity-80"
              style={{ backgroundImage: WOOD_GRAIN_V }}
            />

            <div className="relative flex flex-col">
              {/* Light-grey backing: fills the slight gap between the wood and the narrower monitor */}
              <div className="rounded-sm bg-[#8f8f8f] px-2.5 pt-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]">
                {/* Wide black monitor frame with rounded corners */}
                <div className="rounded-2xl bg-gradient-to-b from-[#1c1c1c] to-[#030303] p-5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)] ring-1 ring-black/70">
                  {/* Screen: the app plus a Windows-style taskbar below it */}
                  <div className="relative overflow-hidden rounded-md bg-[#0a0a0a]">
                    <div className="flex flex-col">
                      {/* App screen with the desktop overlaid when minimized */}
                      <div className="relative">
                        {children}
                        {(minimized || closed) && <WindowsDesktop />}
                      </div>
                      <WindowsTaskbar />
                    </div>

                    {/* Flyouts (start menu / calendar / keyboard): full-screen click-away backdrop plus the panel */}
                    {(startOpen || calendarOpen || keyboardOpen) && (
                      <>
                        <button
                          type="button"
                          aria-label="Menü schließen"
                          className="absolute inset-0 z-[55] cursor-default"
                          onClick={closeFlyouts}
                        />
                        {startOpen && <StartMenu />}
                        {calendarOpen && <CalendarFlyout />}
                        {keyboardOpen && <TouchKeyboard />}
                      </>
                    )}
                  </div>
                </div>

                {/* Monitor-mount remnants - grey shows to its left and right */}
                <div className="flex justify-center">
                  <div className="h-5 w-40 rounded-b-md bg-gradient-to-b from-[#2a2a2a] to-[#141414] shadow-[0_4px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/50" />
                </div>
              </div>

              {/* White wooden beam below the mount (grain along its length) */}
              <div className="h-5 opacity-80" style={{ backgroundImage: WOOD_GRAIN_H }} />

              {/* Cash drawer (Safescan LD-4141), closed - front view */}
              {/* Outer casing: wide black border */}
              <div className="rounded-[12px] bg-gradient-to-b from-[#1e1e1e] to-[#070707] px-6 py-4 shadow-[0_16px_28px_rgba(0,0,0,0.45)] ring-1 ring-black/70">
                {/* Inner frame: the actual drawer face that slides out */}
                <div className="relative h-32 overflow-hidden rounded-md bg-gradient-to-b from-[#3a3a3a] via-[#1d1d1d] to-[#0d0d0d] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-black/60">
                  {/* Safescan logo plate, top right */}
                  <div className="absolute right-4 top-3 select-none rounded-sm bg-white px-1.5 py-1 text-[11px] leading-none text-black shadow-sm">
                    <span className="font-bold">Safe</span>
                    <span className="font-normal">scan</span>
                  </div>

                  {/* Narrow insert slot: left, almost centered vertically (slightly below) */}
                  <div className="absolute left-24 top-[56%] h-1.5 w-[28rem] -translate-y-1/2 rounded-full bg-black/70 shadow-[inset_0_2px_3px_rgba(0,0,0,0.85)]" />

                  {/* Key lock with an info tooltip on hover/focus: lower right */}
                  <button
                    type="button"
                    aria-label="Schloss der Kassenlade - Info"
                    className="group absolute bottom-3 right-24 flex h-7 w-7 cursor-help items-center justify-center rounded-full bg-gradient-to-b from-[#bcbcbc] via-[#7a7a7a] to-[#2e2e2e] shadow-[0_1px_2px_rgba(0,0,0,0.6)] ring-1 ring-black/70"
                  >
                    {/* Keyhole */}
                    <span className="h-2.5 w-1 rounded-full bg-black/85" />
                    {/* blue info icon - signals that hovering shows a tooltip */}
                    <Info
                      size={16}
                      strokeWidth={2.5}
                      fill="#1e88e5"
                      aria-hidden
                      className="absolute -right-2 -top-2 z-20 text-white drop-shadow"
                    />
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 select-none rounded-md bg-zinc-900/95 px-2.5 py-1.5 text-left text-[11px] font-normal leading-snug text-white shadow-lg group-hover:block group-focus:block">
                      {t.drawerInfo}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Signature on the existing bottom wood */}
            <div
              className="absolute inset-x-0 bottom-1 select-none text-center text-[14px] font-bold text-[#4a3b22]"
              style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
            >
              Timo Unger Software Engineering
            </div>
          </div>

          {/* Four gliding feet under the bottom wooden beam (outer two slightly inset) */}
          <div className="absolute inset-x-0 bottom-0 z-0 flex translate-y-[65%] justify-between px-10">
            <span className="h-2.5 w-12 rounded-b-md bg-gradient-to-b from-[#9a9a9a] to-[#5a5a5a] shadow-[0_3px_4px_rgba(0,0,0,0.4)] ring-1 ring-black/30" />
            <span className="h-2.5 w-12 rounded-b-md bg-gradient-to-b from-[#9a9a9a] to-[#5a5a5a] shadow-[0_3px_4px_rgba(0,0,0,0.4)] ring-1 ring-black/30" />
            <span className="h-2.5 w-12 rounded-b-md bg-gradient-to-b from-[#9a9a9a] to-[#5a5a5a] shadow-[0_3px_4px_rgba(0,0,0,0.4)] ring-1 ring-black/30" />
            <span className="h-2.5 w-12 rounded-b-md bg-gradient-to-b from-[#9a9a9a] to-[#5a5a5a] shadow-[0_3px_4px_rgba(0,0,0,0.4)] ring-1 ring-black/30" />
          </div>

          {/* Optional SumUp Solo card terminal, on the floor right of the box, below the printer */}
          <div className="absolute bottom-1 left-full ml-16 block">
            <button type="button" aria-label="SumUp Solo - Info" className="group relative block cursor-help">
              {/* SumUp Solo in its white charging cradle */}
              <div className="w-36 select-none rounded-2xl bg-gradient-to-b from-[#fcfcfc] to-[#e4e4e4] p-1.5 shadow-[0_12px_20px_rgba(0,0,0,0.4)] ring-1 ring-black/15">
                {/* device with screen */}
                <div className="rounded-xl bg-[#f3f3f3] p-1 ring-1 ring-black/10">
                  <div className="overflow-hidden rounded-md bg-gradient-to-b from-[#ebf4fc] to-[#d8e8f6] px-1.5 pb-1 pt-0.5 ring-1 ring-black/15">
                    {/* status bar */}
                    <div className="flex items-center justify-end gap-1 text-[5px] font-medium leading-none text-zinc-500">
                      <span className="flex items-end gap-px">
                        <span className="h-[3px] w-px rounded-sm bg-zinc-500" />
                        <span className="h-[4px] w-px rounded-sm bg-zinc-500" />
                        <span className="h-[5px] w-px rounded-sm bg-zinc-500" />
                        <span className="h-[6px] w-px rounded-sm bg-zinc-400" />
                      </span>
                      <span>94%</span>
                    </div>
                    {/* amount */}
                    <div className="text-center text-[13px] font-bold leading-tight text-zinc-800">
                      {terminalDisplay}
                    </div>
                    <div className="mb-1 text-center text-[5px] leading-none text-zinc-500">Keine USt.</div>
                    {/* numeric keypad */}
                    <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-center text-[9px] font-medium leading-tight text-zinc-700">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "←"].map((k) => (
                        <span key={k}>{k}</span>
                      ))}
                    </div>
                    {/* pay button */}
                    <div className="mt-1 rounded bg-black py-1 text-center text-[7px] font-semibold leading-none text-white">
                      Bezahlen
                    </div>
                  </div>
                </div>
                {/* cradle bottom with the SumUp logo */}
                <div className="flex items-center justify-center gap-1 pt-1.5">
                  <span className="flex h-3 w-3 items-center justify-center rounded-[3px] bg-zinc-800 text-[7px] font-black leading-none text-white">
                    S
                  </span>
                  <span className="text-[9px] font-bold lowercase tracking-tight text-zinc-700">
                    sumup<span className="text-zinc-400">•</span>
                  </span>
                </div>
              </div>
              {/* soft shadow on the floor */}
              <div className="mx-auto mt-1.5 h-1 w-12 rounded-[50%] bg-black/30 blur-sm" />
              {/* blue info icon - signals that hovering shows a tooltip */}
              <Info
                size={16}
                strokeWidth={2.5}
                fill="#1e88e5"
                aria-hidden
                className="absolute -right-2 -top-2 z-20 text-white drop-shadow"
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-52 -translate-x-1/2 select-none rounded-md bg-zinc-900/95 px-2.5 py-1.5 text-left text-[11px] font-normal leading-snug text-white shadow-lg group-hover:block group-focus:block">
                {t.cardTerminalInfo}
              </span>
            </button>
          </div>

          {/* Epson receipt printer: right of the box, flush with the front */}
          <div className="absolute left-full top-5 block">
            <div className="relative w-52">
              {/* 3D top face of the printer (45deg, about half the box depth).
                  Front-left + back-right corners rounded elliptically to close flush. */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-full z-0 h-3.5 origin-bottom rounded-tl-md bg-gradient-to-b from-[#5a5a5a] to-[#393939]"
                style={{
                  transform: "skewX(-45deg)",
                  borderBottomLeftRadius: "5px 10px",
                  borderTopRightRadius: "10px 4px",
                }}
              />
              {/* 3D right face of the printer (complementary 45deg so the corner meets); depth pulled
                  back a touch so its back edge does not overshoot the top plank. */}
              <div
                className="pointer-events-none absolute inset-y-0 left-full z-0 w-[12px] origin-left rounded-br-md bg-gradient-to-r from-[#363636] to-[#1d1d1d]"
                style={{
                  transform: "skewY(-45deg)",
                  borderBottomLeftRadius: "10px 5px",
                  borderTopRightRadius: "4px 12px",
                }}
              />
              {/* Corner fill behind the body's rounded top-right corner: keeps it round but hides the
                  black triangle where the three flat faces meet in a point. The body below is
                  position:relative WITHOUT a z-index, so it paints over this fill (DOM order) but
                  does NOT become a stacking context - otherwise the lever's info icon would be
                  trapped below the overhanging receipt. */}
              <div className="pointer-events-none absolute right-0 top-0 z-0 h-2.5 w-2.5 bg-[#3c3c3c]" />
              {/* Printer body (Epson TM-T20III, charcoal) */}
              <div className="relative rounded-md rounded-t-lg bg-gradient-to-b from-[#454545] via-[#323232] to-[#1c1c1c] p-2.5 shadow-[0_18px_30px_rgba(0,0,0,0.45)] ring-1 ring-black/50">
                {/* Top cover (slightly lighter, matte) */}
                <div className="relative h-12 rounded-t-md bg-gradient-to-b from-[#565656] via-[#474747] to-[#393939] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  {/* seam between cover and body */}
                  <div className="absolute inset-x-1.5 bottom-0 h-px bg-black/60" />
                </div>

                {/* Paper exit: rectangular slot with the metallic tear teeth along the top edge
                    (teeth point down; the lower edge is hidden by the emerging receipt) */}
                <div className="relative ml-8 mr-1 mt-6 h-4 overflow-hidden rounded-sm bg-gradient-to-b from-[#0c0c0c] to-black shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]">
                  <div
                    className="absolute inset-x-0 top-0 h-2.5 bg-gradient-to-b from-[#bcbcbc] via-[#828282] to-[#4c4c4c]"
                    style={{ clipPath: TEAR_TEETH }}
                  />
                </div>

                {/* Controls: lever flush at the left edge; feed button and LEDs centered under it, further down */}
                <div className="-ml-2.5 mt-3 flex w-6 flex-col items-center">
                  {/* paper-change lever with a downward arrow and an info tooltip on hover/focus */}
                  <button
                    type="button"
                    aria-label="Drucker öffnen - Info"
                    className="group relative flex h-10 w-6 cursor-help items-center justify-center rounded-r-sm bg-gradient-to-b from-[#5a5a5a] to-[#2e2e2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-black/40"
                  >
                    <span className="h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-[#cfcfcf]" />
                    {/* blue info icon - signals that hovering shows a tooltip */}
                    <Info
                      size={16}
                      strokeWidth={2.5}
                      fill="#1e88e5"
                      aria-hidden
                      className="absolute -right-2 -top-2 z-20 text-white drop-shadow"
                    />
                    <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden w-44 -translate-y-1/2 select-none rounded-md bg-zinc-900/95 px-2.5 py-1.5 text-left text-[11px] font-normal leading-snug text-white shadow-lg group-hover:block group-focus:block">
                      {t.printerInfo}
                    </span>
                  </button>
                  {/* feed button and LEDs, centered under the lever, with a gap below the lever */}
                  <div className="mt-8 flex flex-col items-center gap-2.5">
                    {/* round paper feed button with the feed symbol (down arrow) to its right */}
                    <div className="relative h-4 w-4 rounded-full bg-gradient-to-b from-[#5e5e5e] to-[#363636] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/50">
                      <ArrowDownToLine
                        size={9}
                        strokeWidth={2.5}
                        aria-hidden
                        className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-zinc-400"
                      />
                    </div>
                    {/* three status LEDs with the Epson panel icons to their right; only the bottom one lit */}
                    <div className="flex flex-col gap-1.5">
                      <div className="relative h-2 w-2 rounded-full bg-[#4a4a4a]">
                        <Scroll
                          size={9}
                          strokeWidth={2.5}
                          aria-hidden
                          className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                      <div className="relative h-2 w-2 rounded-full bg-[#4a4a4a]">
                        <AlertTriangle
                          size={9}
                          strokeWidth={2.5}
                          aria-hidden
                          className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                      <div className="relative h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_7px_#38bdf8]">
                        <Power
                          size={9}
                          strokeWidth={2.5}
                          aria-hidden
                          className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lower body hanging down, with the Epson logo near the bottom */}
                <div className="mt-6 h-12" />
                <div className="select-none pb-2 pr-2 text-right text-[10px] font-bold tracking-[0.2em] text-zinc-300">
                  EPSON
                </div>
              </div>

              {/* Receipt emerging from the slot (only after something was printed) */}
              {showBon && (
                <div
                  className="absolute left-[56%] top-[5.75rem] z-10 w-36 -translate-x-1/2 rotate-1 bg-white px-2.5 py-3 shadow-md"
                  style={{ clipPath: RECEIPT_TEAR }}
                >
                  {/* The printer prints upside down, so the content is rotated 180 degrees */}
                  <div className="rotate-180 select-none text-zinc-800">
                    {/* Header: black-and-white football spanning both title lines */}
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-2xl grayscale" aria-hidden>
                        ⚽
                      </span>
                      <div className="leading-tight">
                        {bonHeader1 && <div className="text-[10px] font-semibold">{bonHeader1}</div>}
                        {bonHeader2 && <div className="text-[8px]">{bonHeader2}</div>}
                      </div>
                    </div>
                    {/* Article name: thermal-printer look (monospace, dark grey) and
                        ESC/POS double height at normal width (scaleY 2). */}
                    <div className="my-2 whitespace-nowrap font-mono text-[13px] font-bold leading-none text-[#3d3d3d]">
                      <span className="inline-block scale-y-[2]">{bonName}</span>
                    </div>
                    {/* Price: same thermal font/color as the name, but normal height */}
                    <div className="text-right font-mono text-[11px] leading-tight text-[#3d3d3d]">
                      EUR {bonPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WindowContext.Provider>
  );
}
