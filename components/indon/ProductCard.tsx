import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/brand/Reveal";
import { WhatsAppButton } from "@/components/brand/WhatsAppButton";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";
import { indonPurchaseMessage, waUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

export function firstAvailableVariant(p: Product) {
  return p.variants?.find((v) => v.availability === "in_stock") ?? p.variants?.[0] ?? null;
}

export function ProductCard({ product, waPhone, index = 0 }: { product: Product; waPhone: string | null; index?: number }) {
  const variant = firstAvailableVariant(product);
  const href = waPhone && variant ? waUrl(waPhone, indonPurchaseMessage(product.name, variant.variant_name, variant.quantity)) : null;

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-charcoal-800/8 bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift">
        <Link href={`/indon/products/${product.slug}`} className="img-frame img-veil relative block aspect-square">
          {product.main_image_url ? (
            <Image src={product.main_image_url} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
          ) : null}
          {product.is_ai_draft ? (
            <span className="absolute left-3 top-3 z-[2]"><Badge tone="draft">Draft data</Badge></span>
          ) : null}
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-red-700">{product.category?.name ?? "INDON"}</p>
          <h3 className="mt-1.5 font-display text-lg leading-snug text-navy-900">
            <Link href={`/indon/products/${product.slug}`} className="transition-colors hover:text-navy-600">{product.name}</Link>
          </h3>
          {product.short_description ? <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-charcoal-600">{product.short_description}</p> : null}
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-charcoal-800/8 pt-4">
            <div>
              <p className="font-display text-xl font-semibold text-navy-800">{formatINR(variant?.price)}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-charcoal-600">
                {variant ? `${variant.variant_name} · ` : ""}
                {variant?.availability === "in_stock" ? (
                  <span className="text-[#0f7a41]">Available: {variant.quantity}</span>
                ) : variant?.availability === "preorder" ? (
                  <span className="text-gold-700">Pre-order</span>
                ) : (
                  <span className="text-red-700">Out of stock</span>
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <WhatsAppButton href={href} size="sm" className="flex-1">Buy Now</WhatsAppButton>
            <Link href={`/indon/products/${product.slug}`} className="inline-flex items-center rounded-sm border border-navy-700/25 px-3.5 py-2 text-xs font-medium text-navy-700 transition-colors hover:bg-navy-700/5">
              Details
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
