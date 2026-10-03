/**
 * Mengambil tangkapan layar dari produk yang benar-benar jalan.
 *
 * Ini bagian inti konsep: kedua referensi memakai GAMBAR NYATA, bukan plate
 * desain. Tangkapan ini diambil dari situs publik Arkan sendiri, lalu
 * dikonversi ke WebP oleh skrip ini juga.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const sharp = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/sharp");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "shots");
fs.mkdirSync(OUT, { recursive: true });

const targets = [
  { name: "mafiablox", url: "https://mafiablox.com" },
  { name: "next-deploy", url: "https://next-deploy-gold-one.vercel.app" },
  { name: "arkanuy-io", url: "https://arkanuy.github.io" },
];

(async () => {
  const b = await chromium.launch();
  for (const t of targets) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const png = path.join(OUT, t.name + ".png");
    try {
      const res = await p.goto(t.url, { waitUntil: "networkidle", timeout: 45000 });
      const code = res ? res.status() : 0;
      await p.waitForTimeout(2600);
      await p.screenshot({ path: png });
      const webp = path.join(OUT, t.name + ".webp");
      await sharp(png).webp({ quality: 80, effort: 6 }).toFile(webp);
      fs.unlinkSync(png);
      console.log(`${t.name.padEnd(14)} ${code}  ${Math.round(fs.statSync(webp).size / 1024)}KB`);
    } catch (e) {
      console.log(`${t.name.padEnd(14)} FAIL ${String(e).split("\n")[0].slice(0, 80)}`);
    }
    await ctx.close();
  }
  await b.close();
})();
