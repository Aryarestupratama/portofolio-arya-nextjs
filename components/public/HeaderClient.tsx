"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "About", href: "/#about" },
];

type HeaderClientProps = {
  name: string;
  role: string | null;
};

// Design.md v2 §6.0: grid 12 kolom. Kiri = nama + role (dua baris),
// tengah = nav (mulai kolom 4), kanan = tombol Contact. Border bawah baru
// muncul setelah scroll. Skip-to-content link dan kunci scroll body saat
// menu mobile terbuka dipertahankan dari versi lama.
export function HeaderClient({ name, role }: HeaderClientProps) {
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-40 bg-paper/80 backdrop-blur-md transition-colors duration-300",
          scrolled ? "border-b border-line" : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto grid h-16 max-w-[1440px] grid-cols-12 items-center gap-4 px-6 md:px-10">
          <Link
            href="/"
            className="col-span-8 flex flex-col justify-center rounded-sm leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:col-span-3"
          >
            <span className="text-[15px] font-medium tracking-tight text-ink">
              {name}
            </span>
            {role && (
              <span className="text-[13px] text-ink-soft">{role}</span>
            )}
          </Link>

          <div className="col-span-6 hidden items-center gap-8 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="col-span-4 flex justify-end md:col-span-3">
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/#contact">Contact</Link>
            </Button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="-mr-2 rounded-md p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-line bg-paper md:hidden"
            >
              <div className="flex flex-col px-6 py-2 text-base">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-11 items-center border-b border-line py-3 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {item.label}
                  </Link>
                ))}

                <Button asChild className="mb-4 mt-4">
                  <Link href="/#contact" onClick={() => setMobileOpen(false)}>
                    Contact
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
