import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(2200);
await p.screenshot({ path: "/tmp/home2-hero.png" });
// scroll to brightstone home section
const el = await p.$("text=Price on Request");
await p.evaluate(() => { const h = [...document.querySelectorAll("h2")].find(x => /Brightstone|Silver|Gem/i.test(x.textContent||"")); h?.scrollIntoView({ block: "start" }); });
await p.waitForTimeout(1600);
await p.screenshot({ path: "/tmp/home2-bright.png" });
// listing page: global back pill
await p.goto("http://127.0.0.1:3000/brightstone", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.screenshot({ path: "/tmp/bright2-list.png" });
const backs = await p.$$eval("button", bs => bs.filter(x => /back/i.test(x.textContent||"")).length);
console.log("back buttons on /brightstone:", backs);
await b.close();
