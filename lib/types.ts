/* Domain types — mirror the PostgreSQL schema (docs/ARCHITECTURE.md §C). */

export type ID = string;
export type Availability = "in_stock" | "out_of_stock" | "preorder";
export type ProjectType = "residential" | "commercial";
export type EnquiryStatus = "new" | "contacted" | "closed";
export type DivisionSlug = "imn-builder" | "indon-mart" | "brightstone";

export interface Company {
  id: ID; name: string; slug: DivisionSlug; short_description: string | null;
  description: string | null; logo_url: string | null; hero_image_url: string | null;
  is_active: boolean; display_order: number; created_at: string; updated_at: string;
}

export interface Category {
  id: ID; company_id: ID; name: string; slug: string; description: string | null;
  image_url: string | null; display_order: number; is_active: boolean;
  created_at: string; updated_at: string;
}

export interface ProductVariant {
  id: ID; product_id: ID; variant_name: string; size: string | null; weight: number | null;
  unit: string | null; price: number | null; quantity: number; availability: Availability;
  display_order: number; created_at: string; updated_at: string;
}

export interface ProductImage {
  id: ID; product_id: ID; image_url: string; alt_text: string | null;
  is_primary: boolean; display_order: number; created_at: string;
}

export interface Product {
  id: ID; company_id: ID; category_id: ID | null; name: string; slug: string;
  short_description: string | null; description: string | null; main_image_url: string | null;
  featured: boolean; is_published: boolean; is_ai_draft: boolean; display_order: number;
  created_at: string; updated_at: string;
  category?: Category | null; variants?: ProductVariant[]; images?: ProductImage[];
}

export interface ProjectImage {
  id: ID; project_id: ID; image_url: string; alt_text: string | null;
  display_order: number; created_at: string;
}

export interface Project {
  id: ID; company_id: ID; name: string; slug: string; location: string | null;
  project_type: ProjectType; description: string | null; main_image_url: string | null;
  featured: boolean; is_published: boolean; display_order: number;
  created_at: string; updated_at: string; images?: ProjectImage[];
}

export interface GalleryItem {
  id: ID; company_id: ID; title: string | null; description: string | null;
  image_url: string; category: string | null; display_order: number; is_published: boolean;
  created_at: string; updated_at: string; company?: Company | null;
}

export interface Banner {
  id: ID; company_id: ID; title: string | null; subtitle: string | null; image_url: string;
  button_text: string | null; button_url: string | null; is_active: boolean;
  display_order: number; created_at: string; updated_at: string;
}

export interface SiteSettings {
  id: ID; site_title: string; tagline: string | null; address: string | null;
  maps_url: string | null; maps_qr_image_url: string | null; website_qr_image_url: string | null;
  whatsapp_qr_image_url: string | null; social_json: Record<string, string> | null;
  footer_note: string | null; seo_title: string | null; seo_description: string | null;
  updated_at: string;
}

export interface ContactSettings {
  id: ID; company_id: ID; email: string | null; phone: string | null; address: string | null;
  maps_url: string | null; updated_at: string;
}

export interface WhatsAppSetting {
  id: ID; company_id: ID; phone_number: string; label: string | null;
  is_primary: boolean; is_active: boolean; updated_at: string;
}

export interface Enquiry {
  id: ID; company_id: ID | null; product_id: ID | null; name: string; email: string;
  phone: string | null; subject: string | null; message: string; status: EnquiryStatus;
  created_at: string; updated_at: string; company?: Company | null; product?: Product | null;
}

export interface AuditLog {
  id: ID; actor_email: string; action: string; entity_type: string; entity_id: string | null;
  diff: Record<string, unknown> | null; created_at: string;
}

export interface AdminSession {
  email: string; name: string | null; role: "owner" | "manager";
}

export interface ProductQuery {
  publishedOnly?: boolean; featured?: boolean; categoryId?: ID | null;
  search?: string; availability?: Availability | "any";
  sort?: "default" | "name-asc" | "price-asc" | "price-desc";
  limit?: number; offset?: number;
}

export interface AdminProfile {
  id: ID; user_id: string | null; email: string; full_name: string | null;
  role: "owner" | "manager"; must_change_password: boolean;
  password_hash: string | null; created_at: string; updated_at: string;
}
