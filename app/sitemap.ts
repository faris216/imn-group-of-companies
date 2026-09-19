import type { MetadataRoute } from "next";
import { getAdapter } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const adapter = getAdapter();
  const now = new Date();
  const staticRoutes = ["/", "/about", "/companies", "/builder", "/projects", "/indon", "/indon/products", "/brightstone", "/brightstone/products", "/gallery", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  const [companies, projects, indon, bright] = await Promise.all([
    adapter.listCompanies(),
    adapter.getCompanyBySlug("imn-builder").then((c) => (c ? adapter.listProjects(c.id, { publishedOnly: true }) : [])),
    adapter.getCompanyBySlug("indon-mart").then((c) => (c ? adapter.listProducts(c.id, { publishedOnly: true }) : [])),
    adapter.getCompanyBySlug("brightstone").then((c) => (c ? adapter.listProducts(c.id, { publishedOnly: true }) : [])),
  ]);
  void companies;
  return [
    ...staticRoutes,
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...indon.map((p) => ({ url: `${base}/indon/products/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...bright.map((p) => ({ url: `${base}/brightstone/products/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
