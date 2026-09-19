/**
 * Production driver — Supabase PostgreSQL + Storage (service role, server-only).
 * RLS (supabase/migrations/0002_rls.sql) still protects anon/browser access;
 * the service role is used exclusively from Server Actions / RSC.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminProfile, AuditLog, Banner, Category, Company, ContactSettings, Enquiry,
  EnquiryStatus, GalleryItem, ID, Product, ProductImage, ProductQuery, ProductVariant,
  Project, SiteSettings, WhatsAppSetting,
} from "@/lib/types";
import type {
  CreateEnquiryInput, DataAdapter, SaveBannerInput, SaveCategoryInput, SaveGalleryInput,
  SaveImageInput, SaveProductInput, SaveProjectInput, SaveVariantInput, SaveWhatsAppInput, UploadResult,
} from "../adapter";
import { makeSlug, newId } from "../common";

function client(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment is not configured on the server.");
  return createClient(url, key, { auth: { persistSession: false } });
}

const clean = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export class SupabaseAdapter implements DataAdapter {
  readonly mode = "supabase" as const;
  private sb = client();

  /* companies */
  async listCompanies(): Promise<Company[]> {
    const { data } = await this.sb.from("companies").select("*").order("display_order");
    return (data ?? []) as Company[];
  }
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    const { data } = await this.sb.from("companies").select("*").eq("slug", slug).maybeSingle();
    return (data as Company) ?? null;
  }
  async upsertCompany(i: { id?: ID; name: string; slug: string; short_description?: string | null; description?: string | null; logo_url?: string | null; hero_image_url?: string | null; is_active?: boolean; display_order?: number }): Promise<ID> {
    const id = i.id ?? newId();
    await this.sb.from("companies").upsert({ id, ...clean({ ...i }) });
    return id;
  }

  /* categories */
  async listCategories(companyId: ID, opts?: { includeInactive?: boolean }): Promise<Category[]> {
    let q = this.sb.from("categories").select("*").eq("company_id", companyId).order("display_order");
    if (!opts?.includeInactive) q = q.eq("is_active", true);
    const { data } = await q;
    return (data ?? []) as Category[];
  }
  async saveCategory(i: SaveCategoryInput): Promise<Category> {
    const existing = i.id ? await this.sb.from("categories").select("*").eq("id", i.id).maybeSingle().then((r) => r.data) : null;
    const slug = (existing as Category | null)?.slug ?? makeSlug(i.name, await this.sb.from("categories").select("slug").then((r) => (r.data ?? []).map((x: { slug: string }) => x.slug)));
    const id = i.id ?? newId();
    const row = { id, ...clean({ ...i }), slug };
    const { data } = await this.sb.from("categories").upsert(row).select().single();
    return data as Category;
  }
  async deleteCategory(id: ID): Promise<void> {
    await this.sb.from("categories").delete().eq("id", id);
  }

  /* products */
  private async hydrate(p: Product): Promise<Product> {
    const [variants, images, cat] = await Promise.all([
      this.sb.from("product_variants").select("*").eq("product_id", p.id).order("display_order"),
      this.sb.from("product_images").select("*").eq("product_id", p.id).order("display_order"),
      p.category_id ? this.sb.from("categories").select("*").eq("id", p.category_id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    return { ...p, variants: (variants.data ?? []) as ProductVariant[], images: (images.data ?? []) as ProductImage[], category: (cat.data as Category) ?? null };
  }
  async listProducts(companyId: ID, q: ProductQuery = {}): Promise<Product[]> {
    let query = this.sb.from("products").select("*, category:categories(*)").eq("company_id", companyId).order("display_order");
    if (q.publishedOnly) query = query.eq("is_published", true);
    if (q.featured) query = query.eq("featured", true);
    if (q.categoryId) query = query.eq("category_id", q.categoryId);
    if (q.search) query = query.or(`name.ilike.%${q.search}%,short_description.ilike.%${q.search}%`);
    if (q.availability && q.availability !== "any") {
      const { data: vids } = await this.sb.from("product_variants").select("product_id").eq("availability", q.availability);
      const ids = (vids ?? []).map((v: { product_id: string }) => v.product_id);
      if (ids.length === 0) return [];
      query = query.in("id", ids);
    }
    if (q.limit) query = query.limit(q.limit).range(q.offset ?? 0, (q.offset ?? 0) + q.limit - 1);
    const { data } = await query;
    let rows = (data ?? []) as Product[];
    rows = await Promise.all(rows.map((r) => this.hydrate(r)));
    if (q.sort === "name-asc") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (q.sort === "price-asc" || q.sort === "price-desc") {
      const min = (p: Product) => Math.min(...(p.variants?.map((v) => v.price ?? Infinity) ?? [Infinity]));
      rows.sort((a, b) => (q.sort === "price-asc" ? min(a) - min(b) : min(b) - min(a)));
    }
    return rows;
  }
  async getProductById(id: ID, opts?: { includeUnpublished?: boolean }): Promise<Product | null> {
    const { data } = await this.sb.from("products").select("*, category:categories(*)").eq("id", id).maybeSingle();
    if (!data) return null;
    const p = data as Product;
    if (!opts?.includeUnpublished && !p.is_published) return null;
    return this.hydrate(p);
  }
  async getProductBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Product | null> {
    const { data } = await this.sb.from("products").select("*, category:categories(*)").eq("slug", slug).maybeSingle();
    if (!data) return null;
    const p = data as Product;
    if (!opts?.includeUnpublished && !p.is_published) return null;
    return this.hydrate(p);
  }
  async saveProduct(i: SaveProductInput): Promise<Product> {
    const existing = i.id ? await this.getProductById(i.id, { includeUnpublished: true }) : null;
    const slug = existing?.slug ?? makeSlug(i.name, await this.sb.from("products").select("slug").then((r) => (r.data ?? []).map((x: { slug: string }) => x.slug)));
    const id = i.id ?? newId();
    const { data } = await this.sb.from("products").upsert({ id, ...clean({ ...i }), slug, updated_at: new Date().toISOString() }).select().single();
    return this.hydrate(data as Product);
  }
  async setProductFlags(id: ID, flags: { featured?: boolean; is_published?: boolean }): Promise<void> {
    await this.sb.from("products").update({ ...clean({ ...flags }), updated_at: new Date().toISOString() }).eq("id", id);
  }
  async deleteProduct(id: ID): Promise<void> {
    await this.sb.from("products").delete().eq("id", id);
  }
  async reorderProducts(companyId: ID, orderedIds: ID[]): Promise<void> {
    await Promise.all(orderedIds.map((pid, idx) => this.sb.from("products").update({ display_order: idx }).eq("id", pid).eq("company_id", companyId)));
  }
  async saveVariant(i: SaveVariantInput): Promise<ProductVariant> {
    const id = i.id ?? newId();
    const { data } = await this.sb.from("product_variants").upsert({ id, ...clean({ ...i }), updated_at: new Date().toISOString() }).select().single();
    return data as ProductVariant;
  }
  async deleteVariant(id: ID): Promise<void> {
    await this.sb.from("product_variants").delete().eq("id", id);
  }
  async reorderVariants(productId: ID, orderedIds: ID[]): Promise<void> {
    await Promise.all(orderedIds.map((vid, idx) => this.sb.from("product_variants").update({ display_order: idx }).eq("id", vid).eq("product_id", productId)));
  }
  async addProductImage(i: SaveImageInput & { product_id: ID }): Promise<ProductImage> {
    const id = i.id ?? newId();
    if (i.is_primary) await this.sb.from("product_images").update({ is_primary: false }).eq("product_id", i.product_id);
    const { data } = await this.sb.from("product_images").upsert({ id, ...clean({ ...i }) }).select().single();
    return data as ProductImage;
  }
  async deleteProductImage(id: ID): Promise<void> {
    await this.sb.from("product_images").delete().eq("id", id);
  }
  async setPrimaryProductImage(productId: ID, imageId: ID): Promise<void> {
    await this.sb.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    await this.sb.from("product_images").update({ is_primary: true }).eq("id", imageId);
  }

  /* projects */
  async listProjects(companyId: ID, opts?: { type?: Project["project_type"]; publishedOnly?: boolean; featured?: boolean }): Promise<Project[]> {
    let q = this.sb.from("projects").select("*").eq("company_id", companyId).order("display_order");
    if (opts?.publishedOnly) q = q.eq("is_published", true);
    if (opts?.featured) q = q.eq("featured", true);
    if (opts?.type) q = q.eq("project_type", opts.type);
    const { data } = await q;
    const rows = (data ?? []) as Project[];
    return Promise.all(rows.map(async (p) => {
      const imgs = await this.sb.from("project_images").select("*").eq("project_id", p.id).order("display_order");
      return { ...p, images: (imgs.data ?? []) as Project["images"] };
    }));
  }
  async getProjectBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Project | null> {
    const { data } = await this.sb.from("projects").select("*").eq("slug", slug).maybeSingle();
    if (!data) return null;
    const p = data as Project;
    if (!opts?.includeUnpublished && !p.is_published) return null;
    const imgs = await this.sb.from("project_images").select("*").eq("project_id", p.id).order("display_order");
    return { ...p, images: (imgs.data ?? []) as Project["images"] };
  }
  async saveProject(i: SaveProjectInput): Promise<Project> {
    const existing = i.id ? await this.sb.from("projects").select("*").eq("id", i.id).maybeSingle().then((r) => r.data as Project | null) : null;
    const slug = existing?.slug ?? makeSlug(i.name, await this.sb.from("projects").select("slug").then((r) => (r.data ?? []).map((x: { slug: string }) => x.slug)));
    const id = i.id ?? newId();
    const { data } = await this.sb.from("projects").upsert({ id, ...clean({ ...i }), slug, updated_at: new Date().toISOString() }).select().single();
    return data as Project;
  }
  async setProjectFlags(id: ID, flags: { featured?: boolean; is_published?: boolean }): Promise<void> {
    await this.sb.from("projects").update({ ...clean({ ...flags }), updated_at: new Date().toISOString() }).eq("id", id);
  }
  async deleteProject(id: ID): Promise<void> {
    await this.sb.from("projects").delete().eq("id", id);
  }
  async reorderProjects(companyId: ID, orderedIds: ID[]): Promise<void> {
    await Promise.all(orderedIds.map((pid, idx) => this.sb.from("projects").update({ display_order: idx }).eq("id", pid).eq("company_id", companyId)));
  }
  async addProjectImage(i: SaveImageInput & { project_id: ID }): Promise<void> {
    await this.sb.from("project_images").insert({ id: i.id ?? newId(), ...clean({ ...i }) });
  }
  async deleteProjectImage(id: ID): Promise<void> {
    await this.sb.from("project_images").delete().eq("id", id);
  }

  /* gallery */
  async listGallery(opts?: { companyId?: ID; publishedOnly?: boolean; limit?: number; offset?: number }): Promise<{ items: GalleryItem[]; total: number }> {
    let q = this.sb.from("gallery_items").select("*", { count: "exact" }).order("display_order");
    if (opts?.publishedOnly) q = q.eq("is_published", true);
    if (opts?.companyId) q = q.eq("company_id", opts.companyId);
    if (opts?.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
    const { data, count } = await q;
    return { items: (data ?? []) as GalleryItem[], total: count ?? 0 };
  }
  async saveGalleryItem(i: SaveGalleryInput): Promise<GalleryItem> {
    const id = i.id ?? newId();
    const { data } = await this.sb.from("gallery_items").upsert({ id, ...clean({ ...i }), updated_at: new Date().toISOString() }).select().single();
    return data as GalleryItem;
  }
  async deleteGalleryItem(id: ID): Promise<void> {
    await this.sb.from("gallery_items").delete().eq("id", id);
  }

  /* banners */
  async listBanners(companyId: ID, opts?: { activeOnly?: boolean }): Promise<Banner[]> {
    let q = this.sb.from("banners").select("*").eq("company_id", companyId).order("display_order");
    if (opts?.activeOnly) q = q.eq("is_active", true);
    const { data } = await q;
    return (data ?? []) as Banner[];
  }
  async saveBanner(i: SaveBannerInput): Promise<Banner> {
    const id = i.id ?? newId();
    const { data } = await this.sb.from("banners").upsert({ id, ...clean({ ...i }), updated_at: new Date().toISOString() }).select().single();
    return data as Banner;
  }
  async deleteBanner(id: ID): Promise<void> {
    await this.sb.from("banners").delete().eq("id", id);
  }

  /* content/settings/contact/whatsapp */
  async getContent<T>(key: string, companyId?: ID | null): Promise<T | null> {
    const q = this.sb.from("site_content").select("value").eq("key", key);
    const { data } = companyId ? await q.eq("company_id", companyId).maybeSingle() : await q.is("company_id", null).maybeSingle();
    return (data?.value as T) ?? null;
  }
  async setContent(key: string, value: unknown, companyId?: ID | null): Promise<void> {
    const existing = await this.getContent(key, companyId);
    void existing;
    const { data } = await this.sb.from("site_content").select("id").eq("key", key).is("company_id", companyId ?? null).maybeSingle();
    await this.sb.from("site_content").upsert({ id: data?.id ?? newId(), key, company_id: companyId ?? null, value, updated_at: new Date().toISOString() });
  }
  async getSettings(): Promise<SiteSettings> {
    const { data } = await this.sb.from("site_settings").select("*").eq("id", "main").maybeSingle();
    if (data) return data as SiteSettings;
    const created = { id: "main", site_title: "IMN Group of Companies", updated_at: new Date().toISOString() };
    await this.sb.from("site_settings").upsert(created);
    return (await this.sb.from("site_settings").select("*").eq("id", "main").single()).data as SiteSettings;
  }
  async updateSettings(patch: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<SiteSettings> {
    await this.sb.from("site_settings").upsert({ id: "main", ...clean({ ...patch }), updated_at: new Date().toISOString() });
    return this.getSettings();
  }
  async getContact(companyId: ID): Promise<ContactSettings | null> {
    const { data } = await this.sb.from("contact_settings").select("*").eq("company_id", companyId).maybeSingle();
    return (data as ContactSettings) ?? null;
  }
  async updateContact(companyId: ID, patch: Partial<Pick<ContactSettings, "email" | "phone" | "address" | "maps_url">>): Promise<ContactSettings> {
    const existing = await this.getContact(companyId);
    const row = { id: existing?.id ?? newId(), company_id: companyId, email: null, phone: null, address: null, maps_url: null, ...clean({ ...(existing ?? {}) }), ...clean({ ...patch }), updated_at: new Date().toISOString() };
    const { data } = await this.sb.from("contact_settings").upsert(row).select().single();
    return data as ContactSettings;
  }
  async listWhatsApp(companyId: ID, opts?: { activeOnly?: boolean }): Promise<WhatsAppSetting[]> {
    let q = this.sb.from("whatsapp_settings").select("*").eq("company_id", companyId).order("is_primary", { ascending: false });
    if (opts?.activeOnly) q = q.eq("is_active", true);
    const { data } = await q;
    return (data ?? []) as WhatsAppSetting[];
  }
  async saveWhatsApp(i: SaveWhatsAppInput): Promise<WhatsAppSetting> {
    if (i.is_primary) await this.sb.from("whatsapp_settings").update({ is_primary: false }).eq("company_id", i.company_id);
    const id = i.id ?? newId();
    const { data } = await this.sb.from("whatsapp_settings").upsert({ id, ...clean({ ...i }), updated_at: new Date().toISOString() }).select().single();
    return data as WhatsAppSetting;
  }
  async deleteWhatsApp(id: ID): Promise<void> {
    await this.sb.from("whatsapp_settings").delete().eq("id", id);
  }

  /* enquiries */
  async createEnquiry(i: CreateEnquiryInput): Promise<Enquiry> {
    const { data } = await this.sb.from("enquiries").insert({ id: newId(), ...clean({ ...i }) }).select().single();
    return data as Enquiry;
  }
  async listEnquiries(opts?: { companyId?: ID; status?: EnquiryStatus | "all" }): Promise<Enquiry[]> {
    let q = this.sb.from("enquiries").select("*, company:companies(*), product:products(*)").order("created_at", { ascending: false });
    if (opts?.companyId) q = q.eq("company_id", opts.companyId);
    if (opts?.status && opts.status !== "all") q = q.eq("status", opts.status);
    const { data } = await q;
    return (data ?? []) as Enquiry[];
  }
  async updateEnquiryStatus(id: ID, status: EnquiryStatus): Promise<void> {
    await this.sb.from("enquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  }

  /* audit */
  async logAudit(actor: string, action: string, entityType: string, entityId: ID | null, diff?: Record<string, unknown> | null): Promise<void> {
    await this.sb.from("audit_logs").insert({ id: newId(), actor_email: actor, action, entity_type: entityType, entity_id: entityId, diff });
  }
  async listAudit(limit = 200): Promise<AuditLog[]> {
    const { data } = await this.sb.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    return (data ?? []) as AuditLog[];
  }

  /* admin profiles */
  async getAdminByEmail(email: string): Promise<AdminProfile | null> {
    const { data } = await this.sb.from("admin_profiles").select("*").eq("email", email.toLowerCase()).maybeSingle();
    return (data as AdminProfile) ?? null;
  }
  async upsertAdminProfile(p: { email: string; full_name?: string | null; role?: "owner" | "manager"; password_hash?: string | null; user_id?: string | null; must_change_password?: boolean }): Promise<AdminProfile> {
    const existing = await this.getAdminByEmail(p.email);
    const id = existing?.id ?? newId();
    const { data } = await this.sb.from("admin_profiles").upsert({ id, ...clean({ ...p }), email: p.email.toLowerCase() }).select().single();
    return data as AdminProfile;
  }

  /* storage */
  async saveUpload(buffer: Buffer, opts: { dir: string; filename: string; mime: string }): Promise<UploadResult> {
    const p = `${opts.dir}/${opts.filename}`;
    const { error } = await this.sb.storage.from("imn").upload(p, buffer, { contentType: opts.mime, upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = this.sb.storage.from("imn").getPublicUrl(p);
    return { url: data.publicUrl, path: p };
  }
  async deleteUpload(url: string): Promise<void> {
    const marker = "/imn/";
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const p = decodeURIComponent(url.slice(idx + marker.length));
    await this.sb.storage.from("imn").remove([p]);
  }
}
