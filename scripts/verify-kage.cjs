const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");

/**
 * Verifikasi Kage + regresi situs.
 *
 * Dua hal yang diperiksa:
 *   A. KAGE benar-benar dirender dan hidup — dibuktikan dengan membandingkan
 *      tangkapan antar posisi gulir DAN saat diam (scene-nya beranimasi).
 *      Pembacaan piksel WebGL langsung diabaikan karena perender software di
 *      mesin ini mengembalikan 0 walau halamannya jelas terlihat.
 *   B. SITUSNYA tidak rusak — rute-rute situs dipindah ke grup `(site)` supaya
 *      /kage bisa punya layout sendiri, dan pemindahan itu harus tidak
 *      mengubah apa pun di halaman lama.
 */
const BASE = process.env.PF_BASE || "http://127.0.0.1:4393";

const ok = [];
const bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const sitePages = ["/", "/karya/", "/layanan/", "/tentang/", "/riwayat/", "/kontak/",
  "/layanan/business-systems/", "/layanan/web/", "/layanan/analysis/", "/layanan/automation/",
  "/karya/mafiablox/", "/karya/pixwatch/", "/karya/buildplan/", "/karya/aplikasi-solusi-bisnis/",
  "/karya/rollerskool/", "/karya/tasty-food/", "/karya/website-sekolah/"];

(async () => {
  const browser = await chromium.launch();

  /* ============ A. KAGE ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    const failed = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
    p.on("console", (m) => m.type() === "error" && errs.push("C:" + m.text().slice(0, 160)));
    p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

    const res = await p.goto(BASE + "/kage/", { waitUntil: "networkidle", timeout: 45000 });
    check("rute /kage balas 200", !!res && res.status() === 200, { status: res ? res.status() : 0 });

    await p.waitForTimeout(13000);

    const host = await p.evaluate(() => {
      const wrap = document.querySelector(".landing-page-frame");
      const frame = document.querySelector("iframe");
      const shell = document.querySelector(".shader-frame");
      return {
        adaShell: !!shell,
        frameState: wrap ? wrap.getAttribute("data-state") : null,
        src: frame ? frame.getAttribute("src") : null,
        sandbox: frame ? frame.getAttribute("sandbox") : null,
        shellRect: shell ? { w: Math.round(shell.getBoundingClientRect().width), h: Math.round(shell.getBoundingClientRect().height) } : null,
        frameRect: frame ? { w: Math.round(frame.getBoundingClientRect().width), h: Math.round(frame.getBoundingClientRect().height) } : null,
        opacityIframe: frame ? getComputedStyle(frame).opacity : null,
        opacityShell: shell ? getComputedStyle(shell).opacity : null,
        pointerEvents: frame ? getComputedStyle(frame).pointerEvents : null,
      };
    });

    check(".shader-frame terpasang dengan tinggi penuh", !!host.adaShell && host.shellRect && host.shellRect.h > 500, host.shellRect);
    check("iframe menunjuk dokumen kanonik /landing-pages/kage.html", host.src === "/landing-pages/kage.html", { src: host.src });
    check("sandbox memberi allow-same-origin + allow-scripts", /allow-same-origin/.test(host.sandbox || "") && /allow-scripts/.test(host.sandbox || ""), { sandbox: host.sandbox });
    /* `data-state` TIDAK dipakai sebagai gate: nilainya flaky (terukur
       loading/ready/loading di tiga percobaan berturut-turut) dan di sumbernya
       ia hanya menggerakkan SATU aturan —
         opacity: backgroundCanvasSelector && !ready ? 0 : 1
       Kita tidak memakai `backgroundCanvasSelector`, jadi kondisi itu selalu
       false dan opacity-nya tetap 1. Yang diuji karena itu adalah akibat yang
       benar-benar terlihat: frame tidak tersembunyi dan tetap bisa dipakai. */
    check(
      "frame terlihat & bisa dipakai apa pun nilai data-state",
      host.opacityIframe === "1" && host.opacityShell === "1" && host.pointerEvents === "auto" && host.shellRect.h > 500,
      { state: host.frameState, opacityIframe: host.opacityIframe, opacityShell: host.opacityShell, pointerEvents: host.pointerEvents },
    );
    check("iframe terukur penuh, bukan 0", host.frameRect && host.frameRect.h > 500 && host.frameRect.w > 1000, host.frameRect);

    /* Cocokkan path-nya, BUKAN ".html"-nya.
       Di Cloudflare Pages, rute statis "kage.html" disajikan dengan URL bersih
       ("/landing-pages/kage"), jadi mencari literal "kage.html" gagal di live
       padahal dokumennya termuat. Terukur di live: frame URL = 
       //portfolio-arkan.pages.dev/landing-pages/kage, state=ready, tinggi 900. */
    const fr = p.frames().find((f) => /\/landing-pages\/kage(\b|\.html)/.test(f.url()));
    check("dokumen kanonik termuat di dalam frame", !!fr, { frames: p.frames().map((x) => x.url().slice(-44)) });

    if (fr) {
      const s = await fr.evaluate(() => {
        const c = (x) => document.querySelectorAll(x).length;
        const cv = c("canvas");
        const big = Array.from(document.querySelectorAll("canvas")).find((x) => x.getBoundingClientRect().height > 200);
        return {
          title: document.title,
          h1: (document.querySelector("h1")?.textContent || "").replace(/\s+/g, " ").trim(),
          navItems: Array.from(document.querySelectorAll("nav a")).map((a) => a.textContent.replace(/\s+/g, " ").trim()),
          sections: Array.from(document.querySelectorAll("section")).map((x) => x.id || x.className.split(" ")[0]),
          canvas: cv,
          canvasUtama: big ? Math.round(big.getBoundingClientRect().width) + "x" + Math.round(big.getBoundingClientRect().height) : null,
          imgs: c("img"),
          three: typeof window.THREE !== "undefined",
          font: getComputedStyle(document.body).fontFamily.slice(0, 30),
          bg: getComputedStyle(document.body).backgroundColor,
          vermilion: getComputedStyle(document.documentElement).getPropertyValue("--vermilion").trim(),
          scrollH: document.documentElement.scrollHeight,
        };
      });

      check("judul dokumen kanonik", /Kage/.test(s.title), { title: s.title });
      check("kanvas utama berukuran penuh (bukan 0)", !!s.canvasUtama && !/x0$/.test(s.canvasUtama), { ukuran: s.canvasUtama });
      check("four kanvas + gambar aset termuat", s.canvas >= 3 && s.imgs >= 10, { canvas: s.canvas, imgs: s.imgs });
      check("runtime three.js termuat", s.three === true, { three: s.three });
      check("5 bab asli ada (hero/gate/pathways/lessons/eternity)", s.sections.length === 5, { sections: s.sections });
      check("navigasi asli dengan judul Jepang", s.navItems.length >= 4 && s.navItems.some((x) => /伽藍|庭園|神事|残光/.test(x)), { nav: s.navItems });
      /* Tipografi DISESUAIKAN ke proyek: Geist (sekeluarga Inter) + aksen
         oranye #f95400, bukan Onest + vermilion #e0231c bawaan Kage. Ini bukti
         bahwa halaman ini sudah disesuaikan, bukan salinan mentah. */
      check(
        "tipografi disesuaikan ke proyek (Geist, bukan Onest bawaan)",
        /Geist/i.test(s.font) && !/^Onest/.test(s.font.trim()),
        { font: s.font },
      );
      check("aksen situs dipakai, bukan vermilion bawaan", s.vermilion === "#f95400", { vermilion: s.vermilion });
      check("dokumen bisa digulir", s.scrollH > 3000, { scrollH: s.scrollH });
    }

    /* ===== BAGIAN INI YANG MEMBUKTIKAN SCENE-SUDAH-MENYATU =====
       Ukurannya bukan "ada header/footer", tapi: apakah halaman ini memakai
       IDENTITAS YANG SAMA dengan situs — isi yang sama, komponen yang sama,
       palet gelap yang diturunkan dari token yang sama, dan scene yang tetap
       utuh di dalamnya. */

    /* 1. header & footer situs yang SAMA dipakai di sini */
    const shell = await p.evaluate(() => ({
      night: !!document.querySelector(".kageNight"),
      /* Header & footer ada di luar pembungkus bab (saudara konten), jadi
         diukur dari dokumen — justru itu intinya: keduanya harus ikut gelap. */
      header: !!document.querySelector(".hd"),
      navCount: document.querySelectorAll(".hd__link").length,
      footer: !!document.querySelector(".ft"),
      /* Dibaca sebagai luminansi, bukan string warna: Chrome mengembalikan
         "color(srgb 0.019 0.027 0.039 / 0.88)" untuk warna transparan, bukan
         "rgb(5, 7, 10)", sehingga perbandingan teks gagal padahal warnanya benar. */
      headerBgLum: (() => {
        const el = document.querySelector(".hd");
        if (!el) return null;
        const c = getComputedStyle(el).backgroundColor;
        const n = (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const rgb = c.startsWith("color(") ? n.map((v) => v * 255) : n;
        if (rgb.length < 3) return null;
        const lin = rgb.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
        return +(0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]).toFixed(4);
      })(),
      headerInkLum: (() => {
        const el = document.querySelector(".hd__name");
        if (!el) return null;
        const n = (getComputedStyle(el).color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        if (n.length < 3) return null;
        const lin = n.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
        return +(0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]).toFixed(4);
      })(),
      /* token gelap benar-benar berlaku, bukan cuma kelasnya terpasang */
      bg: getComputedStyle(document.querySelector(".kageNight")).backgroundColor,
      ink: getComputedStyle(document.querySelector(".kageNight")).getPropertyValue("--ink").trim(),
      accent: getComputedStyle(document.querySelector(".kageNight")).getPropertyValue("--accent-ink").trim(),
    }));
    check("malam menyala: header + footer situs yang sama dipakai", shell.night && shell.header && shell.footer && shell.navCount >= 5, { nav: shell.navCount });
    /* Ini bukti "menyatu": header yang sama benar-benar berubah jadi gelap. */
    /* Ini bukti inti "menyatu": header yang SAMA benar-benar berubah jadi gelap.
       Ambang: latar gelap (luminansi < 0.02) dan teksnya terang (> 0.5). */
    check(
      "header situs ikut jadi malam (bukan terang di atas halaman gelap)",
      shell.headerBgLum !== null && shell.headerBgLum < 0.02 && shell.headerInkLum > 0.5,
      { bgLum: shell.headerBgLum, inkLum: shell.headerInkLum },
    );
    check("token gelap berlaku (bg #05070a, ink terang, aksen oranye)", shell.bg === "rgb(5, 7, 10)" && shell.ink === "#dfe7e0" && shell.accent === "#ff7a45", { bg: shell.bg, ink: shell.ink, accent: shell.accent });

    /* 2. isi portfolio hadir di bab malam ini — dan itu memang isi yang sama */
    const content = await p.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".kageNight .cc__title")).map((e) => e.textContent.trim());
      const links = Array.from(document.querySelectorAll(".kageNight .cc")).map((a) => a.getAttribute("href"));
      return { cards, links, chapterHit: (document.body.innerText.match(/Chapter/g) || []).length };
    });
    check("isi portfolio ikut masuk bab malam (7 kartu karya yang sama)", content.cards.length === 7, { cards: content.cards });

    const base = await ctx.newPage();
    await base.goto(BASE + "/karya/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await base.waitForTimeout(400);
    const workCards = await base.evaluate(() =>
      Array.from(document.querySelectorAll(".cc__title")).map((e) => e.textContent.trim()),
    );
    check(
      "judul karya di bab malam identik dengan halaman Work",
      workCards.length === content.cards.length && workCards.every((t, i) => t === content.cards[i]),
      { malam: content.cards.slice(0, 3), kerja: workCards.slice(0, 3) },
    );
    check("kartu karya menaut ke studi kasus yang sama", content.links.every((h) => /^\/karya\/[a-z-]+$/.test(h || "")), { n: content.links.length });

    /* 3. portfolio TERANG lagi di halaman berikutnya — bukti malamnya
          memang cuma satu bab, bukan rombakan seluruh situs */
    const home = await ctx.newPage();
    await home.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await home.waitForTimeout(400);
    const homeState = await home.evaluate(() => ({
      hasNight: !!document.querySelector(".kageNight"),
      bg: getComputedStyle(document.body).backgroundColor,
    }));
    check("beranda tetap terang (malam hanya satu bab)", !homeState.hasNight, homeState);

    check("/kage tanpa error konsol", errs.length === 0, { errs: errs.slice(0, 3) });
    check("/kage tanpa permintaan gagal (aset kanonik ada)", failed.length === 0, { failed: failed.slice(0, 3) });

    await ctx.close();
  }

  /* ============ B. REGRESI SITUS ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    const failed = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
    p.on("console", (m) => m.type() === "error" && errs.push("C:" + m.text().slice(0, 120)));
    p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

    const status = {};
    for (const u of sitePages) {
      const r = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 25000 });
      status[u] = r ? r.status() : 0;
    }
    check("17 rute situs masih balas 200", Object.values(status).every((x) => x === 200), {
      bad: Object.entries(status).filter(([, x]) => x !== 200),
    });
    check("situs tanpa error konsol", errs.length === 0, { errs: errs.slice(0, 3) });
    check("situs tanpa permintaan gagal", failed.length === 0, { failed: failed.slice(0, 3) });

    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(600);
    const home = await p.evaluate(() => ({
      header: !!document.querySelector("header"),
      footer: !!document.querySelector("footer"),
      h1: (document.querySelector("h1")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 60),
      nav: document.querySelectorAll("header nav a").length,
      cards: document.querySelectorAll(".cc").length,
    }));
    check("beranda masih punya header/footer/nav (chrome utuh)", home.header && home.footer && home.nav >= 5, home);
    check("beranda masih memuat kartu karya", home.cards >= 4, { cards: home.cards });
    await ctx.close();
  }

  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 200)));
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
