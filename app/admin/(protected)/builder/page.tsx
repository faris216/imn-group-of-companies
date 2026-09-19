import Link from "next/link";
import { getAdapter } from "@/lib/data";
import { StatTile } from "@/components/admin/StatTile";

export const metadata = { title: "Builder Admin" };

export default async function BuilderAdminPage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  const [projects, gallery, stat] = await Promise.all([
    adapter.listProjects(company.id, {}),
    adapter.listGallery({ companyId: company.id }),
    adapter.getContent<{ value: string; label: string }>("builder_stat"),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">IMN Builder</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Projects, gallery, banners, statistics and content.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label={stat?.label ?? "Successful Projects"} value={Number(stat?.value?.replace(/\D/g, "") ?? 70)} href="/admin/builder/content" />
        <StatTile label="Projects" value={projects.length} href="/admin/builder/projects" />
        <StatTile label="Published projects" value={projects.filter((p) => p.is_published).length} href="/admin/builder/projects" />
        <StatTile label="Gallery items" value={gallery.total} href="/admin/builder/gallery" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/builder/projects", t: "Projects", d: "Create, edit, publish and reorder completed works." },
          { href: "/admin/builder/gallery", t: "Gallery", d: "Upload and publish site photos under the Builder division." },
          { href: "/admin/builder/banners", t: "Banners", d: "Promotional banners shown on Builder sections." },
          { href: "/admin/builder/content", t: "Content & SEO", d: "Intro text, 70+ statistic, services and meta tags." },
          { href: "/admin/builder/contact", t: "Contact", d: "Email, phone and address shown on the contact page." },
        ].map((c) => (
          <Link key={c.t} href={c.href} className="rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
            <h2 className="font-display text-xl text-navy-900">{c.t}</h2>
            <p className="mt-2 text-sm text-charcoal-600">{c.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
