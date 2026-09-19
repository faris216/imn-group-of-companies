import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/brand/PageHero";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/brand/Reveal";
import { SparkleEffect } from "@/components/brand/SparkleEffect";
import { JewelleryCard } from "@/components/brightstone/JewelleryCard";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/brand/WhatsAppButton";
import { getAdapter } from "@/lib/data";
import { waUrl, genericEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Brightstone Silver & Gemstones",
  description: "Brightstone — silver rings, silver jewellery and gemstone collections. Price on request; enquire for details.",
};
export const revalidate = 60;

export default async function BrightstonePage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const [categories, catalogue, intro, wa, gallery] = await Promise.all([
    adapter.listCategories(company.id),
    adapter.listProducts(company.id, { publishedOnly: true, limit: 12 }),
    adapter.getContent<string>("brightstone_intro"),
    adapter.listWhatsApp(company.id, { activeOnly: true }),
    adapter.listGallery({ companyId: company.id, publishedOnly: true, limit: 4 }),
  ]);
  // Balanced showcase: three rings + three gemstone pieces (tops up if either side is short).
  const rings = catalogue.filter((p) => !/collection/i.test(p.category?.name ?? ""));
  const gems = catalogue.filter((p) => /collection/i.test(p.category?.name ?? ""));
  let featuredList = [...rings.slice(0, 3), ...gems.slice(0, 3)];
  if (featuredList.length < 6) {
    featuredList = [...featuredList, ...catalogue.filter((c) => !featuredList.some((f) => f.id === c.id))].slice(0, 6);
  }
  const collections = categories.filter((c) => /collection/i.test(c.name));
  const silverCats = categories.filter((c) => !/collection/i.test(c.name));
  const waPhone = wa[0]?.phone_number ?? null;

  return (
    <>
      <PageHero image="/assets/brightstone/ring-gemstone.jpg" eyebrow="Division 03" title="Brightstone Silver & Gemstones" subtitle="A showroom of light, metal and stone — silver rings, fine jewellery and gemstone collections, presented by enquiry." tone="charcoal" tall>
        <div className="flex flex-wrap gap-4">
          <Button href="/brightstone/products" variant="gold">View Collections</Button>
          <WhatsAppButton href={waPhone ? waUrl(waPhone, genericEnquiryMessage("Brightstone collections")) : null}>Enquire Now</WhatsAppButton>
        </div>
      </PageHero>

      <section className="bg-charcoal-950 py-20 text-ivory-50 lg:py-28">
        <div className="container-editorial grid gap-14 lg:grid-cols-5">
          <SectionHeading tone="light" eyebrow="The House" title="Craft, presented quietly" className="lg:col-span-2" />
          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-ivory-100/85">{intro ?? company.description}</p>
            <p className="mt-4 text-sm text-ivory-200/60">All pieces are presented as Price on Request — our team shares details personally over WhatsApp or email.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-charcoal-900 py-16 lg:py-24">
        <div className="container-editorial">
          <SectionHeading tone="light" eyebrow="Silver" title="Silver rings & jewellery" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {silverCats.slice(0, 3).map((c, i) => (
              <Reveal key={c.id} delay={i * 0.07}>
                <a href={`/brightstone/products?category=${c.slug}`} className="sweep group block rounded-sm border border-white/8 bg-charcoal-950 p-7 transition-colors hover:border-champagne-400/40">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne-400">Collection</p>
                  <h3 className="mt-2 font-display text-2xl text-ivory-50 transition-colors group-hover:text-champagne-200">{c.name}</h3>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-16">
            <SectionHeading tone="light" eyebrow="Gemstones" title="Gemstone collections" />
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {collections.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.05}>
                  <a href={`/brightstone/products?category=${c.slug}`} className="group relative block overflow-hidden rounded-sm border border-white/8 bg-charcoal-950 px-4 py-6 text-center transition-colors hover:border-champagne-400/40">
                    <SparkleEffect seed={i + 1} />
                    <span className="relative z-[2] font-display text-sm text-ivory-100 transition-colors group-hover:text-champagne-200">{c.name.replace(" Collection", "")}</span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-charcoal-950 py-16 lg:py-24">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading tone="light" eyebrow="Featured" title="Selected pieces" />
            <Reveal delay={0.1}><Button href="/brightstone/products" variant="gold">All Pieces</Button></Reveal>
          </div>
          <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SparkleEffect seed={9} />
            {featuredList.map((p, i) => (
              <JewelleryCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {gallery.items.length > 0 ? (
        <section className="bg-charcoal-900 py-16 lg:py-24">
          <div className="container-editorial">
            <SectionHeading tone="light" eyebrow="Visual Gallery" title="Light on metal & stone" />
            <div className="mt-10 columns-2 gap-4 lg:columns-4">
              {gallery.items.map((g) => (
                <div key={g.id} className="sweep img-frame mb-4 break-inside-avoid rounded-sm">
                  <Image src={g.image_url} alt={g.title ?? "Brightstone gallery"} width={800} height={1000} loading="lazy" sizes="(max-width:640px) 50vw, 25vw" className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-charcoal-950 py-16 text-center lg:py-20">
        <div className="container-editorial">
          <Reveal>
            <h2 className="font-display text-3xl text-ivory-50 sm:text-4xl">Enquire about a piece</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-ivory-200/70">Prices are shared on request. Write to us and the Brightstone team will respond personally.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <WhatsAppButton href={waPhone ? waUrl(waPhone, genericEnquiryMessage("Brightstone pieces")) : null} size="lg">Enquire Now</WhatsAppButton>
              <Button href="/contact" variant="outline" className="border-ivory-50/30 text-ivory-50 hover:bg-ivory-50/10" size="lg">Contact Page</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
