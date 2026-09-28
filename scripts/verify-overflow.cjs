/** Uji ringkas: overflow horizontal di semua halaman & viewport.
 *  Ini yang lolos dari perhatian sebelumnya dan membuat halaman terlihat
 *  "bergeser" saat disentuh di ponsel. */
const { chromium } = require("playwright");

const BASE = process.env.PF_BASE || "http://localhost:4321";
const PAGES = ["/", "/layanan", "/karya", "/tentang", "/riwayat", "/kontak", "/karya/mafiablox", "/layanan/web"];
const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

(async () => {
  const b = await chromium.launch();
  const results = [];
  for (const [w, h, tag] of [[1440, 900, "1440"], [1024, 800, "1024"], [768, 1024, "768"], [390, 844, "390"], [360, 800, "360"]]) {
    const ctx = await b.newContext({
      viewport: { width: w, height: h },
      hasTouch: w < 900,
      isMobile: w < 900,
    });
    const p = await ctx.newPage();
    for (const u of PAGES) {
      try {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 20000 });
      } catch {
        continue;
      }
      await p.waitForTimeout(700);
      const r = await p.evaluate(() => ({
        docW: document.documentElement.scrollWidth,
        winW: window.innerWidth,
      }));
      results.push({ vp: tag, halaman: u, ...r, lebar: r.docW - r.winW });
    }
    await ctx.close();
  }
  const overflow = results.filter((r) => r.lebar > 1);
  check(
    `tidak ada scroll horizontal di ${results.length} kombinasi halaman × viewport`,
    overflow.length === 0,
    { jumlah: results.length, melebar: overflow.slice(0, 8) },
  );
  await b.close();
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
