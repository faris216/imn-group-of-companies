import { ProductTable } from "@/components/admin/ProductTable";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Brightstone Products" };

export default async function BrightstoneProductsAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const products = await adapter.listProducts(company.id, {});
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Pieces</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Silver & gemstone catalogue — price on request by default.</p>
      </div>
      <ProductTable products={products} companyId={company.id} base="/admin/brightstone" />
    </div>
  );
}
