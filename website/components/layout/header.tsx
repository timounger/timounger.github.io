/**
 * Site header with the brand logo, primary navigation and a mobile menu.
 *
 * @module
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactElement } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../theme/theme-toggle";

/** Primary navigation links shown in the header (desktop and mobile menu). */
const navLinks = [
  { href: "/#features", label: "Highlights" },
  { href: "/demo", label: "Demo" },
  { href: "/#pricing", label: "Preise" },
];

/**
 * Sticky site header with the logo, primary navigation, theme toggle and a
 * call-to-action; collapses into a toggleable mobile menu on small screens.
 */
export default function Header(): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container-page flex h-28 items-center justify-between">
        <Link href="/" className="flex items-center font-semibold" aria-label="BonPrinter Box Startseite">
          <Image
            src="/img/logo.svg"
            alt="BonPrinter Box"
            width={263}
            height={88}
            className="h-14 w-auto dark:brightness-0 dark:invert"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/#booking" className="btn-primary px-4 py-2 text-sm">
            Jetzt anfragen
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="rounded-md p-2 text-slate-700 dark:text-slate-300"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 md:hidden dark:border-slate-800">
          <div className="container-page flex flex-col gap-3 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#booking" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Jetzt anfragen
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
