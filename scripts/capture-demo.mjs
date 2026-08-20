import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = "/workspace/artifacts/demo/frames";
mkdirSync(OUT, { recursive: true });

const TITLE = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" />
  <style>
    html, body { margin:0; height:100%; background:#f3ead4; color:#1c1612; }
    body { display:grid; place-items:center; font-family:"Noto Serif SC", serif; }
    .wrap { text-align:center; }
    .kicker { letter-spacing:.45em; font-size:15px; color:#8b1e1e; }
    h1 { font-size:128px; letter-spacing:.28em; margin:12px 0 0; font-weight:700; line-height:1; }
    .en { font-family:"Playfair Display", serif; font-style:italic; letter-spacing:.42em; font-size:22px; margin-top:8px; }
    .meta { margin-top:36px; font-size:18px; letter-spacing:.18em; }
    .seal {
      position:absolute; right:9%; top:14%;
      width:120px; height:120px; border:6px solid #8b1e1e; color:#8b1e1e;
      display:grid; place-items:center; font-size:56px; font-weight:700;
      transform:rotate(-12deg); opacity:.88;
      box-shadow: inset 0 0 0 4px #8b1e1e;
    }
  </style>
</head>
<body>
  <div class="seal">讣</div>
  <div class="wrap">
    <p class="kicker">内部特刊 · 非卖品 · 读完请默哀三秒</p>
    <h1>默哀报</h1>
    <p class="en">MOURNING POST</p>
    <p class="meta">第 37 期 · 复明日集团停尸房专刊</p>
  </div>
</body>
</html>`;

const END = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:ital,wght@1,600&display=swap" />
  <style>
    html, body { margin:0; height:100%; background:#1c1612; color:#f3ead4; }
    body { display:grid; place-items:center; font-family:"Noto Serif SC", serif; }
    .wrap { text-align:center; }
    .kicker { letter-spacing:.4em; font-size:14px; color:#c45c4a; }
    h1 { font-size:64px; letter-spacing:.2em; margin:18px 0 0; font-weight:700; }
    .en { font-family:"Playfair Display", serif; font-style:italic; letter-spacing:.35em; margin-top:10px; opacity:.75; }
    .flow { margin-top:40px; font-size:18px; letter-spacing:.12em; color:#d9cbb0; }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="kicker">第 37 期已印毕</p>
    <h1>读完请默哀三秒</h1>
    <p class="en">MOURNING POST</p>
    <p class="flow">飞书多维表格 → 验尸 → 讣告 → 发回群里</p>
  </div>
</body>
</html>`;

writeFileSync(join(OUT, "title.html"), TITLE);
writeFileSync(join(OUT, "end.html"), END);

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

async function waitReady() {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalHeight > 0),
  ).catch(() => {});
  await page.waitForTimeout(400);
}

async function shot(name) {
  await page.screenshot({ path: join(OUT, name), type: "png" });
  console.log("wrote", name);
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 30000 });
await waitReady();
await shot("01-front.png");

await page.evaluate(() => window.scrollTo(0, 0));
const lead = page.getByRole("button", { name: /增长引擎/ }).first();
await lead.click();
await page.waitForSelector("[role=dialog]");
await page.waitForTimeout(400);
await shot("02-autopsy.png");
await page.getByRole("button", { name: "盖棺" }).click();
await page.waitForTimeout(300);

await page.evaluate(() => {
  const el = [...document.querySelectorAll("h3")].find((n) => n.textContent?.includes("讣告栏"));
  el?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(400);
await shot("03-obituaries.png");

await page.evaluate(() => {
  const el = [...document.querySelectorAll("h3")].find((n) => n.textContent?.includes("犯罪栏"));
  el?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(400);
await shot("04-crime.png");

await page.goto("http://127.0.0.1:8080/morgue", { waitUntil: "domcontentloaded", timeout: 30000 });
await waitReady();
await shot("05-morgue.png");

for (const name of ["title.html", "end.html"]) {
  await page.goto("file://" + join(OUT, name), { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await shot(name.replace(".html", ".png"));
}

await browser.close();
console.log("done");
