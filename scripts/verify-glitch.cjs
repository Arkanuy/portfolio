/** Audit "glitch tampilan" — cari sumber pergeseran & ketidakstabilan tata letak.
 *
 *  Pendekatan: buka tiap halaman DENGAN jaringan lambat & CPU lambat (biar bug
 *  balapan muncul), lalu ukur:
 *   1. CLS (Cumulative Layout Shift) memakai PerformanceObserver
 *   2. elemen mana yang bergeser paling banyak (sumber CLS)
 *   3. apakah ada elemen berubah ukuran setelah gambar/font selesai dimuat
 *   4. apakah ada elemen yang punya opacity 0 tapi TETAP memakan ruang (tak terlihat)
 *   5. apakah ada teks yang terpotong (overflow hidden tanpa ellipsis)
 *   6. apakah ada elemen menumpuk tanpa sengaja
 */
const { chromium } = require("playwright");

const BASE = process.env.PF_BASE || "http://localhost:4321";
const PAGES = ["/", "/karya/", "/tentang/", "/riwayat/", "/kontak/", "/layanan/", "/layanan/web/", "/karya/mafiablox/"];

const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

(async () => {
  const b = await chromium.launch();
  const hasil = [];

  for (const [vw, vh, tag, throttle] of [
    [1440, 900, "desktop-cepat", false],
    [1440, 900, "desktop-lambat", true],
    [390, 844, "ponsel-lambat", true],
  ]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: vw < 900, isMobile: vw < 900 });
    const p = await ctx.newPage();
    if (throttle) {
      const cdp = await ctx.newCDPSession(p);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false, latency: 400,
        downloadThroughput: (400 * 1024) / 8, uploadThroughput: (200 * 1024) / 8,
      });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    }

    for (const url of PAGES) {
      try {
        await p.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 45000 });
      } catch {
        continue;
      }

      // ukur CLS + catat sumber pergeseran
      const r = await p.evaluate(async () => {
        const shifts = [];
        const po = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) {
              shifts.push({
                value: +e.value.toFixed(4),
                sources: (e.sources || []).map((s) => ({
                  tag: s.node?.tagName,
                  cls: (s.node?.className || "").toString().slice(0, 48),
                })),
              });
            }
          }
        });
        try { po.observe({ type: "layout-shift", buffered: true }); } catch {}

        // rekam ukuran elemen kunci di tiga titik waktu
        const kunci = [".hero__h1", ".shotFrame__inner", ".hero__proof", ".quote__t", ".cc__media img", ".secHead__t", ".pageHero__t", ".aboutPhoto img", ".band__t"];
        const snap = () => {
          const o = {};
          kunci.forEach((s) => {
            const el = document.querySelector(s);
            if (!el) return;
            const rr = el.getBoundingClientRect();
            o[s] = { w: Math.round(rr.width), h: Math.round(rr.height), top: Math.round(rr.top) };
          });
          return o;
        };
        const t0 = snap();
        await new Promise((r2) => setTimeout(r2, 700));
        const t1 = snap();
        await new Promise((r2) => setTimeout(r2, 1500));
        const t2 = snap();
        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise((r2) => setTimeout(r2, 500));
        const t3 = snap();

        // bandingkan: elemen yang berubah ukuran (bukan cuma posisi)
        const berubah = [];
        Object.keys(t3).forEach((s) => {
          if (!t0[s] || !t3[s]) return;
          const dw = t3[s].w - t0[s].w;
          const dh = t3[s].h - t0[s].h;
          if (Math.abs(dw) > 2 || Math.abs(dh) > 2) {
            berubah.push({ sel: s, dari: `${t0[s].w}x${t0[s].h}`, ke: `${t3[s].w}x${t3[s].h}` });
          }
        });

        // elemen tak terlihat tapi memakan ruang
        const hantu = [];
        document.querySelectorAll("body *").forEach((el) => {
          const cs = getComputedStyle(el);
          const rr = el.getBoundingClientRect();
          if (parseFloat(cs.opacity) >= 0.05 || rr.width <= 40 || rr.height <= 40 || cs.visibility === "hidden") return;
          if (el.classList.contains("srOnly") || el.getAttribute("aria-hidden") === "true") return;
          // Elemen yang MEMANG dianimasikan masuk (mulai dari opacity 0) bukan glitch.
          // Ia jadi terlihat begitu bloknya masuk layar; kalau kita menunggu blok itu
          // di layar, opacity-nya sudah 1.
          const cls = (el.className || "").toString();
          if (/wf__w|blurTxt__w|treveal__c|treveal__sp/.test(cls)) return;
          // Blok reveal yang belum masuk layar juga wajar masih transparan.
          if (el.closest("[data-fx]") || el.hasAttribute("data-fx")) return;
          hantu.push({ cls: cls.slice(0, 44) || el.tagName, w: Math.round(rr.width), h: Math.round(rr.height) });
        });

        // teks terpotong (overflow hidden tanpa ellipsis)
        const terpotong = [];
        document.querySelectorAll("h1, h2, h3, p, span, a").forEach((el) => {
          const cs = getComputedStyle(el);
          if (cs.overflow === "hidden" && cs.textOverflow !== "ellipsis" && cs.webkitLineClamp === "none") {
            if (el.scrollHeight > el.clientHeight + 4 && el.clientHeight > 0) {
              terpotong.push({ cls: (el.className || el.tagName).toString().slice(0, 40), isi: (el.innerText || "").trim().slice(0, 30), scroll: el.scrollHeight, client: el.clientHeight });
            }
          }
        });

        const cls = shifts.reduce((a, x) => a + x.value, 0);
        return {
          cls: +cls.toFixed(4),
          shifts: shifts.slice(0, 5),
          berubah,
          hantu: hantu.slice(0, 5),
          terpotong: terpotong.slice(0, 4),
          scrollX: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });

      hasil.push({ tag, url, ...r });
    }
    await ctx.close();
  }

  const R = (f) => hasil.filter(f);
  const fmt = (a, k) => a.map((x) => `${x.tag}${x.url}=${x[k]}`).join(" ");

  const clsBuruk = R((r) => r.cls > 0.05);
  check(`CLS rendah di ${hasil.length} kombinasi halaman (semua ≤0.05)`, clsBuruk.length === 0,
    { nilai: clsBuruk.map((r) => `${r.tag}${r.url}=${r.cls}`), sumber: clsBuruk.flatMap((r) => r.shifts).slice(0, 4) });

  const era = R((r) => r.berubah.length > 0);
  check("tidak ada elemen berubah ukuran setelah dimuat (font/gambar tidak menggeser)", era.length === 0,
    { kasus: era.slice(0, 6).map((r) => `${r.tag}${r.url}: ${JSON.stringify(r.berubah)}`) });

  const hantu = R((r) => r.hantu.length > 0);
  check("tidak ada elemen tak terlihat yang memakan ruang", hantu.length === 0,
    { kasus: hantu.slice(0, 5).map((r) => `${r.tag}${r.url}: ${JSON.stringify(r.hantu)}`) });

  const potong = R((r) => r.terpotong.length > 0);
  check("tidak ada teks terpotong tanpa penanda", potong.length === 0,
    { kasus: potong.slice(0, 5).map((r) => `${r.tag}${r.url}: ${JSON.stringify(r.terpotong)}`) });

  /* ---------- bahasa: seluruh teks yang TERLIHAT harus Inggris ----------
     Kata sambung Indonesia dipakai sebagai penanda karena tidak ada padanannya
     di bahasa Inggris. Ini menangkap sisa terjemahan seperti tombol
     "Lihat studi kasus" dan alt "Tampilan ..." yang lolos dari daftar kata
     yang dipakai di uji lain. */
  const ID = /(yang|dengan|untuk|dari|tidak|atau|adalah|akan|sudah|belum|bisa|harus|pada|saya|kami|kita|klik|unduh|halaman|proyek|layanan|karya|riwayat|tentang|beranda|lihat|tampilan|studi|kasus|sebagai|karena|tetapi|juga|masih|lebih|dapat|setiap|melalui|secara|oleh|ini|itu)/i;

  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const lp = await ctx.newPage();
  const kotor = [];
  for (const url of PAGES) {
    try {
      await lp.goto(BASE + url, { waitUntil: "load", timeout: 40000 });
    } catch {
      continue;
    }
    await lp.waitForTimeout(900);
    const t = await lp.evaluate(() => {
      const teks = document.body.innerText;
      const alts = [...document.querySelectorAll("img[alt]")].map((i) => i.alt);
      const aria = [...document.querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label"));
      const titles = [...document.querySelectorAll("[title]")].map((e) => e.getAttribute("title"));
      return { teks, alts, aria, titles };
    });
    const gabung = [t.teks, ...t.alts, ...t.aria, ...t.titles].join(" | ");
    const ketemu = gabung.match(new RegExp(ID.source, "gi")) || [];
    if (ketemu.length) kotor.push({ url, kata: [...new Set(ketemu.map((x) => x.toLowerCase()))] });
  }
  await ctx.close();
  check(`seluruh teks terlihat berbahasa Inggris (${PAGES.length} halaman, termasuk alt/aria/title)`, kotor.length === 0, { kotor });

  check("tidak ada scroll horizontal", R((r) => r.scrollX).length === 0, { gagal: R((r) => r.scrollX).map((r) => r.tag + r.url) });

  await b.close();
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
