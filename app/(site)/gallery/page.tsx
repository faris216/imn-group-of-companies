import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/brand/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/Button";
import { getAdapter } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Gallery", description: "A unified gallery across IMN Builder, INDON Mart and Brightstone Silver & Gemstones." };
export const revalidate = 60;
const PAGE_SIZE = 24;

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ division?: string; page?: string }> }) {
  const sp = await searchParams;
  const adapter = getAdapter();
  const companies = await adapter.listCompanies();
  const division = companies.find((c) => c.slug === sp.division) ?? null;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const { items, total } = await adapter.listGallery({
    publishedOnly: true,
    companyId: division?.id ?? undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const pages = Math.ceil(total / PAGE_SIZE);

  const filters = [
    { slug: "", label: "All" },
    ...companies.map((c) => ({ slug: c.slug, label: c.name })),
  ];

  return (
    <>
      <PageHero eyebrow="Gallery" title="Across the Group" subtitle="Projects, products and presentations from all three divisions — curated by the IMN team." />
      <section className="bg-ivory-50 py-14 lg:py-20">
        <div className="container-editorial">
          <div className="glass-light mb-10 inline-flex flex-wrap gap-1 rounded-full p-1.5" role="group" aria-label="Filter gallery by division">
            {filters.map((f) => (
              <Link
                key={f.slug}
                href={f.slug ? `/gallery?division=${f.slug}` : "/gallery"}
                aria-current={(division?.slug ?? "") === f.slug ? "true" : undefined}
                className={cn("rounded-full px-4.5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors", (division?.slug ?? "") === f.slug ? "bg-navy-700 text-ivory-50" : "text-charcoal-700 hover:bg-navy-700/8")}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState title="Nothing published in this gallery yet" body="Gallery images appear here once the team publishes them from the admin panel." />
          ) : (
            <>
              <GalleryGrid items={items} />
              {pages > 1 ? (
                <div className="mt-10 flex justify-center gap-3">
                  {page > 1 ? <Button href={`/gallery?page=${page - 1}${division ? `&division=${division.slug}` : ""}`} variant="outline">Previous</Button> : null}
                  <span className="self-center text-sm text-charcoal-600">Page {page} of {pages}</span>
                  {page < pages ? <Button href={`/gallery?page=${page + 1}${division ? `&division=${division.slug}` : ""}`} variant="outline">Load More</Button> : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
