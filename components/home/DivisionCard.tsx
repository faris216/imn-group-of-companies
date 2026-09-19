import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/brand/Reveal";
import type { Company } from "@/lib/types";

const ACCENT: Record<string, string> = {
  "imn-builder": "from-navy-700/85",
  "indon-mart": "from-red-800/85",
  brightstone: "from-charcoal-950/90",
};

export function DivisionCard({ company, href, cta, index }: { company: Company; href: string; cta: string; index: number }) {
  return (
    <Reveal delay={index * 0.1}>
      <Link href={href} className="group block">
        <article className="img-frame img-veil relative aspect-[3/4] rounded-sm shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
          {company.hero_image_url ? (
            <Image src={company.hero_image_url} alt={`${company.name} — representative imagery`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
          ) : null}
          <div className={`absolute inset-0 bg-gradient-to-t ${ACCENT[company.slug] ?? "from-charcoal-950/85"} via-transparent to-transparent`} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-gold-300">Division 0{index + 1}</p>
            <h3 className="font-display text-2xl leading-tight text-ivory-50 lg:text-[1.7rem]">{company.name}</h3>
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ivory-100/80">{company.short_description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-300 transition-all duration-300 group-hover:gap-3.5 group-hover:text-gold-200">
              {cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
