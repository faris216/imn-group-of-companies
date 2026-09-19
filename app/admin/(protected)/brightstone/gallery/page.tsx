import { GalleryManager } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Brightstone Gallery" };

export default async function BrightstoneGalleryAdmin() {
  const adapter = getAdapter();
  const companies = await adapter.listCompanies();
  const bright = companies.find((c) => c.slug === "brightstone");
  if (!bright) return null;
  const { items } = await adapter.listGallery({ companyId: bright.id });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Showroom Gallery</h1>
      <GalleryManager companies={companies} items={items} defaultCompanyId={bright.id} />
    </div>
  );
}
