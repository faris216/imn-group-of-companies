# ENVIRONMENT

Copy `.env.example` → `.env`. **Never commit `.env`.**

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | production | browser+server | Supabase project URL. Empty ⇒ Local Demo Mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production | browser+server | Anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | production | **server only** | Service role for admin actions/seed/storage. Never import in client components; never expose |
| `NEXT_PUBLIC_SITE_URL` | optional | build+server | Canonical origin for sitemap/robots/OG until the domain is purchased; falls back to Vercel/request host |
| `ADMIN_SESSION_SECRET` | recommended | server | HMAC secret for Local Demo Mode session cookies (defaults to a dev-only constant when absent) |
| `ADMIN_RATE_LIMIT_PER_MIN` | optional | server | Login throttle (default 10) |
| `CONTACT_RATE_LIMIT_PER_MIN` | optional | server | Contact-form throttle (default 3) |

## Rules enforced in code
- `SUPABASE_SERVICE_ROLE_KEY` is read only in `lib/data/adapters/supabase.ts` and
  `scripts/create-admin.ts` (server/CLI contexts).
- Middleware verifies sessions on the edge; every Server Action re-checks authorization.
- Local Demo Mode stores its SQLite file in `.data/` and uploads in `public/uploads/`
  (both git-ignored; local-only — production uses Supabase Storage bucket `imn`).
