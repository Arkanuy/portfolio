/** Verifikasi menyeluruh setelah rombak: kliping, lompatan, spasi, foto, tema,
 *  dan kelancaran. Dibuat ringan supaya cepat. */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://localhost:4321";
const OUT = path.join(__dirname, "..", "evidence");
const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const PAGES = ["/", "/layanan", "/karya", "/tentang", "/riwayat", "/kontak", "/karya/mafiablox", "/layanan/web"];
const ID_WORDS = ["Magang", "Juara", "Mengembangkan", "Membangun", "Menyusun", "Jurusan", "Kabupaten", "Halaman", "saya", "proyek", "Tentang", "Riwayat", "Layanan", "Kontak", "Beranda", "Karya"];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  const go = async (u) => {
    try {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch {
      /* lanjut */
    }
    await p.waitForTimeout(900);
  };

  // ---------- 1. semua halaman sehat ----------
  const status = {};
  for (const u of PAGES) {
    const r = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => null);
    status[u] = r ? r.status() : 0;
  }
  check("semua halaman balas 200", Object.values(status).every((s) => s === 200), status);

  // ---------- 2. bahasa Inggris ----------
  const dirty = [];
  for (const u of PAGES) {
    await go(u);
    const found = await p.evaluate((w) => {
      const t = document.body.innerText;
      return w.filter((x) => new RegExp(x, "i").test(t));
    }, ID_WORDS);
    if (found.length) dirty.push({ u, found });
  }
  check("semua halaman berbahasa Inggris", dirty.length === 0, { kotor: dirty });

  // ---------- 3. spasi utuh di semua halaman ----------
  const glued = [];
  for (const u of PAGES) {
    await go(u);
    const found = await p.evaluate(() => {
      const out = [];
      [".hero__h1", ".hero__h1--second", ".quote__t", ".secHead__t", ".pageHero__t", ".aboutHero__t", ".band__t"].forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          const vis = (el.innerText || "").trim();
          const raw = (el.textContent || "").trim();
          if (raw.split(/\s+/).filter(Boolean).length < 2) return;
          if (!/[A-Za-z]{2}\s+[A-Za-z]{2}/.test(raw)) return;
          if (!vis.includes(" ")) out.push({ sel, vis: vis.slice(0, 40) });
        });
      });
      return out;
    });
    if (found.length) glued.push({ u, found });
  }
  check("tidak ada kata menempel di 8 halaman", glued.length === 0, { menempel: glued });

  // ---------- 4. foto: tidak terpotong, tidak ditutupi ----------
  await go("/");
  await p.evaluate(async () => {
    await Promise.all([...document.querySelectorAll("img")].map((i) => i.decode().catch(() => {})));
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await p.waitForTimeout(800);
  const photo = await p.evaluate(() => {
    const img = document.querySelector(".shotFrame__img");
    if (!img) return { ada: false };
    const ir = img.getBoundingClientRect();
    const fr = document.querySelector(".shotFrame__inner").getBoundingClientRect();
    const covers = [];
    document.querySelectorAll("body *").forEach((el) => {
      if (el === img || el.contains(img) || img.contains(el)) return;
      const e = el.getBoundingClientRect();
      if (e.width < 2 || e.height < 2) return;
      const ix = Math.min(ir.right, e.right) - Math.max(ir.left, e.left);
      const iy = Math.min(ir.bottom, e.bottom) - Math.max(ir.top, e.top);
      if (ix > 8 && iy > 8) {
        const cls = (el.className || el.tagName).toString();
        const z = getComputedStyle(el).zIndex;
        // yang berada di belakang bingkai bukan penghalang
        if (/shotFrame|BorderBeam|beam|tip/.test(cls)) return;
        const zNum = z === "auto" ? 0 : Number(z);
        if (zNum < 5) return;
        covers.push({ cls, persen: Math.round(((ix * iy) / (ir.width * ir.height)) * 100) });
      }
    });
    return {
      ada: true,
      natural: img.naturalWidth,
      shown: Math.round(ir.width),
      rasio: +(ir.width / ir.height).toFixed(2),
      skala: getComputedStyle(img).scale,
      // celah: gambar harus menutup seluruh bingkai (karena scale 1.08)
      celah: {
        atas: Math.round(img.getBoundingClientRect().top - fr.top),
        bawah: Math.round(fr.bottom - img.getBoundingClientRect().bottom),
      },
      covers,
    };
  });
  check("foto tidak ditutupi elemen lain", photo.covers.length === 0, photo);
  check("foto rasio 1:1, tidak di-upscale, dan tidak ada celah di bingkai", photo.rasio === 1 && photo.natural >= photo.shown && photo.celah.atas <= 0 && photo.celah.bawah <= 0, photo);

  // ---------- 5. tidak ada kliping tersisa ----------
  const clipped = await p.evaluate(() => {
    const out = [];
    [".shotFrame__img", ".shotMeta", ".hero__h1", ".hero__proof", ".cc__media img", ".caseShot img"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      let n = el.parentElement;
      while (n && n !== document.body) {
        const cs = getComputedStyle(n);
        if (/paint|strict|content/.test(cs.contain)) {
          out.push(`${sel} <- .${(n.className || "").toString().split(" ")[0]} contain:${cs.contain}`);
          break;
        }
        n = n.parentElement;
      }
    });
    return out;
  });
  check("tidak ada contain:paint yang memotong", clipped.length === 0, { terpotong: clipped });

  // ---------- 6. tidak ada lompatan saat gulir ----------
  const jumps = await p.evaluate(async () => {
    const sels = [".shotFrame__img", ".shotMeta", ".hero__h1"];
    const prev = {};
    const found = [];
    for (let y = 0; y <= 800; y += 40) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      sels.forEach((s) => {
        const el = document.querySelector(s);
        if (!el) return;
        const t = Math.round(el.getBoundingClientRect().top);
        if (prev[s] !== undefined) {
          const d = t - prev[s];
          if (d > 5 || d < -60) found.push(`${s} y=${y} delta=${d}`);
        }
        prev[s] = t;
      });
    }
    return found.slice(0, 6);
  });
  check("tidak ada lompatan posisi saat gulir", jumps.length === 0, { lompatan: jumps });

  // ---------- 7. tema ----------
  await go("/");
  const t1 = await p.evaluate(() => document.documentElement.dataset.theme);
  await p.click(".icBtn");
  await p.waitForTimeout(600);
  const t2 = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem("theme") }));
  await p.click(".icBtn");
  await p.waitForTimeout(500);
  check("tombol tema bekerja dua arah & tersimpan", t1 === "light" && t2.theme === "dark" && t2.stored === "dark", { awal: t1, ...t2 });

  // ---------- 8. animasi inti masih ada ----------
  const anim = await p.evaluate(() => ({
    blurWords: document.querySelectorAll(".blurTxt__w").length,
    blurSpaces: document.querySelectorAll(".blurTxt__sp").length,
    moving: document.querySelectorAll(".mcards__i").length,
    movingAnim: (() => { const e = document.querySelector(".mcards__row"); return e ? getComputedStyle(e).animationName : null; })(),
    tilt: document.querySelectorAll(".tilt").length,
    glare: document.querySelectorAll(".glare").length,
    beam: document.querySelectorAll(".beam").length,
    reveal: document.querySelectorAll("[data-fx]").length,
    revealOn: document.querySelectorAll('[data-fx][data-on="true"]').length,
  }));
  check("animasi inti terpasang", anim.blurWords >= 6 && anim.moving >= 20 && anim.movingAnim === "mcardsRun" && anim.tilt >= 1 && anim.beam >= 1 && anim.reveal >= 4, anim);

  check("0 error halaman", errs.length === 0, { errs: errs.slice(0, 3) });
  await ctx.close();

  // ---------- 9. ponsel ----------
  const mc = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const mp = await mc.newPage();
  await mp.goto(BASE, { waitUntil: "domcontentloaded" });
  await mp.waitForTimeout(1400);
  const mob = await mp.evaluate(() => {
    const h1 = document.querySelector(".hero__h1")?.innerText || "";
    const img = document.querySelector(".shotFrame__inner").getBoundingClientRect();
    const meta = document.querySelector(".shotMeta")?.getBoundingClientRect();
    const overlap = meta ? !(meta.top >= img.bottom || img.top >= meta.bottom) : false;
    return {
      adaSpasi: /\S\s+\S/.test(h1),
      overflowX: document.documentElement.scrollWidth > innerWidth + 1,
      metaDiLuarBingkai: !overlap,
      fotoW: Math.round(img.width),
    };
  });
  check("ponsel: spasi utuh, tidak overflow, meta di luar bingkai", mob.adaSpasi && !mob.overflowX && mob.metaDiLuarBingkai, mob);
  await mp.screenshot({ path: path.join(OUT, "r-9-ponsel.png") });
  await mc.close();

  await b.close();
  fs.writeFileSync(path.join(OUT, "verify-rebuild.json"), JSON.stringify({ ok: ok.length, bad: bad.length, results: [...ok, ...bad] }, null, 2));
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
