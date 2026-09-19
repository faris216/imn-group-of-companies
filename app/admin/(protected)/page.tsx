import Link from "next/link";
import { getAdapter } from "@/lib/data";
import { StatTile } from "@/components/admin/StatTile";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminLanding() {
  const adapter = getAdapter();
  const companies = await adapter.listCompanies();
  const enquiries = await adapter.listEnquiries({ status: "new" });

  const cards = await Promise.all(
    companies.map(async (c) => {
      const [products, projects, gallery, enq] = await Promise.all([
        adapter.listProducts(c.id, {}),
        adapter.listProjects(c.id, {}),
        adapter.listGallery({ companyId: c.id }),
        adapter.listEnquiries({ companyId: c.id }),
      ]);
      return {
        company: c,
        products: products.length,
        published: products.filter((p) => p.is_published).length,
        projects: projects.length,
        gallery: gallery.total,
        enquiries: enq.filter((e) => e.status === "new").length,
      };
    }),
  );

  const hrefFor = (slug: string) => (slug === "imn-builder" ? "/admin/builder" : slug === "indon-mart" ? "/admin/indon-mart" : "/admin/brightstone");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Group Dashboard</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Manage all three divisions from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="New enquiries" value={enquiries.length} href="/admin/enquiries" />
        <StatTile label="Published products" value={cards.reduce((a, c) => a + c.published, 0)} href="/admin/indon-mart/products" />
        <StatTile label="Projects" value={cards.reduce((a, c) => a + c.projects, 0)} href="/admin/builder/projects" />
        <StatTile label="Gallery items" value={cards.reduce((a, c) => a + c.gallery, 0)} href="/admin/builder/gallery" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map(({ company, products, published, projects, gallery, enquiries: enq }) => (
          <Link key={company.id} href={hrefFor(company.slug)} className="group block">
            <article className="h-full rounded-md border border-charcoal-800/8 bg-white p-7 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-600">Division</p>
              <h2 className="mt-2 font-display text-2xl text-navy-900 transition-colors group-hover:text-navy-600">{company.name}</h2>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-charcoal-600">Products</dt><dd className="font-display text-xl text-navy-800">{products} <span className="text-xs text-[#0f7a41]">({published} live)</span></dd></div>
                <div><dt className="text-charcoal-600">Projects</dt><dd className="font-display text-xl text-navy-800">{projects}</dd></div>
                <div><dt className="text-charcoal-600">Gallery</dt><dd className="font-display text-xl text-navy-800">{gallery}</dd></div>
                <div><dt className="text-charcoal-600">New enq.</dt><dd className="font-display text-xl text-navy-800">{enq}</dd></div>
              </dl>
              <span className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-navy-700 transition-all group-hover:gap-3.5">
                Open Management
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
