import { getAdapter } from "@/lib/data";
import { TextContentForm, StatContentForm, SeoContentForm, LinesContentForm } from "@/components/admin/ContentEditors";

export const metadata = { title: "Builder Content" };

export default async function BuilderContentAdmin() {
  const adapter = getAdapter();
  const [intro, stat, services, seo] = await Promise.all([
    adapter.getContent<string>("builder_intro"),
    adapter.getContent<{ value: string; label: string }>("builder_stat"),
    adapter.getContent<Array<{ title: string; body: string }>>("builder_services"),
    adapter.getContent<{ title: string; description: string }>("imn-builder_seo"),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Builder Content & SEO</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Everything the public Builder page says — editable in plain language.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <TextContentForm k="builder_intro" title="Company introduction" label="Introduction paragraph" initial={intro} />
        <StatContentForm initial={stat} />
        <LinesContentForm k="builder_services" title="Services (one per line: Name :: Description)" initial={services} />
        <SeoContentForm slug="imn-builder" initial={seo} />
      </div>
    </div>
  );
}
