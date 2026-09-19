"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin, getSession } from "@/lib/auth";
import { getAdapter } from "@/lib/data";
import {
  bannerSchema, categorySchema, contactSchema, gallerySchema, productSchema, projectSchema,
  settingsSchema, variantSchema, whatsappSchema, ok, fail, type ActionResult,
} from "@/lib/validation";
import type { EnquiryStatus } from "@/lib/types";

async function actor(): Promise<string> {
  try {
    const s = await requireAdmin();
    return s.email;
  } catch {
    throw new Error("UNAUTHENTICATED");
  }
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

/* ── products ──────────────────────────────────────────────────────────── */
export async function saveProduct(input: Record<string, unknown>): Promise<ActionResult<{ id: string }>> {
  const who = await actor();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fields[String(i.path[0])] = i.message; });
    return fail("Please correct the highlighted fields.", fields);
  }
  const adapter = getAdapter();
  const before = parsed.data.id ? await adapter.getProductById(parsed.data.id, { includeUnpublished: true }) : null;
  const product = await adapter.saveProduct({ ...parsed.data, company_id: parsed.data.company_id });
  await adapter.logAudit(who, before ? "product.updated" : "product.created", "product", product.id, { name: product.name });
  revalidateAll();
  return ok({ id: product.id }, before ? "Product updated successfully." : "Product created successfully.");
}

export async function setProductFlags(id: string, flags: { featured?: boolean; is_published?: boolean }): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.setProductFlags(id, flags);
  await adapter.logAudit(who, flags.is_published === false ? "product.unpublished" : flags.is_published === true ? "product.published" : "product.featured", "product", id, flags);
  revalidateAll();
  return ok(undefined, "Product updated successfully.");
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteProduct(id);
  await adapter.logAudit(who, "product.archived", "product", id, null);
  revalidateAll();
  return ok(undefined, "Product deleted.");
}

export async function reorderProducts(companyId: string, orderedIds: string[]): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.reorderProducts(companyId, orderedIds);
  await adapter.logAudit(who, "product.reordered", "product", null, { count: orderedIds.length });
  revalidateAll();
  return ok(undefined, "Order saved.");
}

/* ── variants ──────────────────────────────────────────────────────────── */
export async function saveVariant(input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fields[String(i.path[0])] = i.message; });
    return fail("Please correct the variant fields.", fields);
  }
  const adapter = getAdapter();
  const before = parsed.data.id ? await adapter.getProductById(parsed.data.product_id, { includeUnpublished: true }).then((p) => p?.variants?.find((v) => v.id === parsed.data.id)) : null;
  const variant = await adapter.saveVariant(parsed.data);
  const priceChanged = before && before.price !== variant.price;
  const qtyChanged = before && before.quantity !== variant.quantity;
  await adapter.logAudit(who, priceChanged ? "variant.price_changed" : qtyChanged ? "variant.quantity_changed" : before ? "variant.updated" : "variant.created", "product_variant", variant.id, { variant: variant.variant_name, price: variant.price, quantity: variant.quantity });
  revalidateAll();
  return ok(undefined, before ? "Variant updated successfully." : "Variant added successfully.");
}

export async function deleteVariant(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteVariant(id);
  await adapter.logAudit(who, "variant.deleted", "product_variant", id, null);
  revalidateAll();
  return ok(undefined, "Variant deleted.");
}

/* ── categories ────────────────────────────────────────────────────────── */
export async function saveCategory(input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid category.");
  const adapter = getAdapter();
  const cat = await adapter.saveCategory(parsed.data);
  await adapter.logAudit(who, "category.saved", "category", cat.id, { name: cat.name });
  revalidateAll();
  return ok(undefined, "Category saved.");
}
export async function deleteCategory(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteCategory(id);
  await adapter.logAudit(who, "category.deleted", "category", id, null);
  revalidateAll();
  return ok(undefined, "Category deleted.");
}

/* ── projects ──────────────────────────────────────────────────────────── */
export async function saveProject(input: Record<string, unknown>): Promise<ActionResult<{ id: string }>> {
  const who = await actor();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fields[String(i.path[0])] = i.message; });
    return fail("Please correct the highlighted fields.", fields);
  }
  const adapter = getAdapter();
  const before = parsed.data.id ? await adapter.getProjectBySlug("", { includeUnpublished: true }).catch(() => null) : null;
  void before;
  const project = await adapter.saveProject(parsed.data);
  await adapter.logAudit(who, parsed.data.id ? "project.updated" : "project.created", "project", project.id, { name: project.name });
  revalidateAll();
  return ok({ id: project.id }, "Project saved successfully.");
}
export async function setProjectFlags(id: string, flags: { featured?: boolean; is_published?: boolean }): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.setProjectFlags(id, flags);
  await adapter.logAudit(who, "project.flags", "project", id, flags);
  revalidateAll();
  return ok(undefined, "Project updated.");
}
export async function deleteProject(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteProject(id);
  await adapter.logAudit(who, "project.archived", "project", id, null);
  revalidateAll();
  return ok(undefined, "Project deleted.");
}
export async function addProjectImage(projectId: string, imageUrl: string, alt: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.addProjectImage({ project_id: projectId, image_url: imageUrl, alt_text: alt });
  await adapter.logAudit(who, "project.image_added", "project_image", projectId, null);
  revalidateAll();
  return ok(undefined, "Image added.");
}
export async function deleteProjectImage(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteProjectImage(id);
  await adapter.logAudit(who, "project.image_deleted", "project_image", id, null);
  revalidateAll();
  return ok(undefined, "Image removed.");
}

/* ── gallery & banners ─────────────────────────────────────────────────── */
export async function saveGalleryItem(input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = gallerySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid gallery item.");
  const adapter = getAdapter();
  const item = await adapter.saveGalleryItem(parsed.data);
  await adapter.logAudit(who, "gallery.saved", "gallery_item", item.id, null);
  revalidateAll();
  return ok(undefined, "Gallery item saved.");
}
export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteGalleryItem(id);
  await adapter.logAudit(who, "gallery.deleted", "gallery_item", id, null);
  revalidateAll();
  return ok(undefined, "Gallery item deleted.");
}
export async function saveBanner(input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid banner.");
  const adapter = getAdapter();
  const banner = await adapter.saveBanner(parsed.data);
  await adapter.logAudit(who, "banner.saved", "banner", banner.id, { title: banner.title });
  revalidateAll();
  return ok(undefined, "Banner saved.");
}
export async function deleteBanner(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteBanner(id);
  await adapter.logAudit(who, "banner.deleted", "banner", id, null);
  revalidateAll();
  return ok(undefined, "Banner deleted.");
}

/* ── contact / whatsapp / content / settings ───────────────────────────── */
export async function saveContact(companyId: string, input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid contact details.");
  const adapter = getAdapter();
  await adapter.updateContact(companyId, {
    email: (parsed.data.email as string | null | undefined) ?? null,
    phone: (parsed.data.phone as string | null | undefined) ?? null,
    address: (parsed.data.address as string | null | undefined) ?? null,
    maps_url: (parsed.data.maps_url as string | null | undefined) || null,
  });
  await adapter.logAudit(who, "contact.changed", "contact_settings", companyId, null);
  revalidateAll();
  return ok(undefined, "Contact details updated.");
}

export async function saveWhatsApp(input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = whatsappSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid WhatsApp number.");
  const adapter = getAdapter();
  const row = await adapter.saveWhatsApp(parsed.data);
  await adapter.logAudit(who, "whatsapp.changed", "whatsapp_settings", row.id, { phone_number: row.phone_number });
  revalidateAll();
  return ok(undefined, "WhatsApp number saved.");
}
export async function deleteWhatsApp(id: string): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.deleteWhatsApp(id);
  await adapter.logAudit(who, "whatsapp.deleted", "whatsapp_settings", id, null);
  revalidateAll();
  return ok(undefined, "WhatsApp number removed.");
}

export async function saveContent(key: string, value: unknown, companyId: string | null): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.setContent(key, value, companyId);
  await adapter.logAudit(who, "content.updated", "site_content", null, { key });
  revalidateAll();
  return ok(undefined, "Content saved.");
}

export async function saveTypography(input: { paragraph_align: string }): Promise<ActionResult> {
  const who = await actor();
  const align = input?.paragraph_align === "left" ? "left" : "justify";
  const adapter = getAdapter();
  await adapter.setContent("typography", { paragraph_align: align });
  await adapter.logAudit(who, "settings.typography", "site_content", "typography", { paragraph_align: align });
  revalidateAll();
  return ok(undefined, "Paragraph alignment saved.");
}

export async function saveSettings(input: Record<string, unknown>): Promise<ActionResult> {
  const who = await actor();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fields[String(i.path[0])] = i.message; });
    return fail("Please correct the highlighted fields.", fields);
  }
  const adapter = getAdapter();
  await adapter.updateSettings(parsed.data);
  await adapter.logAudit(who, "settings.updated", "site_settings", "main", null);
  revalidateAll();
  return ok(undefined, "Settings saved.");
}

/* ── enquiries ─────────────────────────────────────────────────────────── */
export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<ActionResult> {
  const who = await actor();
  const adapter = getAdapter();
  await adapter.updateEnquiryStatus(id, status);
  await adapter.logAudit(who, "enquiry.status", "enquiry", id, { status });
  revalidatePath("/admin/enquiries");
  return ok(undefined, `Enquiry marked ${status}.`);
}

/* ── session ───────────────────────────────────────────────────────────── */
export async function adminSessionInfo(): Promise<{ email: string | null; mode: string }> {
  const s = await getSession();
  return { email: s?.email ?? null, mode: getAdapter().mode };
}
