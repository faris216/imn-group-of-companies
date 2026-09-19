"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/fields";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { saveProject, addProjectImage, deleteProjectImage } from "@/app/actions/admin";
import type { Project } from "@/lib/types";
import Image from "next/image";

export function ProjectEditor({ project, companyId }: { project: Project | null; companyId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    id: project?.id ?? "",
    company_id: companyId,
    name: project?.name ?? "",
    location: project?.location ?? "",
    project_type: project?.project_type ?? ("residential" as Project["project_type"]),
    description: project?.description ?? "",
    main_image_url: project?.main_image_url ?? null as string | null,
    featured: project?.featured ?? false,
    is_published: project?.is_published ?? true,
  });
  const [galleryUrl, setGalleryUrl] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    start(async () => {
      const res = await saveProject({ ...form, id: form.id || undefined });
      if (!res.ok) { setErrors(res.fields ?? {}); toast(res.error, "error"); return; }
      toast(res.message ?? "Project saved.");
      router.push("/admin/builder/projects");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6" noValidate>
      <section className="grid gap-5 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Project name *</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={form.location ?? ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Tamil Nadu" />
        </div>
        <div>
          <Label>Project type *</Label>
          <Select value={form.project_type} onChange={(e) => setForm((f) => ({ ...f, project_type: e.target.value as Project["project_type"] }))}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Description *</Label>
          <Textarea rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          <FieldError message={errors.description} />
        </div>
        <div>
          <ImageUploader dir="builder" value={form.main_image_url} onChange={(url) => setForm((f) => ({ ...f, main_image_url: url }))} label="Cover image *" aspect="aspect-[4/3]" />
          <FieldError message={errors.main_image_url} />
        </div>
        <div className="flex flex-col justify-end gap-3">
          <label className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="h-4 w-4 accent-navy-700" /> Published
          </label>
          <label className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4 accent-gold-500" /> Featured
          </label>
        </div>
      </section>

      {project ? (
        <section className="rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl text-navy-900">Project gallery</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <ImageUploader dir="builder" value={galleryUrl} onChange={setGalleryUrl} label="New image" aspect="aspect-[4/3]" />
            {(project.images ?? []).map((img) => (
              <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-sm border border-charcoal-800/10">
                <Image src={img.image_url} alt={img.alt_text ?? ""} fill sizes="30vw" className="object-cover" />
                <button
                  type="button"
                  onClick={() => start(async () => { const r = await deleteProjectImage(img.id); toast(r.ok ? "Image removed." : r.error, r.ok ? "success" : "error"); router.refresh(); })}
                  className="absolute bottom-2 right-2 rounded-sm bg-red-700/90 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {galleryUrl ? (
            <button
              type="button"
              onClick={() => start(async () => { const r = await addProjectImage(project.id, galleryUrl, project.name); toast(r.ok ? "Image added." : r.error, r.ok ? "success" : "error"); setGalleryUrl(null); router.refresh(); })}
              className="mt-4 rounded-sm bg-navy-700 px-5 py-2 text-xs font-semibold text-ivory-50 hover:bg-navy-600"
            >
              Attach uploaded image to project
            </button>
          ) : null}
        </section>
      ) : null}

      <button type="submit" disabled={pending} className="rounded-sm bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-900 shadow-soft hover:bg-gold-400 disabled:opacity-60">
        {pending ? "Saving…" : project ? "Save Changes" : "Create Project"}
      </button>
    </form>
  );
}
