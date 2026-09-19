"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import {
  saveCategory, deleteCategory, saveBanner, deleteBanner, saveGalleryItem, deleteGalleryItem,
  saveWhatsApp, deleteWhatsApp, saveContact, setEnquiryStatus,
} from "@/app/actions/admin";
import type { Banner, Category, ContactSettings, Enquiry, GalleryItem, WhatsAppSetting } from "@/lib/types";

function useAct() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const act = (p: Promise<{ ok: boolean; error?: string; message?: string }>) =>
    start(async () => {
      const res = await p;
      toast(res.ok ? (res.message ?? "Saved.") : (res.error ?? "Error"), res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  return { act, pending };
}

/* ── Categories / Collections ─────────────────────────────────────────── */
export function CategoryManager({ companyId, categories }: { companyId: string; categories: Category[] }) {
  const { act, pending } = useAct();
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          act(saveCategory({ company_id: companyId, name }));
          setName("");
        }}
        className="flex flex-wrap items-end gap-3 rounded-md border border-charcoal-800/8 bg-white p-5 shadow-soft"
      >
        <div className="min-w-[220px] flex-1">
          <Label>Add category / collection</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Green Tea" />
        </div>
        <button className="rounded-sm bg-navy-700 px-5 py-2.5 text-sm font-semibold text-ivory-50 hover:bg-navy-600" disabled={pending}>Add</button>
      </form>
      <ul className="divide-y divide-charcoal-800/8 rounded-md border border-charcoal-800/8 bg-white shadow-soft">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div>
              <p className="text-sm font-semibold text-charcoal-800">{c.name}</p>
              <p className="text-[11px] text-charcoal-600">/{c.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={c.is_active ? "green" : "silver"}>{c.is_active ? "Active" : "Hidden"}</Badge>
              <button onClick={() => act(saveCategory({ id: c.id, company_id: companyId, name: c.name, is_active: !c.is_active }))} className="rounded-sm border border-charcoal-800/20 px-3 py-1.5 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-800/6">
                {c.is_active ? "Hide" : "Show"}
              </button>
              <button onClick={() => setConfirm(c.id)} className="rounded-sm border border-red-700/40 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-700/6">Delete</button>
            </div>
          </li>
        ))}
        {categories.length === 0 ? <li className="px-5 py-8 text-center text-sm text-charcoal-600">No categories yet. Add your first one above.</li> : null}
      </ul>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && act(deleteCategory(confirm))} title="Delete category?" body="Products in this category keep existing but become uncategorised." confirmLabel="Delete" danger />
    </div>
  );
}

/* ── Banners ──────────────────────────────────────────────────────────── */
export function BannerManager({ companyId, banners }: { companyId: string; banners: Banner[] }) {
  const { act, pending } = useAct();
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: null as string | null, button_text: "Buy Now", button_url: "/indon/products" });
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.image_url) return;
          act(saveBanner({ company_id: companyId, ...form }));
          setForm({ title: "", subtitle: "", image_url: null, button_text: "Buy Now", button_url: "/indon/products" });
        }}
        className="grid gap-4 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft sm:grid-cols-2"
      >
        <div className="sm:col-span-2"><h2 className="font-display text-xl text-navy-900">Add promotional banner</h2></div>
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} /></div>
        <div><Label>Button text</Label><Input value={form.button_text ?? ""} onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))} /></div>
        <div><Label>Button link</Label><Input value={form.button_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, button_url: e.target.value }))} /></div>
        <div className="sm:col-span-2"><ImageUploader dir="banners" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} label="Banner image *" aspect="aspect-[4/1]" /></div>
        <div><button className="rounded-sm bg-navy-700 px-6 py-2.5 text-sm font-semibold text-ivory-50 hover:bg-navy-600" disabled={pending || !form.image_url}>Add banner</button></div>
      </form>
      <ul className="grid gap-4 sm:grid-cols-2">
        {banners.map((b) => (
          <li key={b.id} className="overflow-hidden rounded-md border border-charcoal-800/8 bg-white shadow-soft">
            <div className="relative aspect-[4/1.4]">
              <Image src={b.image_url} alt={b.title ?? "Banner"} fill sizes="50vw" className="object-cover" />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-charcoal-800">{b.title}</p>
                <Badge tone={b.is_active ? "green" : "silver"}>{b.is_active ? "Live" : "Paused"}</Badge>
              </div>
              <div className="flex gap-2">
                <button onClick={() => act(saveBanner({ id: b.id, company_id: companyId, image_url: b.image_url, title: b.title, subtitle: b.subtitle, button_text: b.button_text, button_url: b.button_url, is_active: !b.is_active }))} className="rounded-sm border border-charcoal-800/20 px-3 py-1.5 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-800/6">
                  {b.is_active ? "Pause" : "Activate"}
                </button>
                <button onClick={() => setConfirm(b.id)} className="rounded-sm border border-red-700/40 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-700/6">Delete</button>
              </div>
            </div>
          </li>
        ))}
        {banners.length === 0 ? <li className="sm:col-span-2 rounded-md border border-dashed border-charcoal-800/20 px-5 py-10 text-center text-sm text-charcoal-600">No banners yet.</li> : null}
      </ul>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && act(deleteBanner(confirm))} title="Delete banner?" confirmLabel="Delete" danger />
    </div>
  );
}

/* ── Gallery ─────────────────────────────────────────────────────────── */
export function GalleryManager({ companies, items, defaultCompanyId }: { companies: Array<{ id: string; name: string }>; items: GalleryItem[]; defaultCompanyId: string }) {
  const { act, pending } = useAct();
  const [form, setForm] = useState({ company_id: defaultCompanyId, title: "", image_url: null as string | null, is_published: true });
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.image_url) return;
          act(saveGalleryItem({ ...form }));
          setForm({ company_id: defaultCompanyId, title: "", image_url: null, is_published: true });
        }}
        className="grid gap-4 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft sm:grid-cols-3"
      >
        <div className="sm:col-span-3"><h2 className="font-display text-xl text-navy-900">Add gallery image</h2></div>
        <div>
          <Label>Division</Label>
          <Select value={form.company_id} onChange={(e) => setForm((f) => ({ ...f, company_id: e.target.value }))}>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
        <div className="flex items-end"><button className="w-full rounded-sm bg-navy-700 px-6 py-2.5 text-sm font-semibold text-ivory-50 hover:bg-navy-600" disabled={pending || !form.image_url}>Add to gallery</button></div>
        <div className="sm:col-span-3"><ImageUploader dir="gallery" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} label="Image *" aspect="aspect-[3/1]" /></div>
      </form>
      <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((g) => (
          <li key={g.id} className="overflow-hidden rounded-md border border-charcoal-800/8 bg-white shadow-soft">
            <div className="img-frame relative aspect-[4/3]">
              <Image src={g.image_url} alt={g.title ?? "Gallery"} fill sizes="25vw" />
            </div>
            <div className="space-y-2 p-3">
              <p className="truncate text-xs font-semibold text-charcoal-800">{g.title ?? "Untitled"}</p>
              <div className="flex items-center justify-between">
                <Badge tone={g.is_published ? "green" : "silver"}>{g.is_published ? "Live" : "Hidden"}</Badge>
                <div className="flex gap-1.5">
                  <button onClick={() => act(saveGalleryItem({ id: g.id, company_id: g.company_id, image_url: g.image_url, title: g.title, is_published: !g.is_published }))} className="rounded-sm border border-charcoal-800/20 px-2 py-1 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-800/6">
                    {g.is_published ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => setConfirm(g.id)} className="rounded-sm border border-red-700/40 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-700/6">Del</button>
                </div>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 ? <li className="sm:col-span-3 rounded-md border border-dashed border-charcoal-800/20 px-5 py-10 text-center text-sm text-charcoal-600 lg:col-span-4">No gallery images yet. Upload your first one above.</li> : null}
      </ul>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && act(deleteGalleryItem(confirm))} title="Delete gallery image?" confirmLabel="Delete" danger />
    </div>
  );
}

/* ── WhatsApp numbers ─────────────────────────────────────────────────── */
export function WhatsAppManager({ companyId, numbers }: { companyId: string; numbers: WhatsAppSetting[] }) {
  const { act, pending } = useAct();
  const [form, setForm] = useState({ phone_number: "", label: "" });
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.phone_number.trim()) return;
          act(saveWhatsApp({ company_id: companyId, ...form, is_primary: numbers.length === 0, is_active: true }));
          setForm({ phone_number: "", label: "" });
        }}
        className="grid gap-4 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft sm:grid-cols-3"
      >
        <div className="sm:col-span-3"><h2 className="font-display text-xl text-navy-900">Add WhatsApp number</h2></div>
        <div><Label>Number *</Label><Input value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} placeholder="70104 44471" /></div>
        <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Orders line 1" /></div>
        <div className="flex items-end"><button className="w-full rounded-sm bg-navy-700 px-6 py-2.5 text-sm font-semibold text-ivory-50 hover:bg-navy-600" disabled={pending}>Add</button></div>
      </form>
      <ul className="divide-y divide-charcoal-800/8 rounded-md border border-charcoal-800/8 bg-white shadow-soft">
        {numbers.map((w) => (
          <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-charcoal-800">{w.phone_number}</p>
              <p className="text-[11px] text-charcoal-600">{w.label ?? "—"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {w.is_primary ? <Badge tone="gold">Primary</Badge> : (
                <button onClick={() => act(saveWhatsApp({ id: w.id, company_id: companyId, phone_number: w.phone_number, label: w.label, is_primary: true, is_active: w.is_active }))} className="rounded-sm border border-charcoal-800/20 px-3 py-1.5 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-800/6">Make primary</button>
              )}
              <Badge tone={w.is_active ? "green" : "silver"}>{w.is_active ? "Active" : "Off"}</Badge>
              <button onClick={() => act(saveWhatsApp({ id: w.id, company_id: companyId, phone_number: w.phone_number, label: w.label, is_primary: w.is_primary, is_active: !w.is_active }))} className="rounded-sm border border-charcoal-800/20 px-3 py-1.5 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-800/6">
                {w.is_active ? "Disable" : "Enable"}
              </button>
              <button onClick={() => setConfirm(w.id)} className="rounded-sm border border-red-700/40 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-700/6">Delete</button>
            </div>
          </li>
        ))}
        {numbers.length === 0 ? <li className="px-5 py-8 text-center text-sm text-red-700">No WhatsApp numbers — customer buttons are disabled until one is added.</li> : null}
      </ul>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && act(deleteWhatsApp(confirm))} title="Delete WhatsApp number?" confirmLabel="Delete" danger />
    </div>
  );
}

/* ── Contact details ──────────────────────────────────────────────────── */
export function ContactEditor({ companyId, contact }: { companyId: string; contact: ContactSettings | null }) {
  const { act, pending } = useAct();
  const [v, setV] = useState({ email: contact?.email ?? "", phone: contact?.phone ?? "", address: contact?.address ?? "", maps_url: contact?.maps_url ?? "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        act(saveContact(companyId, v));
      }}
      className="grid max-w-2xl gap-4 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft"
    >
      <h2 className="font-display text-xl text-navy-900">Contact details</h2>
      <div><Label>Email</Label><Input type="email" value={v.email} onChange={(e) => setV((s) => ({ ...s, email: e.target.value }))} /></div>
      <div><Label>Phone</Label><Input value={v.phone} onChange={(e) => setV((s) => ({ ...s, phone: e.target.value }))} /></div>
      <div><Label>Address</Label><Textarea rows={2} value={v.address} onChange={(e) => setV((s) => ({ ...s, address: e.target.value }))} /></div>
      <div><Label>Google Maps URL</Label><Input value={v.maps_url} onChange={(e) => setV((s) => ({ ...s, maps_url: e.target.value }))} placeholder="https://www.google.com/maps/…" /></div>
      <div><button className="w-fit rounded-sm bg-navy-700 px-6 py-2.5 text-sm font-semibold text-ivory-50 hover:bg-navy-600" disabled={pending}>Save contact</button></div>
    </form>
  );
}

/* ── Enquiries ────────────────────────────────────────────────────────── */
export function EnquiryTable({ enquiries }: { enquiries: Enquiry[] }) {
  const { act } = useAct();
  return (
    <div className="overflow-x-auto rounded-md border border-charcoal-800/8 bg-white shadow-soft">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-charcoal-800/8 bg-ivory-100/70 text-[11px] uppercase tracking-[0.14em] text-charcoal-600">
          <tr>
            <th className="px-4 py-3">Received</th><th className="px-4 py-3">From</th><th className="px-4 py-3">Division</th>
            <th className="px-4 py-3">Message</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-800/6">
          {enquiries.map((e) => (
            <tr key={e.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 text-charcoal-600">{new Date(e.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-charcoal-800">{e.name}</p>
                <p className="text-[11px] text-charcoal-600">{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
              </td>
              <td className="px-4 py-3 text-charcoal-600">{e.company?.name ?? "Group"}</td>
              <td className="max-w-[320px] px-4 py-3 text-charcoal-700">
                {e.subject ? <p className="font-semibold">{e.subject}</p> : null}
                <p className="line-clamp-3">{e.message}</p>
              </td>
              <td className="px-4 py-3"><Badge tone={e.status === "new" ? "navy" : e.status === "contacted" ? "gold" : "silver"}>{e.status}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  {e.status !== "contacted" ? <button onClick={() => act(setEnquiryStatus(e.id, "contacted"))} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">Contacted</button> : null}
                  {e.status !== "closed" ? <button onClick={() => act(setEnquiryStatus(e.id, "closed"))} className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6">Close</button> : null}
                  <a className="rounded-sm border border-charcoal-800/20 px-2.5 py-1 text-[10px] font-semibold hover:bg-charcoal-800/6" href={`mailto:${e.email}`}>Reply</a>
                </div>
              </td>
            </tr>
          ))}
          {enquiries.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-charcoal-600">No enquiries yet. Messages from the contact form appear here.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
