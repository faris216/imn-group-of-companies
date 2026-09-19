"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { deleteProject, setProjectFlags } from "@/app/actions/admin";
import type { Project } from "@/lib/types";

export function ProjectTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<string | null>(null);
  async function act(p: Promise<{ ok: boolean; error?: string; message?: string }>) {
    const res = await p;
    toast(res.ok ? (res.message ?? "Saved.") : (res.error ?? "Error"), res.ok ? "success" : "error");
    if (res.ok) router.refresh();
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/admin/builder/projects/new" className="rounded-sm bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-soft hover:bg-gold-400">+ Add Project</Link>
      </div>
      <div className="overflow-x-auto rounded-md border border-charcoal-800/8 bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-charcoal-800/8 bg-ivory-100/70 text-[11px] uppercase tracking-[0.14em] text-charcoal-600">
            <tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800/6">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.main_image_url ? (
                      <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-sm border border-charcoal-800/10">
                        <Image src={p.main_image_url} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                    ) : null}
                    <Link href={`/admin/builder/projects/${p.id}`} className="font-semibold text-charcoal-800 hover:text-navy-700">{p.name}</Link>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-charcoal-600">{p.project_type}</td>
                <td className="px-4 py-3 text-charcoal-600">{p.location ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <Badge tone={p.is_published ? "green" : "silver"}>{p.is_published ? "Live" : "Hidden"}</Badge>
                    {p.featured ? <Badge tone="gold">Featured</Badge> : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={`/admin/builder/projects/${p.id}`} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">Edit</Link>
                    <button onClick={() => act(setProjectFlags(p.id, { is_published: !p.is_published }))} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">{p.is_published ? "Unpublish" : "Publish"}</button>
                    <button onClick={() => act(setProjectFlags(p.id, { featured: !p.featured }))} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">{p.featured ? "Unfeature" : "Feature"}</button>
                    <button onClick={() => setConfirm(p.id)} className="rounded-sm border border-red-700/40 px-2.5 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-700/6">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-charcoal-600">No projects yet. Add your first project.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && act(deleteProject(confirm))} title="Delete project?" confirmLabel="Delete" danger />
    </div>
  );
}
