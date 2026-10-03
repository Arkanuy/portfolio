/** Verifikasi kerapian + tombol tema ikon. */
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

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  const go = async (u) => {
    try {
      await p.goto(BASE + u, { waitUntil: "networkidle", timeout: 20000 });
    } catch {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 20000 });
    }
    await p.waitForTimeout(700);
  };

  // ---------- 1. tepi kiri sejajar di semua halaman ----------
  const aligns = {};
  for (const u of ["/", "/layanan", "/karya", "/kontak", "/tentang", "/riwayat"]) {
    await go(u);
    // Yang dibandingkan adalah TEPI ISI, bukan kotak pembungkus:
    // tiap .wrap punya padding-inline sendiri, jadi isinya mulai di
    // wrap.x + paddingLeft. Semua isi harus mulai di titik yang sama.
    const lefts = await p.evaluate(() => {
      const px = (v) => Math.round(parseFloat(v) || 0);
      const out = [];
      document.querySelectorAll(".wrap").forEach((w) => {
        const wr = w.getBoundingClientRect();
        const pad = px(getComputedStyle(w).paddingLeft);
        out.push(Math.round(wr.x + pad));
      });
      return [...new Set(out)];
    });
    aligns[u] = lefts;
  }
  const uniq = [...new Set(Object.values(aligns).flat())];
  check("tepi isi blok utama sejajar di semua halaman (1 nilai)", uniq.length === 1, { nilai: uniq, perHalaman: aligns });

  // ---------- 2. radius konsisten ----------
  await go("/");
  const radii = await p.evaluate(() => {
    const out = {};
    document.querySelectorAll("body *").forEach((el) => {
      const r = getComputedStyle(el).borderTopLeftRadius;
      if (r && r !== "0px") out[r] = (out[r] || 0) + 1;
    });
    return out;
  });
  const allowed = ["6px", "8px", "12px", "18px", "999px", "50%"];
  const illegal = Object.keys(radii).filter((r) => !allowed.includes(r));
  check("radius hanya dari skala (6/8/12/18/999)", illegal.length === 0, { dipakai: radii, diLuarSkala: illegal });

  // ---------- 3. celah grid konsisten ----------
  const gaps = await p.evaluate(() => {
    const out = {};
    [".painGrid", ".stepsRow", ".numGrid", ".svcGrid", ".kitGrid", ".twoCol2", ".ccGrid", ".svcList", ".timeList"].forEach((s) => {
      const el = document.querySelector(s);
      if (el) out[s] = getComputedStyle(el).gap;
    });
    return out;
  });
  const gapVals = [...new Set(Object.values(gaps))];
  check("celah grid hanya 20px atau 24px", gapVals.every((g) => g === "20px" || g === "24px"), { gaps, nilai: gapVals });

  // ---------- 4. padding kartu konsisten & tidak bersarang ----------
  const pads = await p.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) || 0);
    const cards = {};
    [".pain", ".stepCard", ".num", ".kit", ".card2", ".timeItem", ".noteCard"].forEach((s) => {
      const el = document.querySelector(s);
      if (el) cards[s] = px(getComputedStyle(el).paddingLeft);
    });
    // Padding bersarang pada KARTU saja.
    // Hanya dihitung kalau induknya benar-benar kotak (punya garis atau latar
    // tidak transparan) dan punya sudut membulat. Elemen seperti .quote hanya
    // memberi indentasi untuk garis aksen — bukan kartu, jadi tidak dihitung.
    const kotak = (el) => {
      const cs = getComputedStyle(el);
      const bertulang = px(cs.borderLeftWidth) > 0;
      const berlatar = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
      const membulat = px(cs.borderTopLeftRadius) >= 4;
      return (bertulang || berlatar) && membulat;
    };
    const nested = [];
    document.querySelectorAll("body *").forEach((el) => {
      const pl = px(getComputedStyle(el).paddingLeft);
      if (pl < 16) return;
      const par = el.parentElement;
      if (!par) return;
      const ppl = px(getComputedStyle(par).paddingLeft);
      if (ppl >= 16 && kotak(par) && kotak(el) && !par.classList.contains("drawer")) {
        nested.push(`${(par.className || "").toString().split(" ")[0]}(${ppl}) > ${(el.className || "").toString().split(" ")[0]}(${pl})`);
      }
    });
    return { cards, nested: [...new Set(nested)] };
  });
  const padVals = [...new Set(Object.values(pads.cards))];
  check("padding kartu konsisten (24 atau 28)", padVals.every((v) => v === 24 || v === 28), { pads: pads.cards });
  check("tidak ada padding bersarang pada kartu", pads.nested.length === 0, { bersarang: pads.nested });

  // ---------- 5. padding seksi konsisten ----------
  const secs = await p.evaluate(() =>
    [...document.querySelectorAll(".sec")].map((s) => getComputedStyle(s).paddingTop).filter((v, i, a) => a.indexOf(v) === i),
  );
  check("padding seksi seragam", secs.length === 1, { nilai: secs });

  // ---------- 6. tombol tema: ikon saja ----------
  const themeBtn = await p.evaluate(() => {
    const btn = document.querySelector(".icBtn");
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const sun = btn.querySelector(".icBtn__one--sun");
    const moon = btn.querySelector(".icBtn__one--moon");
    return {
      ada: true,
      teks: btn.textContent.trim(),
      w: Math.round(r.width),
      h: Math.round(r.height),
      sunSvg: sun.querySelectorAll("svg").length,
      moonSvg: moon.querySelectorAll("svg").length,
      sunOpacity: getComputedStyle(sun).opacity,
      moonOpacity: getComputedStyle(moon).opacity,
      label: btn.getAttribute("aria-label"),
    };
  });
  check("tombol tema memakai ikon (tanpa teks) & ≥40px", Boolean(themeBtn) && themeBtn.teks === "" && themeBtn.sunSvg === 1 && themeBtn.moonSvg === 1 && themeBtn.w >= 40, themeBtn);
  check("ikon sesuai tema: matahari tampil di tema terang", themeBtn.sunOpacity === "1" && themeBtn.moonOpacity === "0", {
    matahari: themeBtn.sunOpacity,
    bulan: themeBtn.moonOpacity,
  });

  // ---------- 7. ganti tema: ikon bertukar ----------
  await p.click(".icBtn");
  await p.waitForTimeout(700);
  const afterToggle = await p.evaluate(() => {
    const sun = document.querySelector(".icBtn__one--sun");
    const moon = document.querySelector(".icBtn__one--moon");
    return {
      theme: document.documentElement.dataset.theme,
      sunOpacity: getComputedStyle(sun).opacity,
      moonOpacity: getComputedStyle(moon).opacity,
      label: document.querySelector(".icBtn").getAttribute("aria-label"),
    };
  });
  check("setelah diklik: ikon bulan tampil, tema gelap (label Inggris)", afterToggle.theme === "dark" && afterToggle.moonOpacity === "1" && /light/i.test(afterToggle.label), afterToggle);
  await p.click(".icBtn");
  await p.waitForTimeout(600);

  check("0 error halaman", errs.length === 0, { errs: errs.slice(0, 3) });
  await ctx.close();

  // ---------- 8. ponsel: tombol tetap 44px, tidak menabrak menu ----------
  const mc = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const mp = await mc.newPage();
  await mp.goto(BASE, { waitUntil: "networkidle" });
  await mp.waitForTimeout(700);
  const mob = await mp.evaluate(() => {
    const t = document.querySelector(".icBtn").getBoundingClientRect();
    const burger = document.querySelector(".hd__burger").getBoundingClientRect();
    const overlap = !(t.right < burger.left || burger.right < t.left || t.bottom < burger.top || burger.bottom < t.top);
    const cx = burger.x + burger.width / 2;
    const cy = burger.y + burger.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return {
      tombol: { w: Math.round(t.width), h: Math.round(t.height) },
      bertumpuk: overlap,
      topDiMenu: top ? `${top.tagName}.${(top.className || "").toString().slice(0, 24)}` : null,
      overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  check("ponsel: tombol tema 44px & tidak menutupi menu", mob.tombol.h >= 44 && !mob.bertumpuk && mob.topDiMenu?.includes("burger"), mob);
  await mp.screenshot({ path: path.join(OUT, "r-1-header-ponsel.png") });
  await mc.close();

  await b.close();
  fs.writeFileSync(path.join(OUT, "verify-rapi.json"), JSON.stringify({ ok: ok.length, bad: bad.length, results: [...ok, ...bad] }, null, 2));
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("VERIFY_RAPI_FAILED", e);
  process.exit(1);
});
