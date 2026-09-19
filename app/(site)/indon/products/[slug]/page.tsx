import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndonProductDetail } from "@/components/indon/ProductDetail";
import { getAdapter } from "@/lib/data";

export const revalidate = 0; // prices/quantities must reflect admin edits immediately (§88)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adapter = getAdapter();
  const product = await adapter.getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.short_description ?? undefined,
    openGraph: { title: product.name, description: product.short_description ?? undefined, images: product.main_image_url ? [product.main_image_url] : undefined },
  };
}

export default async function IndonProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adapter = getAdapter();
  const product = await adapter.getProductBySlug(slug);
  if (!product || product.company_id === "") notFound();
  const company = await adapter.getCompanyBySlug("indon-mart");
  if (!company || product.company_id !== company.id) notFound();
  const wa = await adapter.listWhatsApp(company.id, { activeOnly: true });
  const related = await adapter.listProducts(company.id, { publishedOnly: true, categoryId: product.category_id, limit: 4 });
  return <IndonProductDetail product={product} waPhone={wa[0]?.phone_number ?? null} related={related.filter((r) => r.id !== product.id).slice(0, 3)} />;
}
