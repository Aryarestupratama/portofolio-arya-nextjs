"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Projects", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "About", href: "/#about" },
];

// Design.md / PublicLayout.jsx (Laravel): header fixed, anchor nav ke
// section Home, mobile menu slide-down, CTA Contact terpisah dari nav
// link biasa. Skip-to-content link untuk aksesibilitas.
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-40 bg-cream/90 backdrop-blur-sm transition-colors duration-300",
          scrolled ? "border-b border-line" : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="group flex flex-col justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
          >
            <span className="font-display text-lg font-medium leading-tight tracking-tight text-ink">
              Arya Restu Pratama
            </span>
            <span className="font-mono text-[11px] leading-tight text-ink-soft">
              Web Developer
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/#contact"
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              Contact
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="-mr-2 rounded-md p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-line bg-cream md:hidden"
            >
              <div className="flex flex-col px-4 py-2 text-sm">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-sm border-b border-line py-3 text-ink-soft last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/#contact"
                  onClick={() => setMobileOpen(false)}
                  className="mb-4 mt-3 inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}