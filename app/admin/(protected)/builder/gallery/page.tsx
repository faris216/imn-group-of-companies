import { GalleryManager } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Builder Gallery" };

export default async function BuilderGalleryAdmin() {
  const adapter = getAdapter();
  const companies = await adapter.listCompanies();
  const builder = companies.find((c) => c.slug === "imn-builder");
  if (!builder) return null;
  const { items } = await adapter.listGallery({ companyId: builder.id });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Builder Gallery</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Upload site photography, publish or hide it, and tag it to the division.</p>
      </div>
      <GalleryManager companies={companies} items={items} defaultCompanyId={builder.id} />
    </div>
  );
}
