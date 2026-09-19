"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** Simple "← Back" control: browser history when available, fallback link otherwise. */
export function BackButton({ fallback, label = "Back", tone = "light", className }: {
  fallback: string; label?: string; tone?: "light" | "dark"; className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
        tone === "dark"
          ? "border-white/20 bg-white/5 text-ivory-100/90 hover:border-gold-400/60 hover:text-gold-300"
          : "border-charcoal-800/20 bg-white/70 text-charcoal-700 hover:border-navy-600/50 hover:text-navy-700",
        className,
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M19 12H5m0 0l6 6m-6-6l6-6" />
      </svg>
      {label}
    </button>
  );
}
