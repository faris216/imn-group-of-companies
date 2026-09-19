import { BannerManager } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Builder Banners" };

export default async function BuilderBannersAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  const banners = await adapter.listBanners(company.id);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Banners</h1>
      <BannerManager companyId={company.id} banners={banners} />
    </div>
  );
}
