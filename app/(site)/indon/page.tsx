import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/brand/PageHero";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/brand/Reveal";
import { ProductCard } from "@/components/indon/ProductCard";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/brand/WhatsAppButton";
import { getAdapter } from "@/lib/data";
import { waUrl, genericEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "INDON Mart",
  description: "INDON Mart — tea, honey, dates, snacks, chikki and sugarcane jaggery. Browse the catalogue and order directly on WhatsApp.",
};
export const revalidate = 60;

export default async function IndonPage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const [categories, featured, banners, wa, intro, contact] = await Promise.all([
    adapter.listCategories(company.id),
    adapter.listProducts(company.id, { publishedOnly: true, featured: true, limit: 3 }),
    adapter.listBanners(company.id, { activeOnly: true }),
    adapter.listWhatsApp(company.id, { activeOnly: true }),
    adapter.getContent<string>("indon_intro"),
    adapter.getContact(company.id),
  ]);
  const waPhone = wa[0]?.phone_number ?? null;

  return (
    <>
      <PageHero image="/assets/indon/creative-honey.png" eyebrow="Division 02" title="INDON Mart" subtitle={company.short_description ?? undefined} tone="red" tall>
        <div className="flex flex-wrap gap-4">
          <Button href="/indon/products" variant="gold">Browse Catalogue</Button>
          <WhatsAppButton href={waPhone ? waUrl(waPhone, genericEnquiryMessage("INDON Mart products")) : null}>Chat on WhatsApp</WhatsAppButton>
        </div>
      </PageHero>

      <section className="bg-ivory-50 py-20 lg:py-24">
        <div className="container-editorial grid gap-14 lg:grid-cols-5">
          <SectionHeading eyebrow="The Brand" title="From our shelves to your home" className="lg:col-span-2" />
          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-charcoal-700">{intro ?? company.description}</p>
            <p className="mt-4 text-sm text-charcoal-600">No cart, no checkout — choose your size and we take it from there on WhatsApp.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory-100 py-16 lg:py-24">
        <div className="container-editorial">
          <SectionHeading eyebrow="Categories" title="What we pack" />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <Link href={`/indon/products?category=${c.slug}`} className="group block rounded-sm border border-charcoal-800/10 bg-white p-5 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                  <p className="font-display text-base text-navy-800 transition-colors group-hover:text-red-700">{c.name}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 py-16 lg:py-24">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Featured" title="This season's favourites" />
            <Reveal delay={0.1}><Button href="/indon/products" variant="red">All Products</Button></Reveal>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} waPhone={waPhone} index={i} />
            ))}
          </div>
        </div>
      </section>

      {banners.length > 0 ? (
        <section className="bg-navy-950 py-16 lg:py-24">
          <div className="container-editorial">
            <SectionHeading tone="light" eyebrow="Promotions" title="Current campaigns" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {banners.slice(0, 6).map((b, i) => (
                <Reveal key={b.id} delay={(i % 3) * 0.08}>
                  <Link href={b.button_url ?? "/indon/products"} className="group block">
                    <article className="img-frame img-veil relative aspect-[4/5] rounded-sm shadow-soft transition-shadow hover:shadow-lift">
                      <Image src={b.image_url} alt={b.title ?? "INDON promotion"} fill sizes="(max-width:768px) 100vw, 33vw" />
                      <div className="absolute inset-x-0 bottom-0 z-[2] p-5">
                        <p className="font-display text-xl text-ivory-50">{b.title}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold-300">{b.subtitle}</p>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-red-700 py-14 text-center text-white">
        <div className="container-editorial">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl">Order in one message</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
              {wa.map((w) => w.phone_number).join("  ·  ") || "WhatsApp numbers are being configured."}
            </p>
            <div className="mt-7 flex justify-center">
              <WhatsAppButton href={waPhone ? waUrl(waPhone, genericEnquiryMessage("INDON Mart products")) : null} size="lg">Buy Now on WhatsApp</WhatsAppButton>
            </div>
            {contact?.email ? <p className="mt-5 text-xs text-white/70">{contact.email}</p> : null}
          </Reveal>
        </div>
      </section>
    </>
  );
}
