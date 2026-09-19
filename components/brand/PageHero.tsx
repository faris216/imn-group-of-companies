import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cinematic page hero — dark premium field, editorial type, gold rule. */
export function PageHero({ image, eyebrow, title, subtitle, children, tall, tone = "navy" }: {
  image?: string | null; eyebrow?: string; title: string; subtitle?: string; children?: ReactNode; tall?: boolean; tone?: "navy" | "charcoal" | "red";
}) {
  const bg = tone === "charcoal" ? "bg-charcoal-950" : tone === "red" ? "bg-red-800" : "bg-navy-950";
  return (
    <section className={cn("relative isolate overflow-hidden", tall ? "min-h-[86svh]" : "min-h-[52svh]", "flex items-end")}>
      <div className={cn("absolute inset-0 -z-10", bg)} aria-hidden="true" />
      {image ? (
        <Image src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/92 via-navy-950/45 to-navy-950/25" aria-hidden="true" />
      <div className="container-editorial w-full pb-16 pt-40 lg:pb-20">
        {eyebrow ? <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400">{eyebrow}</p> : null}
        <h1 className="max-w-4xl font-display text-4xl leading-[1.08] text-ivory-50 sm:text-5xl lg:text-6xl">{title}</h1>
        <div className="mt-6 h-px w-20 bg-gradient-to-r from-gold-500 to-transparent" aria-hidden="true" />
        {subtitle ? <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory-100/85 sm:text-lg">{subtitle}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
