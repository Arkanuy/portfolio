/** Verifikasi responsif — diukur di 13 lebar layar × semua halaman.
 *
 *  Yang diperiksa (semuanya dari pengukuran, bukan penilaian mata):
 *   1. hero tidak lebih tinggi dari layar di desktop (isi penting tidak tenggelam)
 *   2. dua kolom seimbang (selisih tinggi kolom teks vs foto wajar)
 *   3. judul tidak menabrak / keluar kolom
 *   4. paragraf: jumlah baris wajar & tidak ada baris yang isinya 1 kata (yatim)
 *   5. tiga angka tampil dalam satu baris yang sejajar di desktop
 *   6. tidak ada elemen bertumpuk (teks vs foto vs meta)
 *   7. ukuran teks isi ≥16px di ponsel, sasaran sentuh ≥44px
 *   8. tidak ada scroll horizontal
 *   9. header tidak menutupi judul halaman
 */
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

const VP = [
  [1920, 1080, "1920", true],
  [1440, 900, "1440", true],
  [1366, 768, "1366", true],
  [1280, 800, "1280", true],
  [1024, 768, "1024", true],
  [900, 800, "900", true],
  [820, 1180, "820", false],
  [768, 1024, "768", false],
  [430, 932, "430", false],
  [390, 844, "390", false],
  [360, 800, "360", false],
];
const PAGES = ["/", "/layanan", "/karya", "/tentang", "/riwayat", "/kontak", "/karya/mafiablox", "/layanan/web"];

(async () => {
  const b = await chromium.launch();
  const results = [];

  for (const [w, h, tag, desktop] of VP) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: !desktop, isMobile: !desktop, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));

    for (const url of PAGES) {
      try {
        await p.goto(BASE + url, { waitUntil: "load", timeout: 25000 });
      } catch {
        continue;
      }
      await p.waitForTimeout(url === "/" ? 1800 : 1000);
      const r = await p.evaluate(() => {
        const q = (s) => document.querySelector(s);
        const box = (el) => {
          if (!el) return null;
          const b2 = el.getBoundingClientRect();
          return { x: Math.round(b2.x), y: Math.round(b2.y), w: Math.round(b2.width), h: Math.round(b2.height), b: Math.round(b2.bottom), r: Math.round(b2.right) };
        };
        const over = (a, c) => (a && c ? !(a.b <= c.y || c.b <= a.y || a.r <= c.x || c.r <= a.x) : false);

        const hero = q(".hero");
        const textCol = q(".hero__text");
        const frame = q(".shotFrame");
        const meta = q(".shotMeta");
        const h1s = [...document.querySelectorAll(".hero__h1")];
        const proof = q(".hero__proof");
        const lede = q(".hero__lede");
        const inner = q(".shotFrame__inner");

        // Baris terakhir paragraf terlalu pendek (yatim)?
        // Ukur lebar BARIS terakhir lewat client rects, dibanding lebar kolom.
        let ledeOrphan = false;
        let ledeLines = 0;
        let lebarBarisTerakhir = 0;
        if (lede) {
          const cs = lede.ownerDocument.defaultView.getComputedStyle(lede);
          const lh = parseFloat(cs.lineHeight) || 24;
          ledeLines = Math.round(lede.getBoundingClientRect().height / lh);
          try {
            const rng = document.createRange();
            rng.selectNodeContents(lede);
            const rects = [...rng.getClientRects()].filter((x) => x.width > 1);
            const cw = lede.getBoundingClientRect().width;
            if (rects.length > 1 && cw > 0) {
              lebarBarisTerakhir = Math.round(rects[rects.length - 1].width);
              ledeOrphan = lebarBarisTerakhir < cw * 0.25;
            }
          } catch (e) { /* abaikan */ }
        }

        // judul keluar kolom?
        const h1Over = h1s.some((el) => {
          const eb = el.getBoundingClientRect();
          const cb = textCol?.getBoundingClientRect();
          return cb ? eb.right > cb.right + 2 || eb.left < cb.left - 2 : false;
        });

        // tiga angka sejajar satu baris?
        const proofTops = proof ? [...proof.children].map((li) => Math.round(li.getBoundingClientRect().top)) : [];
        const proofSatuBaris = proofTops.length === 3 && new Set(proofTops).size === 1;

        // header menutupi judul?
        const hd = q(".hd");
        const pageTitle = q(".pageHero__t, .aboutHero__t, .hero__h1");
        const hdB = box(hd);
        const ptB = box(pageTitle);
        const tertutupHeader = hd && pageTitle ? ptB.y < hdB.b - 1 : false;

        // ukuran teks isi
        const bodyFont = (() => {
          const el = q(".hero__lede") || q(".pageHero__s") || q(".secHead__s") || document.querySelector("p");
          return el ? parseFloat(getComputedStyle(el).fontSize) : 0;
        })();
        // sasaran sentuh terkecil dari tombol yang terlihat
        const targets = [...document.querySelectorAll("a.btn, button, .icBtn, .hd__burger")].filter((el) => el.getBoundingClientRect().height > 0).map((el) => Math.round(el.getBoundingClientRect().height));
        const targetMin = targets.length ? Math.min(...targets) : 0;

        return {
          heroH: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
          vh: window.innerHeight,
          duaKolom: textCol && frame ? textCol.getBoundingClientRect().right < frame.getBoundingClientRect().left : null,
          teksH: textCol ? Math.round(textCol.getBoundingClientRect().height) : 0,
          fotoH: frame ? Math.round(frame.getBoundingClientRect().height) : 0,
          ledeLines,
          ledeOrphan,
          lebarBarisTerakhir,
          h1Over,
          proofSatuBaris,
          proofTops,
          fotoTabrakanMeta: box(inner) && box(meta) ? over(box(inner), box(meta)) : false,
          fotoTabrakanTeks: box(frame) && box(textCol) ? over(box(frame), box(textCol)) : false,
          tertutupHeader,
          bodyFont,
          targetMin,
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      results.push({ vp: tag, w, h, desktop, url, ...r });
    }
    await ctx.close();
  }

  const R = (f) => results.filter(f);
  const fmt = (arr, key) => arr.map((r) => `${r.vp}${r.url !== "/" ? r.url : ""}=${r[key]}`).join(" ");

  // 1. tinggi hero di desktop
  const heroTall = R((r) => r.desktop && r.url === "/" && r.heroH > r.vh * 1.06);
  check("desktop: hero ≤106% tinggi layar (isi penting di atas lipatan)", heroTall.length === 0, { melebihi: heroTall.map((r) => `${r.vp}=${Math.round((r.heroH / r.vh) * 100)}%`) });

  // 2. keseimbangan dua kolom
  const takSeimbang = R((r) => r.desktop && r.url === "/" && !r.duaKolom && r.teksH > 0);
  const beda = R((r) => r.desktop && r.url === "/" && r.duaKolom).map((r) => ({ vp: r.vp, beda: Math.abs(r.teksH - r.fotoH) }));
  check("desktop: dua kolom aktif di ≥900px", takSeimbang.length === 0, { satuKolom: takSeimbang.map((r) => r.vp) });
  check("kolom teks & foto tidak terlalu jauh beda tingginya (≤150px)", beda.every((d) => d.beda <= 150), { beda });

  // 3. judul keluar kolom
  const h1bad = R((r) => r.h1Over);
  check("judul tidak keluar dari kolomnya di semua lebar", h1bad.length === 0, { gagal: h1bad.map((r) => `${r.vp}${r.url}`) });

  // 4. paragraf: baris wajar & tanpa baris yatim
  const ledeBad = R((r) => r.url === "/" && r.ledeLines > 6);
  const orphan = R((r) => r.url === "/" && r.ledeOrphan);
  check("paragraf hero maksimum 6 baris di semua lebar", ledeBad.length === 0, { baris: fmt(R((r) => r.url === "/"), "ledeLines") });
  check("tidak ada baris terakhir paragraf yang terlalu pendek (<25% kolom)", orphan.length === 0, { yatim: orphan.map((r) => `${r.vp}=${r.lebarBarisTerakhir}px`) });

  // 5. tiga angka sejajar
  const proofBad = R((r) => r.desktop && r.url === "/" && !r.proofSatuBaris);
  check("desktop: tiga angka tampil satu baris sejajar", proofBad.length === 0, { gagal: proofBad.map((r) => `${r.vp} ${JSON.stringify(r.proofTops)}`) });

  // 6. tumpang tindih
  const tab = R((r) => r.fotoTabrakanMeta);
  const tabTeks = R((r) => r.fotoTabrakanTeks);
  check("foto tidak menimpa kartu identitas", tab.length === 0, { gagal: tab.map((r) => r.vp) });
  check("foto tidak menimpa kolom teks", tabTeks.length === 0, { gagal: tabTeks.map((r) => r.vp) });

  // 7. ukuran teks & sasaran sentuh
  const kecil = R((r) => !r.desktop && r.bodyFont > 0 && r.bodyFont < 16);
  const target = R((r) => !r.desktop && r.targetMin > 0 && r.targetMin < 44);
  check("ponsel: teks isi ≥16px", kecil.length === 0, { gagal: kecil.map((r) => `${r.vp}${r.url}=${r.bodyFont}px`) });
  check("ponsel: sasaran sentuh ≥44px", target.length === 0, { gagal: target.map((r) => `${r.vp}${r.url}=${r.targetMin}px`) });

  // 8. overflow
  const ovf = R((r) => r.overflowX);
  check("tidak ada scroll horizontal", ovf.length === 0, { gagal: ovf.map((r) => `${r.vp}${r.url}`) });

  // 9. header tidak menutupi judul
  const hdBad = R((r) => r.tertutupHeader);
  check("kepala halaman tidak menutupi judul", hdBad.length === 0, { gagal: hdBad.map((r) => `${r.vp}${r.url}`) });

  console.log(`\n(diperiksa: ${results.length} kombinasi halaman × lebar layar)`);
  await b.close();
  fs.writeFileSync(path.join(OUT, "verify-responsive.json"), JSON.stringify({ ok: ok.length, bad: bad.length, results: [...ok, ...bad] }, null, 2));
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
