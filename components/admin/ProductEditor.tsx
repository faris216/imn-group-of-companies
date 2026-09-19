"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/fields";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { saveProduct, saveVariant, deleteVariant } from "@/app/actions/admin";
import type { Category, Product, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

const emptyVariant = (productId: string): ProductVariant => ({
  id: "", product_id: productId, variant_name: "", size: "", weight: null, unit: "g",
  price: null, quantity: 0, availability: "in_stock", display_order: 0, created_at: "", updated_at: "",
});

export function ProductEditor({ product, companyId, categories, storageDir, priceOnRequest }: {
  product: Product | null; companyId: string; categories: Category[]; storageDir: string; priceOnRequest?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    id: product?.id ?? "",
    company_id: companyId,
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    name: product?.name ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    main_image_url: product?.main_image_url ?? null as string | null,
    featured: product?.featured ?? false,
    is_published: product?.is_published ?? true,
    is_ai_draft: product?.is_ai_draft ?? false,
  });
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants?.length ? product.variants : product ? [] : []);
  const [newVariant, setNewVariant] = useState<ProductVariant | null>(product ? null : null);

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    start(async () => {
      const res = await saveProduct({ ...form, id: form.id || undefined });
      if (!res.ok) { setErrors(res.fields ?? {}); toast(res.error, "error"); return; }
      const productId = res.data?.id ?? form.id;
      // persist staged new variants against the saved product
      if (newVariant && newVariant.variant_name) {
        const vres = await saveVariant({ ...newVariant, id: undefined, product_id: productId });
        if (!vres.ok) toast(vres.error, "error");
      }
      toast(res.message ?? "Product saved.");
      router.refresh();
    });
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }
  function commitVariant(v: ProductVariant) {
    start(async () => {
      const res = await saveVariant({ ...v, id: v.id || undefined });
      if (res.ok) { toast(res.message ?? "Variant saved."); router.refresh(); }
      else toast(res.error, "error");
    });
  }
  function removeVariant(id: string) {
    start(async () => {
      const res = await deleteVariant(id);
      if (res.ok) { toast("Variant deleted."); router.refresh(); }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <section className="rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft">
        <h2 className="mb-5 font-display text-xl text-navy-900">Product details</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Label htmlFor="p-name">Name *</Label>
            <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <FieldError message={errors.name} />
          </div>
          <div>
            <Label htmlFor="p-cat">Category *</Label>
            <Select id="p-cat" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <FieldError message={errors.category_id} />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="p-short">Short description</Label>
            <Input id="p-short" value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} />
          </div>
          <div className="lg:col-span-1">
            <ImageUploader dir={storageDir} value={form.main_image_url} onChange={(url) => set("main_image_url", url)} label="Main image *" />
            <FieldError message={errors.main_image_url} />
          </div>
          <div className="lg:col-span-3">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={5} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} className="h-4 w-4 accent-navy-700" />
            Published (visible on website)
          </label>
          <label className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-gold-500" />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <input type="checkbox" checked={form.is_ai_draft} onChange={(e) => set("is_ai_draft", e.target.checked)} className="h-4 w-4 accent-amber-600" />
            Draft data pending client confirmation
          </label>
        </div>
      </section>

      {!priceOnRequest ? (
        <section className="rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl text-navy-900">Variants — size, price & quantity</h2>
            <button type="button" onClick={() => setNewVariant(emptyVariant(form.id || "new"))} className="rounded-sm bg-navy-700 px-4 py-2 text-xs font-semibold text-ivory-50 hover:bg-navy-600">
              + Add variant
            </button>
          </div>

          {newVariant ? (
            <VariantRow
              key="new"
              variant={newVariant}
              draft
              onChange={(patch) => setNewVariant((v) => (v ? { ...v, ...patch } : v))}
              onSave={() => { if (newVariant.variant_name) { /* saved with product submit */ } }}
              onDelete={() => setNewVariant(null)}
              note="Saved together with the product"
            />
          ) : null}

          <div className="space-y-4">
            {variants.map((v) => (
              <VariantRow key={v.id} variant={v} onChange={(patch) => updateVariant(v.id, patch)} onSave={() => commitVariant(v)} onDelete={() => removeVariant(v.id)} />
            ))}
            {variants.length === 0 && !newVariant ? (
              <p className="rounded-sm border border-dashed border-charcoal-800/20 bg-ivory-100/60 px-4 py-6 text-center text-sm text-charcoal-600">
                No variants yet. Add your first size (e.g. 250g, 500g, 1kg).
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded-sm bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-900 shadow-soft transition-all hover:bg-gold-400 hover:shadow-lift disabled:opacity-60">
          {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
        </button>
        <p className="text-xs text-charcoal-600">Changes go live on the public site immediately after saving.</p>
      </div>
    </form>
  );
}

function VariantRow({ variant, onChange, onSave, onDelete, draft, note }: {
  variant: ProductVariant;
  onChange: (patch: Partial<ProductVariant>) => void;
  onSave: () => void;
  onDelete: () => void;
  draft?: boolean;
  note?: string;
}) {
  return (
    <div className={cn("grid gap-3 rounded-sm border p-4", draft ? "border-dashed border-navy-600/40 bg-navy-700/4" : "border-charcoal-800/10 bg-ivory-50")}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <Label>Variant name *</Label>
          <Input value={variant.variant_name} onChange={(e) => onChange({ variant_name: e.target.value })} placeholder="500g" />
        </div>
        <div>
          <Label>Size</Label>
          <Input value={variant.size ?? ""} onChange={(e) => onChange({ size: e.target.value })} placeholder="500 g" />
        </div>
        <div>
          <Label>Weight</Label>
          <Input type="number" min={0} step="any" value={variant.weight ?? ""} onChange={(e) => onChange({ weight: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>
        <div>
          <Label>Unit</Label>
          <Input value={variant.unit ?? ""} onChange={(e) => onChange({ unit: e.target.value })} placeholder="g" />
        </div>
        <div>
          <Label>Price (₹)</Label>
          <Input type="number" min={0} step="any" value={variant.price ?? ""} onChange={(e) => onChange({ price: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>
        <div>
          <Label>Quantity</Label>
          <Input type="number" min={0} step={1} value={variant.quantity} onChange={(e) => onChange({ quantity: Math.max(0, Number(e.target.value)) })} />
        </div>
        <div>
          <Label>Availability</Label>
          <Select value={variant.availability} onChange={(e) => onChange({ availability: e.target.value as ProductVariant["availability"] })}>
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="preorder">Pre-order</option>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!draft ? (
          <button type="button" onClick={onSave} className="rounded-sm bg-navy-700 px-4 py-1.5 text-xs font-semibold text-ivory-50 hover:bg-navy-600">Save variant</button>
        ) : null}
        <button type="button" onClick={onDelete} className="rounded-sm border border-red-700/40 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-700/6">
          {draft ? "Discard" : "Delete"}
        </button>
        {note ? <span className="text-[11px] text-charcoal-600">{note}</span> : null}
      </div>
    </div>
  );
}
