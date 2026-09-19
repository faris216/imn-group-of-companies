# ADMIN GUIDE — IMN Group CMS

Sign in at `/admin/login`. Everything below saves with a confirmation toast and updates the
public site immediately. Destructive actions always ask for confirmation first.

## Add a product (INDON or Brightstone)
1. Sidebar → **INDON Mart → Products** (or **Brightstone → Products**).
2. Click **+ Add Product**.
3. Fill name, category, short description, upload the main image (drag & drop or click).
4. Tick **Published** to show it on the website; **Featured** to place it on the homepage.
5. Click **Create Product**.

## Edit a product / change price / change quantity / add variant
1. Products table → **Edit** on the row.
2. In **Variants — size, price & quantity**, each row is one pack size:
   - change **Price (₹)** and press **Save variant** → the public price updates at once;
   - change **Quantity** and press **Save variant** → “Available: N” updates at once;
   - **Availability** switches between In stock / Out of stock / Pre-order.
3. **+ Add variant** creates a new pack size (name, size, weight, unit, price, quantity).
4. **Save Changes** at the bottom stores product-level edits (name, images, publish state).

> Verification example from the build spec: changing Honey 500 g from ₹450 → ₹500 and
> quantity 25 → 10 makes the public product page show ₹500 and “Available: 10” immediately.

## Publish / unpublish / feature / reorder / delete
Products & Projects tables have row buttons: **Publish/Unpublish**, **Feature/Unfeature**,
**Delete** (confirm dialog), and ↑ ↓ arrows to reorder display order.

## Add a project (IMN Builder)
Builder → **Projects** → **+ Add Project** → name, location, type (Residential/Commercial),
description, cover image. After creating, reopen it to attach extra gallery photos.

## Upload gallery images
Builder (or Brightstone) → **Gallery** → upload image, choose division + title → **Add to
gallery**. Use **Hide/Show** to publish/unpublish, **Del** to remove.

## Change a banner
INDON Mart → **Banners** → add image, title, subtitle, button text/link → **Add banner**.
Existing banners: **Pause/Activate**, **Delete**.

## Change WhatsApp numbers
INDON Mart (or Brightstone) → **WhatsApp** → add number + label. The row marked **Primary**
receives all “Buy Now on WhatsApp” / “Enquire Now” messages. You can disable or delete
numbers; customer buttons disable themselves gracefully if none remain.

## Change contact details
Each division → **Contact** → email, phone, address, Google Maps URL → **Save contact**.
Group-level address & maps live under **Global Settings**.

## Change About / Mission / Vision / homepage wording
**Group Content** (sidebar, Overview) holds About, Our Story, Mission, Vision, Why-IMN and
the homepage hero. Builder/INDON/Brightstone intro texts, the 70+ statistic, services and
per-division SEO are under each division’s **Content & SEO**.

## Global settings
**Global Settings**: site title, tagline, address, Maps URL, **three separate QR slots**
(Google Maps QR pre-loaded from the supplied artwork — never swap it for a WhatsApp QR),
footer note and SEO defaults.

## Enquiries & audit
**Enquiries** lists contact-form messages (mark Contacted/Closed, reply by email).
**Audit Log** records every admin action (who/what/when) — passwords are never logged.

## Draft badge
Amber **Draft** badges mark placeholder business data (non-honey prices/stock, Brightstone
concept pieces, placeholder project titles). Replace with client-confirmed values when available.
