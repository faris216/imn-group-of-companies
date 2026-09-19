/**
 * Local Demo Mode driver — SQLite file (.data/imn.db) + /public/uploads.
 * Activated only while Supabase env vars are absent. Identical schema & seed
 * to production; see docs/ARCHITECTURE.md §A.3 and docs/ENVIRONMENT.md.
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type {
  AdminProfile, AuditLog, Banner, Category, Company, ContactSettings, Enquiry,
  EnquiryStatus, GalleryItem, ID, Product, ProductImage, ProductQuery, ProductVariant,
  Project, ProjectImage, SiteSettings, WhatsAppSetting,
} from "@/lib/types";
import type {
  CreateEnquiryInput, DataAdapter, SaveBannerInput, SaveCategoryInput, SaveGalleryInput,
  SaveImageInput, SaveProductInput, SaveProjectInput, SaveVariantInput, SaveWhatsAppInput, UploadResult,
} from "../adapter";
import { makeSlug, newId, timestamps, touch } from "../common";
import { runSeed } from "../seed";

const DDL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  short_description TEXT, description TEXT, logo_url TEXT, hero_image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1, display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_description TEXT, description TEXT,
  main_image_url TEXT, featured INTEGER NOT NULL DEFAULT 0, is_published INTEGER NOT NULL DEFAULT 0,
  is_ai_draft INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id, is_published, display_order);
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, size TEXT, weight REAL, unit TEXT, price REAL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  availability TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock','out_of_stock','preorder')),
  display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, alt_text TEXT, is_primary INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, location TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('residential','commercial')),
  description TEXT, main_image_url TEXT, featured INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS project_images (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, alt_text TEXT, display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT, description TEXT, image_url TEXT NOT NULL, category TEXT,
  display_order INTEGER NOT NULL DEFAULT 0, is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT, subtitle TEXT, image_url TEXT NOT NULL, button_text TEXT, button_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1, display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY, company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  key TEXT NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL,
  UNIQUE(key, company_id));
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY, site_title TEXT NOT NULL, tagline TEXT, address TEXT, maps_url TEXT,
  maps_qr_image_url TEXT, website_qr_image_url TEXT, whatsapp_qr_image_url TEXT,
  social_json TEXT, footer_note TEXT, seo_title TEXT, seo_description TEXT, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS contact_settings (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT, phone TEXT, address TEXT, maps_url TEXT, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL, label TEXT, is_primary INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_profiles (
  id TEXT PRIMARY KEY, user_id TEXT UNIQUE, email TEXT NOT NULL UNIQUE, full_name TEXT,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','manager')),
  must_change_password INTEGER NOT NULL DEFAULT 0, password_hash TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY, company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY, actor_email TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL,
  entity_id TEXT, diff TEXT, created_at TEXT NOT NULL);
`;

/* ── row mappers ─────────────────────────────────────────────────────────── */
const b = (v: unknown) => !!v;
type Row = Record<string, any>;

function mapCompany(r: any): Company {
  return { ...r, is_active: b(r.is_active) };
}
function mapCategory(r: any): Category {
  return { ...r, is_active: b(r.is_active) };
}
function mapVariant(r: any): ProductVariant {
  return { ...r, availability: r.availability };
}
function mapProduct(r: any): Product {
  return { ...r, featured: b(r.featured), is_published: b(r.is_published), is_ai_draft: b(r.is_ai_draft) };
}
function mapImage(r: any): ProductImage {
  return { ...r, is_primary: b(r.is_primary) };
}
function mapProject(r: any): Project {
  return { ...r, featured: b(r.featured), is_published: b(r.is_published) };
}
function mapGallery(r: any): GalleryItem {
  return { ...r, is_published: b(r.is_published) };
}
function mapBanner(r: any): Banner {
  return { ...r, is_active: b(r.is_active) };
}
function mapWhatsApp(r: any): WhatsAppSetting {
  return { ...r, is_primary: b(r.is_primary), is_active: b(r.is_active) };
}
function mapSettings(r: any): SiteSettings {
  return { ...r, social_json: r.social_json ? JSON.parse(r.social_json) : null };
}

export class LocalAdapter implements DataAdapter {
  readonly mode = "local" as const;
  private db: Database.Database;

  constructor() {
    const dir = path.join(process.cwd(), ".data");
    fs.mkdirSync(dir, { recursive: true });
    this.db = new Database(path.join(dir, "imn.db"));
    this.db.exec(DDL);
  }

  private seedPromise: Promise<void> | null = null;
  private inSeed = false;
  private seedDone = false;

  /** Auto-seed once on first use (idempotent) + first-run admin account.
   *  Re-entrancy safe: calls made from inside the seed flow skip the wait. */
  async ready(): Promise<void> {
    if (this.seedDone) return;
    if (this.inSeed) return;
    if (this.seedPromise) { await this.seedPromise; return; }
    this.seedPromise = (async () => {
      this.inSeed = true;
      try {
        const n = (this.db.prepare("SELECT COUNT(*) c FROM companies").get() as Row).c;
        if (n === 0) await runSeed(this);
        const admins = (this.db.prepare("SELECT COUNT(*) c FROM admin_profiles").get() as Row).c;
        if (admins === 0) {
          const crypto = await import("node:crypto");
          const salt = crypto.default.randomBytes(16).toString("hex");
          const hash = crypto.default.scryptSync("Admin@12345", salt, 64).toString("hex");
          this.run(
            `INSERT INTO admin_profiles (id,user_id,email,full_name,role,must_change_password,password_hash,created_at,updated_at)
             VALUES (@id,NULL,@email,'Group Administrator','owner',1,@hash,@t,@t)`,
            { id: newId(), email: "admin@imn.group", hash: `scrypt:${salt}:${hash}`, t: new Date().toISOString() },
          );
        }
        this.seedDone = true;
      } finally {
        this.inSeed = false;
      }
    })();
    await this.seedPromise;
  }

  private all<T>(sql: string, params: Record<string, unknown> = {}): T[] {
    return this.db.prepare(sql).all(params) as T[];
  }
  private get<T>(sql: string, params: Record<string, unknown> = {}): T | undefined {
    return this.db.prepare(sql).get(params) as T | undefined;
  }
  private run(sql: string, params: Record<string, unknown> = {}) {
    return this.db.prepare(sql).run(params);
  }

  /* companies ─────────────────────────────────────────────────────────── */
  async listCompanies(): Promise<Company[]> {
    await this.ready();
    return this.all<Row>("SELECT * FROM companies ORDER BY display_order").map(mapCompany);
  }
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    await this.ready();
    const r = this.get<Row>("SELECT * FROM companies WHERE slug = @slug", { slug });
    return r ? mapCompany(r) : null;
  }
  async upsertCompany(i: { id?: ID; name: string; slug: string; short_description?: string | null; description?: string | null; logo_url?: string | null; hero_image_url?: string | null; is_active?: boolean; display_order?: number }): Promise<ID> {
    const id = i.id ?? newId();
    const t = timestamps();
    this.run(
      `INSERT INTO companies (id,name,slug,short_description,description,logo_url,hero_image_url,is_active,display_order,created_at,updated_at)
       VALUES (@id,@name,@slug,@short_description,@description,@logo_url,@hero_image_url,@is_active,@display_order,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET name=@name, slug=@slug, short_description=@short_description,
         description=@description, logo_url=@logo_url, hero_image_url=@hero_image_url,
         is_active=@is_active, display_order=@display_order, updated_at=@updated_at`,
      { id, name: i.name, slug: i.slug, short_description: i.short_description ?? null, description: i.description ?? null, logo_url: i.logo_url ?? null, hero_image_url: i.hero_image_url ?? null, is_active: i.is_active === false ? 0 : 1, display_order: i.display_order ?? 0, ...t },
    );
    return id;
  }

  /* categories ────────────────────────────────────────────────────────── */
  async listCategories(companyId: ID, opts?: { includeInactive?: boolean }): Promise<Category[]> {
    await this.ready();
    const sql = `SELECT * FROM categories WHERE company_id = @companyId ${opts?.includeInactive ? "" : "AND is_active = 1"} ORDER BY display_order`;
    return this.all<Row>(sql, { companyId }).map(mapCategory);
  }
  async saveCategory(i: SaveCategoryInput): Promise<Category> {
    const slugs = this.all<Row>("SELECT slug FROM categories").map((r) => r.slug as string);
    const id = i.id ?? newId();
    const t = timestamps();
    const existing = i.id ? this.get<Row>("SELECT * FROM categories WHERE id=@id", { id: i.id }) : undefined;
    const slug = existing?.slug ?? makeSlug(i.name, slugs);
    this.run(
      `INSERT INTO categories (id,company_id,name,slug,description,image_url,display_order,is_active,created_at,updated_at)
       VALUES (@id,@company_id,@name,@slug,@description,@image_url,@display_order,@is_active,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET name=@name, description=@description, image_url=@image_url,
         display_order=@display_order, is_active=@is_active, updated_at=@updated_at`,
      { id, company_id: i.company_id, name: i.name, slug, description: i.description ?? null, image_url: i.image_url ?? null, display_order: i.display_order ?? existing?.display_order ?? 0, is_active: i.is_active === undefined ? (existing ? existing.is_active : 1) : i.is_active ? 1 : 0, ...t },
    );
    return mapCategory(this.get<Row>("SELECT * FROM categories WHERE id=@id", { id })!);
  }
  async deleteCategory(id: ID): Promise<void> {
    this.run("DELETE FROM categories WHERE id=@id", { id });
  }

  /* products ──────────────────────────────────────────────────────────── */
  private hydrateProduct(r: Row): Product {
    const p = mapProduct(r);
    p.variants = this.all<Row>("SELECT * FROM product_variants WHERE product_id=@id ORDER BY display_order", { id: p.id }).map(mapVariant);
    p.images = this.all<Row>("SELECT * FROM product_images WHERE product_id=@id ORDER BY display_order", { id: p.id }).map(mapImage);
    const cat = p.category_id ? this.get<Row>("SELECT * FROM categories WHERE id=@id", { id: p.category_id }) : undefined;
    p.category = cat ? mapCategory(cat) : null;
    return p;
  }

  async listProducts(companyId: ID, q: ProductQuery = {}): Promise<Product[]> {
    await this.ready();
    const where: string[] = ["p.company_id = @companyId"];
    const params: Record<string, unknown> = { companyId };
    if (q.publishedOnly) where.push("p.is_published = 1");
    if (q.featured) where.push("p.featured = 1");
    if (q.categoryId) { where.push("p.category_id = @categoryId"); params.categoryId = q.categoryId; }
    if (q.search) {
      where.push("(LOWER(p.name) LIKE @search OR LOWER(COALESCE(p.short_description,'')) LIKE @search OR LOWER(COALESCE(c.name,'')) LIKE @search)");
      params.search = `%${q.search.toLowerCase()}%`;
    }
    if (q.availability && q.availability !== "any") {
      where.push("EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.availability = @availability)");
      params.availability = q.availability;
    }
    const order =
      q.sort === "name-asc" ? "LOWER(p.name) ASC"
      : q.sort === "price-asc" ? "min_price ASC NULLS LAST"
      : q.sort === "price-desc" ? "min_price DESC NULLS LAST"
      : "p.display_order ASC";
    const rows = this.all<Row>(
      `SELECT p.*, c.name as cat_name, (SELECT MIN(v.price) FROM product_variants v WHERE v.product_id=p.id) AS min_price
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT @limit OFFSET @offset`,
      { ...params, limit: q.limit ?? 500, offset: q.offset ?? 0 },
    );
    return rows.map((r) => this.hydrateProduct(r));
  }

  async getProductById(id: ID, opts?: { includeUnpublished?: boolean }): Promise<Product | null> {
    await this.ready();
    const r = this.get<Row>("SELECT * FROM products WHERE id=@id", { id });
    if (!r) return null;
    if (!opts?.includeUnpublished && !r.is_published) return null;
    return this.hydrateProduct(r);
  }
  async getProductBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Product | null> {
    await this.ready();
    const r = this.get<Row>("SELECT * FROM products WHERE slug=@slug", { slug });
    if (!r) return null;
    if (!opts?.includeUnpublished && !r.is_published) return null;
    return this.hydrateProduct(r);
  }
  async saveProduct(i: SaveProductInput): Promise<Product> {
    const slugs = this.all<Row>("SELECT slug FROM products").map((r) => r.slug as string);
    const id = i.id ?? newId();
    const existing = i.id ? this.get<Row>("SELECT * FROM products WHERE id=@id", { id: i.id }) : undefined;
    const slug = existing?.slug ?? makeSlug(i.name, slugs);
    const t = timestamps();
    this.run(
      `INSERT INTO products (id,company_id,category_id,name,slug,short_description,description,main_image_url,featured,is_published,is_ai_draft,display_order,created_at,updated_at)
       VALUES (@id,@company_id,@category_id,@name,@slug,@short_description,@description,@main_image_url,@featured,@is_published,@is_ai_draft,@display_order,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET category_id=@category_id, name=@name, short_description=@short_description,
         description=@description, main_image_url=@main_image_url, featured=@featured,
         is_published=@is_published, is_ai_draft=@is_ai_draft, display_order=@display_order, updated_at=@updated_at`,
      {
        id, company_id: i.company_id, category_id: i.category_id ?? null, name: i.name, slug,
        short_description: i.short_description ?? null, description: i.description ?? null,
        main_image_url: i.main_image_url ?? null,
        featured: i.featured === undefined ? (existing ? existing.featured : 0) : i.featured ? 1 : 0,
        is_published: i.is_published === undefined ? (existing ? existing.is_published : 0) : i.is_published ? 1 : 0,
        is_ai_draft: i.is_ai_draft === undefined ? (existing ? existing.is_ai_draft : 0) : i.is_ai_draft ? 1 : 0,
        display_order: i.display_order ?? existing?.display_order ?? 0, ...t,
      },
    );
    return this.hydrateProduct(this.get<Row>("SELECT * FROM products WHERE id=@id", { id })!);
  }
  async setProductFlags(id: ID, flags: { featured?: boolean; is_published?: boolean }): Promise<void> {
    const sets: string[] = ["updated_at = @updated_at"];
    const params: Record<string, unknown> = { id, updated_at: new Date().toISOString() };
    if (flags.featured !== undefined) { sets.push("featured = @featured"); params.featured = flags.featured ? 1 : 0; }
    if (flags.is_published !== undefined) { sets.push("is_published = @is_published"); params.is_published = flags.is_published ? 1 : 0; }
    this.run(`UPDATE products SET ${sets.join(", ")} WHERE id=@id`, params);
  }
  async deleteProduct(id: ID): Promise<void> {
    this.run("DELETE FROM products WHERE id=@id", { id });
  }
  async reorderProducts(companyId: ID, orderedIds: ID[]): Promise<void> {
    for (const [idx, pid] of orderedIds.entries()) this.run("UPDATE products SET display_order=@o, updated_at=@u WHERE id=@id AND company_id=@c", { o: idx, id: pid, c: companyId, u: new Date().toISOString() });
  }

  /* variants ──────────────────────────────────────────────────────────── */
  async saveVariant(i: SaveVariantInput): Promise<ProductVariant> {
    const id = i.id ?? newId();
    const existing = i.id ? this.get<Row>("SELECT * FROM product_variants WHERE id=@id", { id: i.id }) : undefined;
    const t = timestamps();
    this.run(
      `INSERT INTO product_variants (id,product_id,variant_name,size,weight,unit,price,quantity,availability,display_order,created_at,updated_at)
       VALUES (@id,@product_id,@variant_name,@size,@weight,@unit,@price,@quantity,@availability,@display_order,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET variant_name=@variant_name, size=@size, weight=@weight, unit=@unit,
         price=@price, quantity=@quantity, availability=@availability, display_order=@display_order, updated_at=@updated_at`,
      {
        id, product_id: i.product_id, variant_name: i.variant_name, size: i.size ?? null,
        weight: i.weight ?? null, unit: i.unit ?? null, price: i.price ?? null, quantity: i.quantity,
        availability: i.availability ?? existing?.availability ?? "in_stock",
        display_order: i.display_order ?? existing?.display_order ?? 0, ...t,
      },
    );
    return mapVariant(this.get<Row>("SELECT * FROM product_variants WHERE id=@id", { id })!);
  }
  async deleteVariant(id: ID): Promise<void> {
    this.run("DELETE FROM product_variants WHERE id=@id", { id });
  }
  async reorderVariants(productId: ID, orderedIds: ID[]): Promise<void> {
    for (const [idx, vid] of orderedIds.entries()) this.run("UPDATE product_variants SET display_order=@o WHERE id=@id AND product_id=@p", { o: idx, id: vid, p: productId });
  }

  /* product images ────────────────────────────────────────────────────── */
  async addProductImage(i: SaveImageInput & { product_id: ID }): Promise<ProductImage> {
    const id = i.id ?? newId();
    this.run("INSERT INTO product_images (id,product_id,image_url,alt_text,is_primary,display_order,created_at) VALUES (@id,@product_id,@image_url,@alt_text,@is_primary,@display_order,@created_at) ON CONFLICT(id) DO UPDATE SET image_url=@image_url, alt_text=@alt_text, is_primary=@is_primary, display_order=@display_order", {
      id, product_id: i.product_id, image_url: i.image_url, alt_text: i.alt_text ?? null,
      is_primary: i.is_primary ? 1 : 0, display_order: i.display_order ?? 0, created_at: new Date().toISOString(),
    });
    if (i.is_primary) this.run("UPDATE product_images SET is_primary=0 WHERE product_id=@p AND id<>@id", { p: i.product_id, id });
    return mapImage(this.get<Row>("SELECT * FROM product_images WHERE id=@id", { id })!);
  }
  async deleteProductImage(id: ID): Promise<void> {
    this.run("DELETE FROM product_images WHERE id=@id", { id });
  }
  async setPrimaryProductImage(productId: ID, imageId: ID): Promise<void> {
    this.run("UPDATE product_images SET is_primary=0 WHERE product_id=@p", { p: productId });
    this.run("UPDATE product_images SET is_primary=1 WHERE id=@id", { id: imageId });
  }

  /* projects ──────────────────────────────────────────────────────────── */
  private hydrateProject(r: Row): Project {
    const p = mapProject(r);
    p.images = this.all<ProjectImage & Row>("SELECT * FROM project_images WHERE project_id=@id ORDER BY display_order", { id: p.id });
    return p;
  }
  async listProjects(companyId: ID, opts?: { type?: Project["project_type"]; publishedOnly?: boolean; featured?: boolean }): Promise<Project[]> {
    await this.ready();
    const where = ["company_id = @companyId"];
    const params: Record<string, unknown> = { companyId };
    if (opts?.publishedOnly) where.push("is_published = 1");
    if (opts?.featured) where.push("featured = 1");
    if (opts?.type) { where.push("project_type = @type"); params.type = opts.type; }
    return this.all<Row>(`SELECT * FROM projects WHERE ${where.join(" AND ")} ORDER BY display_order`, params).map((r) => this.hydrateProject(r));
  }
  async getProjectBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Project | null> {
    await this.ready();
    const r = this.get<Row>("SELECT * FROM projects WHERE slug=@slug", { slug });
    if (!r) return null;
    if (!opts?.includeUnpublished && !r.is_published) return null;
    return this.hydrateProject(r);
  }
  async saveProject(i: SaveProjectInput): Promise<Project> {
    const slugs = this.all<Row>("SELECT slug FROM projects").map((r) => r.slug as string);
    const id = i.id ?? newId();
    const existing = i.id ? this.get<Row>("SELECT * FROM projects WHERE id=@id", { id: i.id }) : undefined;
    const slug = existing?.slug ?? makeSlug(i.name, slugs);
    const t = timestamps();
    this.run(
      `INSERT INTO projects (id,company_id,name,slug,location,project_type,description,main_image_url,featured,is_published,display_order,created_at,updated_at)
       VALUES (@id,@company_id,@name,@slug,@location,@project_type,@description,@main_image_url,@featured,@is_published,@display_order,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET name=@name, location=@location, project_type=@project_type,
         description=@description, main_image_url=@main_image_url, featured=@featured,
         is_published=@is_published, display_order=@display_order, updated_at=@updated_at`,
      {
        id, company_id: i.company_id, name: i.name, slug, location: i.location ?? null,
        project_type: i.project_type, description: i.description ?? null, main_image_url: i.main_image_url ?? null,
        featured: i.featured === undefined ? (existing ? existing.featured : 0) : i.featured ? 1 : 0,
        is_published: i.is_published === undefined ? (existing ? existing.is_published : 0) : i.is_published ? 1 : 0,
        display_order: i.display_order ?? existing?.display_order ?? 0, ...t,
      },
    );
    return this.hydrateProject(this.get<Row>("SELECT * FROM projects WHERE id=@id", { id })!);
  }
  async setProjectFlags(id: ID, flags: { featured?: boolean; is_published?: boolean }): Promise<void> {
    const sets = ["updated_at = @updated_at"];
    const params: Record<string, unknown> = { id, updated_at: new Date().toISOString() };
    if (flags.featured !== undefined) { sets.push("featured = @featured"); params.featured = flags.featured ? 1 : 0; }
    if (flags.is_published !== undefined) { sets.push("is_published = @is_published"); params.is_published = flags.is_published ? 1 : 0; }
    this.run(`UPDATE projects SET ${sets.join(", ")} WHERE id=@id`, params);
  }
  async deleteProject(id: ID): Promise<void> {
    this.run("DELETE FROM projects WHERE id=@id", { id });
  }
  async reorderProjects(companyId: ID, orderedIds: ID[]): Promise<void> {
    for (const [idx, pid] of orderedIds.entries()) this.run("UPDATE projects SET display_order=@o WHERE id=@id AND company_id=@c", { o: idx, id: pid, c: companyId });
  }
  async addProjectImage(i: SaveImageInput & { project_id: ID }): Promise<void> {
    this.run("INSERT INTO project_images (id,project_id,image_url,alt_text,display_order,created_at) VALUES (@id,@project_id,@image_url,@alt_text,@display_order,@created_at)", { id: i.id ?? newId(), project_id: i.project_id, image_url: i.image_url, alt_text: i.alt_text ?? null, display_order: i.display_order ?? 0, created_at: new Date().toISOString() });
  }
  async deleteProjectImage(id: ID): Promise<void> {
    this.run("DELETE FROM project_images WHERE id=@id", { id });
  }

  /* gallery ───────────────────────────────────────────────────────────── */
  async listGallery(opts?: { companyId?: ID; publishedOnly?: boolean; limit?: number; offset?: number }): Promise<{ items: GalleryItem[]; total: number }> {
    await this.ready();
    const where: string[] = [];
    const params: Record<string, unknown> = {};
    if (opts?.publishedOnly) where.push("g.is_published = 1");
    if (opts?.companyId) { where.push("g.company_id = @companyId"); params.companyId = opts.companyId; }
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = (this.get<Row>(`SELECT COUNT(*) c FROM gallery_items g ${w}`, params)?.c ?? 0) as number;
    const rows = this.all<Row>(
      `SELECT g.*, co.name AS company_name, co.slug AS company_slug FROM gallery_items g
       LEFT JOIN companies co ON co.id = g.company_id ${w}
       ORDER BY g.display_order LIMIT @limit OFFSET @offset`,
      { ...params, limit: opts?.limit ?? 500, offset: opts?.offset ?? 0 },
    );
    return { items: rows.map((r) => ({ ...mapGallery(r), company: r.company_slug ? ({ id: r.company_id, name: r.company_name, slug: r.company_slug } as unknown as Company) : null })), total };
  }
  async saveGalleryItem(i: SaveGalleryInput): Promise<GalleryItem> {
    const id = i.id ?? newId();
    const existing = i.id ? this.get<Row>("SELECT * FROM gallery_items WHERE id=@id", { id: i.id }) : undefined;
    const t = timestamps();
    this.run(
      `INSERT INTO gallery_items (id,company_id,title,description,image_url,category,display_order,is_published,created_at,updated_at)
       VALUES (@id,@company_id,@title,@description,@image_url,@category,@display_order,@is_published,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET title=@title, description=@description, image_url=@image_url,
         category=@category, display_order=@display_order, is_published=@is_published, updated_at=@updated_at`,
      {
        id, company_id: i.company_id, title: i.title ?? null, description: i.description ?? null,
        image_url: i.image_url, category: i.category ?? null,
        display_order: i.display_order ?? existing?.display_order ?? 0,
        is_published: i.is_published === undefined ? (existing ? existing.is_published : 1) : i.is_published ? 1 : 0, ...t,
      },
    );
    return mapGallery(this.get<Row>("SELECT * FROM gallery_items WHERE id=@id", { id })!);
  }
  async deleteGalleryItem(id: ID): Promise<void> {
    this.run("DELETE FROM gallery_items WHERE id=@id", { id });
  }

  /* banners ───────────────────────────────────────────────────────────── */
  async listBanners(companyId: ID, opts?: { activeOnly?: boolean }): Promise<Banner[]> {
    await this.ready();
    return this.all<Row>(`SELECT * FROM banners WHERE company_id=@companyId ${opts?.activeOnly ? "AND is_active=1" : ""} ORDER BY display_order`, { companyId }).map(mapBanner);
  }
  async saveBanner(i: SaveBannerInput): Promise<Banner> {
    const id = i.id ?? newId();
    const existing = i.id ? this.get<Row>("SELECT * FROM banners WHERE id=@id", { id: i.id }) : undefined;
    const t = timestamps();
    this.run(
      `INSERT INTO banners (id,company_id,title,subtitle,image_url,button_text,button_url,is_active,display_order,created_at,updated_at)
       VALUES (@id,@company_id,@title,@subtitle,@image_url,@button_text,@button_url,@is_active,@display_order,@created_at,@updated_at)
       ON CONFLICT(id) DO UPDATE SET title=@title, subtitle=@subtitle, image_url=@image_url,
         button_text=@button_text, button_url=@button_url, is_active=@is_active, display_order=@display_order, updated_at=@updated_at`,
      {
        id, company_id: i.company_id, title: i.title ?? null, subtitle: i.subtitle ?? null, image_url: i.image_url,
        button_text: i.button_text ?? null, button_url: i.button_url ?? null,
        is_active: i.is_active === undefined ? (existing ? existing.is_active : 1) : i.is_active ? 1 : 0,
        display_order: i.display_order ?? existing?.display_order ?? 0, ...t,
      },
    );
    return mapBanner(this.get<Row>("SELECT * FROM banners WHERE id=@id", { id })!);
  }
  async deleteBanner(id: ID): Promise<void> {
    this.run("DELETE FROM banners WHERE id=@id", { id });
  }

  /* content / settings / contact / whatsapp ───────────────────────────── */
  async getContent<T>(key: string, companyId?: ID | null): Promise<T | null> {
    await this.ready();
    const r = this.get<Row>("SELECT value FROM site_content WHERE key=@key AND company_id IS @companyId", { key, companyId: companyId ?? null });
    return r ? (JSON.parse(r.value) as T) : null;
  }
  async setContent(key: string, value: unknown, companyId?: ID | null): Promise<void> {
    // NOTE: SQLite UNIQUE indexes treat NULL company_id as distinct, so an
    // upsert via ON CONFLICT would silently insert duplicates — update first.
    const cid = companyId ?? null;
    const res = this.run(
      `UPDATE site_content SET value=@value, updated_at=@updated_at WHERE key=@key AND company_id IS @cid`,
      { key, cid, value: JSON.stringify(value), updated_at: new Date().toISOString() },
    );
    if (res.changes === 0) {
      this.run(
        `INSERT INTO site_content (id,company_id,key,value,updated_at) VALUES (@id,@cid,@key,@value,@updated_at)`,
        { id: newId(), cid, key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
      );
    }
  }
  async getSettings(): Promise<SiteSettings> {
    await this.ready();
    let r = this.get<Row>("SELECT * FROM site_settings WHERE id='main'");
    if (!r) {
      this.run("INSERT INTO site_settings (id,site_title,updated_at) VALUES ('main','IMN Group of Companies',@u)", { u: new Date().toISOString() });
      r = this.get<Row>("SELECT * FROM site_settings WHERE id='main'")!;
    }
    return mapSettings(r);
  }
  async updateSettings(patch: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const next = { ...current, ...patch };
    this.run(
      `UPDATE site_settings SET site_title=@site_title, tagline=@tagline, address=@address, maps_url=@maps_url,
       maps_qr_image_url=@maps_qr_image_url, website_qr_image_url=@website_qr_image_url,
       whatsapp_qr_image_url=@whatsapp_qr_image_url, social_json=@social_json, footer_note=@footer_note,
       seo_title=@seo_title, seo_description=@seo_description, updated_at=@updated_at WHERE id='main'`,
      { ...next, social_json: JSON.stringify(next.social_json ?? {}), updated_at: new Date().toISOString() },
    );
    return this.getSettings();
  }
  async getContact(companyId: ID): Promise<ContactSettings | null> {
    await this.ready();
    const r = this.get<Row>("SELECT * FROM contact_settings WHERE company_id=@companyId", { companyId });
    return (r as ContactSettings | undefined) ?? null;
  }
  async updateContact(companyId: ID, patch: Partial<Pick<ContactSettings, "email" | "phone" | "address" | "maps_url">>): Promise<ContactSettings> {
    const current = (await this.getContact(companyId)) ?? { id: newId(), company_id: companyId, email: null, phone: null, address: null, maps_url: null, updated_at: new Date().toISOString() };
    const next = { ...current, ...patch };
    this.run(
      `INSERT INTO contact_settings (id,company_id,email,phone,address,maps_url,updated_at)
       VALUES (@id,@company_id,@email,@phone,@address,@maps_url,@updated_at)
       ON CONFLICT(company_id) DO UPDATE SET email=@email, phone=@phone, address=@address, maps_url=@maps_url, updated_at=@updated_at`,
      next,
    );
    return (await this.getContact(companyId))!;
  }
  async listWhatsApp(companyId: ID, opts?: { activeOnly?: boolean }): Promise<WhatsAppSetting[]> {
    await this.ready();
    return this.all<Row>(`SELECT * FROM whatsapp_settings WHERE company_id=@companyId ${opts?.activeOnly ? "AND is_active=1" : ""} ORDER BY is_primary DESC, updated_at`, { companyId }).map(mapWhatsApp);
  }
  async saveWhatsApp(i: SaveWhatsAppInput): Promise<WhatsAppSetting> {
    const id = i.id ?? newId();
    const existing = i.id ? this.get<Row>("SELECT * FROM whatsapp_settings WHERE id=@id", { id: i.id }) : undefined;
    const isPrimary = i.is_primary === undefined ? (existing ? b(existing.is_primary) : false) : i.is_primary;
    if (isPrimary) this.run("UPDATE whatsapp_settings SET is_primary=0 WHERE company_id=@c", { c: i.company_id });
    this.run(
      `INSERT INTO whatsapp_settings (id,company_id,phone_number,label,is_primary,is_active,updated_at)
       VALUES (@id,@company_id,@phone_number,@label,@is_primary,@is_active,@updated_at)
       ON CONFLICT(id) DO UPDATE SET phone_number=@phone_number, label=@label, is_primary=@is_primary, is_active=@is_active, updated_at=@updated_at`,
      {
        id, company_id: i.company_id, phone_number: i.phone_number, label: i.label ?? null,
        is_primary: isPrimary ? 1 : 0,
        is_active: i.is_active === undefined ? (existing ? existing.is_active : 1) : i.is_active ? 1 : 0,
        updated_at: new Date().toISOString(),
      },
    );
    return mapWhatsApp(this.get<Row>("SELECT * FROM whatsapp_settings WHERE id=@id", { id })!);
  }
  async deleteWhatsApp(id: ID): Promise<void> {
    this.run("DELETE FROM whatsapp_settings WHERE id=@id", { id });
  }

  /* enquiries ─────────────────────────────────────────────────────────── */
  async createEnquiry(i: CreateEnquiryInput): Promise<Enquiry> {
    const id = newId();
    const t = timestamps();
    this.run(
      `INSERT INTO enquiries (id,company_id,product_id,name,email,phone,subject,message,status,created_at,updated_at)
       VALUES (@id,@company_id,@product_id,@name,@email,@phone,@subject,@message,'new',@created_at,@updated_at)`,
      { id, company_id: i.company_id ?? null, product_id: i.product_id ?? null, name: i.name, email: i.email, phone: i.phone ?? null, subject: i.subject ?? null, message: i.message, ...t },
    );
    return (await this.listEnquiries()).find((e) => e.id === id)!;
  }
  async listEnquiries(opts?: { companyId?: ID; status?: EnquiryStatus | "all" }): Promise<Enquiry[]> {
    await this.ready();
    const where: string[] = [];
    const params: Record<string, unknown> = {};
    if (opts?.companyId) { where.push("e.company_id=@companyId"); params.companyId = opts.companyId; }
    if (opts?.status && opts.status !== "all") { where.push("e.status=@status"); params.status = opts.status; }
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    return this.all<Enquiry>(`SELECT e.* FROM enquiries e ${w} ORDER BY e.created_at DESC`, params);
  }
  async updateEnquiryStatus(id: ID, status: EnquiryStatus): Promise<void> {
    this.run("UPDATE enquiries SET status=@status, updated_at=@u WHERE id=@id", { id, status, u: new Date().toISOString() });
  }

  /* audit ─────────────────────────────────────────────────────────────── */
  async logAudit(actor: string, action: string, entityType: string, entityId: ID | null, diff?: Record<string, unknown> | null): Promise<void> {
    this.run("INSERT INTO audit_logs (id,actor_email,action,entity_type,entity_id,diff,created_at) VALUES (@id,@actor,@action,@entityType,@entityId,@diff,@created_at)", { id: newId(), actor, action, entityType, entityId, diff: diff ? JSON.stringify(diff) : null, created_at: new Date().toISOString() });
  }
  async listAudit(limit = 200): Promise<AuditLog[]> {
    await this.ready();
    return this.all<AuditLog>("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT @limit", { limit }).map((r) => ({ ...r, diff: r.diff ? JSON.parse(r.diff as unknown as string) : null }));
  }

  /* admin profiles ────────────────────────────────────────────────────── */
  async getAdminByEmail(email: string): Promise<AdminProfile | null> {
    await this.ready();
    const r = this.get<Row>("SELECT * FROM admin_profiles WHERE email=@email", { email: email.toLowerCase() });
    return r ? ({ ...r, must_change_password: b(r.must_change_password) } as AdminProfile) : null;
  }
  async upsertAdminProfile(p: { email: string; full_name?: string | null; role?: "owner" | "manager"; password_hash?: string | null; user_id?: string | null; must_change_password?: boolean }): Promise<AdminProfile> {
    const email = p.email.toLowerCase();
    const existing = await this.getAdminByEmail(email);
    const id = existing?.id ?? newId();
    const t = timestamps();
    this.run(
      `INSERT INTO admin_profiles (id,user_id,email,full_name,role,must_change_password,password_hash,created_at,updated_at)
       VALUES (@id,@user_id,@email,@full_name,@role,@must_change_password,@password_hash,@created_at,@updated_at)
       ON CONFLICT(email) DO UPDATE SET full_name=@full_name, role=@role,
         must_change_password=@must_change_password,
         password_hash=COALESCE(@password_hash, password_hash), updated_at=@updated_at`,
      {
        id, user_id: p.user_id ?? null, email, full_name: p.full_name ?? null,
        role: p.role ?? existing?.role ?? "owner",
        must_change_password: p.must_change_password === undefined ? (existing ? existing.must_change_password : false) : p.must_change_password ? 1 : 0,
        password_hash: p.password_hash ?? null, ...t,
      },
    );
    return (await this.getAdminByEmail(email))!;
  }

  /* storage ───────────────────────────────────────────────────────────── */
  async saveUpload(buffer: Buffer, opts: { dir: string; filename: string; mime: string }): Promise<UploadResult> {
    const rel = path.posix.join("uploads", opts.dir, opts.filename);
    const abs = path.join(process.cwd(), "public", rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buffer);
    return { url: `/${rel}`, path: rel };
  }
  async deleteUpload(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const abs = path.join(process.cwd(), "public", url);
    if (abs.startsWith(path.join(process.cwd(), "public"))) fs.rmSync(abs, { force: true });
  }
}

void touch;
