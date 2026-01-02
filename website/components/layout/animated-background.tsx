/**
 * Decorative animated background of floating themed icons.
 *
 * @module
 */

import {
  Ticket,
  Coins,
  Receipt,
  Euro,
  ReceiptText,
  Printer,
  CircleDollarSign,
  BadgeEuro,
  type LucideIcon,
} from "lucide-react";
import { type ReactElement } from "react";

/** A single floating decorative icon and its placement/animation settings. */
type FloatItem = {
  /** Icon component to render. */
  Icon: LucideIcon;
  /** Tailwind position utility classes. */
  pos: string;
  /** Rendered icon size in pixels. */
  size: number;
  /** Animation utility class applied to the icon. */
  anim: string;
  /** CSS animation delay value. */
  delay: string;
};

/** Decorative floating icons placed across the animated background. */
const items: FloatItem[] = [
  { Icon: Ticket, pos: "left-[5%] top-[10%]", size: 96, anim: "anim-float-a", delay: "0s" },
  { Icon: Coins, pos: "left-[82%] top-[14%]", size: 72, anim: "anim-float-b", delay: "1.2s" },
  { Icon: Receipt, pos: "left-[14%] top-[42%]", size: 110, anim: "anim-float-c", delay: "0.6s" },
  { Icon: Euro, pos: "left-[70%] top-[38%]", size: 84, anim: "anim-float-a", delay: "2.4s" },
  { Icon: ReceiptText, pos: "left-[88%] top-[62%]", size: 90, anim: "anim-float-b", delay: "0.3s" },
  { Icon: Printer, pos: "left-[8%] top-[74%]", size: 100, anim: "anim-float-c", delay: "1.8s" },
  { Icon: CircleDollarSign, pos: "left-[46%] top-[20%]", size: 64, anim: "anim-float-b", delay: "3s" },
  { Icon: BadgeEuro, pos: "left-[60%] top-[80%]", size: 88, anim: "anim-float-a", delay: "1s" },
  { Icon: Ticket, pos: "left-[34%] top-[88%]", size: 76, anim: "anim-float-c", delay: "2s" },
  { Icon: Coins, pos: "left-[40%] top-[58%]", size: 68, anim: "anim-float-a", delay: "0.9s" },
];

/**
 * Decorative, non-interactive background of softly floating themed icons used
 * behind the page content.
 */
export default function AnimatedBackground(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.18] dark:opacity-[0.08]"
    >
      {items.map(({ Icon, pos, size, anim, delay }, i) => (
        <span
          key={i}
          className={`absolute ${pos} ${anim} text-brand-900 dark:text-brand-300`}
          style={{ animationDelay: delay }}
        >
          <Icon size={size} strokeWidth={1.25} />
        </span>
      ))}
    </div>
  );
}
