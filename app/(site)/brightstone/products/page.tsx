import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/brand/PageHero";
import { JewelleryCard } from "@/components/brightstone/JewelleryCard";
import { EmptyState } from "@/components/ui/states";
import { getAdapter } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Brightstone Collections", description: "Silver rings, silver jewellery and gemstone collections by Brightstone — price on request." };
export const revalidate = 60;

export default async function BrightstoneProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; group?: string }> }) {
  const sp = await searchParams;
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const categories = await adapter.listCategories(company.id);
  const active = categories.find((c) => c.slug === sp.category) ?? null;
  const group = sp.group === "rings" || sp.group === "jewellery" || sp.group === "gemstones" || sp.group === "collections" ? sp.group : null;

  let categoryIds: string[] | null = null;
  if (active) categoryIds = [active.id];
  else if (group === "rings") categoryIds = categories.filter((c) => c.name === "Silver Rings").map((c) => c.id);
  else if (group === "jewellery") categoryIds = categories.filter((c) => c.name === "Silver Jewellery").map((c) => c.id);
  else if (group === "gemstones" || group === "collections") categoryIds = categories.filter((c) => /collection/i.test(c.name)).map((c) => c.id);

  const all = await adapter.listProducts(company.id, { publishedOnly: true });
  const products = categoryIds ? all.filter((p) => p.category_id && categoryIds!.includes(p.category_id)) : all;

  const groups = [
    { key: "rings", label: "Silver Rings", show: categories.some((c) => c.name === "Silver Rings") },
    { key: "jewellery", label: "Silver Jewellery", show: categories.some((c) => c.name === "Silver Jewellery") },
    { key: "gemstones", label: "Gemstones", show: categories.some((c) => /collection/i.test(c.name)) },
    { key: "collections", label: "Collections", show: categories.some((c) => /collection/i.test(c.name)) },
  ].filter((g) => g.show);

  return (
    <>
      <PageHero eyebrow="Brightstone" title="The Showroom" subtitle="Every piece is presented as Price on Request — enquire and our team will share full details." tone="charcoal" />
      <section className="bg-charcoal-950 py-14 lg:py-20">
        <div className="container-editorial">
          <div className="glass-dark mb-6 inline-flex flex-wrap gap-1 rounded-full p-1.5" role="group" aria-label="Filter by line">
            <Link href="/brightstone/products" className={cn("rounded-full px-4.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors", !group && !active ? "bg-champagne-400 text-charcoal-900" : "text-ivory-100 hover:text-champagne-300")}>
              All
            </Link>
            {groups.map((g) => (
              <Link key={g.key} href={`/brightstone/products?group=${g.key}`} className={cn("rounded-full px-4.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors", group === g.key ? "bg-champagne-400 text-charcoal-900" : "text-ivory-100 hover:text-champagne-300")}>
                {g.label}
              </Link>
            ))}
          </div>
          <div className="mb-10 flex flex-wrap gap-1.5" role="group" aria-label="Filter by collection">
            {categories.filter((c) => /collection/i.test(c.name)).map((c) => (
              <Link key={c.id} href={`/brightstone/products?category=${c.slug}`} className={cn("rounded-full border px-3.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors", active?.id === c.id ? "border-champagne-400 bg-champagne-400/15 text-champagne-300" : "border-white/12 text-ivory-200/70 hover:border-champagne-400/50 hover:text-champagne-300")}>
                {c.name}
              </Link>
            ))}
          </div>

          {products.length === 0 ? (
            <EmptyState title="No pieces in this selection yet" body="New concept pieces and confirmed catalogue items appear here first." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <JewelleryCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
