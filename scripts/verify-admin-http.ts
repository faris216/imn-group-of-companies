import { signToken } from "../lib/auth";
const BASE = "http://127.0.0.1:3000";
const token = signToken({ email: "admin@imn.group", name: "Group Administrator", role: "owner", exp: Date.now() + 600_000 });
const cookie = `imn_admin_session=${token}`;
async function get(path: string, withCookie: boolean) {
  const r = await fetch(BASE + path, { headers: withCookie ? { cookie } : {}, redirect: "manual" });
  return r;
}
async function main() {
let fail = 0;
const anon = await get("/admin", false);
if (anon.status !== 307) { console.error("FAIL anon /admin not redirected", anon.status); fail++; } else console.log("ok   anon /admin →", anon.headers.get("location"));
const login = await get("/admin/login", false);
console.log(login.status === 200 ? "ok   /admin/login renders" : `FAIL login ${login.status}`);
if (login.status !== 200) fail++;
for (const p of ["/admin", "/admin/indon-mart/products", "/admin/builder/projects", "/admin/settings", "/admin/enquiries", "/admin/audit", "/admin/content"]) {
  const r = await get(p, true);
  const body = await r.text();
  if (r.status === 200 && body.includes("Admin CMS")) console.log(`ok   authed ${p}`);
  else { console.error(`FAIL authed ${p} → ${r.status}`); fail++; }
}
console.log(fail === 0 ? "ADMIN-HTTP: ALL PASS" : `ADMIN-HTTP: ${fail} FAIL`);
process.exit(fail ? 1 : 0);
}
main();
