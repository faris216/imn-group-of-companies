/** Headless visual check of the Builder materials animation. */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 300)));

await page.goto(`${BASE}/builder`, { waitUntil: "networkidle" });
// scroll the animation section into view
await page.evaluate(() => {
  const el = [...document.querySelectorAll("h2")].find((h) => /raw material/i.test(h.textContent ?? ""));
  el?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/anim-mid.png" });
await page.waitForTimeout(3500);
await page.screenshot({ path: "/tmp/anim-end.png" });

// what does the DOM say about the building image + materials?
const info = await page.evaluate(() => {
  const scene = [...document.querySelectorAll("div")].find((d) => d.className.includes("bg-charcoal-950") && d.querySelector("img[alt*='completed']"));
  const img = document.querySelector("img[alt*='completed']");
  const cs = img ? getComputedStyle(img.parentElement) : null;
  return {
    imgFound: !!img,
    imgSrc: img?.getAttribute("src") ?? null,
    imgComplete: img ? img.complete && img.naturalWidth > 0 : null,
    wrapperClip: cs?.clipPath ?? null,
    wrapperOpacity: cs?.opacity ?? null,
  };
});
console.log(JSON.stringify(info, null, 1));
console.log("CONSOLE ERRORS:", errors.length ? errors : "none");
await browser.close();
