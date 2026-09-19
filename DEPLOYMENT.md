# DEPLOYMENT (Vercel + Supabase)

## 1. Repository
Push this folder to GitHub (the `.gitignore` already excludes `.env`, `.data`, uploads).

## 2. Vercel
1. New Project → import repo → framework preset **Next.js**.
2. Environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain` (add after domain purchase; until then the
     app falls back to the Vercel URL for canonical/sitemap/OG)
   - `ADMIN_SESSION_SECRET=<long random string>`
3. Deploy. Run migrations + seed once against Supabase (SETUP.md §3), then create the admin.

> **Local Demo Mode on Vercel is not supported** (ephemeral filesystem). Always configure
> Supabase for deployed environments.

## 3. Domain (not yet purchased — spec §79)
When bought: add it in Vercel → Domains, set DNS per Vercel instructions, then set
`NEXT_PUBLIC_SITE_URL`. No domain is hard-coded anywhere; canonical URLs, sitemap and OG
tags read the env var at request/build time.

## 4. Post-deploy hardening checklist
- [ ] Add `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` in `next.config.ts`
      (currently omitted so the sandbox preview iframe works — see comment in the file).
- [ ] Enable Vercel Firewall rate limits on `/admin/login` and `/contact` if desired
      (app-level token buckets already exist).
- [ ] Supabase → Settings → Auth: disable sign-ups (admins are created by script only).
- [ ] Configure Supabase automated backups (see BACKUP.md).
- [ ] Replace the first-run admin password; admin rows carry `must_change_password`.

## 5. Rollback
Vercel deployments are immutable — promote the previous deployment instantly from the
Vercel dashboard. Database migrations are additive; keep `supabase/migrations` ordered.
