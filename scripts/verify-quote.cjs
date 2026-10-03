/** Verifikasi bagian kutipan.
 *
 *  Bug-bug yang ditemukan dari laporan "bagian ini kurang rapi":
 *   1. `.quote { max-width: 26ch }` dihitung pada font 16px milik div-nya sendiri
 *      → lebar cuma 271px padahal teksnya 66px, kalimat pecah 6 baris.
 *   2. `margin-inline: auto` membuat blok mulai di x=240 sedangkan seluruh teks
 *      halaman mulai di x=110/40 → tidak segaris dengan grid.
 *   3. TextReveal memecah teks per HURUF dengan display:inline-block; browser
 *      boleh memotong baris di antara dua kotak inline-block, jadi kata terpotong
 *      di tengah ("fir" / "st,"). Diganti WordFlow (per kata).
 *   4. Pecah baris tidak seimbang: baris terakhir cuma 75px (16% baris pertama).
 */
const { chromium } = require("playwright");
const BASE = process.env.PF_BASE || "http://localhost:4321";

const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const LEBAR = [1440, 1280, 1024, 900, 820, 768, 600, 480, 390, 360];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  // matikan animasi: transform kata yang sedang berjalan menggeser kotak ukur
  await p.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
  await p.waitForTimeout(1200);

  const data = [];
  for (const vw of LEBAR) {
    await p.setViewportSize({ width: vw, height: 900 });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const t = document.querySelector(".quote__t");
      const wf = t.querySelector(".wf");
      const kata = [...wf.querySelectorAll(".wf__w")];
      const baris = [];
      let kini = null;
      kata.forEach((k) => {
        const rb = k.getBoundingClientRect();
        if (!kini || Math.abs(rb.top - kini.top) > 2) {
          kini = { top: rb.top, kata: [k.textContent], kiri: rb.left, kanan: rb.right };
          baris.push(kini);
        } else {
          kini.kata.push(k.textContent);
          kini.kanan = Math.max(kini.kanan, rb.right);
        }
      });
      const lebar = baris.map((x) => Math.round(x.kanan - x.kiri));
      const wrap = t.closest(".wrap").getBoundingClientRect();
      const gut = Math.round(t.getBoundingClientRect().left - wrap.left);
      return {
        baris: baris.length,
        lebar,
        persen: baris.length > 1 ? Math.round((Math.min(...lebar) / Math.max(...lebar)) * 100) : 100,
        teks: baris.map((x) => x.kata.join(" ")),
        spasiAntarKata: kata.length,
        teksKutipan: t.innerText.trim(),
        adaPerHuruf: t.querySelectorAll(".treveal__c").length,
        perKata: t.querySelectorAll(".wf__w").length,
        kiriBlok: Math.round(t.getBoundingClientRect().left),
        kiriKonten: Math.round(wrap.left + gut),
        // apakah ada kata yang terpotong di tengah (kata tanpa spasi tapi pindah baris)?
        adaKataTerpotong: baris.some((x) => x.kata.some((w) => !/^[A-Za-z][A-Za-z.,;:'"-]*$/.test(w) && w.length > 0)),
      };
    });
    data.push({ vw, ...r });
  }

  check(`kutipan pecah jadi 2 baris di semua lebar (${LEBAR.length} lebar diuji)`,
    data.every((d) => d.baris === 2), { baris: data.map((d) => `${d.vw}=${d.baris}`) });

  check("baris seimbang: baris terpendek ≥60% baris terpanjang",
    data.every((d) => d.persen >= 60), { keseimbangan: data.map((d) => `${d.vw}=${d.persen}%`) });

  check("pecah baris konsisten (bukan berubah-ubah antar lebar)",
    new Set(data.map((d) => d.teks.join(" | "))).size <= 2,
    { pola: [...new Set(data.map((d) => d.teks.join(" | ")))] });

  check("kutipan sejajar dengan tepi kiri konten halaman",
    data.every((d) => d.kiriBlok === d.kiriKonten), { kiri: data.map((d) => `${d.vw}:${d.kiriBlok}/${d.kiriKonten}`) });

  check("tidak ada kata terpotong di tengah baris (bekas bug per-huruf)",
    data.every((d) => !d.adaKataTerpotong && d.adaPerHuruf === 0),
    { perHuruf: [...new Set(data.map((d) => d.adaPerHuruf))], perKata: [...new Set(data.map((d) => d.perKata))] });

  check("kalimat kutipan utuh & spasinya benar",
    data.every((d) => d.teksKutipan === "I map the workflow first, then write the code."),
    { contoh: data[0].teksKutipan });

  check("kata aksen cuma satu", data.every((d) => d.teks.some((t) => t.includes("workflow"))),
    { baris: data[0].teks });

  await ctx.close();
  await b.close();
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
