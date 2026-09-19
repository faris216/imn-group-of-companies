# IMN GROUP OF COMPANIES — Technical Architecture
**Ultra Master Build · Phase 1 Deliverable · v1.0**

Companion docs: `ASSET-ANALYSIS.md` (asset inventory, logo palette, QR verification).

---

## A. ARCHITECTURE

### A.1 Stack (per spec §78)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15 (App Router, TypeScript strict)** | RSC for public pages, Server Actions for admin CRUD |
| Styling | **Tailwind CSS 4** + design tokens in `@theme` | no Bootstrap, no template UI |
| Components | **shadcn/ui-style primitives**, hand-authored in `components/ui/*` | Button, Dialog, Toast, Table, Skeleton… identical API to shadcn, no CLI/network dependency |
| Animation | **Framer Motion** | centralized presets in `lib/motion.ts` |
| Database | **Supabase PostgreSQL** | migrations + RLS in `supabase/migrations/` |
| Auth | **Supabase Auth** (`@supabase/ssr`) — admins only | middleware-guarded `/admin/*` |
| Storage | **Supabase Storage** bucket `imn` | validated uploads, `next/image` optimization |
| Hosting | **Vercel** (domain TBD, env-driven) | `NEXT_PUBLIC_SITE_URL` optional until domain purchased |

### A.2 Runtime topology

```
            USER (browser)
                 │
            DOMAIN (TBD — env configured, never hard-coded)
                 │
              VERCEL
                 │
            NEXT.JS 15
        ├─ RSC public pages (read published content)
        ├─ Server Actions /admin/** (auth + validation + audit)
        ├─ /api/upload (MIME/size/dimension validated)
        ├─ sitemap.ts · robots.ts · OG images
        │
        ├─ SUPABASE AUTH      (admin sessions, @supabase/ssr cookies)
        ├─ SUPABASE DATABASE  (16 tables, RLS: anon = published reads only)
        └─ SUPABASE STORAGE   (imn/{brand,builder,indon,brightstone,gallery,banners})
```

### A.3 Data-access strategy (one codebase, two drivers)

The specification requires Supabase PostgreSQL, but **no Supabase credentials exist yet**
(identified missing input, §K). To keep Rule 20 ("never declare complete until it works")
testable *today*, the data layer is an adapter interface with two implementations:

```
lib/data/adapter.ts        → interface DataAdapter (find/insert/update/remove/auth/storage)
lib/data/adapters/supabase.ts → production driver (@supabase/supabase-js, service role, server-only)
lib/data/adapters/local.ts    → offline driver (SQLite file .data/imn.db + /public/uploads)
lib/data/repo/*.ts         → ALL domain logic (slugs, ordering, publish rules, audit) — driver-agnostic
```

Driver selection: `NEXT_PUBLIC_SUPABASE_URL` present → Supabase; absent → **Local Demo Mode**
(banner shown in admin, documented in README/SETUP). Same schema DDL, same seed script, same
repository code, same Server Actions. When the client supplies credentials, switching is
environment-only — zero code changes. This is a development/verification bridge, not a
replacement: Supabase remains the production target exactly as specified.

### A.4 Auth & authorization

- Customers: **no auth at all** (Rules 3–5).
- Admins: Supabase Auth email+password; profile row in `admin_profiles` (`role: owner|manager`).
- `middleware.ts` guards `/admin/*` (except `/admin/login`) → redirect `/admin/login`.
- Every Server Action re-verifies the session **server-side** (middleware is UX, not security).
- Local mode: scrypt-hashed credentials in `admin_profiles`, HttpOnly SameSite=Lax session cookie.
- Seed admin (Local Demo Mode only): `admin@imn.group` / `Admin@12345` flagged
  `must_change_password = true`; SETUP.md documents `scripts/create-admin.ts` for Supabase mode.

### A.5 Images & storage

- Originals: committed under `public/assets/originals/` — **never mutated** (Rule 1, §81).
- Working copies: `public/assets/{brand,builder,indon,brightstone,qr}/` (seed content).
- Admin uploads: Storage bucket `imn/…` (prod) or `public/uploads/…` (local), paths
  `imn/{builder,indon,brightstone,gallery,banners}/…`.
- Upload validation server-side: MIME whitelist (png/jpeg/webp/avif), ≤ 8 MB, dimensions
  ≤ 6000px, extension/MIME agreement; images served only through `next/image` (auto
  WebP/AVIF negotiation, lazy loading, explicit aspect ratios → no CLS).
- QR slots kept separate in `site_settings`: `maps_qr_image_url` (seeded from supplied
  creative), `website_qr_image_url`, `whatsapp_qr_image_url` (null until supplied).

### A.6 WhatsApp & enquiry system

- Numbers live **only** in `whatsapp_settings` (per company, `is_primary`, `is_active`).
- `lib/whatsapp.ts` builds links: `https://wa.me/<digits>?text=<encodeURIComponent(msg)>`.
- INDON message template (product + variant names only — no internal IDs):
  `Hello, I am interested in purchasing:\n\nProduct: {product}\nVariant: {variant}\n\nPlease provide availability and purchase details.`
- Brightstone template: `Hello, I am interested in the Brightstone {product}.\nPlease provide more information.`
- Missing/misconfigured number → dedicated error state (spec §63), never a dead link.
- Contact form → `enquiries` table (status New/Contacted/Closed) + admin management + audit.

### A.7 SEO / accessibility / performance (summary; details §J, phase 22)

- `generateMetadata` per route; canonical from `SITE_URL` (falls back to request host);
  Open Graph + Twitter cards; JSON-LD: `Organization`, `LocalBusiness` (per division),
  `Product` (INDON details, offers without checkout), `BreadcrumbList`; no fake ratings.
- `app/sitemap.ts` + `app/robots.ts` generated from DB (published rows only).
- Semantic landmarks, single h1 per page, focus-visible rings, skip link, dialog focus trap,
  `prefers-reduced-motion` honored by motion presets **and** CSS (sparkle disabled).
- Gallery paginated (24/tile) + IntersectionObserver lightbox preloading; admin editors
  dynamically imported; fonts self-hosted via `next/font` (Playfair Display + Inter).

---

## B. FOLDER STRUCTURE

```
imn-website/
├─ app/
│  ├─ layout.tsx · globals.css · not-found.tsx · error.tsx · global-error.tsx
│  ├─ page.tsx                     (home: splash + hero + divisions + highlights)
│  ├─ about/page.tsx
│  ├─ companies/page.tsx
│  ├─ builder/page.tsx
│  ├─ projects/page.tsx · projects/[slug]/page.tsx
│  ├─ indon/page.tsx · indon/products/page.tsx · indon/products/[slug]/page.tsx
│  ├─ brightstone/page.tsx · brightstone/products/page.tsx · brightstone/products/[slug]/page.tsx
│  ├─ gallery/page.tsx
│  ├─ contact/page.tsx
│  ├─ sitemap.ts · robots.ts · manifest.ts · icon.tsx
│  ├─ actions/                    (server actions: admin CRUD, enquiries, upload, settings)
│  ├─ api/upload/route.ts
│  └─ admin/
│     ├─ login/page.tsx
│     ├─ layout.tsx  (guard + AdminSidebar/AdminHeader)
│     ├─ page.tsx    (3 division cards)
│     ├─ builder/  page.tsx · projects/ · projects/[id]/ · gallery/ · banners/ · content/ · contact/ · seo/
│     ├─ indon-mart/ page.tsx · products/ · products/new · products/[id]/ · categories/ · banners/ · whatsapp/ · contact/ · content/ · seo/
│     ├─ brightstone/ page.tsx · products/ · products/new · products/[id]/ · categories/ · gallery/ · banners/ · enquiries/ · whatsapp/ · contact/ · content/ · seo/
│     ├─ enquiries/page.tsx
│     ├─ audit/page.tsx
│     └─ settings/page.tsx  (logo, site title, address, maps URL, QRs, socials, footer, SEO defaults)
├─ components/
│  ├─ layout/   Header · Footer · MobileNavigation · StickyHeaderShell
│  ├─ ui/       button · dialog · modal · toast · input · select · textarea · table · data-table · skeleton · badge · tabs · switch · confirm-dialog · empty-state · error-state
│  ├─ brand/    ImnLogo · DivisionTheme · SparkleEffect · MetallicSweep · SectionHeading · WhatsAppButton · EnquireButton · QrCard
│  ├─ home/     Splash · Hero · DivisionCard · DivisionGrid · Highlights…
│  ├─ builder/  ProjectCard · ProjectGrid · ProjectFilters · StatBlock
│  ├─ indon/    ProductCard · ProductGrid · VariantSelector · PriceTag · AvailabilityBadge · SearchBar · CategoryFilter · PromoBanner
│  ├─ brightstone/ JewelleryCard · GemstoneCard · CollectionGrid
│  ├─ gallery/  GalleryGrid · Lightbox · GalleryFilters
│  ├─ contact/  ContactForm · DivisionContactCard · MapsPanel
│  └─ admin/    AdminSidebar · AdminHeader · ProductEditor · VariantEditor · ProjectEditor · BannerEditor · ContactEditor · SettingsEditor · ImageUploader · ReorderList · AuditTable
├─ lib/         data/(adapter, adapters/, repo/) · auth.ts · validation.ts (zod) · whatsapp.ts · seo.ts · audit.ts · utils.ts
├─ hooks/       useReducedMotionPref · useScrolled · useLockBody · useDebounce
├─ types/       db.ts · domain.ts
├─ supabase/    migrations/0001_init.sql · 0002_rls.sql · seed.sql
├─ scripts/     seed-local.ts · create-admin.ts · smoke.mts · verify-crud.mts
├─ docs/        ARCHITECTURE.md · ASSET-ANALYSIS.md · README.md · SETUP.md · DEPLOYMENT.md ·
│               DATABASE.md · ADMIN-GUIDE.md · ENVIRONMENT.md · BACKUP.md · ACCEPTANCE.md
├─ public/assets/{originals,brand,builder,indon,brightstone,qr}/
├─ .env.example · next.config.ts · tailwind.config? (v4 CSS-first) · middleware.ts · package.json
```

---

## C. DATABASE SCHEMA (Supabase PostgreSQL)

ERD (core relations):

```
companies 1─┬─< categories 1─< products 1─┬─< product_variants
            │                             └─< product_images
            ├─< projects 1─< project_images
            ├─< gallery_items
            ├─< banners
            ├─< contact_settings (1)
            ├─< whatsapp_settings
            └─< enquiries (products nullable)
site_content(key,value,company_id nullable)   site_settings(single row)
admin_profiles (auth user link)   audit_logs (actor, action, entity, diff jsonb)
```

Tables (fields exactly per spec §37–§49; `id uuid pk default gen_random_uuid()`,
`created_at/updated_at timestamptz default now()`):

```sql
companies(id, name, slug uniq, short_description, description, logo_url, hero_image_url,
          is_active bool, display_order int, created_at, updated_at)
categories(id, company_id fk, name, slug, description, image_url, display_order, is_active, …)
products(id, company_id fk, category_id fk, name, slug uniq, short_description, description,
         main_image_url, featured bool, is_published bool, is_ai_draft bool,
         display_order int, …)
product_variants(id, product_id fk on delete cascade, variant_name, size, weight numeric,
         unit, price numeric(10,2), quantity int check(quantity>=0),
         availability text check in ('in_stock','out_of_stock','preorder'),
         display_order int, …)
product_images(id, product_id fk, image_url, alt_text, is_primary bool, display_order int, created_at)
projects(id, company_id fk, name, slug uniq, location, project_type text check in
         ('residential','commercial'), description, main_image_url, featured, is_published,
         display_order, …)
project_images(id, project_id fk, image_url, alt_text, display_order, created_at)
gallery_items(id, company_id fk, title, description, image_url, category, display_order,
         is_published, …)
banners(id, company_id fk, title, subtitle, image_url, button_text, button_url, is_active,
         display_order, …)
site_content(id, company_id fk null, key text, value jsonb, updated_at)  -- about/mission/vision/hero/stats/footer…
site_settings(id single, site_title, tagline, address, maps_url, maps_qr_image_url,
         website_qr_image_url, whatsapp_qr_image_url, social_json jsonb, footer_note,
         seo_title, seo_description, updated_at)
contact_settings(id, company_id fk uniq, email, phone, address, maps_url, updated_at)
whatsapp_settings(id, company_id fk, phone_number, label, is_primary bool, is_active bool, updated_at)
admin_profiles(id, user_id uuid uniq, email uniq, full_name, role text check in ('owner','manager'),
         must_change_password bool, …)
enquiries(id, company_id fk null, product_id fk null, name, email, phone, subject, message,
         status text check in ('new','contacted','closed'), …)
audit_logs(id, actor_email, action, entity_type, entity_id, diff jsonb, created_at)
```

Indexes: `(company_id, is_published, display_order)` on products/projects/gallery;
`products(slug)`, `gin(to_tsvector)` omitted — INDON search uses `ilike` + trigram-friendly
`pg_trgm` extension index on `products.name` (fast, case-insensitive, spec §57).

**RLS (migration 0002):**
- `anon`: SELECT only, filtered to published/active rows (`is_published = true`,
  `is_active = true`) on products, variants, images, projects, project_images, gallery,
  banners, companies, categories; SELECT on contact/whatsapp/site settings (public display);
  INSERT on `enquiries` (contact form) with column allow-list; **no** SELECT on enquiries,
  audit_logs, admin_profiles.
- `authenticated` (admin): full DML on content tables; enforced again server-side by role.
- Service role (server-only env key) bypasses RLS for admin Server Actions & seed.

**Seed (`seed.sql` / `scripts/seed-local.ts`, identical data):** 3 companies; 6 INDON
categories; 6 INDON products with real variants (Honey 250 g ₹250 ×40 / 500 g ₹450 ×25 /
1 kg ₹800 ×10, others single/multi variant); 5 Brightstone concept rings + 6 gemstone
collection categories (`is_ai_draft = true`); 2 Builder projects from supplied photos
(descriptive placeholder titles, flagged for client rename in ADMIN-GUIDE); banners from the
6 INDON creatives; gallery seeded across divisions; site_content = spec §18 drafts +
"70+ Successful Projects" stat; contact/whatsapp settings per spec §09; maps_url = decoded
QR URL; site_settings QR slots (maps seeded, others null).

---

## D. ROUTE MAP

| Route | Type | Purpose | Data |
|---|---|---|---|
| `/` | public | splash → hero → 3 divisions → builder/indon/brightstone highlights → featured → gallery preview → about preview → CTA | companies, products(featured), projects(featured), site_content |
| `/about` | public | hero, story, mission, vision, divisions, why-IMN, 70+ stat, CTA | site_content |
| `/companies` | public | overview of the three divisions | companies |
| `/builder` | public | builder identity, services, 70+ stat, locations, projects preview, gallery, CTA | companies, projects, site_content |
| `/projects` | public | editorial grid + Residential/Commercial filters (hidden if empty) | projects |
| `/projects/[slug]` | public | hero, details, gallery, enquiry CTA | projects, project_images |
| `/indon` | public | brand hero, categories, featured, catalogue teaser, promo banners, WhatsApp CTA | categories, products, banners |
| `/indon/products` | public | search + category/availability filters + sort; cards w/ price & availability | products, variants |
| `/indon/products/[slug]` | public | gallery, variant selector (price/qty/availability live-update), BUY NOW ON WHATSAPP | products, variants, images, whatsapp_settings |
| `/brightstone` | public | luxury hero, silver & gemstone collections, featured, gallery, enquiry CTA | categories, products |
| `/brightstone/products` | public | luxury grid; filters: Silver Rings / Jewellery / Gemstones / Collections | products |
| `/brightstone/products/[slug]` | public | large imagery, sparkle, **Price on Request**, ENQUIRE NOW | products, images, whatsapp_settings |
| `/gallery` | public | masonry + filters (All/Builder/INDON/Brightstone) + lightbox, paginated | gallery_items |
| `/contact` | public | 3 division cards, form, Google Maps embed + **Maps QR**, directions CTA | contact_settings, site_settings |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.png` | public | SEO/PWA | generated |
| `/admin/login` | auth | email+password, rate-limited | auth |
| `/admin` | admin | landing: 3 division cards + global counters | all |
| `/admin/builder[/projects|/projects/[id]|/gallery|/banners|/content|/contact|/seo]` | admin | Builder CMS | … |
| `/admin/indon-mart[/products|/products/new|/products/[id]|/categories|/banners|/whatsapp|/contact|/content|/seo]` | admin | INDON CMS incl. variants/prices/qty | … |
| `/admin/brightstone[/products…|/categories|/gallery|/banners|/enquiries|/whatsapp|/contact|/content|/seo]` | admin | Brightstone CMS | … |
| `/admin/enquiries` | admin | global inbox, status workflow New→Contacted→Closed | enquiries |
| `/admin/audit` | admin | audit trail viewer | audit_logs |
| `/admin/settings` | admin | logo, site title, address, maps URL, 3 QR slots, socials, footer, SEO defaults | site_settings |
| `app/actions/*` (Server Actions) | server | all mutations, zod-validated, audited | — |
| `/api/upload` | server | validated image upload → Storage/local | — |

No route exposes customer auth, cart, checkout or payment (Rules 3–7).

---

## E. ADMIN ARCHITECTURE

- **Layout:** left `AdminSidebar` (collapsible → bottom-sheet on mobile), `AdminHeader`
  (breadcrumb, view-site link, sign-out), toast viewport, confirm-dialog provider.
  Selective glass panels on dashboard stat tiles only (§13).
- **Landing:** three large division cards (IMN BUILDER / INDON MART / BRIGHTSTONE) with live
  counters (published products, projects, new enquiries).
- **Per-division sections** exactly as spec §52–§54; **global settings** §55.
- **Editors:** `ProductEditor` (meta + publish/feature/reorder + `ImageUploader` multi with
  preview/replace/delete/reorder + primary flag) embedding `VariantEditor` rows
  (name/size/weight/unit/price/quantity/availability, add/remove/reorder, live validation);
  `ProjectEditor`, `BannerEditor`, `ContactEditor`, `SettingsEditor`, `ContactEditor`.
- **Tables:** `DataTable` with search, status filter, row actions (edit, publish/unpublish,
  feature, archive w/ confirm dialog, reorder handles), skeleton rows while loading,
  helpful empty states ("No products yet. Add your first product.").
- **Feedback:** optimistic-free, server-authoritative saves → toast "Product updated
  successfully." / error toast with message; audit row written for every mutation
  (created/updated/archived/published/price changed/quantity changed/contact changed…),
  passwords never logged.
- **UX for non-technical client:** plain labels, inline help text, big touch targets,
  every list reachable in ≤ 2 clicks from sidebar; ADMIN-GUIDE.md mirrors each task.

---

## F. DESIGN SYSTEM

**Sampled brand anchors (from supplied logo):** Navy `#011F5F`, Red `#FD0101`, White `#FFFFFF`.

| Token | Value | Use |
|---|---|---|
| `--navy-900/700/500` | `#01133C / #011F5F / #1B3F8F` | global chrome, Builder identity |
| `--red-600/700` | `#E40202 / #B40101` | INDON identity, CTAs (logo red, deepened for AA contrast) |
| `--gold-400/500/600` | `#E3C567 / #C9A227 / #A6831B` | restrained accents, rules, numerals |
| `--ivory-50/100` | `#FBF9F4 / #F4EFE6` | page surfaces |
| `--charcoal-800/900` | `#23272B / #16191C` | Builder neutrals, Brightstone base |
| `--silver-300/400` | `#D7DBE0 / #B9C0C8` | Brightstone metallic |
| `--champagne-300/400` | `#EAD9B0 / #D9C08A` | Brightstone gold accent |
| division themes | `data-division="builder|indon|brightstone"` scoping accent vars | one codebase, three identities |

- **Type:** Playfair Display (display, editorial sizes, tight leading) + Inter (UI/body).
  Scale: 13/14/16/18/20/24/32/40/56/72 clamp()-based; stat numerals Playfair 700.
- **Space/radius/shadow:** 4-pt grid, section padding 96–144 px desktop; radius 4/10/16;
  shadows layered & low-alpha (no harsh drop shadows).
- **Glassmorphism (selective):** sticky header post-scroll, hero overlay panels, floating
  contact/WhatsApp panel, gallery filter bar, lightbox chrome, modals, admin stat tiles.
  Recipe: `bg white/8–12% · backdrop-blur 14px · border white/15% · shadow soft` — always
  paired with a contrast-checked text color; never on body content.
- **Motion presets (`lib/motion.ts`):** fade-up 0.5 s ease-out, stagger 60 ms, image
  clip-reveal, hero parallax ≤ 4 %, hover scale 1.02–1.04, page transition 0.35 s.
  All gated by `useReducedMotion` + CSS `@media (prefers-reduced-motion)`.
- **Brightstone sparkle:** CSS specular "light sweep" (masked gradient translate on hover)
  for silver; sparse SVG star-glints (2–4, opacity ≤ 0.9, 1.2–2 s, random delay) for
  gemstones; no particles/rainbow/looping flash; fully disabled under reduced motion.
- **Image treatment:** fixed aspect ratios per slot (hero 21:9, card 4:3, product 1:1,
  portrait 3:4), subtle bottom gradient overlay, hover zoom 1.03 inside overflow-hidden,
  packaging never cropped through branding.

---

## G. IMPLEMENTATION PHASES (spec §85 mapped to delivery batches)

| Batch | Spec phases | Contents | Exit gate |
|---|---|---|---|
| 1 | 1–2 | analysis (done), repo init, TS/Tailwind/config, env example | `tsc`, `lint`, dev server boots |
| 2 | 3 | design system: tokens, fonts, ui primitives, motion, glass, sparkle | storybook-ish route check |
| 3 | 4–6 | schema migrations, RLS, seed, adapter + both drivers, storage/upload service | seed runs on both drivers |
| 4 | 7 | layout: Header/sticky-glass, MobileNavigation, Footer, SEO shell, error/not-found | visual desktop+mobile |
| 5 | 8–9 | splash + home + about + companies | visual + motion/reduced-motion |
| 6 | 10–11 | builder page, projects list/detail, filters | CRUD-read verified |
| 7 | 12–14 | INDON page, listing (search/filter/sort), detail w/ variants, WhatsApp system | wa.me URL unit tests |
| 8 | 15 | Brightstone page/listing/detail + sparkle | visual |
| 9 | 16 | gallery + lightbox + contact (form, maps, QR) | enquiry insert verified |
| 10 | 17–21 | admin auth + all four admin areas + settings + audit | full CRUD script (price 450→500 & qty 25→10 propagation) |
| 11 | 22 | SEO/OG/JSON-LD/sitemap/robots/a11y/perf pass | Lighthouse-ish manual + validators |
| 12 | 23–25 | tests, prod build, docs (7 files), deployment prep, acceptance checklist | `npm run build` clean, ACCEPTANCE.md all green |

Every batch ends with: inspect → `tsc --noEmit` → `lint` → targeted tests → build when
appropriate → browser check (desktop/tablet/mobile) → fix → continue (§86).

---

## H. ENVIRONMENT VARIABLES (`.env.example`)

```
# Supabase (production). Leave unset to run Local Demo Mode (SQLite + local uploads).
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never imported in client components

# Optional until domain purchase; falls back to request host / VERCEL_URL.
NEXT_PUBLIC_SITE_URL=

# Optional hardening
ADMIN_RATE_LIMIT_PER_MIN=10
CONTACT_RATE_LIMIT_PER_MIN=3
```

Rules: service role used **only** in `lib/data/adapters/supabase.ts` (server-only import);
`.env` git-ignored; docs/ENVIRONMENT.md explains each var + where to find them in Supabase.

---

## I. ASSET MAPPING

See `ASSET-ANALYSIS.md` for dimensions/hashes/QR payload. Summary:

| Source | Role | Repo path | Used by |
|---|---|---|---|
| image-1 | IMN logo (authoritative) | `assets/brand/imn-logo.png` | splash, header, footer, admin login, favicon derivatives |
| image-2 | Builder project 01 | `assets/builder/project-01.jpg` | project detail, projects grid, home, gallery |
| image-3 | Builder project 02 | `assets/builder/project-02.jpg` | same |
| image-4 | INDON Tea | `assets/indon/creative-tea.png` | product image + promo banner + gallery |
| image-5 | INDON Chikki | `assets/indon/creative-chikki.png` | same |
| image-6 | INDON Dates | `assets/indon/creative-dates.png` | same |
| image-7 | INDON Honey | `assets/indon/creative-honey.png` | same |
| image-8 | INDON Snacks | `assets/indon/creative-snacks.png` | same (image-9 duplicate dropped) |
| image-10 | INDON Jaggery | `assets/indon/creative-jaggery.png` | same |
| QR crop (from image-4) | Google Maps QR | `assets/qr/google-maps-qr.png` | contact page, footer, admin-replaceable slot |
| decoded QR URL | maps_url seed | `site_settings.maps_url` | directions CTA |
| AI-generated (batch 8) | Brightstone concept rings/gems | Storage `imn/brightstone/…` | flagged `is_ai_draft` |

---

## J. TESTING STRATEGY

1. **Static:** `tsc --noEmit` (strict), `next lint`, `next build` per batch gate.
2. **Unit (vitest):** `lib/whatsapp.ts` (message templates + encoding, digits-only numbers,
   no IDs), slugify/ordering helpers, zod schemas (product/variant/project/contact),
   upload validation (MIME/size/dimension rejections).
3. **Integration (scripts/verify-crud.mts against running server):** admin login → create
   product → add variant → publish → assert public page HTML shows price/qty → change
   Honey 500 g ₹450→₹500 and qty 25→10 → assert public detail reflects ₹500 / 10 (spec §88)
   → unpublish → assert 404/hidden → enquiry form insert → admin sees it → status change →
   audit rows exist. Runs against Local driver now, Supabase driver after credentials.
4. **WhatsApp verification (§89):** script asserts exact `wa.me` URLs for INDON (product +
   variant) and Brightstone (product) including percent-encoding of newlines/₹/spaces.
5. **Route smoke (scripts/smoke.mts):** every public route 200 + key strings; every admin
   route 307→/admin/login when unauthenticated; 404/500 pages render branded states.
6. **Visual/responsive:** manual pass at 390/768/1280/1440/1920 for home, divisions, product
   detail, gallery, contact, admin tables & editors; check overflow, touch targets, focus.
7. **Accessibility:** keyboard-only pass (nav, dialogs, lightbox arrows/Esc), heading order,
   contrast (gold on navy ≥ 4.5 via deepened shades), reduced-motion pass.
8. **Acceptance:** `docs/ACCEPTANCE.md` mirrors spec §90 checkboxes; project not declared
   complete until every box is evidenced (Rule 20).

---

## K. MISSING INPUTS & CONFIGURABLE PLACEHOLDERS (explicit — not invented)

| Item | Status | Handling |
|---|---|---|
| Supabase project credentials | **missing** | Local Demo Mode bridge (§A.3); SETUP.md one-page switch |
| Domain | not decided (§79) | `NEXT_PUBLIC_SITE_URL` optional; canonical/sitemap adapt |
| Admin account | not supplied | seeded change-me admin (local) + `scripts/create-admin.ts` (Supabase) |
| Project names/dates/costs | not supplied | descriptive placeholder titles from supplied photos, ADMIN-GUIDE flags them for rename; no dates/costs shown |
| Brightstone real catalogue | not supplied | AI concept entries `is_ai_draft=true`, "Price on Request", no certification claims |
| Builder/INDON street address | INDON address known from creatives; Builder address unknown | INDON seeded; Builder address empty → contact card hides gracefully until set |
| Social links | not supplied | empty slots in `/admin/settings`; icons hidden when empty |
| Website/WhatsApp QRs | not supplied | null slots, contact page shows Maps QR only |
| Testimonials/reviews/awards | forbidden (§84) | never rendered; no schema for them |

---
*Prepared for client approval. Implementation begins on approval, batch by batch per §G.*
