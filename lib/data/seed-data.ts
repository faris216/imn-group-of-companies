/**
 * Initial catalogue & content seed.
 *
 * PROVENANCE RULES (spec §83/§84):
 *  • Verified client facts: three divisions, 70+ successful projects, services,
 *    locations, contact values, supplied imagery, Google Maps QR destination.
 *  • INDON Honey variants/prices/quantities: verified (client specification).
 *  • Everything else business-specific (other prices, stock levels, project
 *    titles, Brightstone catalogue) is DRAFT content, flagged `is_ai_draft`,
 *    badged in admin and fully editable. No certifications, testimonials,
 *    awards, dates, costs or purity claims are invented anywhere.
 */
import type { Availability } from "@/lib/types";

export const MAPS_URL =
  "https://www.google.com/maps/@10.7587221,78.6864707,3a,75y,157.81h,99.34t/data=!3m7!1e1!3m5!1sLDbhdzpssW9eq8TFbi2rGg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-9.33749405361246%26panoid%3DLDbhdzpssW9eq8TFbi2rGg%26yaw%3D157.8058479871592!7i16384!8i8192?hl=en&entry=ttu";

export const INDON_ADDRESS = "86, Rajaram Rd, K K Nagar, Tiruchirappalli, Tamil Nadu 620021";

export const ASSET = {
  logo: "/assets/brand/imn-logo.png",
  qrMaps: "/assets/qr/google-maps-qr.png",
  builder1: "/assets/builder/project-01.jpg",
  builder2: "/assets/builder/project-02.jpg",
  builder3: "/assets/builder/project-03.jpg",
  builder4: "/assets/builder/project-04.jpg",
  concept1: "/assets/builder/concept-01.jpg",
  concept2: "/assets/builder/concept-02.jpg",
  concept3: "/assets/builder/concept-03.jpg",
  concept4: "/assets/builder/concept-04.jpg",
  tea: "/assets/indon/creative-tea.png",
  chikki: "/assets/indon/creative-chikki.png",
  dates: "/assets/indon/creative-dates.png",
  honey: "/assets/indon/creative-honey.png",
  snacks: "/assets/indon/creative-snacks.png",
  jaggery: "/assets/indon/creative-jaggery.png",
} as const;

export interface SeedVariant {
  variant_name: string; size?: string; weight?: number; unit?: string;
  price?: number | null; quantity: number; availability?: Availability;
}
export interface SeedProduct {
  name: string; category: string; image: string; short: string; description: string;
  featured?: boolean; draft?: boolean; variants: SeedVariant[]; extraImages?: string[];
}

export const INDON_PRODUCTS: SeedProduct[] = [
  {
    name: "INDON Wild Honey", category: "Honey", image: "/assets/indon/product-honey.jpg", featured: true, draft: false,
    short: "Pure wild forest honey, packed with care by INDON.",
    description:
      "INDON Wild Honey is collected from natural forest comb and packed hygienically to preserve its rich colour and aroma. A golden staple for tea, desserts and everyday wellness rituals. Draft note: description is marketing copy — editable in admin.",
    variants: [
      { variant_name: "250g", size: "250 g", weight: 250, unit: "g", price: 250, quantity: 40 },
      { variant_name: "500g", size: "500 g", weight: 500, unit: "g", price: 450, quantity: 25 },
      { variant_name: "1kg", size: "1 kg", weight: 1000, unit: "g", price: 800, quantity: 10 },
    ],
  },
  {
    name: "INDON Premium Tea", category: "Tea", image: "/assets/indon/product-tea.jpg", featured: true, draft: true,
    short: "Premium quality leaf tea for golden moments.",
    description:
      "A carefully selected leaf tea with a bright colour and full-bodied flavour — the cup behind ‘Golden sips for Golden moments’. Draft note: price & stock are placeholders until the client confirms them.",
    variants: [
      { variant_name: "250g", size: "250 g", weight: 250, unit: "g", price: 199, quantity: 50 },
      { variant_name: "500g", size: "500 g", weight: 500, unit: "g", price: 380, quantity: 30 },
    ],
  },
  {
    name: "INDON Mazafati Dates", category: "Dates", image: "/assets/indon/product-dates.jpg", featured: true, draft: true,
    short: "Fresh natural Mazafati dates, soft and luscious.",
    description:
      "Soft, glossy Mazafati dates packed fresh in hygienic trays. A natural source of sweetness for festivals, gifting and daily nutrition. Draft note: price & stock are placeholders until the client confirms them.",
    variants: [
      { variant_name: "250g", size: "250 g", weight: 250, unit: "g", price: 320, quantity: 25 },
      { variant_name: "500g", size: "500 g", weight: 500, unit: "g", price: 600, quantity: 15 },
    ],
  },
  {
    name: "INDON Snacks (Murukku)", category: "Snacks", image: "/assets/indon/product-snacks.jpg", draft: true,
    short: "Crispy traditional murukku bites.",
    description:
      "Golden, crunchy murukku made in the traditional style — the crispy bite every tea time waits for. Draft note: price & stock are placeholders until the client confirms them.",
    variants: [
      { variant_name: "250g", size: "250 g", weight: 250, unit: "g", price: 150, quantity: 40 },
      { variant_name: "500g", size: "500 g", weight: 500, unit: "g", price: 280, quantity: 20 },
    ],
  },
  {
    name: "INDON Premium Chikki", category: "Chikki", image: "/assets/indon/product-chikki.jpg", draft: true,
    short: "Sweet crunch of classic peanut chikki.",
    description:
      "Roasted peanuts bound in golden jaggery caramel — a sweet crunch with old-fashioned honesty. Draft note: price & stock are placeholders until the client confirms them.",
    variants: [
      { variant_name: "250g", size: "250 g", weight: 250, unit: "g", price: 160, quantity: 35 },
      { variant_name: "500g", size: "500 g", weight: 500, unit: "g", price: 300, quantity: 18 },
    ],
  },
  {
    name: "INDON Sugarcane Jaggery", category: "Sugarcane Jaggery", image: "/assets/indon/product-jaggery.jpg", draft: true,
    short: "Traditional nattusakkarei (sugarcane jaggery).",
    description:
      "Unrefined sugarcane jaggery (நாட்டுச்சக்கரை) with its characteristic warm caramel notes — a classic delight from cane to kitchen. Draft note: price & stock are placeholders until the client confirms them.",
    variants: [
      { variant_name: "500g", size: "500 g", weight: 500, unit: "g", price: 140, quantity: 45 },
      { variant_name: "1kg", size: "1 kg", weight: 1000, unit: "g", price: 260, quantity: 22 },
    ],
  },
];

export const BRIGHTSTONE_PRODUCTS: SeedProduct[] = [
  { name: "Classic Silver Ring", category: "Silver Rings", image: "/assets/brightstone/ring-classic.jpg", featured: true, draft: true, short: "A timeless polished silver band.", description: "Concept piece: a clean, timeless silver band with a mirror polish. Catalogue concept pending client confirmation — no purity or certification claims are made.", variants: [] },
  { name: "Signature Silver Band", category: "Silver Rings", image: "/assets/brightstone/ring-signature.jpg", draft: true, short: "A sculpted band with a brushed finish.", description: "Concept piece: sculpted shoulders and a brushed centre channel. Catalogue concept pending client confirmation.", variants: [] },
  { name: "Heritage Silver Ring", category: "Silver Rings", image: "/assets/brightstone/ring-heritage.jpg", draft: true, short: "Temple-inspired detailing in silver.", description: "Concept piece: heritage motifs inspired by South Indian temple craft. Catalogue concept pending client confirmation.", variants: [] },
  { name: "Contemporary Silver Ring", category: "Silver Rings", image: "/assets/brightstone/ring-contemporary.jpg", draft: true, short: "Minimal geometry for everyday wear.", description: "Concept piece: minimalist geometry with soft edges. Catalogue concept pending client confirmation.", variants: [] },
  { name: "Gemstone Silver Ring", category: "Silver Rings", image: "/assets/brightstone/ring-gemstone.jpg", featured: true, draft: true, short: "A silver ring crowned with a coloured stone.", description: "Concept piece: a raised four-prong setting around a coloured stone. Catalogue concept pending client confirmation — gemstone identity not verified.", variants: [] },
  { name: "Ruby Collection Piece", category: "Ruby Collection", image: "/assets/brightstone/gem-ruby.jpg", draft: true, short: "Deep red brilliance from the Ruby Collection.", description: "Concept piece representing the Ruby Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Emerald Collection Piece", category: "Emerald Collection", image: "/assets/brightstone/gem-emerald.jpg", draft: true, short: "Vivid green depth from the Emerald Collection.", description: "Concept piece representing the Emerald Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Sapphire Collection Piece", category: "Sapphire Collection", image: "/assets/brightstone/gem-sapphire.jpg", draft: true, short: "Royal blue calm from the Sapphire Collection.", description: "Concept piece representing the Sapphire Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Amethyst Collection Piece", category: "Amethyst Collection", image: "/assets/brightstone/gem-amethyst.jpg", draft: true, short: "Violet serenity from the Amethyst Collection.", description: "Concept piece representing the Amethyst Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Garnet Collection Piece", category: "Garnet Collection", image: "/assets/brightstone/gem-garnet.jpg", draft: true, short: "Ember warmth from the Garnet Collection.", description: "Concept piece representing the Garnet Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Citrine Collection Piece", category: "Citrine Collection", image: "/assets/brightstone/gem-citrine.jpg", draft: true, short: "Sunlit gold from the Citrine Collection.", description: "Concept piece representing the Citrine Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Twisted Vine Ring", category: "Silver Rings", image: "/assets/brightstone/ring-twist.jpg", draft: true, short: "Two silver strands intertwined.", description: "Concept piece: intertwined bands with a hand-twisted vine look. Catalogue concept pending client confirmation.", variants: [] },
  { name: "Trilogy Stone Ring", category: "Silver Rings", image: "/assets/brightstone/ring-trilogy.jpg", draft: true, short: "Three graduated stones in one setting.", description: "Concept piece: three graduated coloured stones in a shared silver setting. Gemstone identity not verified.", variants: [] },
  { name: "Topaz Collection Piece", category: "Topaz Collection", image: "/assets/brightstone/gem-topaz.jpg", draft: true, short: "Honeyed light from the Topaz Collection.", description: "Concept piece representing the Topaz Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
  { name: "Peridot Collection Piece", category: "Peridot Collection", image: "/assets/brightstone/gem-peridot.jpg", draft: true, short: "Fresh olive green from the Peridot Collection.", description: "Concept piece representing the Peridot Collection. Stone origin, weight and treatment unverified — presented as design concept only.", variants: [] },
];

export const BUILDER_PROJECTS = [
  {
    name: "Green-Balcony Apartment Residence", location: "Tamil Nadu", type: "residential" as const,
    image: ASSET.builder3, featured: true,
    description:
      "A modern multi-storey apartment residence with sculpted planted balconies and jaali privacy screens. Client-supplied architectural visualisation. (Placeholder title — rename in admin once the client provides the official project name.)",
  },
  {
    name: "Safiya Manzil Residence", location: "Tamil Nadu", type: "residential" as const,
    image: ASSET.builder4, featured: true,
    description:
      "A completed two-storey residence with a glass-railed terrace balcony, charcoal-and-cream facade and brick accent fins, photographed at handover. Client-supplied photography. (Placeholder title from the site nameplate — editable in admin.)",
  },
  {
    name: "Modern Framed-Facade Residence", location: "Tamil Nadu", type: "residential" as const,
    image: ASSET.builder1, featured: true,
    description:
      "A completed two-storey residence with a bold framed upper facade, decorative jaali screen and covered car porch, delivered turnkey by IMN Builder. (Placeholder title from supplied client photography — rename in admin once the client provides official project names.)",
  },
  {
    name: "Evening-Light Courtyard Residence", location: "Tamil Nadu", type: "residential" as const,
    image: ASSET.builder2, featured: true,
    description:
      "A single-storey residence composed in layered planes and warm exterior lighting, with a patterned compound gate and deep front porch. (Placeholder title from supplied client photography — rename in admin once the client provides official project names.)",
  },
];

export const CONTENT: Record<string, unknown> = {
  typography: { paragraph_align: "justify" },
  home_hero: {
    eyebrow: "Building · Food Essential Goods · Silver & Gemstones", title: "IMN Group of Companies",
    tagline: "Three enterprises, one promise — quality, trust and care in everything we build, pack and present.",
    cta_primary: "Explore Our Companies", cta_secondary: "Contact Us",
  },
  home_divisions: {
    title: "Our Companies",
    subtitle: "A group of three distinct businesses, each crafted to serve a different part of life — united by one standard of care.",
  },
  about: "IMN Group of Companies brings together diverse business ventures with a shared commitment to quality, trust and excellence. From creating thoughtfully built spaces through IMN Builder, to offering everyday essentials through INDON Mart, and presenting timeless silver and gemstones through Brightstone, the group aims to serve customers across different aspects of life with care and consistency.\n\nWith a focus on dependable products, meaningful customer relationships and continuous growth, IMN Group of Companies looks toward building lasting value for its customers and communities.",
  our_story: "IMN Group of Companies grew from a simple conviction: that customers deserve the same honesty and care whether they are entrusting someone with their home, their kitchen or their celebrations. What began as separate ventures — building, everyday essentials, and silver & gemstones — matured into one group that shares a single standard of quality, trust and excellence. (Draft narrative — editable in admin.)",
  mission: "To deliver quality products and services across our diverse businesses while building lasting relationships through trust, integrity and customer-focused excellence.",
  vision: "To grow as a trusted and respected group of companies, creating meaningful value through quality, innovation and responsible business while building a better tomorrow for our customers and communities.",
  builder_stat: { value: "70+", label: "Successful Projects" },
  builder_services: [
    { title: "Residential Building", body: "Homes planned around light, ventilation and family life — from foundation to handover." },
    { title: "Commercial Building", body: "Shops, offices and commercial spaces built for durability, compliance and daily business." },
  ],
  builder_intro: "IMN Builder constructs residential and commercial buildings across Tamil Nadu and Puducherry — thoughtfully engineered, cleanly executed and delivered with pride.",
  why_imn: [
    { title: "One standard of quality", body: "Every division — construction, essentials or jewellery — is held to the same uncompromising standard of care." },
    { title: "Relationships over transactions", body: "We build lasting customer relationships through transparent communication and dependable follow-through." },
    { title: "Rooted in our communities", body: "From Tamil Nadu to Puducherry, we grow by creating value for the customers and communities we serve." },
  ],
  indon_intro: "INDON Mart brings everyday essentials — tea, honey, dates, snacks, chikki and jaggery — packed hygienically and priced honestly, straight to your home over WhatsApp.",
  brightstone_intro: "Brightstone presents silver rings, fine silver jewellery and gemstone collections in a showroom experience of light, metal and stone.",
};

export const BANNERS = [
  { title: "Golden sips for Golden moments", subtitle: "INDON Premium Tea", image: ASSET.tea, button_text: "View Products", button_url: "/indon/products" },
  { title: "Sweet Crunch", subtitle: "INDON Premium Chikki", image: ASSET.chikki, button_text: "Buy Now", button_url: "/indon/products" },
  { title: "Premium Dates", subtitle: "INDON Mazafati Dates", image: ASSET.dates, button_text: "Buy Now", button_url: "/indon/products" },
  { title: "Wild Honey", subtitle: "INDON Sivaganga Wild Honey", image: ASSET.honey, button_text: "Buy Now", button_url: "/indon/products" },
  { title: "Crispy Bites", subtitle: "INDON Snacks", image: ASSET.snacks, button_text: "Buy Now", button_url: "/indon/products" },
  { title: "Classic Delight", subtitle: "INDON Sugarcane Jaggery", image: ASSET.jaggery, button_text: "Buy Now", button_url: "/indon/products" },
];
