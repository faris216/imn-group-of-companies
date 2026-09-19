import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "gold" | "green" | "red" | "silver" | "draft";

const tones: Record<Tone, string> = {
  navy: "bg-navy-700/10 text-navy-700 border-navy-700/20",
  gold: "bg-gold-500/15 text-gold-700 border-gold-500/30",
  green: "bg-[#128C4B]/10 text-[#0f7a41] border-[#128C4B]/25",
  red: "bg-red-700/10 text-red-700 border-red-700/20",
  silver: "bg-charcoal-800/8 text-charcoal-700 border-charcoal-800/15",
  draft: "bg-amber-500/12 text-amber-800 border-amber-600/30",
};

export function Badge({ tone = "silver", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]", tones[tone], className)}>
      {children}
    </span>
  );
}
