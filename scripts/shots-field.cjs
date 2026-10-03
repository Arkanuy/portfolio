/**
 * Tangkapan + statistik untuk konsep FIELD.
 * Model tidak bisa melihat gambar, jadi setiap tangkapan diukur: tinta,
 * baris berisi, warna unik, dan SATURASI. Konsep ini memakai gambar nyata,
 * jadi saturasinya memang lebih tinggi dari versi monokrom — yang penting
 * angkanya terbaca, bukan "kelihatan bagus".
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "field", "shots");
fs.mkdirSync(OUT, { recursive: true });

function stats(file) {
  const buf = fs.readFileSync(file);
  let pos = 8, w = 0, h = 0, bitDepth = 8, colorType = 6;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (type === "IHDR") { w = buf.readUInt32BE(pos + 8); h = buf.readUInt32BE(pos + 12); bitDepth = buf[pos + 16]; colorType = buf[pos + 17]; }
    else if (type === "IDAT") idat.push(buf.subarray(pos + 8, pos + 8 + len));
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) return { w, h, error: "bitDepth " + bitDepth };
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[rp++];
    const line = raw.subarray(rp, rp + stride); rp += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[x] = v & 255;
    }
  }
  const bg = [out[0], out[1], out[2]];
  let ink = 0, satSum = 0, satN = 0, coloured = 0;
  const rows = new Int32Array(h);
  const uniq = new Set();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * stride + x * ch;
    const r = out[i], g = out[i + 1], bb = out[i + 2];
    const d = Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(bb - bg[2]);
    if (d > 36) { ink++; rows[y]++; }
    const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    satSum += sat; satN++;
    if (sat > 0.28) coloured++;
    if (uniq.size < 9000) uniq.add((r >> 3) * 4096 + (g >> 3) * 64 + (bb >> 3));
  }
  let rn = 0; for (let y = 0; y < h; y++) if (rows[y] > 0) rn++;
  return { w, h, inkPct: +((ink / (w * h)) * 100).toFixed(2), meanSaturation: +(satSum / satN).toFixed(3), saturatedPixelPct: +((coloured / (w * h)) * 100).toFixed(2), rowsWithContentPct: +((rn / h) * 100).toFixed(1), uniqueColors: uniq.size, kb: Math.round(buf.length / 1024) };
}

(async () => {
  const b = await chromium.launch();
  const shots = [
    { name: "hero-light", url: "/", w: 1440, h: 900, theme: "light" },
    { name: "hero-dark", url: "/", w: 1440, h: 900, theme: "dark" },
    { name: "home-full", url: "/", w: 1440, h: 900, theme: "light", full: true },
    { name: "home-mobile", url: "/", w: 390, h: 844, theme: "light", full: true },
    { name: "work", url: "/karya/", w: 1440, h: 900, theme: "light", full: true },
    { name: "case-study", url: "/karya/mafiablox/", w: 1440, h: 900, theme: "light", full: true },
    { name: "services", url: "/layanan/", w: 1440, h: 900, theme: "light" },
    { name: "about", url: "/tentang/", w: 1440, h: 900, theme: "dark" },
    { name: "history", url: "/riwayat/", w: 1440, h: 900, theme: "light" },
    { name: "contact", url: "/kontak/", w: 1440, h: 900, theme: "light" },
  ];
  const rep = [];
  for (const s of shots) {
    const ctx = await b.newContext({ viewport: { width: s.w, height: s.h } });
    const p = await ctx.newPage();
    await p.addInitScript((t) => localStorage.setItem("theme", t), s.theme);
    await p.goto(BASE + s.url, { waitUntil: "networkidle" });
    await p.waitForTimeout(2600);
    const file = path.join(OUT, s.name + ".png");
    await p.screenshot({ path: file, fullPage: !!s.full });
    const st = stats(file);
    rep.push({ name: s.name, url: s.url, ...st });
    console.log(s.name.padEnd(14), JSON.stringify(st));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(rep, null, 2));
  const susp = rep.filter((r) => r.inkPct < 1 || r.rowsWithContentPct < 10 || r.uniqueColors < 20);
  console.log(`\n${rep.length} screenshots · ${susp.length} suspicious`);
  if (susp.length) console.log(JSON.stringify(susp, null, 1));
  await b.close();
  process.exit(susp.length ? 1 : 0);
})();
