# DATABASE

## Engines
- **Production:** Supabase PostgreSQL — migrations in `supabase/migrations/` (0001 schema, 0002 RLS).
- **Local Demo Mode:** SQLite file `.data/imn.db` — DDL embedded in `lib/data/adapters/local.ts`,
  field-for-field identical to the Postgres schema.

## Tables (spec §37–§49)
`companies · categories · products · product_variants · product_images · projects ·
project_images · gallery_items · banners · site_content · site_settings · contact_settings ·
whatsapp_settings · admin_profiles · enquiries · audit_logs`

Key rules encoded in schema:
- `product_variants.quantity >= 0`; `availability ∈ {in_stock, out_of_stock, preorder}`.
- `products.is_published` gates public visibility; `is_ai_draft` marks draft business data.
- `projects.project_type ∈ {residential, commercial}`; filters hide empty types.
- `enquiries.status ∈ {new, contacted, closed}`.
- `site_content` = key/value(jsonb) editable copy (about, mission, vision, hero, stats,
  services, per-division SEO…). `site_settings` = single row (title, address, maps URL,
  **three separate QR slots**, socials, footer, SEO defaults).
- `whatsapp_settings` per company with `is_primary` — the single source for all wa.me links.

## Row Level Security (0002_rls.sql)
- `anon`: SELECT published/active rows only; INSERT enquiries (allow-listed columns).
  **No** read access to enquiries, audit_logs, admin_profiles.
- `authenticated`: full DML on content tables (admin UI), still re-verified server-side.
- `service_role`: server actions & seed only (`SUPABASE_SERVICE_ROLE_KEY`, never in browser).
- Storage bucket `imn`: public read, authenticated write.

## Seed provenance
| Data | Source |
|---|---|
| 3 companies, services, locations, 70+ stat | client specification (verified) |
| INDON categories & 6 products | supplied creatives + spec |
| Honey variants 250 g ₹250 ×40 / 500 g ₹450 ×25 / 1 kg ₹800 ×10 | client specification (verified) |
| Other INDON prices/stock | **draft** (`is_ai_draft`) — confirm in admin |
| Brightstone rings/collections | **AI concept catalogue** (`is_ai_draft`) — Price on Request |
| Projects (2) | supplied client photography; titles are editable placeholders |
| Contacts & WhatsApp numbers | spec §09 (current initial values, admin-editable) |
| Maps URL + QR | decoded from supplied QR (Google Maps, K K Nagar Trichy) |

## Migrations discipline
Additive-only migrations, numbered `000N_name.sql`; mirror any schema change in
`lib/data/adapters/local.ts` DDL and `lib/types.ts`.
