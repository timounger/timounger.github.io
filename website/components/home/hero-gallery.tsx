/**
 * Hero image carousel with thumbnails and navigation controls.
 *
 * @module
 */
"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Pixels scrolled per animation frame during edge auto-scroll of the strip. */
const SCROLL_STEP_PX = 6;

/** A single gallery entry with full image, thumbnail, alt text and dimensions. */
type GalleryImage = { src: string; thumb: string; alt: string; width: number; height: number };

/** Ordered list of gallery images shown in the hero carousel. */
const images: GalleryImage[] = [
  {
    src: "/img/bonprinterbox_front.webp",
    thumb: "/img/bonprinterbox_front_thumb.webp",
    alt: "BonPrinter Box Vorderansicht",
    width: 745,
    height: 640,
  },
  {
    src: "/img/article_view.webp",
    thumb: "/img/article_view_thumb.webp",
    alt: "Artikelansicht auf dem Touchscreen",
    width: 1000,
    height: 640,
  },
  {
    src: "/img/staff.webp",
    thumb: "/img/staff_thumb.webp",
    alt: "Einsatz auf einem Vereinsfest",
    width: 1024,
    height: 676,
  },
  {
    src: "/img/printer.webp",
    thumb: "/img/printer_thumb.webp",
    alt: "Integrierter Bondrucker",
    width: 800,
    height: 774,
  },
  {
    src: "/img/nfc.webp",
    thumb: "/img/nfc_thumb.webp",
    alt: "Kontaktlose Bediener-Anmeldung per NFC",
    width: 800,
    height: 735,
  },
  { src: "/img/sumup.webp", thumb: "/img/sumup_thumb.webp", alt: "SumUp Kartenterminal", width: 800, height: 717 },
];

/**
 * Image carousel for the hero section: shows the active image with a scrollable
 * thumbnail strip, previous/next buttons and edge-hover auto-scrolling.
 */
export default function HeroGallery(): ReactElement {
  const [active, setActive] = useState(0);
  const current = images[active];
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const autoScrollRaf = useRef<number | null>(null);

  useEffect(() => {
    const btn = thumbRefs.current[active];
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  /**
   * Moves the active image by the given offset, wrapping around the ends.
   *
   * @param delta - number of positions to move (negative = backwards)
   */
  const go = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  /** Cancels any in-progress thumbnail-strip auto-scroll animation. */
  const stopAutoScroll = () => {
    if (autoScrollRaf.current !== null) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
  };

  /**
   * Starts or stops auto-scrolling of the thumbnail strip depending on whether
   * the pointer is near its left or right edge.
   *
   * @param e - the pointer move event over the thumbnail strip
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const strip = stripRef.current;
    if (!strip) return;
    const rect = strip.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    const edge = 80;
    let dir = 0;
    if (x < edge) dir = -1;
    else if (x > w - edge) dir = 1;

    stopAutoScroll();
    if (dir !== 0) {
      const step = () => {
        strip.scrollLeft += dir * SCROLL_STEP_PX;
        autoScrollRaf.current = requestAnimationFrame(step);
      };
      step();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-fit overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          fetchPriority="high"
          className="block h-72 w-auto sm:h-80 md:h-96"
        />
      </div>

      {images.length > 1 && (
        <div className="relative w-full max-w-full">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Vorheriges Bild"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md transition hover:bg-white hover:text-slate-900 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={20} />
          </button>
          <div
            ref={stripRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={stopAutoScroll}
            className="flex w-full gap-2 overflow-x-auto px-12 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, idx) => (
              <button
                key={img.src}
                ref={(el) => {
                  thumbRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => setActive(idx)}
                aria-label={`Bild ${idx + 1}: ${img.alt}`}
                aria-current={idx === active}
                className={`flex-shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                  idx === active
                    ? "ring-brand-500"
                    : "ring-slate-200 hover:ring-slate-400 dark:ring-slate-700 dark:hover:ring-slate-500"
                }`}
              >
                <img
                  src={img.thumb}
                  alt=""
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Nächstes Bild"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md transition hover:bg-white hover:text-slate-900 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
