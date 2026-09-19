# SETUP

## 1. Prerequisites
Node.js ≥ 20, npm ≥ 10.

## 2. Install & run (Local Demo Mode — no credentials needed)
```bash
npm install
cp .env.example .env        # optional: leave Supabase vars empty
npm run dev                 # first run auto-creates .data/imn.db + seed + admin
```
Open http://localhost:3000 · Admin: http://localhost:3000/admin/login
(`admin@imn.group` / `Admin@12345` — change after first login).

What you get immediately: full public site (home, about, companies, builder, projects,
INDON catalogue with variants/prices/stock, Brightstone showroom, gallery, contact with
Google Maps + QR) **and** the complete admin CMS (products, variants, prices, quantities,
projects, gallery, banners, WhatsApp numbers, contacts, content, SEO, settings, enquiries,
audit log, validated image uploads).

## 2b. Running in VS Code

1. Install the prerequisites: Node.js >= 20 (nodejs.org) and Git.
2. Unzip the project, then VS Code -> File -> Open Folder -> select the `imn-website` folder.
   Open the integrated terminal with `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (macOS).
3. Recommended extensions (VS Code will offer them from `.vscode/extensions.json`):
   ESLint, Tailwind CSS IntelliSense, Prettier.
4. In the terminal:

   ```bash
   npm install          # once; better-sqlite3 may compile for ~1 min
   cp .env.example .env # optional - defaults work as-is
   npm run dev          # http://localhost:3000
   ```

   On Windows PowerShell use `Copy-Item .env.example .env` instead of `cp`.
5. Admin panel: http://localhost:3000/admin - `admin@imn.group` / `Admin@12345`.
   Local dev serves over plain HTTP, so the session cookie uses SameSite=Lax and works
   in a normal browser tab. (In an embedded cross-site iframe the production build uses
   SameSite=None + Secure instead - see `lib/auth.ts`.)
6. The shipped `.data/imn.db` carries all current content. Delete that folder to get a
   fresh seed on the next `npm run dev`.
7. Production preview locally: `npm run build` then `npm start`.

If `npm install` fails on `better-sqlite3`, install build tooling once:
Windows `npm install -g windows-build-tools` (or the "Desktop development with C++"
workload in Visual Studio Build Tools); macOS `xcode-select --install`.

## 3. Switch to Supabase (production path)
1. Create a Supabase project → SQL editor → run `supabase/migrations/0001_init.sql` then `0002_rls.sql`.
2. Fill `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
   SUPABASE_SERVICE_ROLE_KEY=eyJ…   # server-only, never expose
   ```
3. `npm run seed` — inserts the three companies, INDON catalogue (verified honey variants),
   Brightstone concept catalogue, projects, banners, gallery, contacts, WhatsApp numbers,
   site content and the Google Maps QR/URL.
4. `npm run create-admin -- owner@company.com 'StrongPass!23'` — creates the Supabase Auth
   user + admin profile.
5. `npm run dev` — the app now uses Supabase everywhere (auth, DB, storage bucket `imn`).

## 3b. Troubleshooting

- **"Body exceeded 1 MB limit" when uploading images in admin:** the Server-Action body cap
  must be raised under `experimental.serverActions.bodySizeLimit` in `next.config.ts`
  (Next 15.5 ignores the top-level `serverActions` key at runtime). Already set to `10mb`;
  the app-level rule in `app/actions/upload.ts` still refuses files over 8 MB with a friendly message.
- **Admin login in an embedded iframe:** production builds set the session cookie
  `SameSite=None; Secure` for cross-site frames; local dev uses `Lax`. In a plain browser tab
  both work. If login loops in the embedded preview, open the preview in a real tab.

## 4. Verification gates (run after any change)
```bash
npm run typecheck && npm run lint && npm test
npm run build && npm start          # then in another shell:
npm run smoke && npm run verify
```

## 5. Replacing draft content
Everything badged **Draft** in admin (prices/stock of non-honey INDON products, Brightstone
concept pieces, project titles, about/mission/vision wording) is placeholder content pending
client confirmation — edit via the corresponding admin section (see ADMIN-GUIDE.md).
