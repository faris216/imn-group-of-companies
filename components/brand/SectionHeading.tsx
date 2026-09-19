import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, subtitle, align = "left", tone = "dark", className }: {
  eyebrow?: string; title: string; subtitle?: string;
  align?: "left" | "center"; tone?: "dark" | "light"; className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className={cn("mb-3 text-[11px] font-semibold uppercase tracking-[0.32em]", tone === "dark" ? "text-gold-600" : "text-champagne-400")}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("font-display text-3xl leading-[1.12] sm:text-4xl lg:text-[2.9rem]", tone === "dark" ? "text-navy-900" : "text-ivory-50")}>
        {title}
      </h2>
      <div className={cn("mt-5 h-px w-16 bg-gradient-to-r from-gold-500 to-transparent", align === "center" && "mx-auto from-gold-500 via-gold-500/60 to-transparent")} aria-hidden="true" />
      {subtitle ? <p className={cn("mt-5 text-base leading-relaxed", tone === "dark" ? "text-charcoal-600" : "text-ivory-200/85")}>{subtitle}</p> : null}
    </Reveal>
  );
}
