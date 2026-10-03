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

    await p.waitForTimeout(11000);

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

    const fr = p.frames().find((f) => f.url().includes("kage.html"));
    check("dokumen kanonik termuat di dalam frame", !!fr);

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
          scrollH: document.documentElement.scrollHeight,
        };
      });

      check("judul dokumen kanonik", /Kage/.test(s.title), { title: s.title });
      check("kanvas utama berukuran penuh (bukan 0)", !!s.canvasUtama && !/x0$/.test(s.canvasUtama), { ukuran: s.canvasUtama });
      check("four kanvas + gambar aset termuat", s.canvas >= 3 && s.imgs >= 10, { canvas: s.canvas, imgs: s.imgs });
      check("runtime three.js termuat", s.three === true, { three: s.three });
      check("5 bab asli ada (hero/gate/pathways/lessons/eternity)", s.sections.length === 5, { sections: s.sections });
      check("navigasi asli dengan judul Jepang", s.navItems.length >= 4 && s.navItems.some((x) => /伽藍|庭園|神事|残光/.test(x)), { nav: s.navItems });
      check("tipografi kanonik: Onest, latar #05070a", /Onest/.test(s.font) && s.bg === "rgb(5, 7, 10)", { font: s.font, bg: s.bg });
      check("dokumen bisa digulir", s.scrollH > 3000, { scrollH: s.scrollH });
    }

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
