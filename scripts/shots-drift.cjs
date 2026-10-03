/**
 * BUKTI VISUAL + STATISTIK GAMBAR
 *
 * Model tidak bisa melihat gambar, jadi setiap tangkapan diukur dengan kode:
 * rasio piksel "tinta", baris yang berisi, dan persentase terang. Tangkapan
 * yang hampir kosong atau nyaris satu warna akan langsung ketahuan.
 *
 * Ditambah: pergerakan nyata diukur pada dua posisi gulir supaya tangkapan
 * bukan satu-satunya bukti.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "drift", "shots");
fs.mkdirSync(OUT, { recursive: true });

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
      const cc = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - cc;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - cc);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : cc;
      }
      cur[x] = v & 255;
    }
  }
  const bg = [out[0], out[1], out[2]];
  let ink = 0;
  let bright = 0;
  const rows = new Int32Array(h);
  const uniq = new Set();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * stride + x * ch;
      const d = Math.abs(out[i] - bg[0]) + Math.abs(out[i + 1] - bg[1]) + Math.abs(out[i + 2] - bg[2]);
      if (d > 36) {
        ink++;
        rows[y]++;
      }
      const lum = 0.2126 * out[i] + 0.7152 * out[i + 1] + 0.0722 * out[i + 2];
      if (lum > 140) bright++;
      if (uniq.size < 5000) uniq.add((out[i] >> 3) * 4096 + (out[i + 1] >> 3) * 64 + (out[i + 2] >> 3));
    }
  }
  let rowNonEmpty = 0;
  for (let y = 0; y < h; y++) if (rows[y] > 0) rowNonEmpty++;
  return {
    w,
    h,
    inkPct: +((ink / (w * h)) * 100).toFixed(2),
    brightPct: +((bright / (w * h)) * 100).toFixed(2),
    rowsWithContentPct: +((rowNonEmpty / h) * 100).toFixed(1),
    uniqueColors: uniq.size,
    kb: Math.round(buf.length / 1024),
  };
}

(async () => {
  const browser = await chromium.launch();
  const shots = [
    { name: "hero-desktop", url: "/", w: 1440, h: 900, theme: "dark", full: false },
    { name: "hero-light", url: "/", w: 1440, h: 900, theme: "light", full: false },
    { name: "home-full", url: "/", w: 1440, h: 900, theme: "dark", full: true },
    { name: "home-mobile", url: "/", w: 390, h: 844, theme: "dark", full: true },
    { name: "work", url: "/karya/", w: 1440, h: 900, theme: "dark", full: false },
    { name: "services", url: "/layanan/", w: 1440, h: 900, theme: "dark", full: false },
    { name: "about", url: "/tentang/", w: 1440, h: 900, theme: "dark", full: false },
    { name: "case-study", url: "/karya/mafiablox/", w: 1440, h: 900, theme: "dark", full: false },
    { name: "contact", url: "/kontak/", w: 1440, h: 900, theme: "light", full: false },
    { name: "history", url: "/riwayat/", w: 1440, h: 900, theme: "dark", full: false },
  ];

  const report = [];
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
    const p = await ctx.newPage();
    await p.addInitScript((t) => localStorage.setItem("theme", t), s.theme);
    await p.goto(BASE + s.url, { waitUntil: "networkidle" });
    await p.waitForTimeout(1400);
    if (s.full) {
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += Math.round(innerHeight * 0.7)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 180));
        }
        window.scrollTo(0, 0);
      });
      await p.waitForTimeout(900);
    }
    const file = path.join(OUT, s.name + ".png");
    await p.screenshot({ path: file, fullPage: !!s.full });
    report.push({ name: s.name, url: s.url, vw: s.w, theme: s.theme, ...pngStats(file) });
    console.log(s.name.padEnd(16), JSON.stringify(report[report.length - 1]));
    await ctx.close();
  }

  /* pergerakan nyata: bukti angka, bukan cuma gambar */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.addStyleTag({ content: ".field__grain,.field__orb,.hd__orb,.ticks__row{animation:none!important}" });
  const read = () =>
    p.evaluate(() =>
      Array.from(document.querySelectorAll("[data-dp]")).map((el) => Number(el.dataset.dp || 0)),
    );
  const samples = {};
  for (const y of [0, 400, 900, 1500]) {
    await p.evaluate((n) => window.scrollTo(0, n), y);
    await p.waitForTimeout(380);
    samples[y] = await read();
  }
  const speeds = await p.evaluate(() =>
    Array.from(new Set(Array.from(document.querySelectorAll("[data-dp]")).map((e) => Number(e.dataset.dp)))),
  );
  fs.writeFileSync(path.join(OUT, "..", "motion-samples.json"), JSON.stringify({ speeds, samples }, null, 2));

  fs.writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(report, null, 2));
  const suspicious = report.filter((r) => r.inkPct < 1.2 || r.rowsWithContentPct < 12 || r.uniqueColors < 24);
  console.log(`\n${report.length} screenshots · ${suspicious.length} suspicious (flat or near-empty)`);
  if (suspicious.length) console.log(JSON.stringify(suspicious, null, 1));
  await browser.close();
  process.exit(suspicious.length ? 1 : 0);
})();
