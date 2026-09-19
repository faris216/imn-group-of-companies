import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/brand/PageHero";
import { ProductCard } from "@/components/indon/ProductCard";
import { EmptyState } from "@/components/ui/states";
import { IndonSearchBar } from "@/components/indon/SearchBar";
import { getAdapter } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Availability } from "@/lib/types";

export const metadata: Metadata = { title: "INDON Products", description: "Browse INDON Mart products — tea, honey, dates, snacks, chikki and jaggery with live prices and availability." };
export const revalidate = 0;

export default async function IndonProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; availability?: string; sort?: string }> }) {
  const sp = await searchParams;
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const categories = await adapter.listCategories(company.id);
  const activeCategory = categories.find((c) => c.slug === sp.category) ?? null;
  const availability: Availability | "any" = sp.availability === "in_stock" ? "in_stock" : "any";
  const sort = (["name-asc", "price-asc", "price-desc"].includes(sp.sort ?? "") ? sp.sort : "default") as "default" | "name-asc" | "price-asc" | "price-desc";

  const products = await adapter.listProducts(company.id, {
    publishedOnly: true,
    search: sp.q || undefined,
    categoryId: activeCategory?.id ?? null,
    availability,
    sort,
  });
  const wa = await adapter.listWhatsApp(company.id, { activeOnly: true });

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: sp.q, category: sp.category, availability: sp.availability, sort: sp.sort, ...over };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const s = p.toString();
    return s ? `/indon/products?${s}` : "/indon/products";
  };

  return (
    <>
      <PageHero eyebrow="INDON Mart" title="Product Catalogue" subtitle="Live prices and availability. Choose a size, then buy in one WhatsApp message — no cart, no checkout." tone="red" />
      <section className="bg-ivory-50 py-14 lg:py-20">
        <div className="container-editorial">
          <IndonSearchBar initial={sp.q ?? ""} />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <nav aria-label="Category filter" className="flex flex-wrap gap-1.5">
              <Link href={qs({ category: undefined })} className={cn("rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors", !activeCategory ? "border-red-700 bg-red-700 text-white" : "border-charcoal-800/15 text-charcoal-700 hover:border-red-700/50 hover:text-red-700")}>
                All
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={qs({ category: c.slug })} className={cn("rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors", activeCategory?.id === c.id ? "border-red-700 bg-red-700 text-white" : "border-charcoal-800/15 text-charcoal-700 hover:border-red-700/50 hover:text-red-700")}>
                  {c.name}
                </Link>
              ))}
            </nav>
            <Link
              href={qs({ availability: availability === "in_stock" ? undefined : "in_stock" })}
              aria-pressed={availability === "in_stock"}
              className={cn("ml-auto rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors", availability === "in_stock" ? "border-[#0f7a41] bg-[#0f7a41] text-white" : "border-charcoal-800/15 text-charcoal-700 hover:border-[#0f7a41]/50 hover:text-[#0f7a41]")}
            >
              In stock only
            </Link>
          </div>
          <SortLinks current={sort} build={qs} />

          <div className="mt-10">
            {products.length === 0 ? (
              <EmptyState title="No products match your search" body="Try a different keyword or clear the filters — new INDON products are added regularly." action={<Link href="/indon/products" className="text-sm font-semibold text-red-700 underline underline-offset-4">Clear all filters</Link>} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} waPhone={wa[0]?.phone_number ?? null} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function SortLinks({ current, build }: { current: string; build: (o: Record<string, string | undefined>) => string }) {
  const options = [
    { key: "default", label: "Default" },
    { key: "name-asc", label: "Name A–Z" },
    { key: "price-asc", label: "Price ↑" },
    { key: "price-desc", label: "Price ↓" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Sort products">
      {options.map((o) => (
        <Link key={o.key} href={build({ sort: o.key === "default" ? undefined : o.key })} className={cn("rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors", current === o.key ? "bg-navy-700 text-ivory-50" : "bg-charcoal-800/6 text-charcoal-700 hover:bg-navy-700/12")}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}
