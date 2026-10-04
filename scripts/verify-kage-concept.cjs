const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");

/**
 * VERIFIKASI KONSEP KAGE — berlaku untuk SELURUH situs, bukan satu halaman.
 *
 * Yang diuji bukan "ada halaman Kage", tapi "portfolio ini berbahasa Kage":
 *   · gelap adalah tampilan baku
 *   · hurufnya Onest yang sama dengan scene
 *   · sudutnya tajam, bukan membulat
 *   · bab dipisah garis rambut, dan tiap seksi bernomor otomatis
 *   · aksennya merah Kage, dan teks kecilnya memakai versi yang lulus kontras
 *   · scene-nya tetap utuh, dan /kage memakai bahasa yang sama
 *   · tema terang tetap bisa dibaca (bukan sekadar ada tombolnya)
 */
const BASE = process.env.PF_BASE || "http://127.0.0.1:4393";
const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const lum = (rgb) => {
  const lin = rgb.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};
const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

/** Luminansi dari nilai hex — pengurai "digit saja" gagal pada #ffffff
 *  (huruf f bukan digit), jadi pasangan hex dibaca langsung. */
const hexLum = (hex) => {
  let h = hex.trim().replace("#", "");
  /* #fff lebih dulu diperluas: token tema terang memakai bentuk 3 digit,
     dan pengurai 6-digit mengembalikan null untuk itu — terbaca sebagai
     kontras 1.08:1 padahal sebenarnya 19:1. */
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lin = n.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};

/* Kumpulkan nilai terukur dari satu halaman. */
const read = () => ({
  theme: document.documentElement.getAttribute("data-theme"),
  bodyBg: getComputedStyle(document.body).backgroundColor,
  bodyFont: getComputedStyle(document.body).fontFamily,
  h1Font: (() => { const h = document.querySelector("h1"); return h ? getComputedStyle(h).fontFamily : null; })(),
  h1Weight: (() => { const h = document.querySelector("h1"); return h ? getComputedStyle(h).fontWeight : null; })(),
  radius: (() => {
    const el = document.querySelector(".cc") || document.querySelector(".btn") || document.querySelector(".pill");
    return el ? getComputedStyle(el).borderTopLeftRadius : null;
  })(),
  accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
  accentInk: getComputedStyle(document.documentElement).getPropertyValue("--accent-ink").trim(),
  sectionBorderTop: (() => {
    const s = Array.from(document.querySelectorAll(".sec")).find((x) => getComputedStyle(x).borderTopWidth !== "0px");
    return s ? getComputedStyle(s).borderTopWidth + " " + getComputedStyle(s).borderTopColor : null;
  })(),
  chapterNums: Array.from(document.querySelectorAll(".secHead")).map((h) => getComputedStyle(h, "::after").content).filter((c) => c && c !== "none" && c !== '""'),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  errs: 0,
});

(async () => {
  const browser = await chromium.launch();

  /* ---------- A. tema baku = gelap, huruf = Onest ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));
    p.on("console", (m) => m.type() === "error" && errs.push("C:" + m.text().slice(0, 140)));

    await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 45000 });
    await p.waitForTimeout(1200);
    const h = await p.evaluate(read);

    check("gelap adalah tampilan baku (tanpa memilih apa pun)", h.theme === "dark", { theme: h.theme });
    check("latar memakai hitam Kage #05070a", h.bodyBg === "rgb(5, 7, 10)", { bg: h.bodyBg });
    check("hurufnya Onest — sama dengan scene Kage", /Onest/.test(h.bodyFont), { font: h.bodyFont.split(",")[0] });
    check("judul juga Onest", h.h1Font ? /Onest/.test(h.h1Font) : false, { font: (h.h1Font || "").split(",")[0] });
    check("aksen = merah Kage #e0231c", h.accent === "#e0231c", { accent: h.accent });
    check("aksen untuk teks = ember Kage #ff5a3c (lulus kontras)", h.accentInk === "#ff5a3c", { accentInk: h.accentInk });

    /* kontras: aksen-teks di atas latar harus >= 4.5:1 */
    const cr = (() => {
      const a = lum(parse(h.accentInk.startsWith("#") ? "#ff5a3c" : h.accentInk));
      return null;
    })();
    const contrast = await p.evaluate(() => {
      const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent-ink").trim();
      const L = (hex) => {
        const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
        const lin = n.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      };
      const bgL = L("#05070a");
      return +(((L(hex) + 0.05) / (bgL + 0.05))).toFixed(2);
    });
    check("kontras aksen-teks >= 4.5:1", contrast >= 4.5, { rasio: contrast });

    /* ---------- B. gramatika Kage ---------- */
    check("sudut tajam (radius <= 3px), bukan membulat", h.radius !== null && parseFloat(h.radius) <= 3, { radius: h.radius });
    check("bab dipisah garis rambut 1px", !!h.sectionBorderTop && h.sectionBorderTop.startsWith("1px"), { border: h.sectionBorderTop });
    check("seksi bernomor otomatis dari CSS counter", h.chapterNums.length >= 3, { nomor: h.chapterNums.slice(0, 7) });
    check("judul besar diturunkan ke berat 400 (tenang, ala Kage)", h.h1Weight === "400", { weight: h.h1Weight });
    check("beranda tanpa overflow horizontal", h.overflowX === 0, { overflowX: h.overflowX });
    check("beranda tanpa error konsol", errs.length === 0, { errs: errs.slice(0, 3) });

    /* ---------- C. tema TERANG masih bisa dibaca ---------- */
    await p.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    });
    await p.waitForTimeout(500);
    const light = await p.evaluate(() => ({
      bg: getComputedStyle(document.body).backgroundColor,
      inkParsed: getComputedStyle(document.body).color,
      radius: (() => { const e = document.querySelector(".cc"); return e ? getComputedStyle(e).borderTopLeftRadius : null; })(),
      chapterNums: Array.from(document.querySelectorAll(".secHead")).map((x) => getComputedStyle(x, "::after").content).filter((c) => c && c !== "none" && c !== '""').length,
    }));
    /* Diukur dari variabel CSS (hex) — getComputedStyle bisa mengembalikan
       format "color(srgb ...)" yang salah bila diparsing sebagai 0-255. */
    const lightVars = await p.evaluate(() => ({
      ink: getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(),
      bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
    }));
    /* Rasio kontras = (terang + 0.05) / (gelap + 0.05), jadi urutannya harus
       ditentukan max/min. Versi pertama saya selalu membagi ink dengan bg, dan
       untuk teks gelap di latar terang itu menghasilkan < 1 (terukur 0.05) —
       rumus yang salah, bukan warnanya. */
    const li = hexLum(lightVars.ink), lb = hexLum(lightVars.bg);
    const lightContrast = +(((Math.max(li, lb) + 0.05) / (Math.min(li, lb) + 0.05))).toFixed(2);
    check("tema terang benar-benar terang", light.bg === "rgb(255, 255, 255)", { bg: light.bg });
    check("teks tema terang tetap terbaca (>= 4.5:1)", lightContrast >= 4.5, { rasio: lightContrast });
    check("tema terang TIDAK kena gaya Kage (tetap membulat, tanpa nomor bab)", parseFloat(light.radius) > 3 && light.chapterNums === 0, { radius: light.radius, nomor: light.chapterNums });
    await p.evaluate(() => localStorage.removeItem("theme"));
    await ctx.close();
  }

  /* ---------- D. seluruh rute, empat lebar ---------- */
  {
    const routes = ["/", "/karya/", "/layanan/", "/tentang/", "/riwayat/", "/kontak/",
      "/layanan/business-systems/", "/layanan/web/", "/layanan/analysis/", "/layanan/automation/",
      "/karya/mafiablox/", "/karya/pixwatch/", "/karya/buildplan/", "/karya/aplikasi-solusi-bisnis/",
      "/karya/rollerskool/", "/karya/tasty-food/", "/karya/website-sekolah/"];
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 100)));
    const status = {};
    for (const u of routes) {
      const r = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 30000 });
      status[u] = r ? r.status() : 0;
    }
    check("17 rute portfolio masih 200", Object.values(status).every((x) => x === 200), { bad: Object.entries(status).filter(([, x]) => x !== 200) });

    /* semua halaman gelap & berfont Onest, bukan cuma beranda */
    const perPage = [];
    for (const u of ["/karya/", "/tentang/", "/layanan/", "/kontak/"]) {
      await p.goto(BASE + u, { waitUntil: "networkidle", timeout: 30000 });
      await p.waitForTimeout(300);
      perPage.push(await p.evaluate((u2) => ({
        u: u2,
        theme: document.documentElement.getAttribute("data-theme"),
        font: getComputedStyle(document.body).fontFamily.split(",")[0].replace(/["']/g, ""),
        bg: getComputedStyle(document.body).backgroundColor,
      }), u));
    }
    check("semua halaman gelap", perPage.every((x) => x.theme === "dark" && x.bg === "rgb(5, 7, 10)"), { perPage: perPage.map((x) => x.u + ":" + x.bg) });
    check("semua halaman memakai Onest", perPage.every((x) => /Onest/.test(x.font)), { perPage: perPage.map((x) => x.u + ":" + x.font) });
    check("portfolio tanpa error konsol", errs.length === 0, { errs: errs.slice(0, 3) });
    await ctx.close();
  }

  /* ---------- E. scene Kage tetap utuh di dalam konsep ini ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/kage/", { waitUntil: "networkidle", timeout: 45000 });
    await p.waitForTimeout(11000);
    const fr = p.frames().find((f) => /\/landing-pages\/kage(\b|\.html)/.test(f.url()));
    check("/kage masih memuat dokumen kanonik", !!fr);
    if (fr) {
      const s = await fr.evaluate(() => {
        const big = Array.from(document.querySelectorAll("canvas")).find((c) => c.getBoundingClientRect().height > 200);
        return {
          sections: document.querySelectorAll("section").length,
          canvas: big ? Math.round(big.getBoundingClientRect().width) + "x" + Math.round(big.getBoundingClientRect().height) : null,
          font: getComputedStyle(document.body).fontFamily.split(",")[0].replace(/["']/g, ""),
        };
      });
      check("scene tetap 5 bab, kanvas penuh, dan berfont Kage", s.sections === 5 && s.canvas === "1440x900", s);
    }
    const outer = await p.evaluate(() => ({
      theme: document.documentElement.getAttribute("data-theme"),
      font: getComputedStyle(document.body).fontFamily.split(",")[0].replace(/["']/g, ""),
    }));
    check("/kage kini memakai bahasa situs yang sama (gelap + Onest)", outer.theme === "dark" && /Onest/.test(outer.font), outer);
    await ctx.close();
  }

  /* ---------- F. HP ---------- */
  {
    for (const w of [320, 390, 768]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true });
      const p = await ctx.newPage();
      await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 45000 });
      await p.waitForTimeout(600);
      const r = await p.evaluate(() => ({
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        font: getComputedStyle(document.body).fontFamily.split(",")[0].replace(/["']/g, ""),
        theme: document.documentElement.getAttribute("data-theme"),
        h1: (() => { const h = document.querySelector("h1"); return h ? getComputedStyle(h).fontSize : null; })(),
      }));
      check(`layar ${w}px: tanpa overflow, gelap, Onest`, r.overflowX === 0 && r.theme === "dark" && /Onest/.test(r.font), r);
      await ctx.close();
    }
  }

  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 200)));
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
