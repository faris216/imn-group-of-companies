"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Debounced, mobile-friendly catalogue search (§57). */
export function IndonSearchBar({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set("q", value);
      else url.searchParams.delete("q");
      if ((url.searchParams.get("q") ?? "") !== initial) router.replace(url.pathname + url.search, { scroll: false });
    }, 350);
    return () => clearTimeout(t);
  }, [value, router, initial]);

  return (
    <div className="glass-light flex items-center gap-3 rounded-full px-5 py-3">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-charcoal-600" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, categories…"
        aria-label="Search INDON products"
        className="w-full bg-transparent text-sm text-charcoal-800 placeholder:text-charcoal-600/50 focus:outline-none"
      />
    </div>
  );
}
