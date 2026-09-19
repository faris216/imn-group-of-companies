import { ProductTable } from "@/components/admin/ProductTable";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "INDON Products" };

export default async function IndonProductsAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const products = await adapter.listProducts(company.id, {});
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Products</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Full CRUD with variants, prices, quantities and availability.</p>
      </div>
      <ProductTable products={products} companyId={company.id} base="/admin/indon-mart" />
    </div>
  );
}
