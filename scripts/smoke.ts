/** Route smoke test — every public route 200 + key content; admin guarded. */
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";

const PUBLIC: Array<[string, Array<string | RegExp>]> = [
  ["/", ["IMN", "Group of Companies", "Our Companies"]],
  ["/about", ["Our Mission", "Our Vision"]],
  ["/companies", ["IMN Builder", "INDON Mart", "Brightstone"]],
  ["/builder", ["70+", "Residential", "Puducherry", "Selected completed works", "Design concepts", "not completed client projects"]],
  ["/projects", ["Project Portfolio"]],
  ["/indon", ["INDON Mart"]],
  ["/indon/products", ["Product Catalogue", "Wild Honey"]],
  ["/indon/products/indon-wild-honey", ["Buy Now on WhatsApp", /Available:[\s\S]{0,20}?40/, "₹250"]],
  ["/brightstone", ["Price on Request", "Gemstone collections"]],
  ["/brightstone/products", ["The Showroom"]],
  ["/gallery", ["Across the Group"]],
  ["/contact", ["Google Maps", "Send an enquiry", "70104 44471"]],
  ["/sitemap.xml", ["<url>"]],
  ["/robots.txt", ["Sitemap"]],
];

const ADMIN_GUARDED = ["/admin", "/admin/indon-mart/products", "/admin/settings", "/admin/enquiries"];

async function main() {
  let failed = 0;
  for (const [path, needles] of PUBLIC) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const body = await res.text();
    const missing = needles.filter((n) => (typeof n === "string" ? !body.includes(n) : !n.test(body))).map(String);
    if (res.status !== 200 || missing.length) {
      failed++;
      console.error(`FAIL ${path} → ${res.status} missing: ${missing.join(", ")}`);
    } else console.log(`ok   ${path}`);
  }
  for (const path of ADMIN_GUARDED) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    if (res.status !== 307 && res.status !== 302) {
      failed++;
      console.error(`FAIL ${path} expected redirect, got ${res.status}`);
    } else {
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/admin/login")) { failed++; console.error(`FAIL ${path} redirects to ${loc}`); }
      else console.log(`ok   ${path} → guarded`);
    }
  }
  // WhatsApp link encoding check on product page
  const pd = await fetch(`${BASE}/indon/products/indon-wild-honey`).then((r) => r.text());
  const wa = pd.match(/https:\/\/wa\.me\/917010444471\?text=[^"]+/);
  if (!wa) { failed++; console.error("FAIL wa.me link not found on product page"); }
  else {
    const text = decodeURIComponent(wa[0].split("text=")[1] ?? "");
    if (!text.includes("Product: INDON Wild Honey")) { failed++; console.error("FAIL wa message wrong:", text); }
    else console.log("ok   wa.me message:", JSON.stringify(text.split("\n")[2]));
  }
  console.log(failed === 0 ? "\nSMOKE: ALL PASS" : `\nSMOKE: ${failed} FAILURES`);
  process.exit(failed === 0 ? 0 : 1);
}
main();
