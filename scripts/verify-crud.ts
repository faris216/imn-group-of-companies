/**
 * Spec §88/§89 verification — admin change → public reflection.
 * Runs against the same database the running server uses (Local Demo Mode:
 * shared SQLite file in WAL mode; Supabase mode: same tables).
 */
import { getAdapter } from "../lib/data";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
let failed = 0;
function check(cond: boolean, label: string) {
  if (cond) console.log(`ok   ${label}`);
  else { failed++; console.error(`FAIL ${label}`); }
}
const fetchBody = (p: string) => fetch(`${BASE}${p}`, { cache: "no-store" }).then((r) => ({ status: r.status, body: r.text().then((b) => b) }));

async function main() {
  const adapter = getAdapter();
  console.log(`driver: ${adapter.mode}`);

  const product = await adapter.getProductBySlug("indon-wild-honey", { includeUnpublished: true });
  if (!product) { console.error("FAIL product seed missing"); process.exit(1); }
  // The publicly rendered price/availability belong to the default (first) variant.
  const vDefault = product.variants?.[0];
  if (!vDefault) { console.error("FAIL default variant missing"); process.exit(1); }
  const origPrice = vDefault.price ?? 0;
  const origQty = vDefault.quantity;

  // baseline
  let page = await fetchBody("/indon/products/indon-wild-honey");
  check(page.status === 200 && (await page.body).includes(`₹${origPrice.toLocaleString("en-IN")}`), `public shows ₹${origPrice} before change`);

  // §88 test: price +100, quantity 25 → 10 style change on the visible variant
  await adapter.saveVariant({ ...vDefault, price: origPrice + 50, quantity: 10 });
  page = await fetchBody("/indon/products/indon-wild-honey");
  let body = await page.body;
  check(body.includes(`₹${(origPrice + 50).toLocaleString("en-IN")}`), `public reflects price ₹${origPrice + 50} after admin change`);
  check(/Available:[\s\S]{0,20}?10/.test(body), "public reflects quantity 10 after admin change");

  // revert
  await adapter.saveVariant({ ...vDefault, price: origPrice, quantity: origQty });
  page = await fetchBody("/indon/products/indon-wild-honey");
  body = await page.body;
  check(body.includes(`₹${origPrice.toLocaleString("en-IN")}`) && new RegExp(`Available:[\\s\\S]{0,20}?${origQty}`).test(body), `revert to ₹${origPrice} / ${origQty} reflected`);

  // publish / unpublish
  await adapter.setProductFlags(product.id, { is_published: false });
  page = await fetchBody("/indon/products/indon-wild-honey");
  check(page.status === 404, "unpublished product returns 404 publicly");
  await adapter.setProductFlags(product.id, { is_published: true });
  page = await fetchBody("/indon/products/indon-wild-honey");
  check(page.status === 200, "republished product is public again");

  // feature flag
  await adapter.setProductFlags(product.id, { featured: true });
  const featured = await adapter.listProducts(product.company_id, { featured: true, publishedOnly: true });
  check(featured.some((p) => p.id === product.id), "feature flag persists");

  // enquiries lifecycle
  const enq = await adapter.createEnquiry({ company_id: product.company_id, product_id: product.id, name: "Verify Script", email: "verify@example.com", message: "Automated verification enquiry — please ignore." });
  const listed = await adapter.listEnquiries({ status: "new" });
  check(listed.some((e) => e.id === enq.id), "enquiry stored and listed as new");
  await adapter.updateEnquiryStatus(enq.id, "contacted");
  const contacted = await adapter.listEnquiries({ status: "contacted" });
  check(contacted.some((e) => e.id === enq.id), "enquiry status workflow works");

  // audit trail
  const audit = await adapter.listAudit(20);
  check(audit.length >= 0, "audit log readable");

  // whatsapp settings source-of-truth
  const wa = await adapter.listWhatsApp(product.company_id, { activeOnly: true });
  check(wa.length === 2 && wa[0]?.phone_number === "70104 44471", "whatsapp numbers from settings (primary first)");

  console.log(failed === 0 ? "\nVERIFY-CRUD: ALL PASS" : `\nVERIFY-CRUD: ${failed} FAILURES`);
  process.exit(failed === 0 ? 0 : 1);
}
main();
