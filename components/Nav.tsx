"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MotionToggle from "./MotionToggle";

const LINKS = [
  { href: "/", label: "The Barn" },
  { href: "/log", label: "The Log" },
  { href: "/board", label: "The Board" },
  { href: "/bats", label: "The Bats" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-edge bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-1.5 px-4 py-3 sm:gap-x-6 sm:gap-y-2 sm:px-8 sm:py-4">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-xl font-black tracking-tight sm:text-2xl">
            The Bat Barn
          </span>
          <span className="hidden text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-3 sm:inline">
            Winton Woods · Ohio
          </span>
        </Link>
        <nav aria-label="Pages" className="ml-auto flex flex-wrap items-baseline gap-x-1 gap-y-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-sm px-2 py-0.5 text-[0.9rem] font-bold sm:px-2.5 sm:py-1 sm:text-[0.95rem] " +
                  (active
                    ? "bg-kraft text-ink underline decoration-ember decoration-2 underline-offset-4"
                    : "text-ink-2 hover:bg-paper-2 hover:text-ink")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <MotionToggle />
      </div>
    </header>
  );
}
