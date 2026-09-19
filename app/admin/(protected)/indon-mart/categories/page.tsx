import { CategoryManager } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "INDON Categories" };

export default async function IndonCategoriesAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const categories = await adapter.listCategories(company.id, { includeInactive: true });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Categories</h1>
      <CategoryManager companyId={company.id} categories={categories} />
    </div>
  );
}
