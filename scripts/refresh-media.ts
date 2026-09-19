/**
 * One-time media refresh (idempotent):
 *  • INDON products → new catalogue photography (main image + primary product image)
 *  • INDON gallery entries → catalogue photography
 *  • Builder: two client-supplied projects + gallery entries
 *  • Builder: four studio concept visuals as gallery "Concepts" (clearly labelled)
 * Safe to re-run; skips anything already present.
 */
import { getAdapter } from "../lib/data";

const INDON_IMAGES: Record<string, string> = {
  "indon-wild-honey": "/assets/indon/product-honey.jpg",
  "indon-premium-tea": "/assets/indon/product-tea.jpg",
  "indon-mazafati-dates": "/assets/indon/product-dates.jpg",
  "indon-snacks-murukku": "/assets/indon/product-snacks.jpg",
  "indon-premium-chikki": "/assets/indon/product-chikki.jpg",
  "indon-sugarcane-jaggery": "/assets/indon/product-jaggery.jpg",
};

const NEW_PROJECTS = [
  {
    slug: "green-balcony-apartment-residence",
    name: "Green-Balcony Apartment Residence",
    location: "Tamil Nadu",
    type: "residential" as const,
    image: "/assets/builder/project-03.jpg",
    description:
      "A modern multi-storey apartment residence with sculpted planted balconies and jaali privacy screens. Client-supplied architectural visualisation. (Placeholder title — rename in admin once the client provides the official project name.)",
  },
  {
    slug: "safiya-manzil-residence",
    name: "Safiya Manzil Residence",
    location: "Tamil Nadu",
    type: "residential" as const,
    image: "/assets/builder/project-04.jpg",
    description:
      "A completed two-storey residence with a glass-railed terrace balcony, charcoal-and-cream facade and brick accent fins, photographed at handover. Client-supplied photography. (Placeholder title from the site nameplate — editable in admin.)",
  },
];

const GALLERY_UPDATES: Record<string, string> = {
  "INDON Premium Tea": "/assets/indon/product-tea.jpg",
  "INDON Premium Chikki": "/assets/indon/product-chikki.jpg",
  "INDON Mazafati Dates": "/assets/indon/product-dates.jpg",
  "INDON Wild Honey": "/assets/indon/product-honey.jpg",
  "INDON Snacks": "/assets/indon/product-snacks.jpg",
  "INDON Sugarcane Jaggery": "/assets/indon/product-jaggery.jpg",
};

const GALLERY_ADDS = [
  { title: "Green-balcony apartment residence", image: "/assets/builder/project-03.jpg", category: "Projects" },
  { title: "Safiya Manzil residence — handover", image: "/assets/builder/project-04.jpg", category: "Projects" },
  { title: "Design study — dusk residence (concept)", image: "/assets/builder/concept-01.jpg", category: "Concepts" },
  { title: "Design study — commercial complex (concept)", image: "/assets/builder/concept-02.jpg", category: "Concepts" },
  { title: "Design study — courtyard villa (concept)", image: "/assets/builder/concept-03.jpg", category: "Concepts" },
  { title: "Design study — jaali apartments (concept)", image: "/assets/builder/concept-04.jpg", category: "Concepts" },
];

async function main() {
  const adapter = getAdapter();
  const indon = await adapter.getCompanyBySlug("indon-mart");
  const builder = await adapter.getCompanyBySlug("imn-builder");
  if (!indon || !builder) throw new Error("companies missing — run seed first");

  // 1 — INDON product imagery
  for (const [slug, url] of Object.entries(INDON_IMAGES)) {
    const p = await adapter.getProductBySlug(slug, { includeUnpublished: true });
    if (!p) { console.warn("skip missing product", slug); continue; }
    if (p.main_image_url !== url) {
      await adapter.saveProduct({
        id: p.id, company_id: p.company_id, category_id: p.category_id, name: p.name,
        short_description: p.short_description, description: p.description,
        main_image_url: url, featured: p.featured, is_published: p.is_published, is_ai_draft: p.is_ai_draft,
      });
    }
    const existing = p.images?.find((i) => i.image_url === url);
    if (!existing) {
      await adapter.addProductImage({ product_id: p.id, image_url: url, alt_text: p.name, is_primary: true, display_order: 0 });
      for (const old of p.images ?? []) {
        if (old.image_url !== url) await adapter.deleteProductImage(old.id);
      }
    }
    console.log("indon image →", slug);
  }

  // 2 — gallery updates (INDON)
  const { items } = await adapter.listGallery({});
  for (const g of items) {
    const next = g.title ? GALLERY_UPDATES[g.title] : undefined;
    if (next && g.image_url !== next) {
      await adapter.saveGalleryItem({ id: g.id, company_id: g.company_id, title: g.title, description: g.description, image_url: next, category: g.category, is_published: g.is_published });
      console.log("gallery updated →", g.title);
    }
  }

  // 3 — new builder projects
  for (const np of NEW_PROJECTS) {
    const exists = await adapter.getProjectBySlug(np.slug, { includeUnpublished: true });
    if (exists) { console.log("project exists →", np.slug); continue; }
    const project = await adapter.saveProject({ company_id: builder.id, name: np.name, location: np.location, project_type: np.type, description: np.description, main_image_url: np.image, featured: true, is_published: true });
    await adapter.addProjectImage({ project_id: project.id, image_url: np.image, alt_text: np.name, display_order: 0 });
    console.log("project created →", np.slug);
  }

  // 4 — gallery adds (skip duplicates by title)
  const titles = new Set(items.map((i) => i.title));
  for (const g of GALLERY_ADDS) {
    if (titles.has(g.title)) { console.log("gallery exists →", g.title); continue; }
    await adapter.saveGalleryItem({ company_id: builder.id, title: g.title, image_url: g.image, category: g.category, is_published: true });
    console.log("gallery added →", g.title);
  }

  // ── Brightstone catalogue additions (idempotent upsert by name) ─────────
const brightCo = await adapter.getCompanyBySlug("brightstone");
if (brightCo) {
  const existingProducts = await adapter.listProducts(brightCo.id, {});
  const brightCats = await adapter.listCategories(brightCo.id);
  const ADDS = [
    { name: "Twisted Vine Ring", category: "Silver Rings", image: "/assets/brightstone/ring-twist.jpg", short: "Two silver strands intertwined.", description: "Concept piece: intertwined bands with a hand-twisted vine look. Catalogue concept pending client confirmation." },
    { name: "Trilogy Stone Ring", category: "Silver Rings", image: "/assets/brightstone/ring-trilogy.jpg", short: "Three graduated stones in one setting.", description: "Concept piece: three graduated coloured stones in a shared silver setting. Gemstone identity not verified." },
    { name: "Topaz Collection Piece", category: "Topaz Collection", image: "/assets/brightstone/gem-topaz.jpg", short: "Honeyed light from the Topaz Collection.", description: "Concept piece representing the Topaz Collection. Stone origin, weight and treatment unverified — presented as design concept only." },
    { name: "Peridot Collection Piece", category: "Peridot Collection", image: "/assets/brightstone/gem-peridot.jpg", short: "Fresh olive green from the Peridot Collection.", description: "Concept piece representing the Peridot Collection. Stone origin, weight and treatment unverified — presented as design concept only." },
  ];
  for (const [i, a] of ADDS.entries()) {
    if (existingProducts.some((p) => p.name === a.name)) continue;
    let cat = brightCats.find((c) => c.name === a.category);
    if (!cat) {
      cat = await adapter.saveCategory({ company_id: brightCo.id, name: a.category, display_order: brightCats.length + i, is_active: true });
      brightCats.push(cat);
    }
    const product = await adapter.saveProduct({
      company_id: brightCo.id, category_id: cat.id ?? null, name: a.name,
      short_description: a.short, description: a.description, main_image_url: a.image,
      featured: false, is_published: true, is_ai_draft: true, display_order: 100 + i,
    });
    await adapter.addProductImage({ product_id: product.id, image_url: a.image, alt_text: a.name, is_primary: true, display_order: 0 });
    console.log("brightstone added →", a.name);
  }
}

// ── Homepage hero copy: single professional title (idempotent) ──────────
await adapter.setContent("home_hero", {
  eyebrow: "Building · Food Essential Goods · Silver & Gemstones",
  title: "IMN Group of Companies",
  tagline: "Three enterprises, one promise — quality, trust and care in everything we build, pack and present.",
  cta_primary: "Explore Our Companies",
  cta_secondary: "Contact Us",
});
console.log("home_hero copy updated");
await adapter.setContent("typography", { paragraph_align: "justify" });
console.log("typography default set (justified paragraphs)");

console.log("MEDIA REFRESH COMPLETE");
  process.exit(0);
}
main();
