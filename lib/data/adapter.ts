/**
 * DataAdapter — the single contract between the application and its database.
 * Two implementations exist:
 *   • adapters/supabase.ts — production (Supabase PostgreSQL + Auth + Storage)
 *   • adapters/local.ts    — Local Demo Mode (SQLite file + /public/uploads)
 * All domain logic lives in the callers (server components / server actions);
 * adapters only persist and query. See docs/ARCHITECTURE.md §A.3.
 */
import type {
  AdminProfile, Availability, Banner, Category, Company, ContactSettings, DivisionSlug,
  Enquiry, EnquiryStatus, GalleryItem, ID, Product, ProductImage, ProductQuery,
  ProductVariant, Project, ProjectType, SiteSettings, WhatsAppSetting, AuditLog,
} from "@/lib/types";

export interface SaveCategoryInput {
  id?: ID; company_id: ID; name: string; description?: string | null;
  image_url?: string | null; display_order?: number; is_active?: boolean;
}
export interface SaveProductInput {
  id?: ID; company_id: ID; category_id?: ID | null; name: string;
  short_description?: string | null; description?: string | null;
  main_image_url?: string | null; featured?: boolean; is_published?: boolean;
  is_ai_draft?: boolean; display_order?: number;
}
export interface SaveVariantInput {
  id?: ID; product_id: ID; variant_name: string; size?: string | null;
  weight?: number | null; unit?: string | null; price?: number | null;
  quantity: number; availability?: Availability; display_order?: number;
}
export interface SaveImageInput {
  id?: ID; product_id?: ID; project_id?: ID; image_url: string; alt_text?: string | null;
  is_primary?: boolean; display_order?: number;
}
export interface SaveProjectInput {
  id?: ID; company_id: ID; name: string; location?: string | null;
  project_type: ProjectType; description?: string | null; main_image_url?: string | null;
  featured?: boolean; is_published?: boolean; display_order?: number;
}
export interface SaveGalleryInput {
  id?: ID; company_id: ID; title?: string | null; description?: string | null;
  image_url: string; category?: string | null; display_order?: number; is_published?: boolean;
}
export interface SaveBannerInput {
  id?: ID; company_id: ID; title?: string | null; subtitle?: string | null; image_url: string;
  button_text?: string | null; button_url?: string | null; is_active?: boolean;
  display_order?: number;
}
export interface SaveWhatsAppInput {
  id?: ID; company_id: ID; phone_number: string; label?: string | null;
  is_primary?: boolean; is_active?: boolean;
}
export interface CreateEnquiryInput {
  company_id?: ID | null; product_id?: ID | null; name: string; email: string;
  phone?: string | null; subject?: string | null; message: string;
}
export interface UploadResult { url: string; path: string; }

export interface DataAdapter {
  readonly mode: "supabase" | "local";

  // companies
  listCompanies(): Promise<Company[]>;
  getCompanyBySlug(slug: DivisionSlug | string): Promise<Company | null>;
  upsertCompany(input: { id?: ID; name: string; slug: DivisionSlug | string; short_description?: string | null; description?: string | null; logo_url?: string | null; hero_image_url?: string | null; is_active?: boolean; display_order?: number }): Promise<ID>;

  // categories
  listCategories(companyId: ID, opts?: { includeInactive?: boolean }): Promise<Category[]>;
  saveCategory(input: SaveCategoryInput): Promise<Category>;
  deleteCategory(id: ID): Promise<void>;

  // products + variants + images
  listProducts(companyId: ID, q?: ProductQuery): Promise<Product[]>;
  getProductById(id: ID, opts?: { includeUnpublished?: boolean }): Promise<Product | null>;
  getProductBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Product | null>;
  saveProduct(input: SaveProductInput): Promise<Product>;
  setProductFlags(id: ID, flags: { featured?: boolean; is_published?: boolean }): Promise<void>;
  deleteProduct(id: ID): Promise<void>;
  reorderProducts(companyId: ID, orderedIds: ID[]): Promise<void>;
  saveVariant(input: SaveVariantInput): Promise<ProductVariant>;
  deleteVariant(id: ID): Promise<void>;
  reorderVariants(productId: ID, orderedIds: ID[]): Promise<void>;
  addProductImage(input: SaveImageInput & { product_id: ID }): Promise<ProductImage>;
  deleteProductImage(id: ID): Promise<void>;
  setPrimaryProductImage(productId: ID, imageId: ID): Promise<void>;

  // projects
  listProjects(companyId: ID, opts?: { type?: ProjectType; publishedOnly?: boolean; featured?: boolean }): Promise<Project[]>;
  getProjectBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Project | null>;
  saveProject(input: SaveProjectInput): Promise<Project>;
  setProjectFlags(id: ID, flags: { featured?: boolean; is_published?: boolean }): Promise<void>;
  deleteProject(id: ID): Promise<void>;
  reorderProjects(companyId: ID, orderedIds: ID[]): Promise<void>;
  addProjectImage(input: SaveImageInput & { project_id: ID }): Promise<void>;
  deleteProjectImage(id: ID): Promise<void>;

  // gallery
  listGallery(opts?: { companyId?: ID; publishedOnly?: boolean; limit?: number; offset?: number }): Promise<{ items: GalleryItem[]; total: number }>;
  saveGalleryItem(input: SaveGalleryInput): Promise<GalleryItem>;
  deleteGalleryItem(id: ID): Promise<void>;

  // banners
  listBanners(companyId: ID, opts?: { activeOnly?: boolean }): Promise<Banner[]>;
  saveBanner(input: SaveBannerInput): Promise<Banner>;
  deleteBanner(id: ID): Promise<void>;

  // site content / settings / contact / whatsapp
  getContent<T>(key: string, companyId?: ID | null): Promise<T | null>;
  setContent(key: string, value: unknown, companyId?: ID | null): Promise<void>;
  getSettings(): Promise<SiteSettings>;
  updateSettings(patch: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<SiteSettings>;
  getContact(companyId: ID): Promise<ContactSettings | null>;
  updateContact(companyId: ID, patch: Partial<Pick<ContactSettings, "email" | "phone" | "address" | "maps_url">>): Promise<ContactSettings>;
  listWhatsApp(companyId: ID, opts?: { activeOnly?: boolean }): Promise<WhatsAppSetting[]>;
  saveWhatsApp(input: SaveWhatsAppInput): Promise<WhatsAppSetting>;
  deleteWhatsApp(id: ID): Promise<void>;

  // enquiries
  createEnquiry(input: CreateEnquiryInput): Promise<Enquiry>;
  listEnquiries(opts?: { companyId?: ID; status?: EnquiryStatus | "all" }): Promise<Enquiry[]>;
  updateEnquiryStatus(id: ID, status: EnquiryStatus): Promise<void>;

  // audit
  logAudit(actor: string, action: string, entityType: string, entityId: ID | null, diff?: Record<string, unknown> | null): Promise<void>;
  listAudit(limit?: number): Promise<AuditLog[]>;

  // admin profiles (auth secrets handled by lib/auth per mode)
  getAdminByEmail(email: string): Promise<AdminProfile | null>;
  upsertAdminProfile(p: { email: string; full_name?: string | null; role?: "owner" | "manager"; password_hash?: string | null; user_id?: string | null; must_change_password?: boolean }): Promise<AdminProfile>;

  // storage
  saveUpload(buffer: Buffer, opts: { dir: string; filename: string; mime: string }): Promise<UploadResult>;
  deleteUpload(url: string): Promise<void>;
}
