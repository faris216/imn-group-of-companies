import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.screenshot({ path: "/tmp/home-hero.png" });
await b.close();
console.log("shot saved");
