import { getAdapter } from "@/lib/data";
import { StatTile } from "@/components/admin/StatTile";

export const metadata = { title: "Brightstone Admin" };

export default async function BrightstoneAdminPage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const [products, categories, gallery, enq] = await Promise.all([
    adapter.listProducts(company.id, {}),
    adapter.listCategories(company.id, { includeInactive: true }),
    adapter.listGallery({ companyId: company.id }),
    adapter.listEnquiries({ companyId: company.id }),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Brightstone</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Concept catalogue management — pieces display as “Price on Request”.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Pieces" value={products.length} href="/admin/brightstone/products" />
        <StatTile label="Published" value={products.filter((p) => p.is_published).length} href="/admin/brightstone/products" />
        <StatTile label="Collections" value={categories.length} href="/admin/brightstone/categories" />
        <StatTile label="Enquiries" value={enq.filter((e) => e.status === "new").length} href="/admin/brightstone/enquiries" />
      </div>
      <p className="text-sm text-charcoal-600">Gallery items: {gallery.total}</p>
    </div>
  );
}
