import { CategoryManager } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Brightstone Collections" };

export default async function BrightstoneCategoriesAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const categories = await adapter.listCategories(company.id, { includeInactive: true });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Collections & Categories</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Silver lines and gemstone collections (Ruby, Emerald, Sapphire…).</p>
      </div>
      <CategoryManager companyId={company.id} categories={categories} />
    </div>
  );
}
