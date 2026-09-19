# IMN Group of Companies — Website + Admin CMS

Production-ready corporate showcase, product catalogue and enquiry/WhatsApp platform for
**IMN Group of Companies** and its three divisions:

| Division | Focus | Public routes | Admin |
|---|---|---|---|
| **IMN Builder** | Residential & commercial construction · 70+ successful projects · Tamil Nadu & Puducherry | `/builder`, `/projects` | `/admin/builder` |
| **INDON Mart** | Tea · Honey · Dates · Snacks · Chikki · Sugarcane Jaggery — variants, live price & stock, buy on WhatsApp | `/indon`, `/indon/products` | `/admin/indon-mart` |
| **Brightstone Silver & Gemstones** | Silver rings, jewellery & gemstone collections — *Price on Request*, enquire on WhatsApp | `/brightstone` | `/admin/brightstone` |

There is **no customer login, no cart, no checkout, no payment** — purchases and enquiries
flow to WhatsApp with pre-filled messages.

## Stack

Next.js 15 (App Router, TypeScript strict) · Tailwind CSS 4 · Framer Motion · shadcn-style UI
primitives · Supabase (PostgreSQL + Auth + Storage) in production · Vercel-ready.

**Local Demo Mode:** with no Supabase env vars the app runs on an identical SQLite schema
(`.data/imn.db`) with uploads in `/public/uploads` — same seed, same code paths, so the whole
system (including the CMS) is fully functional locally. Adding Supabase credentials switches
drivers with zero code changes.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000  (auto-seeds on first run)
```

First-run admin (Local Demo Mode): **admin@imn.group / Admin@12345** — change it after login
(`/admin` → flagged `must_change_password`). For Supabase mode create admins with
`npm run create-admin -- you@company.com 'StrongPass!23'`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | develop / production build / serve |
| `npm run typecheck` / `lint` / `test` | gates (tsc strict, eslint, vitest) |
| `npm run smoke` | route + guard + WhatsApp-message smoke test against a running server |
| `npm run verify` | §88 verification: admin price/qty change → public reflection, publish/unpublish, enquiries |
| `npm run seed` | seed Supabase (local mode auto-seeds) |
| `npm run create-admin -- email pass` | create an administrator |

## Documentation

- `SETUP.md` — local & Supabase setup
- `DEPLOYMENT.md` — Vercel + Supabase + domain
- `DATABASE.md` — schema, RLS, seed provenance
- `ADMIN-GUIDE.md` — every client task, step by step
- `ENVIRONMENT.md` — environment variables & secrets
- `BACKUP.md` — database / assets / code backup plan
- `ACCEPTANCE.md` — final acceptance checklist (spec §90)
- `docs/ARCHITECTURE.md`, `docs/ASSET-ANALYSIS.md` — design decisions & asset provenance

## Content provenance rules (enforced)

- Verified client facts only: three divisions, 70+ projects, services, locations, contacts,
  supplied logo/creatives/photos, Google Maps QR destination.
- Anything else is **draft** (`is_ai_draft`), badged in admin, editable everywhere.
- No testimonials, reviews, awards, certifications, purity/origin claims, dates or costs are
  invented. Brightstone shows **Price on Request** until the client confirms pricing.
