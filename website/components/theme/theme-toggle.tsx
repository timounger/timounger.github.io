/**
 * Button that toggles between light and dark theme.
 *
 * @module
 */
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, type ReactElement } from "react";

/**
 * Button that toggles between light and dark theme. Renders a static
 * placeholder before mount to avoid a hydration mismatch, then reflects the
 * resolved theme.
 */
export default function ThemeToggle(): ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme wechseln"
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Sun size={20} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Dunkel - auf Hell umschalten" : "Hell - auf Dunkel umschalten";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={label}
      aria-label={label}
      className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
