/** Verifikasi warna aksen pita CTA.
 *
 *  Bug yang dilaporkan: "Tell me how the work runs today" — kata aksennya beda
 *  warna sendiri. Sebabnya kata aksen memakai --accent-ink (aksen untuk latar
 *  TERANG) di atas pita gelap rgb(16,16,20) → kontras 3.75:1, terbaca cokelat
 *  keruh. Sekarang warna ditentukan oleh latar PITA, karena pita ini gelap di
 *  tema terang dan terang di tema gelap.
 */
const { chromium } = require("playwright");
const BASE = process.env.PF_BASE || "http://localhost:4321";

const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

// "rgb(r, g, b)" maupun "color(srgb r g b / a)" (skala 0-1) → [r,g,b,a] 0-255
function toRgb(s) {
  if (!s) return null;
  if (s.startsWith("color(srgb")) {
    const nums = (s.match(/[\d.]+/g) || []).map(Number);
    const [r, g, b] = nums;
    const a = nums.length > 3 ? nums[3] : 1;
    return [r * 255, g * 255, b * 255, a];
  }
  const nums = (s.match(/[\d.]+/g) || []).map(Number);
  return [nums[0], nums[1], nums[2], nums.length > 3 ? nums[3] : 1];
}
// gabungkan warna ber-alpha di atas latar
function blend(fg, bg) {
  const a = fg[3] ?? 1;
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
}
function lum(c) {
  const [r, g, b] = c.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2);
}

(async () => {
  const b = await chromium.launch();
  const hasil = [];

  for (const theme of ["light", "dark"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "load" });
    await p.evaluate((t) => localStorage.setItem("theme", t), theme);
    await p.reload({ waitUntil: "load" });
    await p.waitForTimeout(1400);
    await p.evaluate(() => {
      const el = document.querySelector(".band");
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 200);
    });
    await p.waitForTimeout(1600);

    const r = await p.evaluate(() => {
      const band = document.querySelector(".band");
      const cs = getComputedStyle(band);
      const acc = band.querySelector(".wf__w--a");
      const normal = [...band.querySelectorAll(".wf__w")].find((w) => !w.classList.contains("wf__w--a"));
      const eyebrow = band.querySelector(".eyebrow--on");
      const sub = band.querySelector(".band__s");
      const btn = band.querySelector(".btn--light") || band.querySelector(".btn");
      return {
        bg: cs.backgroundColor,
        teksBiasa: normal ? getComputedStyle(normal).color : null,
        teksAksen: acc ? getComputedStyle(acc).color : null,
        kataAksen: [...band.querySelectorAll(".wf__w--a")].map((w) => w.textContent),
        garisAksen: acc ? getComputedStyle(acc, "::after").backgroundColor : null,
        eyebrow: eyebrow ? getComputedStyle(eyebrow).color : null,
        isi: sub ? getComputedStyle(sub).color : null,
        tombolBg: btn ? getComputedStyle(btn).backgroundColor : null,
        tombolTeks: btn ? getComputedStyle(btn).color : null,
        aksenDiLuarPita: (() => {
          const el = document.querySelector(".secHead__t .wf__w--a") || document.querySelector(".svc__no");
          return el ? getComputedStyle(el).color : null;
        })(),
      };
    });

    const bg = toRgb(r.bg);
    const hitung = (warna) => (warna ? ratio(blend(toRgb(warna), bg), bg) : null);

    const baris = {
      tema: theme,
      latarPita: r.bg,
      teksBiasa: r.teksBiasa,
      teksAksen: r.teksAksen,
      kataAksen: r.kataAksen,
      kontrasTeksBiasa: hitung(r.teksBiasa),
      kontrasKataAksen: hitung(r.teksAksen),
      kontrasEyebrow: hitung(r.eyebrow),
      kontrasIsi: hitung(r.isi),
      kontrasTombol: r.tombolBg ? ratio(toRgb(r.tombolBg), bg) : null,
      aksenDiLuarPita: r.aksenDiLuarPita,
    };
    hasil.push(baris);
    console.log(JSON.stringify(baris));
    await ctx.close();
  }

  for (const h of hasil) {
    check(`tema ${h.tema}: kata aksen di pita terbaca jelas (≥4.5:1)`, h.kontrasKataAksen >= 4.5, { kontras: h.kontrasKataAksen, warna: h.teksAksen, latar: h.latarPita });
    check(`tema ${h.tema}: teks utama pita ≥7:1`, h.kontrasTeksBiasa >= 7, { kontras: h.kontrasTeksBiasa });
    check(`tema ${h.tema}: teks pendukung pita ≥4.5:1`, h.kontrasIsi >= 4.5 && h.kontrasEyebrow >= 4.5, { isi: h.kontrasIsi, eyebrow: h.kontrasEyebrow });
    check(`tema ${h.tema}: tombol pita ≥3:1`, h.kontrasTombol >= 3, { kontras: h.kontrasTombol });
  }

  check("kata aksen di pita hanya 2 kata yang ditandai", hasil.every((h) => h.kataAksen.length === 2), { kata: hasil.map((h) => h.kataAksen) });
  check("aksen di luar pita tetap memakai --accent-ink (tidak ikut berubah)",
    hasil[0].aksenDiLuarPita !== hasil[0].teksAksen,
    { luar: hasil[0].aksenDiLuarPita, dalam: hasil[0].teksAksen });

  await b.close();
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
