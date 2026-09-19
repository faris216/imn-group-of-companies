import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/brand/Reveal";
import { SparkleEffect } from "@/components/brand/SparkleEffect";
import type { Product } from "@/lib/types";

/** Luxury showroom card — metallic sweep on hover + sparse gem glints (§34). */
export function JewelleryCard({ product, index = 0 }: { product: Product; index?: number }) {
  const isGem = /collection/i.test(product.category?.name ?? "");
  return (
    <Reveal delay={(index % 3) * 0.08}>
      <Link href={`/brightstone/products/${product.slug}`} className="group block">
        <article className="sweep relative overflow-hidden rounded-sm border border-white/8 bg-charcoal-900 shadow-soft transition-shadow duration-500 group-hover:shadow-[0_24px_64px_rgb(0_0_0/0.55)]">
          <div className="img-frame relative aspect-[4/5]">
            {product.main_image_url ? (
              <Image src={product.main_image_url} alt={`${product.name} — concept imagery`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
            ) : null}
            {isGem ? <SparkleEffect seed={index + 2} /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-transparent to-transparent" aria-hidden="true" />
          </div>
          <div className="relative p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne-400">{product.category?.name ?? "Brightstone"}</p>
            <h3 className="mt-1.5 font-display text-xl leading-snug text-ivory-50 transition-colors group-hover:text-champagne-200">{product.name}</h3>
            {product.short_description ? <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ivory-200/65">{product.short_description}</p> : null}
            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-silver-400">Price on Request</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne-400 transition-all duration-300 group-hover:gap-3 group-hover:text-champagne-300">
                Enquire
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </div>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
