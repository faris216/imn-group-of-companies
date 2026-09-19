import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Edit INDON Product" };

export default async function EditIndonProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const product = await adapter.getProductById(id, { includeUnpublished: true });
  if (!product || product.company_id !== company.id) notFound();
  const categories = await adapter.listCategories(company.id, { includeInactive: true });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Edit: {product.name}</h1>
      <ProductEditor product={product} companyId={company.id} categories={categories} storageDir="indon" />
    </div>
  );
}
