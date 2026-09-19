/** Seed runner — works against ANY DataAdapter (local SQLite or Supabase). */
import type { DataAdapter } from "./adapter";
import { ASSET, BANNERS, BRIGHTSTONE_PRODUCTS, BUILDER_PROJECTS, CONTENT, INDON_ADDRESS, INDON_PRODUCTS, MAPS_URL, type SeedProduct } from "./seed-data";

const COMPANIES = [
  {
    name: "IMN Builder", slug: "imn-builder" as const, order: 1,
    short: "Residential & commercial building construction across Tamil Nadu and Puducherry.",
    description: "IMN Builder is the construction division of IMN Group of Companies, delivering residential and commercial buildings with thoughtful engineering and clean execution. 70+ successful projects across Tamil Nadu and Puducherry.",
    hero: ASSET.builder1,
  },
  {
    name: "INDON Mart", slug: "indon-mart" as const, order: 2,
    short: "Everyday essentials — tea, honey, dates, snacks, chikki and jaggery.",
    description: "INDON Mart is the consumer products division of IMN Group of Companies. Browse the catalogue, choose your size, and order directly over WhatsApp.",
    hero: ASSET.honey,
  },
  {
    name: "Brightstone Silver & Gemstones", slug: "brightstone" as const, order: 3,
    short: "Silver rings, silver jewellery and gemstone collections.",
    description: "Brightstone Silver & Gemstones is the jewellery division of IMN Group of Companies — silver rings, fine silver jewellery and curated gemstone collections, presented by enquiry.",
    hero: "/assets/brightstone/ring-gemstone.jpg",
  },
];

const INDON_CATEGORIES = ["Tea", "Honey", "Dates", "Snacks", "Chikki", "Sugarcane Jaggery"];
const BRIGHTSTONE_CATEGORIES = [
  "Silver Rings", "Silver Jewellery", "Gemstones",
  "Ruby Collection", "Emerald Collection", "Sapphire Collection",
  "Amethyst Collection", "Garnet Collection", "Citrine Collection",
];

async function seedProducts(adapter: DataAdapter, companyId: string, products: SeedProduct[], categoryIds: Record<string, string>) {
  for (const [i, p] of products.entries()) {
    const product = await adapter.saveProduct({
      company_id: companyId,
      category_id: categoryIds[p.category] ?? null,
      name: p.name,
      short_description: p.short,
      description: p.description,
      main_image_url: p.image,
      featured: !!p.featured,
      is_published: true,
      is_ai_draft: !!p.draft,
      display_order: i,
    });
    await adapter.addProductImage({ product_id: product.id, image_url: p.image, alt_text: p.name, is_primary: true, display_order: 0 });
    for (const [vi, v] of p.variants.entries()) {
      await adapter.saveVariant({
        product_id: product.id, variant_name: v.variant_name, size: v.size ?? null,
        weight: v.weight ?? null, unit: v.unit ?? null, price: v.price ?? null,
        quantity: v.quantity, availability: v.availability ?? "in_stock", display_order: vi,
      });
    }
  }
}

export async function runSeed(adapter: DataAdapter): Promise<void> {
  const existing = await adapter.listCompanies();
  if (existing.length > 0) return; // idempotent

  const companyIds: Record<string, string> = {};
  for (const c of COMPANIES) {
    companyIds[c.slug] = await createCompany(adapter, c);
  }

  // settings + content
  await adapter.updateSettings({
    site_title: "IMN Group of Companies",
    tagline: "Builders · Essentials · Silver & Gemstones",
    address: INDON_ADDRESS,
    maps_url: MAPS_URL,
    maps_qr_image_url: ASSET.qrMaps,
    social_json: {},
    seo_title: "IMN Group of Companies — IMN Builder · INDON Mart · Brightstone Silver & Gemstones",
    seo_description:
      "IMN Group of Companies unites IMN Builder (70+ successful projects in Tamil Nadu & Puducherry), INDON Mart (tea, honey, dates, snacks, chikki, jaggery) and Brightstone Silver & Gemstones.",
  });
  for (const [key, value] of Object.entries(CONTENT)) await adapter.setContent(key, value, null);

  // INDON
  const indon = companyIds["indon-mart"]!;
  const indonCats: Record<string, string> = {};
  for (const [i, name] of INDON_CATEGORIES.entries()) {
    const cat = await adapter.saveCategory({ company_id: indon, name, display_order: i, is_active: true });
    indonCats[name] = cat.id;
  }
  await seedProducts(adapter, indon, INDON_PRODUCTS, indonCats);
  for (const [i, b] of BANNERS.entries()) {
    await adapter.saveBanner({ company_id: indon, title: b.title, subtitle: b.subtitle, image_url: b.image, button_text: b.button_text, button_url: b.button_url, is_active: true, display_order: i });
  }

  // Brightstone
  const bright = companyIds["brightstone"]!;
  const brightCats: Record<string, string> = {};
  for (const [i, name] of BRIGHTSTONE_CATEGORIES.entries()) {
    const cat = await adapter.saveCategory({ company_id: bright, name, display_order: i, is_active: true });
    brightCats[name] = cat.id;
  }
  await seedProducts(adapter, bright, BRIGHTSTONE_PRODUCTS, brightCats);

  // Builder projects
  const builder = companyIds["imn-builder"]!;
  for (const [i, p] of BUILDER_PROJECTS.entries()) {
    const project = await adapter.saveProject({
      company_id: builder, name: p.name, location: p.location, project_type: p.type,
      description: p.description, main_image_url: p.image, featured: p.featured,
      is_published: true, display_order: i,
    });
    await adapter.addProjectImage({ project_id: project.id, image_url: p.image, alt_text: p.name, display_order: 0 });
  }

  // Gallery (unified, division-tagged)
  const gallery: Array<{ company: string; title: string; image: string; category: string }> = [
    { company: builder, title: "Framed-facade residence — elevation", image: ASSET.builder1, category: "Projects" },
    { company: builder, title: "Courtyard residence — evening view", image: ASSET.builder2, category: "Projects" },
    { company: indon, title: "INDON Premium Tea", image: ASSET.tea, category: "Products" },
    { company: indon, title: "INDON Premium Chikki", image: ASSET.chikki, category: "Products" },
    { company: indon, title: "INDON Mazafati Dates", image: ASSET.dates, category: "Products" },
    { company: indon, title: "INDON Wild Honey", image: ASSET.honey, category: "Products" },
    { company: indon, title: "INDON Snacks", image: ASSET.snacks, category: "Products" },
    { company: indon, title: "INDON Sugarcane Jaggery", image: ASSET.jaggery, category: "Products" },
    { company: bright, title: "Gemstone silver ring — concept", image: "/assets/brightstone/ring-gemstone.jpg", category: "Collections" },
    { company: bright, title: "Classic silver ring — concept", image: "/assets/brightstone/ring-classic.jpg", category: "Collections" },
  ];
  for (const [i, g] of gallery.entries()) {
    await adapter.saveGalleryItem({ company_id: g.company, title: g.title, image_url: g.image, category: g.category, display_order: i, is_published: true });
  }

  // Contact + WhatsApp settings (spec §09)
  await adapter.updateContact(builder, { email: "Indon.Care@gmail.com", phone: "99436 42955", address: null, maps_url: null });
  await adapter.updateContact(indon, { email: "Indon.Care@gmail.com", phone: null, address: INDON_ADDRESS, maps_url: MAPS_URL });
  await adapter.updateContact(bright, { email: "Sfazulullah@gmail.com", phone: "7094100910", address: null, maps_url: null });

  await adapter.saveWhatsApp({ company_id: indon, phone_number: "70104 44471", label: "INDON Orders — line 1", is_primary: true, is_active: true });
  await adapter.saveWhatsApp({ company_id: indon, phone_number: "89253 45865", label: "INDON Orders — line 2", is_primary: false, is_active: true });
  await adapter.saveWhatsApp({ company_id: bright, phone_number: "7094100910", label: "Brightstone Enquiries", is_primary: true, is_active: true });
}

/* Companies are created through a tiny direct helper because saveCategory etc.
   assume an existing company; the adapter exposes company creation via
   `upsertCompany` implemented in both drivers. */
async function createCompany(adapter: DataAdapter, c: (typeof COMPANIES)[number]): Promise<string> {
  return adapter.upsertCompany({
    name: c.name, slug: c.slug, short_description: c.short, description: c.description,
    logo_url: ASSET.logo, hero_image_url: c.hero, is_active: true, display_order: c.order,
  });
}
