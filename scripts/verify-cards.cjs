/** Uji konsistensi kartu di semua halaman.
 *
 *  Bug yang ditemukan dari laporan Arkan di /layanan/web:
 *    kartu "Other services" memakai markup berbeda dari beranda
 *    (<Link class="svc svc--link"> vs <div class="svc"><Link class="svc__link">),
 *    sehingga padding-nya 0px dan teks menempel ke garis tepi kartu (terukur
 *    teks di x=1px dari tepi kartu). Uji ini membandingkan langsung.
 */
const { chromium } = require("playwright");
const BASE = process.env.PF_BASE || "http://localhost:4321";

const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const bacaKartu = (sel) =>
  [...document.querySelectorAll(sel)].map((c) => {
    const cs = getComputedStyle(c);
    const bb = c.getBoundingClientRect();
    const inner = c.querySelector(".svc__link");
    const no = c.querySelector(".svc__no");
    const go = c.querySelector(".svc__go");
    const kids = [...c.querySelectorAll("span")];
    return {
      padLuar: cs.padding,
      padDalam: inner ? getComputedStyle(inner).padding : null,
      teksX: no ? Math.round(no.getBoundingClientRect().x - bb.x) : null,
      sisaBawah: go ? Math.round(bb.bottom - go.getBoundingClientRect().bottom) : null,
      h: Math.round(bb.height),
      jumlahBaris: kids.length,
      adaFor: !!c.querySelector(".svc__for"),
    };
  });

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));

  // beranda
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(1300);
  const home = await p.evaluate(bacaKartu, ".svcGrid .svc");

  // semua halaman detail layanan (ini yang dilaporkan rusak)
  const detail = [];
  for (const slug of ["web", "business-systems", "analysis", "automation"]) {
    const r = await p.goto(`${BASE}/layanan/${slug}`, { waitUntil: "load" }).catch(() => null);
    if (!r || r.status() !== 200) continue;
    await p.waitForTimeout(1000);
    const c = await p.evaluate(bacaKartu, ".sec--tint .svc");
    detail.push({ slug, cards: c });
  }

  const semua = [...home.map((c) => ({ ...c, dari: "beranda" })), ...detail.flatMap((d) => d.cards.map((c) => ({ ...c, dari: `/layanan/${d.slug}` })))];

  check(`semua kartu layanan punya padding dalam (bukan 0px) — ${semua.length} kartu diperiksa`,
    semua.every((c) => c.padDalam && parseFloat(c.padDalam) >= 20),
    { padDalam: [...new Set(semua.map((c) => c.padDalam))] });

  check("teks kartu tidak menempel ke garis tepi (≥20px)", semua.every((c) => c.teksX >= 20),
    { teksX: [...new Set(semua.map((c) => c.teksX))] });

  check("isi kartu berhenti ≥16px sebelum dasar kartu", semua.every((c) => c.sisaBawah >= 16),
    { sisaBawah: [...new Set(semua.map((c) => c.sisaBawah))] });

  check("semua kartu punya isi lengkap (termasuk baris 'for')", semua.every((c) => c.adaFor),
    { tanpaFor: semua.filter((c) => !c.adaFor).map((c) => c.dari) });

  const tinggi = [...new Set(semua.map((c) => c.h))];
  check("kartu seragam tinggi di seluruh halaman", tinggi.length <= 2, { tinggi });

  check("halaman detail layanan semua balas 200", detail.length === 4, { diperiksa: detail.map((d) => d.slug) });
  check("0 error halaman", errs.length === 0, { errs: errs.slice(0, 3) });

  // Bagian kutipan diuji khusus di scripts/verify-quote.cjs

  await ctx.close();
  await b.close();
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
