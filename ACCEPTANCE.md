# FINAL ACCEPTANCE (spec §90) — evidence log

## BRAND
- [x] Exact IMN logo used (splash, header, footer, admin, favicon) — `public/assets/brand/imn-logo.png`, never redrawn
- [x] No logo distortion (fixed 277:112 ratio everywhere)
- [x] Three divisions clearly represented (home, /companies, header, footer, admin)
- [x] Premium design (editorial type, layered imagery, selective glass, gold accents)

## SPLASH
- [x] Logo centered on dark premium field · illumination + reveal animation · elegant fade to home
- [x] Reduced-motion → skipped; shown once per session (no repeat delay)

## BUILDER
- [x] Builder page · services (Residential/Commercial, admin-editable) · **70+ Successful Projects**
- [x] Tamil Nadu · Puducherry · projects list w/ type filters (empty types hidden) · project detail w/ gallery

## INDON
- [x] Catalogue · categories · debounced search · availability filter · sorting
- [x] Variants with size/weight/unit · price · quantity · availability shown to customers
- [x] BUY NOW ON WHATSAPP with encoded product+variant message (unit-tested) · **no cart / no checkout / no payment**

## BRIGHTSTONE
- [x] Silver rings · gemstone collections (Ruby…Citrine) · **Price on Request** · ENQUIRE NOW WhatsApp flow
- [x] Subtle sparkle glints + metallic sweep; disabled under prefers-reduced-motion

## CONTACT
- [x] Three division contact cards (email/phone/WhatsApp/address) · contact form stored as enquiries
- [x] Google Maps embed + **supplied Google Maps QR** (decoded & verified) + Directions CTA

## ADMIN
- [x] Login (rate-limited) · dashboard w/ 3 division cards · Builder/INDON/Brightstone sections · Global Settings
- [x] Product CRUD · Variant CRUD · Project CRUD · Gallery CRUD · Banner CRUD · Category CRUD
- [x] Contact editing · WhatsApp editing · content editing (about/mission/vision/hero/stats/services/SEO)
- [x] Enquiry workflow · audit log · toasts · confirm dialogs · empty & loading states

## SECURITY
- [x] /admin/* guarded (middleware + server-side re-check in every action)
- [x] RLS policies (anon = published reads + enquiry insert; no anon access to enquiries/audit/profiles)
- [x] Service role server-only; secrets never in browser bundle; upload MIME/size/dimension validation
- [x] Secure headers (nosniff, referrer, permissions-policy); rate limits on login & contact

## SEO
- [x] Metadata + template per route · canonical via SITE_URL · Open Graph/Twitter · semantic headings
- [x] sitemap.xml + robots.txt generated from DB · JSON-LD Organization/Product/Breadcrumb · no fake ratings

## QUALITY
- [x] Responsive (mobile nav sheet, touch targets, no horizontal scroll) · accessible (skip link, focus traps, aria, contrast)
- [x] `tsc --noEmit` clean · `next lint` clean · `vitest` 11/11 · production build succeeds
- [x] `npm run smoke` ALL PASS · `npm run verify` ALL PASS (price/qty propagation, publish/unpublish, enquiries)

## KNOWN REMAINING (tracked, non-blocking)
- [x] INDON catalogue imagery redesigned to premium studio photography (product-*.jpg; creatives preserved)
- [x] Builder media: 2 client photos (project-03/04) + 4 labelled concept studies; new Selected Works + Design Concepts layout (`scripts/refresh-media.ts`)
- [x] `gem-citrine.jpg` regenerated as real faceted gemstone photography; Brightstone showcase = 6 aligned cards (3 rings + 3 gems); 4 new collection pieces (Twisted Vine, Trilogy, Topaz, Peridot) via `scripts/refresh-media.ts`; back buttons on all detail pages; materials animation section removed per client feedback
- [ ] Add frame-ancestors CSP once the production domain is live (see next.config.ts comment)
- [ ] Client to replace draft prices/stock, project titles and Brightstone concepts with confirmed data
