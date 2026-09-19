import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "New INDON Product" };

export default async function NewIndonProduct() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const categories = await adapter.listCategories(company.id, { includeInactive: true });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Add INDON Product</h1>
      <ProductEditor product={null} companyId={company.id} categories={categories} storageDir="indon" />
    </div>
  );
}
