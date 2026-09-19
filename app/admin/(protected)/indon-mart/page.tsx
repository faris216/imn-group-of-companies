import { getAdapter } from "@/lib/data";
import { StatTile } from "@/components/admin/StatTile";

export const metadata = { title: "INDON Admin" };

export default async function IndonAdminPage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company) return null;
  const [products, categories, banners, wa] = await Promise.all([
    adapter.listProducts(company.id, {}),
    adapter.listCategories(company.id, { includeInactive: true }),
    adapter.listBanners(company.id),
    adapter.listWhatsApp(company.id),
  ]);
  const drafts = products.filter((p) => p.is_ai_draft).length;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">INDON Mart</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Products, variants, prices, quantities, categories, banners and WhatsApp.</p>
      </div>
      {drafts > 0 ? (
        <p className="rounded-sm border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
          {drafts} product{drafts > 1 ? "s" : ""} carry draft prices/stock pending client confirmation — review them under Products (badge “Draft”).
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Products" value={products.length} href="/admin/indon-mart/products" />
        <StatTile label="Published" value={products.filter((p) => p.is_published).length} href="/admin/indon-mart/products" />
        <StatTile label="Categories" value={categories.length} href="/admin/indon-mart/categories" />
        <StatTile label="WhatsApp numbers" value={wa.length} href="/admin/indon-mart/whatsapp" />
      </div>
      <p className="text-sm text-charcoal-600">Active banners: {banners.filter((b) => b.is_active).length} · <a className="underline" href="/admin/indon-mart/banners">manage banners</a></p>
    </div>
  );
}
