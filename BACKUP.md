# BACKUP PLAN

## 1. Client originals (highest priority — irreplaceable)
`public/assets/originals/` contains the untouched supplied files:
- `image-1.png` — **authoritative IMN logo**
- `image-2/3.png` — builder project photography
- `image-4…8,10.png` — INDON creatives (incl. embedded Google Maps QR)
Keep this folder in git **and** in an external copy (drive/OSS). Never edit these files;
working copies live in `public/assets/{brand,builder,indon,qr}/`.

## 2. Database
- **Supabase:** enable Point-in-Time-Recovery (Project Settings → Backups) + weekly
  `supabase db dump` stored with the repo tag; download monthly CSVs of `enquiries`.
- **Local Demo Mode:** copy `.data/imn.db` (stop the server first, or use
  `sqlite3 .data/imn.db ".backup backup.db"`).

## 3. Uploads
- Supabase Storage bucket `imn` — sync with `supabase storage ls`/`cp` or the dashboard export.
- Local mode: `public/uploads/` — include in git or archive monthly.

## 4. Source code
Git remote (GitHub) + tag each deployed release (`v1.x`). Vercel keeps build history.

## 5. Documentation
This folder (`docs/`, root *.md) travels with the repo — architecture, asset analysis,
admin guide and acceptance checklist are part of the deliverable.

## Restore drill (quarterly)
1. Restore DB dump into a scratch Supabase project (or fresh `.data/imn.db`).
2. Point a local `.env` at it, `npm run dev`, run `npm run smoke && npm run verify`.
3. Confirm logo/QR/assets render from `public/assets/originals` copies.
