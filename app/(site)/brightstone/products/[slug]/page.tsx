import { BackButton } from "@/components/ui/BackButton";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SparkleEffect } from "@/components/brand/SparkleEffect";
import { WhatsAppButton } from "@/components/brand/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { getAdapter } from "@/lib/data";
import { brightstoneEnquiryMessage, waUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adapter = getAdapter();
  const product = await adapter.getProductBySlug(slug);
  if (!product) return { title: "Piece not found" };
  return { title: product.name, description: product.short_description ?? undefined };
}

export default async function BrightstoneProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adapter = getAdapter();
  const product = await adapter.getProductBySlug(slug);
  if (!product) notFound();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company || product.company_id !== company.id) notFound();
  const wa = await adapter.listWhatsApp(company.id, { activeOnly: true });
  const contact = await adapter.getContact(company.id);
  const waPhone = wa[0]?.phone_number ?? null;
  const images = product.images?.length ? product.images : product.main_image_url ? [{ id: "m", image_url: product.main_image_url, alt_text: product.name }] : [];
  const isGem = /collection/i.test(product.category?.name ?? "");

  return (
    <section className="bg-charcoal-950 pb-20 pt-32 text-ivory-50 lg:pt-40">
      <div className="container-editorial">
        <BackButton fallback="/brightstone/products" tone="dark" className="mb-6" />
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-ivory-200/60">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href="/" className="hover:text-champagne-300">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/brightstone" className="hover:text-champagne-300">Brightstone</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-champagne-300">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="sweep relative overflow-hidden rounded-sm border border-white/8 shadow-[0_32px_80px_rgb(0_0_0/0.5)]">
            <div className="img-frame relative aspect-[4/5]">
              {images[0] ? <Image src={images[0].image_url} alt={images[0].alt_text ?? product.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" /> : null}
              {isGem ? <SparkleEffect seed={3} /> : null}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-champagne-400">{product.category?.name ?? "Brightstone"}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight lg:text-5xl">{product.name}</h1>
            <div className="mt-5 h-px w-16 bg-gradient-to-r from-champagne-400 to-transparent" aria-hidden="true" />
            {product.short_description ? <p className="mt-6 text-base leading-relaxed text-ivory-100/80">{product.short_description}</p> : null}
            {product.description ? <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ivory-200/60">{product.description}</p> : null}

            <dl className="glass-dark mt-9 rounded-md p-6">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-silver-400">Price</dt>
                <dd className="font-display text-2xl text-champagne-300">Price on Request</dd>
              </div>
              <div className="mt-5">
                <WhatsAppButton href={waPhone ? waUrl(waPhone, brightstoneEnquiryMessage(product.name)) : null} size="lg" className="w-full">
                  Enquire Now
                </WhatsAppButton>
                {contact?.email ? (
                  <p className="mt-3 text-center text-[11px] text-ivory-200/60">
                    or email <a className="underline underline-offset-4 hover:text-champagne-300" href={`mailto:${contact.email}`}>{contact.email}</a>
                  </p>
                ) : null}
              </div>
            </dl>
            {product.is_ai_draft ? (
              <p className="mt-5 text-[11px] leading-relaxed text-ivory-200/45">
                Concept catalogue piece pending client confirmation. No certification, purity, origin or weight claims are made until verified.
              </p>
            ) : null}
            <div className="mt-8">
              <Button href="/brightstone/products" variant="outline" className="border-ivory-50/25 text-ivory-50 hover:bg-ivory-50/10">Back to showroom</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
