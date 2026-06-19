/**
 * Wraps pages in shared site chrome, omitting it on full-screen routes.
 *
 * @module
 */
"use client";

import { usePathname } from "next/navigation";
import { type ReactElement } from "react";
import Header from "./header";
import Footer from "./footer";
import AnimatedBackground from "./animated-background";
import WhatsappFab from "./whatsapp-fab";

/**
 * Wraps page content with the shared site chrome (animated background, header,
 * footer and WhatsApp button). On full-screen routes such as /demo the chrome
 * is omitted and only the page content is rendered.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }): ReactElement {
  const pathname = usePathname();
  const isFullscreen = pathname?.startsWith("/demo") || pathname?.startsWith("/kiosk");

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <WhatsappFab />
    </>
  );
}
