/**
 * Shared domain types for the POS demo feature.
 *
 * @module
 */

/** A single sellable article with its display name, gross price and tax group. */
export type Article = {
  /** Display name; may contain "\n" for line breaks on the grid button. */
  name: string;
  /** Gross unit price in euro. */
  price: number;
  /** Tax group the article belongs to (used for grouped report totals). */
  taxGroup: number;
  /** Optional background color override for the grid button (CSS color). */
  bg?: string;
  /** Optional foreground/text color override for the grid button (CSS color). */
  fg?: string;
  /** Whether the article starts marked (orange highlight), as if long-pressed. */
  mark?: boolean;
  /** Optional deposit (Pfand) per unit in euro; adds a PFAND line to the order. */
  deposit?: number;
};

/** Article grid: row-major list of filled/empty cells plus the grid dimensions. */
export type ArticleGrid = {
  /** Row-major cells; null marks an empty grid position. */
  grid: (Article | null)[];
  /** Number of grid rows. */
  rows: number;
  /** Number of grid columns. */
  cols: number;
  /** First receipt header line ([Header] header1), printed centered atop every bon. */
  header1: string;
  /** Second receipt header line ([Header] header2), printed centered atop every bon. */
  header2: string;
  /** [Tax] ec: when true, the clear key becomes an EC payment key after printing. */
  ec: boolean;
  /** [Prints] print_article (default true): whether article bons are printed at all. */
  printArticle: boolean;
  /** [Prints] print_free_price (default true): whether Free-user bons show the price. */
  printFreePrice: boolean;
};

/** One line of the current order: article, unit price, quantity and tax group. */
export type OrderLine = {
  /** Article name (matches {@link Article.name}). */
  name: string;
  /** Unit price in euro. */
  price: number;
  /** Booked quantity. */
  qty: number;
  /** Tax group of the article. */
  taxGroup: number;
  /** Deposit (Pfand) per unit in euro, if the article carries one. */
  deposit?: number;
};

/** Active numpad mode: off (null), quantity entry or change calculation. */
export type NumpadMode = null | "qty" | "change";

/** A single key on the login grid: operator button, digit or special login. */
export type LoginCell =
  | {
      /** Operator button (cashier slot B1..B15). */
      t: "op";
      /** Button caption. */
      label: string;
    }
  | {
      /** Inactive numbering cell. */
      t: "num";
      /** Cell caption. */
      label: string;
    }
  | {
      /** Special login entry. */
      t: "sp";
      /** Button caption. */
      label: string;
      /** Login identifier this cell triggers. */
      id: "Admin" | "Host" | "Free" | "Local" | "SmartCard";
    };

/** Supported UI languages (menu order: English first, then German). */
export const LANGUAGES = ["English", "Deutsch"] as const;

/** Supported UI language. */
export type Lang = (typeof LANGUAGES)[number];

/** Default UI language used on first render (German, despite the menu order). */
export const DEFAULT_LANG: Lang = "Deutsch";

/** A single user's login configuration from user.ini. */
export type User = {
  /** Optional display name. */
  name?: string;
  /** Password: empty = direct login, all digits = numeric PIN, otherwise locked. */
  pw?: string;
  /** Optional RFID/NFC card UIDs that log this user in. */
  uid?: string[];
};

/** Login users keyed by their section name in user.ini (e.g. "Admin", "B1"). */
export type UserConfig = Record<string, User>;
