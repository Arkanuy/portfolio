/**
 * Poster rekam jejak: PNG plate -> WebP.
 *
 * Kenapa: enam plate 103-118 KB = ~660 KB di lembar depan, dan itu LCP +
 * jank. Ketebalan garis poster memang membengkakkan PNG. WebP dengan effort
 * tinggi turun ke ~20-25 KB per berkas tanpa terlihat bedanya (plate-nya
 * blok warna datar + garis, justru kasus terbaik untuk WebP lossy).
 *
 * CATATAN: sumber aslinya 1200px. Jangan pernah "upscale" untuk terlihat
 * lebih tajam — itu menambah byte tanpa menambah detail. Resolusi asli
 * dilaporkan apa adanya.
 */
const sharp = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/sharp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "public", "projects");

(async () => {
  let before = 0;
  let after = 0;
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith(".png")) continue;
    const src = path.join(DIR, f);
    const out = path.join(DIR, f.replace(/\.png$/, ".webp"));
    const meta = await sharp(src).metadata();
    const b = fs.statSync(src).size;
    await sharp(src).webp({ quality: 82, effort: 6 }).toFile(out);
    const a = fs.statSync(out).size;
    before += b;
    after += a;
    console.log(`${f.replace(/\.png$/, ".webp").padEnd(34)} ${meta.width}x${meta.height}  ${Math.round(b / 1024)}KB -> ${Math.round(a / 1024)}KB`);
    fs.unlinkSync(src);
  }
  console.log(`\ntotal: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB (${Math.round((1 - after / before) * 100)}% smaller)`);
})();
