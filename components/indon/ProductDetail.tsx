"use client";
import { BackButton } from "@/components/ui/BackButton";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WhatsAppButton } from "@/components/brand/WhatsAppButton";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/indon/ProductCard";
import { Button } from "@/components/ui/Button";
import { cn, formatINR } from "@/lib/utils";
import { indonPurchaseMessage, waUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

export function IndonProductDetail({ product, waPhone, related }: { product: Product; waPhone: string | null; related: Product[] }) {
  const images = product.images?.length ? product.images : product.main_image_url ? [{ id: "main", product_id: product.id, image_url: product.main_image_url, alt_text: product.name, is_primary: true, display_order: 0, created_at: "" }] : [];
  const [imgIdx, setImgIdx] = useState(0);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? null);
  const variant = product.variants?.find((v) => v.id === variantId) ?? product.variants?.[0] ?? null;
  const href = waPhone && variant ? waUrl(waPhone, indonPurchaseMessage(product.name, variant.variant_name, variant.quantity)) : null;
  const activeImg = images[imgIdx] ?? images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description ?? undefined,
    image: product.main_image_url ?? undefined,
    brand: { "@type": "Brand", name: "INDON" },
    offers: variant?.price != null
      ? { "@type": "Offer", price: variant.price, priceCurrency: "INR", availability: variant.availability === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", description: `Variant ${variant.variant_name}` }
      : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-ivory-50 pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="container-editorial">
          <BackButton fallback="/indon/products" className="mb-6" />
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-charcoal-600">
            <ol className="flex flex-wrap gap-1.5">
              <li><Link href="/" className="hover:text-navy-700">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/indon" className="hover:text-navy-700">INDON Mart</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/indon/products" className="hover:text-navy-700">Products</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-navy-700">{product.name}</li>
            </ol>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* gallery */}
            <div>
              <div className="img-frame relative aspect-square rounded-sm shadow-soft">
                {activeImg ? <Image src={activeImg.image_url} alt={activeImg.alt_text ?? product.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" /> : null}
                {product.is_ai_draft ? <span className="absolute left-3 top-3 z-[2]"><Badge tone="draft">Draft data</Badge></span> : null}
              </div>
              {images.length > 1 ? (
                <div className="mt-4 flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setImgIdx(i)}
                      aria-label={`View image ${i + 1}`}
                      aria-current={i === imgIdx}
                      className={cn("img-frame relative h-20 w-20 overflow-hidden rounded-sm border-2 transition-colors", i === imgIdx ? "border-red-700" : "border-transparent opacity-70 hover:opacity-100")}
                    >
                      <Image src={img.image_url} alt="" fill sizes="80px" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* buy panel */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-700">{product.category?.name ?? "INDON"}</p>
              <h1 className="mt-2 font-display text-4xl leading-tight text-navy-900">{product.name}</h1>
              {product.short_description ? <p className="mt-4 text-base leading-relaxed text-charcoal-600">{product.short_description}</p> : null}

              {product.variants && product.variants.length > 0 ? (
                <fieldset className="mt-8">
                  <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal-700">Choose size</legend>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVariantId(v.id)}
                        aria-pressed={v.id === variant?.id}
                        className={cn(
                          "rounded-sm border px-5 py-2.5 text-sm font-semibold transition-all",
                          v.id === variant?.id ? "border-red-700 bg-red-700 text-white shadow-soft" : "border-charcoal-800/20 bg-white text-charcoal-800 hover:border-red-700/60 hover:text-red-700",
                        )}
                      >
                        {v.variant_name}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <div className="glass-light mt-8 rounded-md p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-charcoal-600">Price {variant ? `· ${variant.variant_name}` : ""}</p>
                    <p className="mt-1 font-display text-4xl font-semibold text-navy-800">{formatINR(variant?.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-charcoal-600">Availability</p>
                    {variant?.availability === "in_stock" ? (
                      <p className="mt-1 text-lg font-semibold text-[#0f7a41]">Available: {variant.quantity}</p>
                    ) : variant?.availability === "preorder" ? (
                      <p className="mt-1 text-lg font-semibold text-gold-700">Pre-order</p>
                    ) : (
                      <p className="mt-1 text-lg font-semibold text-red-700">Out of stock</p>
                    )}
                  </div>
                </div>
                {variant?.size || variant?.weight ? (
                  <p className="mt-3 text-xs text-charcoal-600">
                    {[variant?.size, variant?.weight ? `${variant.weight}${variant.unit ?? "g"}` : null].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                <div className="mt-5">
                  <WhatsAppButton href={href} size="lg" className="w-full">Buy Now on WhatsApp</WhatsAppButton>
                </div>
                <p className="mt-3 text-center text-[11px] text-charcoal-600">Opens WhatsApp with your product &amp; size pre-filled — no cart, no checkout.</p>
              </div>

              {product.description ? (
                <div className="mt-8">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal-700">About this product</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-charcoal-600">{product.description}</p>
                </div>
              ) : null}
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-20">
              <h2 className="font-display text-2xl text-navy-900">You may also like</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} waPhone={waPhone} index={i} />
                ))}
              </div>
              <div className="mt-10">
                <Button href="/indon/products" variant="outline">Back to catalogue</Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
