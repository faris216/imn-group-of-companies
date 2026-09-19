"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ImnLogo } from "@/components/brand/ImnLogo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/companies", label: "Our Companies", children: [
    { href: "/builder", label: "IMN Builder" },
    { href: "/indon", label: "INDON Mart" },
    { href: "/brightstone", label: "Brightstone" },
  ] },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:rounded-sm focus:bg-navy-700 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-all duration-500",
          solid ? "glass-light py-2.5" : "bg-transparent py-4",
        )}
      >
        <div className="container-wide flex items-center justify-between gap-6">
          <Link href="/" aria-label="IMN Group of Companies — home" className="shrink-0">
            <ImnLogo width={scrolled ? 126 : 144} priority />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.href} className="relative" onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
                  <button
                    onClick={() => setDrop((d) => !d)}
                    aria-expanded={drop}
                    aria-haspopup="true"
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-[13px] font-medium tracking-[0.08em] transition-colors",
                      solid ? "text-charcoal-800 hover:text-navy-700" : "text-ivory-50/90 hover:text-white",
                    )}
                  >
                    {item.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div
                    className={cn(
                      "glass-light absolute left-0 top-full mt-2 w-60 origin-top rounded-md p-2 transition-all duration-200",
                      drop ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
                    )}
                  >
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="block rounded-sm px-3.5 py-2.5 text-sm text-charcoal-800 transition-colors hover:bg-navy-700/6 hover:text-navy-700">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-3.5 py-2 text-[13px] font-medium tracking-[0.08em] transition-colors",
                    solid ? "text-charcoal-800 hover:text-navy-700" : "text-ivory-50/90 hover:text-white",
                    pathname === item.href && (solid ? "text-navy-700" : "text-white underline decoration-gold-400 decoration-2 underline-offset-8"),
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href="/contact"
              className={cn(
                "ml-3 rounded-sm px-4.5 py-2 text-[13px] font-semibold tracking-[0.08em] transition-all",
                "bg-gold-500 text-navy-900 hover:bg-gold-400 hover:shadow-lift",
              )}
            >
              Enquire
            </Link>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn("rounded-sm p-2 transition-colors lg:hidden", solid ? "text-charcoal-900" : "text-ivory-50")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile navigation */}
      <div
        className={cn(
          "fixed inset-0 z-[75] bg-navy-950/97 backdrop-blur-xl transition-all duration-400 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile" className="flex h-full flex-col justify-center gap-1 px-8">
          {[NAV[0]!, NAV[1]!, ...NAV[2]!.children!, NAV[3]!, NAV[4]!].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${open ? 80 + i * 45 : 0}ms` }}
              className={cn(
                "font-display text-3xl text-ivory-50 transition-all duration-500 hover:text-gold-400",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-8 h-px w-24 bg-gold-500/60" aria-hidden="true" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ivory-200/60">IMN Group of Companies</p>
        </nav>
      </div>
    </>
  );
}
