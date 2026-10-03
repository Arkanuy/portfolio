/**
 * VERIFIKASI "PUNCH"
 * ==================
 * yang diuji, berurutan kepentingannya:
 *
 *   1. LUBANGNYA ADALAH DATA. Kalau lubangnya acak, konsepnya runtuh jadi
 *      hiasan. Jadi: kartu yang berbeda WAJIB punya pola berbeda, kartu yang
 *      sama WAJIB deterministik, dan jumlah lubang harus bisa dihitung dari
 *      aturan di lib/punch.ts.
 *   2. MEKANISME MESINNYA ADA: kepala pembaca menyapu kolom saat menggulir,
 *      kolom yang dilewati menyala, memilih kartu MENGANGKATNYA, dan area
 *      cetak menampilkan kartu yang sedang diangkat.
 *   3. ANTI-SLOP = NOL (orb, gradien, kaca, shadow, radius besar, glow).
 *   4. AMAN: tanpa JS semua kartu tetap tergambar; reduced-motion tidak
 *      menyembunyikan apa pun.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4391";
const OUT = path.join(__dirname, "..", "evidence", "punch");
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

  /* ============ 2. LUBANG = DATA ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(700);

    const cards = await p.evaluate(() =>
      Array.from(document.querySelectorAll(".card")).map((c) => {
        const rects = Array.from(c.querySelectorAll(".field__col rect"));
        return {
          title: c.querySelector(".card__title")?.textContent?.trim() || "",
          cols: c.querySelectorAll(".field__col").length,
          holes: rects.length,
          signature: rects.map((r) => `${Math.round(Number(r.getAttribute("x")))}:${Math.round(Number(r.getAttribute("y")))}`).join("|"),
          label: c.querySelector("svg")?.getAttribute("aria-label") || "",
        };
      }),
    );

    check("setiap catatan tergambar sebagai satu kartu", cards.length >= 7, { cards: cards.length });
    check("setiap kartu punya banyak kolom terisi (>= 60)", cards.every((c) => c.cols >= 60), { cols: cards.map((c) => c.cols) });

    const sigs = new Set(cards.map((c) => c.signature));
    check("kartu yang berbeda punya pola lubang BERBEDA", sigs.size === cards.length, { unik: sigs.size, kartu: cards.length });

    const counts = cards.map((c) => c.holes);
    /* Yang penting bukan "semua berbeda" (dua catatan bisa kebetulan sama
     panjangnya), tapi "tidak seragam" — kepadatan pola harus mengikuti data. */
    check("kepadatan lubang bervariasi mengikuti data (>=3 nilai berbeda)", new Set(counts).size >= 3, { counts });

    check("setiap kartu punya label aria yang menyebut jumlah lubang", cards.every((c) => /\d+ lubang/.test(c.label)), { contoh: cards[0]?.label });

    /* deterministik: muat ulang, pola harus sama */
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForTimeout(600);
    const again = await p.evaluate(() =>
      Array.from(document.querySelectorAll(".card")).map((c) =>
        Array.from(c.querySelectorAll(".field__col rect")).map((r) => `${Math.round(Number(r.getAttribute("x")))}:${Math.round(Number(r.getAttribute("y")))}`).join("|"),
      ),
    );
    check("pola lubang deterministik (sama setelah muat ulang)", again.join("#") === cards.map((c) => c.signature).join("#"), { sama: again.length === cards.length });

    /* legenda: tiap lubang yang berarti dijelaskan */
    const legend = await p.evaluate(() => Array.from(document.querySelectorAll(".code__r")).map((e) => e.innerText.replace(/\s+/g, " ").trim()));
    check("area cetak menjelaskan cara membaca lubang", legend.length >= 4, { legend: legend.slice(0, 5) });

    report.cards = cards.map((c) => ({ title: c.title, cols: c.cols, holes: c.holes }));
    await ctx.close();
  }

  /* ============ 3. MEKANISME MESIN ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(700);

    /* 3a. kepala pembaca bergerak saat menggulir */
    const readX = () =>
      p.evaluate(() => {
        const r = document.querySelector(".reader");
        return r ? parseFloat(getComputedStyle(r).getPropertyValue("--x")) || 0 : null;
      });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    const x1 = await readX();
    await p.evaluate(() => window.scrollTo(0, 900));
    await p.waitForTimeout(600);
    const x2 = await readX();
    await p.evaluate(() => window.scrollTo(0, 2000));
    await p.waitForTimeout(600);
    const x3 = await readX();
    check("kepala pembaca bergerak mengikuti gulir", x1 !== null && (x2 - x1 > 20 || x3 - x2 > 20), { x1, x2, x3 });

    /* 3b. kolom yang dilewati menyala, dan berpindah */
    const litAt = async (y) => {
      await p.evaluate((n) => window.scrollTo(0, n), y);
      await p.waitForTimeout(600);
      return p.evaluate(() =>
        Array.from(document.querySelectorAll(".field__col")).filter((g) => g.dataset.lit === "true").map((g) => Number(g.dataset.col)),
      );
    };
    const l1 = await litAt(600);
    const l2 = await litAt(1600);
    check("kolom yang dilewati menyala", l1.length > 0, { kolomMenyala: l1.slice(0, 6) });
    check("kolom yang menyala berpindah saat menggulir", l1.join(",") !== l2.join(","), { dulu: l1.slice(0, 3), kini: l2.slice(0, 3) });

    /* 3c. memilih kartu mengangkatnya + area cetak ikut berubah */
    const before = await p.evaluate(() => ({
      lifted: Array.from(document.querySelectorAll(".card")).findIndex((c) => c.dataset.lifted === "true"),
      print: document.querySelector(".print__t")?.textContent?.trim() || "",
    }));
    const picked = await p.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".card"));
      const target = cards[3];
      target?.querySelector(".card__pick")?.click();
      return cards[3]?.querySelector(".card__title")?.textContent?.trim() || "";
    });
    await p.waitForTimeout(900);
    const after = await p.evaluate(() => ({
      lifted: Array.from(document.querySelectorAll(".card")).findIndex((c) => c.dataset.lifted === "true"),
      print: document.querySelector(".print__t")?.textContent?.trim() || "",
    }));
    check("memilih kartu mengangkatnya dari tumpukan", before.lifted !== after.lifted && after.lifted === 3, { before: before.lifted, after: after.lifted, dipilih: picked });
    check("area cetak menampilkan kartu yang diangkat", after.print === picked && after.print !== before.print, { cetak: after.print.slice(0, 40) });

    /* 3d. tombol angka keyboard memilih kartu */
    await p.keyboard.press("5");
    await p.waitForTimeout(700);
    const kb = await p.evaluate(() => Array.from(document.querySelectorAll(".card")).findIndex((c) => c.dataset.lifted === "true"));
    check("tombol angka 1–7 memilih kartu", kb === 4, { lifted: kb });

    await ctx.close();
  }

  /* ============ 4. ANTI-SLOP: SEMUA NOL ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const found = { backdrop: [], filter: [], shadow: [], gradient: [], clipText: [], bigRadius: [], glow: [], circles: [] };
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(140);
      const r = await p.evaluate(() => {
        const out = { backdrop: [], filter: [], shadow: [], gradient: [], clipText: [], bigRadius: [], glow: [], circles: [] };
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const cs = getComputedStyle(el);
          const id = el.tagName + "." + (el.className || "").toString().split(" ")[0].slice(0, 20);
          if (cs.backdropFilter && cs.backdropFilter !== "none") out.backdrop.push(id);
          if (cs.filter && cs.filter !== "none") out.filter.push(id);
          const sh = cs.boxShadow || "";
          if (sh && sh !== "none") { out.shadow.push(id); if (!/rgba?\(0,\s*0,\s*0/.test(sh)) out.glow.push(id); }
          if ((cs.backgroundImage || "").includes("gradient")) out.gradient.push(id);
          if (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text") out.clipText.push(id);
          const raw = cs.borderTopLeftRadius, isPct = raw.endsWith("%"), rad = parseFloat(raw) || 0;
          const w = el.getBoundingClientRect().width;
          if (!isPct && rad > 14 && !(rad >= 999 && w <= 40)) out.bigRadius.push(id);
          if (!isPct && rad >= 999 && w > 40) out.circles.push(id);
        }
        return out;
      });
      for (const k of Object.keys(found)) if (r[k].length) found[k].push({ u, n: r[k].length, ex: r[k].slice(0, 2) });
    }
    const flat = (k, label) => check(`nol ${label} di 17 rute`, found[k].length === 0, { pelanggar: found[k].slice(0, 2) });
    flat("backdrop", "backdrop-filter (kaca)");
    flat("filter", "CSS filter (blur/glow)");
    flat("shadow", "box-shadow");
    flat("gradient", "latar gradien");
    flat("clipText", "teks gradien");
    flat("bigRadius", "radius > 14px");
    flat("glow", "glow berwarna");
    flat("circles", "lingkaran besar (orb)");
    report.tells = found;
    await ctx.close();
  }

  /* ============ 5. AMAN: tanpa JS & reduced-motion ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => {
      const svg = document.querySelector("svg.field__grid");
      const rects = document.querySelectorAll(".field__col rect");
      const hidden = Array.from(document.querySelectorAll(".card, .print, .sec")).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length;
      return {
        kartu: document.querySelectorAll(".card").length,
        lubang: rects.length,
        svgAda: !!svg,
        hidden,
        len: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
        judul: (document.querySelector("h1")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 60),
      };
    });
    check("tanpa JS: semua kartu tetap tergambar", n.kartu >= 7 && n.lubang > 400 && n.svgAda, { kartu: n.kartu, lubang: n.lubang });
    check("tanpa JS: tidak ada elemen tersembunyi", n.hidden === 0, { hidden: n.hidden });
    check("tanpa JS: teks utuh", n.len > 1400 && /Perangkat lunak/.test(n.judul), { len: n.len, judul: n.judul });
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p2.waitForTimeout(500);
    const r = await p2.evaluate(() => ({
      kartu: document.querySelectorAll(".card").length,
      tersembunyi: Array.from(document.querySelectorAll(".card, .sec, .print")).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length,
      lubang: document.querySelectorAll(".field__col rect").length,
    }));
    check("reduced-motion: kartu & lubang tetap tampil", r.tersembunyi === 0 && r.kartu >= 7 && r.lubang > 400, r);
    await ctx2.close();
  }

  /* ============ 6. kontras dua tema ============ */
  {
    for (const theme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const fails = [];
      for (const [u, vw] of [["/", 1440], ["/karya/", 1440], ["/layanan/", 1440], ["/tentang/", 1440], ["/riwayat/", 1440], ["/kontak/", 1440], ["/karya/mafiablox/", 1440], ["/", 390], ["/karya/", 390]]) {
        await p.setViewportSize({ width: vw, height: 900 });
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(280);
        const rows = await p.evaluate(() => {
          const parse = (s) => { if (!s) return null; const nums = (s.match(/[\d.]+/g) || []).map(Number); if (nums.length < 3) return null; const isC = s.startsWith("color("); const a = nums.length >= 4 ? nums[3] : 1; const sc = isC ? 255 : 1; return { c: [nums[0] * sc, nums[1] * sc, nums[2] * sc], a }; };
          const over = (t, b) => { const a = t.a + b.a * (1 - t.a); if (a === 0) return { c: [0, 0, 0], a: 0 }; return { c: t.c.map((v, i) => (v * t.a + b.c[i] * b.a * (1 - t.a)) / a), a }; };
          const bgOf = (el) => { const ch = []; let x = el; while (x && x.nodeType === 1) { ch.push(x); x = x.parentElement; } ch.reverse(); let acc = { c: [255, 255, 255], a: 1 }; for (const node of ch) { const bg = parse(getComputedStyle(node).backgroundColor); if (bg && bg.a > 0) acc = over(bg, acc); } return acc.c; };
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
      check(`kontras >= 4.5:1 (${theme})`, fails.length === 0, { jumlah: fails.length, contoh: fails.slice(0, 5) });
      await ctx.close();
    }
  }

  /* ============ 7. viewport + sentuh ============ */
  {
    for (const v of [{ w: 320, h: 720, n: "320" }, { w: 375, h: 780, n: "375" }, { w: 414, h: 800, n: "414" }, { w: 768, h: 900, n: "768" }, { w: 1280, h: 800, n: "1280" }, { w: 1920, h: 1080, n: "1920" }]) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
      const p = await ctx.newPage();
      const over = [];
      for (const u of ["/", "/karya/", "/tentang/", "/kontak/", "/karya/mafiablox/"]) {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(240);
        const r = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth, left: Math.round(document.documentElement.getBoundingClientRect().left) }));
        if (r.doc > r.win + 2 || r.left !== 0) over.push({ u, ...r });
      }
      check(`tanpa overflow horizontal @ ${v.n}px`, over.length === 0, { over: over.slice(0, 2) });
      if (v.w <= 640) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(400);
        const small = await p.evaluate(() =>
          Array.from(document.querySelectorAll("a.btn, button.btn, .dl__b, .card__pick"))
            .filter((el) => { const b = el.getBoundingClientRect(); return b.height > 0 && b.height < 40; })
            .map((el) => el.className.toString().slice(0, 24) + " h=" + Math.round(el.getBoundingClientRect().height)),
        );
        check(`target sentuh >= 40px @ ${v.n}px`, small.length === 0, { small: small.slice(0, 4) });
      }
      await ctx.close();
    }
  }

  /* ============ 8. teks ============ */
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
        return { len: it.length, sus, text: it };
      });
      if (r.len === 0) glued.push({ u, reason: "innerText kosong" });
      if (r.sus.length) glued.push({ u, sus: r.sus });
      const forb = [/\d{3,4}\s?[x×]\s?\d{3,4}/i, /\.(png|jpg|jpeg|webp|pdf)\b/i, /needs confirmation/i, /lorem ipsum/i, /undefined/, /NaN/, /\[object Object\]/];
      const hits = forb.filter((re) => re.test(r.text)).map((re) => re.source);
      if (hits.length) leaks.push({ u, hits });
    }
    check("tanpa kata menempel", glued.length === 0, { glued: glued.slice(0, 3) });
    check("tanpa kebocoran metadata di teks", leaks.length === 0, { leaks: leaks.slice(0, 3) });
    await ctx.close();
  }

  report.summary = { pass: ok.length, fail: bad.length };
  report.failures = bad;
  fs.writeFileSync(path.join(OUT, "verify.json"), JSON.stringify(report, null, 2));
  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 220)));
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
