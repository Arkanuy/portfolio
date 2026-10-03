/**
 * VERIFIKASI "BROWSE"
 * ===================
 * Konsep ini memakai bahasa desain referensi (threeui.com): katalog dua kolom,
 * panel spesifikasi, pratinjau, langkah bernomor. Jadi yang diuji:
 *
 *   1. STRUKTUR KATALOGNYA ADA — sidebar daftar + panel kanan, dan memilih
 *      catatan benar-benar mengganti panel (nama, spesifikasi, langkah).
 *   2. SPESIFIKASINYA DARI DATA — jumlah properti cocok dengan jumlah bagian
 *      yang dibangun + field tetap; bukan angka karangan.
 *   3. PRATINJAU & DIAGRAM dua-duanya jalan.
 *   4. ANTI-SLOP = NOL. Ini yang paling penting: konsep sebelumnya mati karena
 *      grid kecil terbaca sebagai noise. Jadi gate menuntut nol blur, nol
 *      gradien dekoratif, nol glow, nol radius besar, nol shadow berwarna.
 *   5. AMAN: tanpa JS panel pertama tetap lengkap; reduced-motion tidak
 *      menyembunyikan apa pun.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4392";
const OUT = path.join(__dirname, "..", "evidence", "browse");
fs.mkdirSync(OUT, { recursive: true });

const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const pages = ["/", "/karya/", "/layanan/", "/tentang/", "/riwayat/", "/kontak/",
  "/layanan/business-systems/", "/layanan/web/", "/layanan/analysis/", "/layanan/automation/",
  "/karya/mafiablox/", "/karya/pixwatch/", "/karya/buildplan/", "/karya/aplikasi-solusi-bisnis/",
  "/karya/rollerskool/", "/karya/tasty-food/", "/karya/website-sekolah/"];

const lum = (c) => { const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

(async () => {
  const browser = await chromium.launch();
  const report = {};

  /* ============ 1. rute + error ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [], failed = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));
    p.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text().slice(0, 140)));
    p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
    const status = {};
    for (const u of pages) {
      const res = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 25000 });
      status[u] = res ? res.status() : 0;
    }
    check("17 rute balas 200", Object.values(status).every((s) => s === 200), { bad: Object.entries(status).filter(([, s]) => s !== 200) });
    check("tanpa error halaman/konsol", errs.length === 0, { errs: errs.slice(0, 3) });
    check("tanpa 4xx/5xx", failed.length === 0, { failed: failed.slice(0, 3) });
    report.status = status;
    await ctx.close();
  }

  /* ============ 2. STRUKTUR KATALOG ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);

    const layout = await p.evaluate(() => {
      const side = document.querySelector(".side");
      const doc = document.querySelector(".doc");
      const cat = document.querySelector(".cat");
      return {
        adaKatalog: !!cat,
        kolom: cat ? getComputedStyle(cat).gridTemplateColumns : null,
        itemSidebar: document.querySelectorAll(".nav-item").length,
        adaPanel: !!doc,
        judul: document.querySelector(".intro__t")?.textContent?.trim() || "",
        adaPratinjau: !!document.querySelector(".demo__shot"),
        adaTabel: document.querySelectorAll(".spec .tbl tbody tr").length,
        adaLangkah: document.querySelectorAll(".steps .step").length,
        adaIntegritas: document.querySelectorAll(".keep").length,
        adaChips: document.querySelectorAll(".chip").length,
      };
    });

    check("tata letak katalog dua kolom (sidebar + panel)", !!layout.adaKatalog && !!layout.adaPanel, { kolom: layout.kolom });
    check("sidebar memuat semua catatan", layout.itemSidebar >= 7, { item: layout.itemSidebar });
    check("panel menampilkan judul, pratinjau, tabel, langkah, integritas",
      layout.judul.length > 0 && layout.adaPratinjau && layout.adaTabel >= 5 && layout.adaLangkah >= 1 && layout.adaIntegritas >= 1,
      { judul: layout.judul.slice(0, 30), baris: layout.adaTabel, langkah: layout.adaLangkah, integritas: layout.adaIntegritas });
    check("ada chip status/konteks", layout.adaChips >= 3, { chips: layout.adaChips });

    /* memilih catatan lain mengganti panel */
    const before = layout.judul;
    await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".nav-item"));
      items[3]?.click();
    });
    await p.waitForTimeout(800);
    const after = await p.evaluate(() => ({
      judul: document.querySelector(".intro__t")?.textContent?.trim() || "",
      on: Array.from(document.querySelectorAll(".nav-item")).findIndex((b) => b.dataset.on === "true"),
      baris: document.querySelectorAll(".spec .tbl tbody tr").length,
      langkah: document.querySelectorAll(".steps .step").length,
      chip: Array.from(document.querySelectorAll(".chip")).map((c) => c.textContent.trim()).slice(0, 3),
    }));
    check("memilih catatan mengganti panel", after.judul !== before && after.judul.length > 0, { dulu: before.slice(0, 26), kini: after.judul.slice(0, 26) });
    check("penanda aktif ikut berpindah", after.on === 3, { aktif: after.on });
    check("spesifikasi & langkah ikut berubah", after.baris >= 5 && after.langkah >= 1, { baris: after.baris, langkah: after.langkah });

    /* tombol angka keyboard: cari catatan ke-N berdasarkan NO-nya, bukan
       berdasarkan urutan di sidebar (sidebar dikelompokkan per status, jadi
       urutannya beda dari urutan records). */
    const target = await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".nav-item"));
      const idx = items.findIndex((b) => b.querySelector(".nav-item__n")?.textContent?.trim() === "06");
      items[idx]?.click();
      return { idx, no: items[idx]?.querySelector(".nav-item__n")?.textContent?.trim() };
    });
    await p.waitForTimeout(700);
    const kb = await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".nav-item"));
      const i = items.findIndex((b) => b.dataset.on === "true");
      return { idx: i, no: items[i]?.querySelector(".nav-item__n")?.textContent?.trim() };
    });
    check("memilih catatan lewat daftar berfungsi", target.idx >= 0 && kb.idx === target.idx, { target, kb });

    /* spesifikasi benar-benar dari data: jumlah bagian di chip == jumlah langkah */
    const konsisten = await p.evaluate(() => {
      const chips = Array.from(document.querySelectorAll(".chip")).map((c) => c.textContent.trim());
      const bagian = chips.find((c) => /bagian$/.test(c)) || "";
      const n = parseInt(bagian, 10);
      const langkah = document.querySelectorAll(".steps .step").length;
      return { bagian, n, langkah };
    });
    check("jumlah 'bagian' di chip cocok dengan jumlah langkah", konsisten.n === konsisten.langkah, konsisten);

    /* pratinjau <-> diagram */
    await p.evaluate(() => {
      const seg = document.querySelectorAll(".demo__seg button");
      seg[1]?.click();
    });
    await p.waitForTimeout(600);
    const bp = await p.evaluate(() => ({
      node: document.querySelectorAll(".bp__node").length,
      shot: !!document.querySelector(".demo__shot"),
    }));
    check("tampilan diagram menampilkan alur, bukan gambar", bp.node >= 1 && !bp.shot, bp);

    report.layout = layout;
    await ctx.close();
  }

  /* ============ 3. ANTI-SLOP ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const found = { backdrop: [], gradient: [], glow: [], bigRadius: [], orbs: [] };
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(160);
      const r = await p.evaluate(() => {
        const out = { backdrop: [], gradient: [], glow: [], bigRadius: [], orbs: [] };
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const cs = getComputedStyle(el);
          const id = el.tagName + "." + (el.className || "").toString().split(" ")[0].slice(0, 20);
          if (cs.backdropFilter && cs.backdropFilter !== "none") out.backdrop.push(id);
          const bi = cs.backgroundImage || "none";
          /* gradien linear DIPAKAI untuk scrim tipis; yang dilarang gradien
             dekoratif. Gate menghitung yang jelas dekoratif: banyak warna stop. */
          if (bi.includes("gradient")) {
            const stops = (bi.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)/gi) || []).length;
            if (stops >= 3) out.gradient.push(id + " stops=" + stops);
          }
          const sh = cs.boxShadow || "";
          if (sh && sh !== "none" && !/rgba?\(0,\s*0,\s*0/.test(sh) && !/inset/.test(sh)) out.glow.push(id);
          const raw = cs.borderTopLeftRadius, isPct = raw.endsWith("%"), rad = parseFloat(raw) || 0;
          const w = el.getBoundingClientRect().width;
          if (!isPct && rad > 14) out.bigRadius.push(id + " r=" + rad);
          if ((parseFloat(cs.width) || 0) > 0 && rad >= 999 && w > 40 && el.getBoundingClientRect().height > 40) out.orbs.push(id);
        }
        return out;
      });
      for (const k of Object.keys(found)) if (r[k].length) found[k].push({ u, n: r[k].length, ex: r[k].slice(0, 2) });
    }
    const flat = (k, label) => check(`nol ${label} di 17 rute`, found[k].length === 0, { pelanggar: found[k].slice(0, 2) });
    flat("backdrop", "backdrop-filter (kaca)");
    flat("gradient", "gradien dekoratif (>=3 stop)");
    flat("glow", "glow berwarna");
    flat("bigRadius", "radius > 14px");
    flat("orbs", "bulatan besar");
    report.tells = found;
    await ctx.close();
  }

  /* ============ 4. AMAN: tanpa JS & reduced-motion ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => ({
      judul: document.querySelector(".intro__t")?.innerText?.trim() || "",
      item: document.querySelectorAll(".nav-item").length,
      tabel: document.querySelectorAll(".spec .tbl tbody tr").length,
      langkah: document.querySelectorAll(".steps .step").length,
      tersembunyi: Array.from(document.querySelectorAll("[data-rv]")).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length,
      len: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
    }));
    check("tanpa JS: panel pertama tetap lengkap", n.judul.length > 0 && n.tabel >= 5 && n.langkah >= 1, { judul: n.judul.slice(0, 26), tabel: n.tabel });
    check("tanpa JS: sidebar tetap memuat catatan", n.item >= 7, { item: n.item });
    check("tanpa JS: tidak ada yang tersembunyi", n.tersembunyi === 0 && n.len > 1400, { tersembunyi: n.tersembunyi, len: n.len });
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p2.waitForTimeout(500);
    const r = await p2.evaluate(() => ({
      tersembunyi: Array.from(document.querySelectorAll("[data-rv]")).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length,
      tabel: document.querySelectorAll(".spec .tbl tbody tr").length,
    }));
    check("reduced-motion: tidak ada yang tersembunyi", r.tersembunyi === 0 && r.tabel >= 5, r);
    await ctx2.close();
  }

  /* ============ 5. kontras dua tema ============ */
  {
    for (const theme of ["dark", "light"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const fails = [];
      for (const [u, vw] of [["/", 1440], ["/karya/", 1440], ["/layanan/", 1440], ["/tentang/", 1440], ["/riwayat/", 1440], ["/kontak/", 1440], ["/karya/mafiablox/", 1440], ["/", 390], ["/karya/", 390]]) {
        await p.setViewportSize({ width: vw, height: 900 });
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(300);
        const rows = await p.evaluate(() => {
          const parse = (s) => { if (!s) return null; const nums = (s.match(/[\d.]+/g) || []).map(Number); if (nums.length < 3) return null; const isC = s.startsWith("color("); const a = nums.length >= 4 ? nums[3] : 1; const sc = isC ? 255 : 1; return { c: [nums[0] * sc, nums[1] * sc, nums[2] * sc], a }; };
          const over = (t, b) => { const a = t.a + b.a * (1 - t.a); if (a === 0) return { c: [0, 0, 0], a: 0 }; return { c: t.c.map((v, i) => (v * t.a + b.c[i] * b.a * (1 - t.a)) / a), a }; };
          const bgOf = (el) => { const ch = []; let x = el; while (x && x.nodeType === 1) { ch.push(x); x = x.parentElement; } ch.reverse(); let acc = { c: [5, 6, 8], a: 1 }; for (const node of ch) { const bg = parse(getComputedStyle(node).backgroundColor); if (bg && bg.a > 0) acc = over(bg, acc); } return acc.c; };
          const out = [];
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const own = Array.from(el.childNodes).filter((nd) => nd.nodeType === 3 && nd.textContent.trim().length > 1);
            if (!own.length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (parseFloat(cs.opacity) < 0.4) continue;
            const fg = parse(cs.color); if (!fg) continue;
            out.push({ fg: fg.c, bg: bgOf(el), t: own[0].textContent.trim().slice(0, 22) });
          }
          return out;
        });
        for (const x of rows) { const cr = ratio(x.fg, x.bg); if (cr < 4.5) fails.push({ u, vw, cr: +cr.toFixed(2), t: x.t }); }
      }
      check(`kontras >= 4.5:1 (${theme})`, fails.length === 0, { jumlah: fails.length, contoh: fails.slice(0, 6) });
      await ctx.close();
    }
  }

  /* ============ 6. viewport + sentuh ============ */
  {
    for (const v of [{ w: 320, h: 720, n: "320" }, { w: 375, h: 780, n: "375" }, { w: 414, h: 800, n: "414" }, { w: 768, h: 900, n: "768" }, { w: 1280, h: 800, n: "1280" }, { w: 1920, h: 1080, n: "1920" }]) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
      const p = await ctx.newPage();
      const over = [];
      for (const u of ["/", "/karya/", "/tentang/", "/kontak/", "/karya/mafiablox/"]) {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(260);
        const r = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth, left: Math.round(document.documentElement.getBoundingClientRect().left) }));
        if (r.doc > r.win + 2 || r.left !== 0) over.push({ u, ...r });
      }
      check(`tanpa overflow horizontal @ ${v.n}px`, over.length === 0, { over: over.slice(0, 2) });
      if (v.w <= 640) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(400);
        const small = await p.evaluate(() =>
          Array.from(document.querySelectorAll(".btn, .bar__cta, .nav-item"))
            .filter((el) => { const b = el.getBoundingClientRect(); return b.height > 0 && b.height < 36; })
            .map((el) => el.className.toString().slice(0, 22) + " h=" + Math.round(el.getBoundingClientRect().height)),
        );
        check(`target sentuh >= 36px @ ${v.n}px`, small.length === 0, { small: small.slice(0, 4) });
      }
      await ctx.close();
    }
  }

  /* ============ 7. teks ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const glued = [], leaks = [];
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "networkidle" });
      await p.waitForTimeout(220);
      const r = await p.evaluate(() => {
        const it = (document.body.innerText || "").replace(/\s+/g, " ").trim();
        const emailish = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i;
        const sus = it.split(" ").filter((w) => !emailish.test(w) && !/https?:|github\.com|instagram\.com/i.test(w)).filter((w) => /[a-z]{16,}/.test(w) && !/-/.test(w) && !/^[A-Z]/.test(w)).slice(0, 4);
        return { len: it.length, sus };
      });
      if (r.len === 0) glued.push({ u, reason: "innerText kosong" });
      if (r.sus.length) glued.push({ u, sus: r.sus });
    }
    check("tanpa kata menempel", glued.length === 0, { glued: glued.slice(0, 3) });
    await ctx.close();
  }

  /* ============ 8. AKSEN DIPAKAI HEMAT ============
     Saturasi naif menyesatkan di latar near-black: abu #1e222a dihitung
     "berwarna" karena rumus HSV. Jadi yang diukur di sini: berapa persen
     piksel yang benar-benar memakai warna sinyal (lime/cyan), dari tangkapan.
     Konsep sebelumnya mati karena terlalu banyak elemen bersinyal. */
  {
    const shotsDir = path.join(OUT, "shots");
    if (fs.existsSync(shotsDir)) {
      const zlib2 = require("zlib");
      const read = (file) => {
        const buf = fs.readFileSync(file);
        let pos = 8, w = 0, h = 0, bd = 8, ct = 6;
        const idat = [];
        while (pos < buf.length) {
          const len = buf.readUInt32BE(pos);
          const type = buf.toString("ascii", pos + 4, pos + 8);
          if (type === "IHDR") { w = buf.readUInt32BE(pos + 8); h = buf.readUInt32BE(pos + 12); bd = buf[pos + 16]; ct = buf[pos + 17]; }
          else if (type === "IDAT") idat.push(buf.subarray(pos + 8, pos + 8 + len));
          else if (type === "IEND") break;
          pos += 12 + len;
        }
        if (bd !== 8) return null;
        const ch = ct === 6 ? 4 : ct === 2 ? 3 : 1;
        return { w, h, ch, raw: zlib2.inflateSync(Buffer.concat(idat)) };
      };
      const worst = [];
      for (const f of fs.readdirSync(shotsDir)) {
        if (!f.endsWith(".png")) continue;
        const im = read(path.join(shotsDir, f));
        if (!im) continue;
        const { w, h, ch, raw } = im;
        const stride = w * ch;
        const out = Buffer.alloc(h * stride);
        let rp = 0;
        for (let y = 0; y < h; y++) {
          const fl = raw[rp++];
          const line = raw.subarray(rp, rp + stride);
          rp += stride;
          const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
          const cur = out.subarray(y * stride, (y + 1) * stride);
          for (let x = 0; x < stride; x++) {
            const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0;
            let v = line[x];
            if (fl === 1) v += a; else if (fl === 2) v += b; else if (fl === 3) v += (a + b) >> 1;
            else if (fl === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
            cur[x] = v & 255;
          }
        }
        let accent = 0, total = 0;
        for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
          const i = y * stride + x * ch;
          const r = out[i], g = out[i + 1], b = out[i + 2];
          if (g > 150 && g > b + 60 && r > 120 && b < 150) accent++;
          total++;
        }
        worst.push({ f: f.replace(".png", ""), accentPct: +((accent / total) * 100).toFixed(2) });
      }
      worst.sort((a, b) => b.accentPct - a.accentPct);
      const over = worst.filter((x) => x.accentPct > 6);
      check("aksen dipakai hemat (< 6% piksel di semua halaman)", over.length === 0 && worst.length > 0, { tertinggi: worst.slice(0, 3), over });
    } else {
      check("tangkapan tersedia untuk mengukur aksen", false, { shotsDir });
    }
  }

  report.summary = { pass: ok.length, fail: bad.length };
  report.failures = bad;
  fs.writeFileSync(path.join(OUT, "verify.json"), JSON.stringify(report, null, 2));
  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 240)));
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
