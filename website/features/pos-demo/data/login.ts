/**
 * Static login keypad grid layout for the POS demo.
 *
 * @module
 */

import type { LoginCell } from "../types";

/** Login grid layout: 6 columns x 5 rows of operator, digit and special keys. */
export const LOGIN: LoginCell[] = [
  { t: "op", label: "B1" },
  { t: "op", label: "B2" },
  { t: "op", label: "B3" },
  { t: "op", label: "B4" },
  { t: "op", label: "B5" },
  { t: "op", label: "B6" },
  { t: "num", label: "7" },
  { t: "num", label: "8" },
  { t: "num", label: "9" },
  { t: "op", label: "B7" },
  { t: "op", label: "B8" },
  { t: "op", label: "B9" },
  { t: "num", label: "4" },
  { t: "num", label: "5" },
  { t: "num", label: "6" },
  { t: "op", label: "B10" },
  { t: "op", label: "B11" },
  { t: "op", label: "B12" },
  { t: "num", label: "1" },
  { t: "num", label: "2" },
  { t: "num", label: "3" },
  { t: "op", label: "B13" },
  { t: "op", label: "B14" },
  { t: "op", label: "B15" },
  { t: "num", label: "0" },
  { t: "sp", label: "Admin", id: "Admin" },
  { t: "sp", label: "Host", id: "Host" },
  { t: "sp", label: "Free", id: "Free" },
  { t: "sp", label: "Local", id: "Local" },
  { t: "sp", label: "Smart\nCard", id: "SmartCard" },
];
