"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { deleteProduct, setProductFlags, reorderProducts } from "@/app/actions/admin";
import type { Product } from "@/lib/types";

export function ProductTable({ products, companyId, base }: { products: Product[]; companyId: string; base: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const rows = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  async function act(p: Promise<{ ok: boolean; error?: string; message?: string }>) {
    const res = await p;
    toast(res.ok ? (res.message ?? "Saved.") : (res.error ?? "Error"), res.ok ? "success" : "error");
    if (res.ok) router.refresh();
  }
  function move(id: string, dir: -1 | 1) {
    const ids = products.map((p) => p.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    act(reorderProducts(companyId, ids));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full max-w-xs rounded-sm border border-charcoal-800/15 bg-white px-3.5 py-2 text-sm focus:border-navy-600 focus:outline-none"
        />
        <Link href={`${base}/products/new`} className="rounded-sm bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-soft hover:bg-gold-400">+ Add Product</Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-charcoal-800/8 bg-white shadow-soft">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-charcoal-800/8 bg-ivory-100/70 text-[11px] uppercase tracking-[0.14em] text-charcoal-600">
            <tr>
              <th className="px-4 py-3">Order</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Variants</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800/6">
            {rows.map((p) => (
              <tr key={p.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => move(p.id, -1)} aria-label="Move up" className="rounded-sm border border-charcoal-800/15 px-1.5 py-0.5 text-[10px] hover:bg-charcoal-800/6">↑</button>
                    <button onClick={() => move(p.id, 1)} aria-label="Move down" className="rounded-sm border border-charcoal-800/15 px-1.5 py-0.5 text-[10px] hover:bg-charcoal-800/6">↓</button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.main_image_url ? (
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-charcoal-800/10">
                        <Image src={p.main_image_url} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                    ) : null}
                    <div>
                      <Link href={`${base}/products/${p.id}`} className="font-semibold text-charcoal-800 hover:text-navy-700">{p.name}</Link>
                      {p.is_ai_draft ? <span className="ml-2"><Badge tone="draft">Draft</Badge></span> : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal-600">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-charcoal-600">
                  {p.variants?.length ? (
                    <span className="line-clamp-1">{p.variants.map((v) => `${v.variant_name} ₹${v.price ?? "—"} ×${v.quantity}`).join(" · ")}</span>
                  ) : (
                    <span className="text-charcoal-600/60">Price on request</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={p.is_published ? "green" : "silver"}>{p.is_published ? "Live" : "Hidden"}</Badge>
                    {p.featured ? <Badge tone="gold">Featured</Badge> : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={`${base}/products/${p.id}`} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">Edit</Link>
                    <button onClick={() => act(setProductFlags(p.id, { is_published: !p.is_published }))} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">
                      {p.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => act(setProductFlags(p.id, { featured: !p.featured }))} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">
                      {p.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button onClick={() => setConfirm(p.id)} className="rounded-sm border border-red-700/40 px-2.5 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-700/6">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-charcoal-600">No products yet. Add your first product.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && act(deleteProduct(confirm))} title="Delete product?" body="The product, its variants and image references are removed from the public site immediately." confirmLabel="Delete" danger />
    </div>
  );
}
