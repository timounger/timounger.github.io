/**
 * Standalone POS application page (no device frame, no website chrome), used as
 * the entry point for the desktop (.exe) build.
 *
 * @module
 */

import { PosAppOnly } from "@/features/pos-demo/components/pos-app-only";
import { loadArticleText } from "@/features/pos-demo/data/load-articles";
import { loadUsers } from "@/features/pos-demo/data/load-users";
import { type ReactElement } from "react";

/**
 * Renders only the BonPrinter application, full-screen on a plain background.
 *
 * @returns the kiosk page element
 */
export default function KioskPage(): ReactElement {
  const articleText = loadArticleText();
  const users = loadUsers();
  return (
    <div className="fixed inset-0 z-30 overflow-hidden">
      <PosAppOnly articleText={articleText} users={users} />
    </div>
  );
}
