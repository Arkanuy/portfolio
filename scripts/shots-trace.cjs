/**
 * BUKTI VISUAL + STATISTIK GAMBAR
 *
 * Model tidak bisa melihat gambar, jadi setiap tangkapan diukur dengan kode:
 * rasio piksel "tinta" (bukan latar), jumlah baris yang punya isi, dan tinggi
 * halaman. Tangkapan yang hampir kosong akan langsung ketahuan dari angka.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "trace", "shots");
fs.mkdirSync(OUT, { recursive: true });

/** Baca PNG (RGBA) tanpa pustaka luar: pakai zlib untuk IDAT + unfilter. */
function pngStats(file) {
  const buf = fs.readFileSync(file);
  let pos = 8;
  let w = 0;
  let h = 0;
  let bitDepth = 8;
  let colorType = 6;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (type === "IHDR") {
      w = buf.readUInt32BE(pos + 8);
      h = buf.readUInt32BE(pos + 12);
      bitDepth = buf[pos + 16];
      colorType = buf[pos + 17];
    } else if (type === "IDAT") idat.push(buf.subarray(pos + 8, pos + 8 + len));
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) return { w, h, error: "bitDepth " + bitDepth };
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 4;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = raw.subarray(rp, rp + stride);
    rp += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0;
      const b = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 255;
    }
  }
  // latar = warna piksel pojok kiri atas; tinta = piksel yang menyimpang jauh
  const bg = [out[0], out[1], out[2]];
  let ink = 0;
  let dark = 0;
  const rows = new Int32Array(h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * stride + x * ch;
      const d = Math.abs(out[i] - bg[0]) + Math.abs(out[i + 1] - bg[1]) + Math.abs(out[i + 2] - bg[2]);
      if (d > 36) {
        ink++;
        rows[y]++;
      }
      if (out[i] < 120) dark++;
    }
  }
  let rowMax = 0;
  let rowNonEmpty = 0;
  for (let y = 0; y < h; y++) {
    if (rows[y] > 0) {
      rowNonEmpty++;
      rowMax = Math.max(rowMax, rows[y]);
    }
  }
  return {
    w,
    h,
    inkPct: +((ink / (w * h)) * 100).toFixed(2),
    darkPct: +((dark / (w * h)) * 100).toFixed(2),
    rowsWithContentPct: +((rowNonEmpty / h) * 100).toFixed(1),
    kb: Math.round(buf.length / 1024),
  };
}

(async () => {
  const browser = await chromium.launch();
  const shots = [
    { name: "folio-desktop", url: "/", w: 1440, h: 900, theme: "light", full: false },
    { name: "folio-full", url: "/", w: 1440, h: 900, theme: "light", full: true },
    { name: "folio-dark", url: "/", w: 1440, h: 900, theme: "dark", full: false },
    { name: "folio-mobile", url: "/", w: 390, h: 844, theme: "light", full: true },
    { name: "records", url: "/karya/", w: 1440, h: 900, theme: "light", full: false },
    { name: "case-study", url: "/karya/mafiablox/", w: 1440, h: 900, theme: "light", full: false },
    { name: "method", url: "/tentang/", w: 1440, h: 900, theme: "light", full: false },
    { name: "trace-off", url: "/", w: 1440, h: 900, theme: "light", full: false, traceOff: true },
    { name: "panel-claim-2", url: "/", w: 1440, h: 900, theme: "light", full: false, claim: 1 },
    { name: "mobile-records", url: "/karya/", w: 390, h: 844, theme: "light", full: true },
  ];

  const report = [];
  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: 1,
    });
    const p = await ctx.newPage();
    await p.addInitScript((t) => localStorage.setItem("theme", t), s.theme);
    await p.goto(BASE + s.url, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    if (s.traceOff) {
      await p.locator(".traceOnBtn").click();
      await p.waitForTimeout(450);
    }
    if (s.claim !== undefined) {
      await p.locator(".claim").nth(s.claim).click();
      await p.waitForTimeout(450);
    }
    const file = path.join(OUT, s.name + ".png");
    await p.screenshot({ path: file, fullPage: !!s.full });
    const st = pngStats(file);
    report.push({ name: s.name, url: s.url, vw: s.w, theme: s.theme, ...st });
    console.log(s.name.padEnd(16), JSON.stringify(st));
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(report, null, 2));
  const suspicious = report.filter((r) => r.inkPct < 1.2 || r.rowsWithContentPct < 12);
  console.log(`\n${report.length} screenshots · ${suspicious.length} suspicious (ink < 1.2% or content rows < 12%)`);
  if (suspicious.length) console.log(JSON.stringify(suspicious, null, 1));
  await browser.close();
  process.exit(suspicious.length ? 1 : 0);
})();