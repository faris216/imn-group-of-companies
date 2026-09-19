# IMN Group — Supplied Asset Analysis

Generated during Phase 1 (analysis). All source files remain untouched in `/uploads` and are
copied (never modified) into the repository under `public/assets/originals/`.

## Inventory

| File | Size (px) | Format | Identified role | Destination in repo |
|---|---|---|---|---|
| image-1.png | 277 × 112 | PNG sRGB | **IMN authoritative logo** (navy block "IMN" + red block script wordmark) | `public/assets/brand/imn-logo.png` (+ favicon/icon derivatives) |
| image-2.png | 1023 × 1600 | PNG sRGB | **IMN Builder project photo** — completed modern residence, daytime, frontal elevation | `public/assets/builder/project-01.jpg` |
| image-3.png | 1220 × 683 | PNG sRGB | **IMN Builder project photo** — completed residence, dusk, warm exterior lighting | `public/assets/builder/project-02.jpg` |
| image-4.png | 1125 × 1400 | PNG sRGB | **INDON Tea creative** ("Golden sips for Golden moments") | `public/assets/indon/creative-tea.png` |
| image-5.png | 1125 × 1400 | PNG sRGB | **INDON Chikki creative** ("Sweet Crunch", Premium Chikki packs) | `public/assets/indon/creative-chikki.png` |
| image-6.png | 1125 × 1400 | PNG sRGB | **INDON Dates creative** ("Premium Dates", Mazafati Dates packs) | `public/assets/indon/creative-dates.png` |
| image-7.png | 1125 × 1400 | PNG sRGB | **INDON Wild Honey creative** (jar + honeycomb) | `public/assets/indon/creative-honey.png` |
| image-8.png | 1125 × 1400 | PNG sRGB | **INDON Snacks creative** ("Crispy Bites", murukku jar) | `public/assets/indon/creative-snacks.png` |
| image-9.png | 1125 × 1400 | PNG sRGB | **Byte-identical duplicate of image-8** (md5 `39a74bab…`) — ignored, kept only in originals | not mapped |
| image-10.png | 1125 × 1400 | PNG sRGB | **INDON Sugarcane Jaggery creative** ("Classic Delight") | `public/assets/indon/creative-jaggery.png` |

MD5 duplicates check: only image-8 ≡ image-9. All other assets unique.

## Logo color extraction (sampled from image-1.png)

| Token | Hex | Source |
|---|---|---|
| IMN Navy | `#011F5F` | dominant pixel of upper band |
| IMN Red | `#FD0101` | dominant pixel of lower band |
| Logo White | `#FFFFFF` | "IMN" glyph / script wordmark |

These two hues anchor the global palette; all derived tints/shades are documented in
`ARCHITECTURE.md §F`. The logo file itself is never recolored, cropped or redrawn.

## QR code verification

The QR embedded bottom-left of every INDON creative was decoded (OpenCV, 3× upscale):

```
https://www.google.com/maps/@10.7587221,78.6864707,3a,75y,157.81h,99.34t/data=!3m7!1e1!3m5!1sLDbhdzpssW9eq8TFbi2rGg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3F...?hl=en&entry=ttu
```

→ **Confirmed: Google Maps destination** (Street View pin at 10.7587221, 78.6864707 —
K K Nagar, Tiruchirappalli), exactly as the specification states. It is NOT a WhatsApp QR.

Actions:
1. A clean standalone crop is extracted during implementation →
   `public/assets/qr/google-maps-qr.png` (used on Contact page + footer + admin-replaceable).
2. The decoded URL seeds `contact_settings.maps_url` for INDON Mart (and group contact),
   editable from `/admin/settings`.
3. Separate slots exist for a future Website QR and WhatsApp QR — never conflated.

## Content embedded in creatives (cross-checked against spec §09)

- WhatsApp numbers `70104 44471` and `89253 45865` ✔ match spec (INDON Mart).
- Address `86, Rajaram Rd, K K Nagar, Tiruchirappalli, Tamil Nadu 620021` ✔ matches QR location;
  seeded as INDON Mart address (editable).
- Product names visible on packaging: INDON Tea, Premium Chikki, Mazafati Dates,
  Sivaganga/Wild Honey ("சிகப்புக் காட்டுத் தேன்"), Snacks (murukku), Sugarcane Jaggery
  ("நாட்டுச்சக்கரை") ✔ match spec §05 categories.

## Brightstone assets

None supplied. Initial catalogue imagery will be AI-generated **concept** photography,
flagged `is_ai_draft = true` in the database, editable/replacable from admin, and never
accompanied by certification/purity/origin claims (spec §07, §84).

---

## Addendum — media refresh (visual upgrade round)

New client uploads (Phase-2 round) and generated catalogue imagery now in use:

| File | Size (px) | Role | Destination |
|---|---|---|---|
| image-1.jpeg | 1320 × 1574 (resized from upload) | **Client project photo** — apartment residence, green balconies | `public/assets/builder/project-03.jpg` (+ originals copy `client-builder-01.jpeg`) |
| image-2.jpeg | 1127 × 1034 (resized from upload) | **Client project photo** — "Safiya Manzil" handover, nameplate visible | `public/assets/builder/project-04.jpg` (+ originals copy `client-builder-02.jpeg`) |

- **INDON catalogue redesign:** the six `creative-*.png` marketing creatives are preserved
  untouched; new premium studio-catalogue photographs were generated using each creative as
  the packaging/branding reference → `public/assets/indon/product-{tea,honey,dates,snacks,chikki,jaggery}.jpg`.
  These are the product `main_image_url` / primary gallery images (admin-replaceable).
- **IMN Builder concepts:** four AI design studies → `public/assets/builder/concept-01..04.jpg`
  (dusk residence, commercial complex, courtyard villa, jaali apartments). Stored in the builder
  gallery under category **"Concepts"**, always displayed with a *Concept* chip and the footnote
  "illustrative works, not completed client projects" (spec rule on never fabricating facts).
- **Builder page layout:** Selected Works = featured lead project (16:9) + 3 cards;
  Design Concepts = asymmetric editorial grid (lead tile spans 2×2 on desktop, single column mobile).
- `scripts/refresh-media.ts` applies all of the above to an existing database idempotently
  (image swaps, two new project records, gallery updates/additions). Fresh databases get it via seed.
- **Still pending:** `public/assets/brightstone/gem-citrine.jpg` remains a gradient placeholder
  (image-generation quota); regenerate and swap via admin or `refresh-media`.
