import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:3000/brightstone", { waitUntil: "networkidle" });
await p.evaluate(() => [...document.querySelectorAll("h2")].find(h => /Selected pieces/i.test(h.textContent ?? ""))?.scrollIntoView({ block: "start" }));
await p.waitForTimeout(1500);
const rows = await p.evaluate(() => {
  const cards = [...document.querySelectorAll("a[href^='/brightstone/products/']")].map(a => ({ href: a.getAttribute("href"), y: Math.round(a.getBoundingClientRect().top + window.scrollY) }));
  const ys = [...new Set(cards.map(c => c.y))];
  return { total: cards.length, rows: ys.length, perRow: ys.map(y => cards.filter(c => c.y === y).length) };
});
console.log("showcase cards:", JSON.stringify(rows));
await p.screenshot({ path: "/tmp/bright.png" });
console.log("builder anim gone:", !(await (await p.goto("http://127.0.0.1:3000/builder", { waitUntil: "domcontentloaded" })).text()).includes("From raw material"));
await b.close();
