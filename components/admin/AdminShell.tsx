"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import type { AdminSession } from "@/lib/types";

const SECTIONS: Array<{ group: string; items: Array<{ href: string; label: string }> }> = [
  { group: "Overview", items: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/content", label: "Group Content" },
    { href: "/admin/enquiries", label: "Enquiries" },
    { href: "/admin/audit", label: "Audit Log" },
    { href: "/admin/settings", label: "Global Settings" },
  ] },
  { group: "IMN Builder", items: [
    { href: "/admin/builder", label: "Dashboard" },
    { href: "/admin/builder/projects", label: "Projects" },
    { href: "/admin/builder/gallery", label: "Gallery" },
    { href: "/admin/builder/banners", label: "Banners" },
    { href: "/admin/builder/content", label: "Content & SEO" },
    { href: "/admin/builder/contact", label: "Contact" },
  ] },
  { group: "INDON Mart", items: [
    { href: "/admin/indon-mart", label: "Dashboard" },
    { href: "/admin/indon-mart/products", label: "Products" },
    { href: "/admin/indon-mart/categories", label: "Categories" },
    { href: "/admin/indon-mart/banners", label: "Banners" },
    { href: "/admin/indon-mart/whatsapp", label: "WhatsApp" },
    { href: "/admin/indon-mart/content", label: "Content & SEO" },
    { href: "/admin/indon-mart/contact", label: "Contact" },
  ] },
  { group: "Brightstone", items: [
    { href: "/admin/brightstone", label: "Dashboard" },
    { href: "/admin/brightstone/products", label: "Products" },
    { href: "/admin/brightstone/categories", label: "Collections" },
    { href: "/admin/brightstone/gallery", label: "Gallery" },
    { href: "/admin/brightstone/banners", label: "Banners" },
    { href: "/admin/brightstone/enquiries", label: "Enquiries" },
    { href: "/admin/brightstone/whatsapp", label: "WhatsApp" },
    { href: "/admin/brightstone/content", label: "Content & SEO" },
    { href: "/admin/brightstone/contact", label: "Contact" },
  ] },
];

export function AdminShell({ session, mode, children }: { session: AdminSession; mode: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin" className="space-y-7">
      {SECTIONS.map((s) => (
        <div key={s.group}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-charcoal-600/70">{s.group}</p>
          <ul className="space-y-0.5">
            {s.items.map((i) => {
              const active = i.href === "/admin" ? pathname === "/admin" : pathname === i.href || pathname.startsWith(`${i.href}/`);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn("block rounded-sm px-3 py-2 text-[13px] font-medium transition-colors", active ? "bg-navy-700 text-ivory-50" : "text-charcoal-700 hover:bg-navy-700/8 hover:text-navy-700")}
                  >
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-[100svh] bg-ivory-100">
      <header className="glass-light sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle admin menu" aria-expanded={open} className="rounded-sm p-2 text-charcoal-800 hover:bg-charcoal-800/8 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/assets/brand/imn-logo.png" alt="IMN" width={277} height={112} style={{ width: 74, height: 30 }} />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal-700 sm:block">Admin CMS</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {mode === "local" ? (
            <span className="hidden rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800 md:block">Local Demo Mode</span>
          ) : null}
          <Link href="/" className="text-[12px] font-semibold text-navy-700 underline decoration-gold-500/50 underline-offset-4 hover:text-navy-600">View Site</Link>
          <span className="hidden text-[12px] text-charcoal-600 sm:block">{session.email}</span>
          <form action={logout}>
            <button type="submit" className="rounded-sm border border-charcoal-800/20 px-3.5 py-1.5 text-[12px] font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-800/6">Sign Out</button>
          </form>
        </div>
      </header>

      <div className="flex">
        <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-charcoal-800/8 bg-ivory-50 px-3 py-6 transition-transform duration-300 lg:sticky lg:top-[57px] lg:h-[calc(100svh-57px)] lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
          {nav}
        </aside>
        {open ? <button aria-label="Close menu" className="fixed inset-0 z-30 bg-charcoal-950/40 lg:hidden" onClick={() => setOpen(false)} /> : null}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
