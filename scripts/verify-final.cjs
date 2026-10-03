/** Verifikasi konsep baru: 16 halaman, foto di banyak halaman, tema terang,
 *  navigasi, form kontak, dan ponsel. */
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
  /** Navigasi yang tahan gagal: server lokal kadang lambat menutup koneksi,
   *  jadi kalau networkidle lewat batas, cukup tunggu DOM-nya siap. */
  const go = async (u, wait = "networkidle") => {
    try {
      return await p.goto(BASE + u, { waitUntil: wait, timeout: 20000 });
    } catch {
      return await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 20000 });
    }
  };
  const errs = [];
  const failed = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("tidak-ada")) failed.push(`${r.status()} ${r.url()}`);
  });

  // 1. semua halaman 200 (5 utama + 4 layanan + 7 karya = 16)
  const pages = ["/", "/layanan", "/karya", "/tentang", "/riwayat", "/kontak"];
  const svc = ["business-systems", "web", "analysis", "automation"].map((s) => `/layanan/${s}`);
  const cs = ["mafiablox", "pixwatch", "buildplan", "aplikasi-solusi-bisnis", "rollerskool", "tasty-food", "website-sekolah"].map((s) => `/karya/${s}`);
  const status = {};
  for (const u of [...pages, ...svc, ...cs]) {
    const r = await go(u, "domcontentloaded");
    status[u] = r.status();
  }
  const badPages = Object.entries(status).filter(([, s]) => s !== 200);
  check(`${Object.keys(status).length} halaman balas 200`, badPages.length === 0, { total: Object.keys(status).length, gagal: badPages });

  // 2. tema default terang (fresh)
  await go("");
  await p.waitForTimeout(400);
  const theme = await p.evaluate(() => {
    const d = document.documentElement;
    const cs = getComputedStyle(document.body);
    return { attr: d.dataset.theme, bg: cs.backgroundColor, color: cs.color };
  });
  check("default theme is light", theme.attr === "light" || /255, 255, 255/.test(theme.bg), theme);

  // 3. foto tampil di 5 tempat berbeda
  const photoSpots = [
    ["/", ".shotFrame__img"],
    ["/tentang", ".aboutPhoto img"],
    ["/kontak", ".contactPhoto img"],
    ["/layanan", ".aboutStrip__photo img"],
    ["/", ".ft__avatar"],
  ];
  const photos = {};
  for (const [u, sel] of photoSpots) {
    await go(u);
    await p.waitForTimeout(400);
    photos[`${u} ${sel}`] = await p.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: el.naturalWidth, box: Math.round(r.width) };
    }, sel);
  }
  check(
    "portrait appears on home, about, contact, services, footer",
    Object.values(photos).every((v) => v && v.w > 0) && photos["/ .shotFrame__img"].box >= 300,
    photos,
  );

  // 4. header + navigasi
  await go("");
  await p.waitForTimeout(400);
  const nav = await p.evaluate(() => ({
    links: [...document.querySelectorAll(".hd__link")].map((a) => a.textContent),
    active: document.querySelector('.hd__link[data-active="true"]')?.textContent,
    cta: document.querySelector(".hd__cta")?.getAttribute("href"),
    sticky: getComputedStyle(document.querySelector(".hd")).position,
  }));
  check("nav has 5 links + CTA and marks the active page", nav.links.length === 5 && nav.active === "Home" && nav.cta === "/kontak", nav);

  // 5. navigasi benar-benar pindah halaman
  await p.click('.hd__link:has-text("Services")');
  await p.waitForTimeout(1600);
  const navTo = await p.evaluate(() => ({ url: location.pathname, h1: document.querySelector(".pageHero__t")?.textContent }));
  check("clicking the menu goes to /layanan", /^\/layanan\/?$/.test(navTo.url) && /actually do/i.test(navTo.h1 || ""), navTo);

  // 6. 4 layanan + 7 karya terdaftar, dan tiap kartu punya tautan detail
  await go("/layanan");
  const svcRows = await p.$$eval(".svcRow", (els) => els.length);
  await go("/karya");
  const ccards = await p.$$eval(".cc", (els) => els.length);
  const ccLinks = await p.$$eval(".cc", (els) => els.map((e) => e.getAttribute("href")));
  check("services page lists 4 services", svcRows === 4, { svcRows });
  check("work page lists 7 cards linking to detail pages", ccards === 7 && ccLinks.every((h) => h?.startsWith("/karya/")), { ccards, contoh: ccLinks.slice(0, 3) });

  // 7. detail karya: alur masalah → dikerjakan → hasil
  await go("/karya/mafiablox");
  const detail = await p.evaluate(() => ({
    title: document.querySelector(".pageHero__t")?.textContent,
    blocks: [...document.querySelectorAll(".caseBlock__k")].map((e) => e.textContent),
    meta: [...document.querySelectorAll(".caseMeta__k")].map((e) => e.textContent),
    imgW: document.querySelector(".caseShot img")?.naturalWidth ?? 0,
    next: document.querySelector(".caseNav__next")?.getAttribute("href"),
  }));
  check(
    "case detail covers problem, build, outcome",
    detail.blocks.join("|") === "The problem|What I built|The outcome" && detail.imgW > 0 && detail.meta.length >= 3,
    detail,
  );

  // 8. form kontak menyusun email (tidak menghilangkan data)
  await go("/kontak");
  await p.fill("#nama", "Budi");
  await p.fill("#kontak", "budi@example.com");
  await p.fill("#pesan", "Pesanan dicatat di chat, sering salah.");
  // location tidak bisa didefinisikan ulang, jadi uji lewat aksi nyata:
  // blokir skema mailto, klik tombol, dan tangkap percobaan navigasinya.
  const mailReq = p.waitForRequest((r) => r.url().startsWith("mailto:"), { timeout: 8000 }).catch(() => null);
  await p.click('.form__go');
  const req = await mailReq;
  const mail = req ? decodeURIComponent(req.url()) : null;
  check("submit button composes an email with the visitor data", Boolean(mail) && mail.startsWith("mailto:") && mail.includes("Budi") && mail.includes("sering salah"), { mail: (mail || "").slice(0, 110) });

  // 9. tema gelap tetap jalan
  await p.evaluate(() => document.querySelector(".icBtn")?.click());
  await p.waitForTimeout(500);
  const dark = await p.evaluate(() => ({
    attr: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.body).backgroundColor,
    stored: localStorage.getItem("theme"),
  }));
  check("theme switch flips to dark and persists", dark.attr === "dark" && dark.stored === "dark", dark);

  check("no page errors, no failed requests", errs.length === 0 && failed.length === 0, { pageErrors: errs.slice(0, 3), failed: failed.slice(0, 4) });
  await ctx.close();

  // 10. ponsel
  const mc = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const mp = await mc.newPage();
  await mp.goto(BASE, { waitUntil: "networkidle" });
  await mp.waitForTimeout(600);
  const mob = await mp.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    burger: getComputedStyle(document.querySelector(".hd__burger")).display,
    navHidden: getComputedStyle(document.querySelector(".hd__nav")).display,
    heroCols: getComputedStyle(document.querySelector(".hero__in")).gridTemplateColumns.split(" ").length,
    photoW: Math.round(document.querySelector(".shotFrame__img").getBoundingClientRect().width),
    tiny: [...document.querySelectorAll("p, span, a, li, dt, dd, label")]
      .filter((x) => (x.textContent || "").trim().length > 4 && parseFloat(getComputedStyle(x).fontSize) < 12).length,
    small: [...document.querySelectorAll("a[href], button")]
      .filter((x) => {
        const r = x.getBoundingClientRect();
        if (!(r.height > 0 && r.height < 40)) return false;
        if ((x.textContent || "").trim().length === 0) return false;
        if (x.classList.contains("skip")) return false;
        return !x.closest(".ft__col") && !x.closest(".ft__links");
      })
      .map((x) => `${x.tagName}.${(x.className || "").toString().slice(0, 26)} ${Math.round(x.getBoundingClientRect().height)}px`),
  }));
  check("mobile: no overflow, single column, portrait intact", !mob.overflowX && mob.heroCols === 1 && mob.photoW > 250, mob);
  check("mobile: no tiny text, no small targets", mob.tiny === 0 && mob.small.length === 0, { tiny: mob.tiny, small: mob.small });

  await mp.click(".hd__burger");
  await mp.waitForTimeout(700);
  const drawer = await mp.evaluate(() => {
    const d = document.querySelector(".drawer");
    return { open: d.dataset.open, links: d.querySelectorAll(".drawer__link").length };
  });
  check("mobile menu opens with 6 links", drawer.open === "true" && drawer.links === 6, drawer);
  await mp.screenshot({ path: path.join(OUT, "f-6-ponsel.png") });
  await mc.close();

  // 11. reduced-motion
  const rm = await b.newContext({ viewport: { width: 1400, height: 900 }, reducedMotion: "reduce" });
  const rp = await rm.newPage();
  await rp.goto(BASE, { waitUntil: "networkidle" });
  await rp.waitForTimeout(500);
  const rmState = await rp.evaluate(() => {
    const rv = document.querySelector("[data-fx]");
    const bw = document.querySelector(".blurTxt__w");
    return {
      rvOpacity: rv ? getComputedStyle(rv).opacity : "1",
      blurOpacity: bw ? getComputedStyle(bw).opacity : "n/a",
      blurFilter: bw ? getComputedStyle(bw).filter : "n/a",
      motion: document.documentElement.dataset.motion,
    };
  });
check("reduced-motion: content is immediately visible, no motion", rmState.rvOpacity === "1" && rmState.blurOpacity === "1" && rmState.motion === "off", rmState);
  await rm.close();

  await b.close();
  fs.writeFileSync(path.join(OUT, "verify-final.json"), JSON.stringify({ ok: ok.length, bad: bad.length, results: [...ok, ...bad] }, null, 2));
  console.log(`\nRINGKASAN: ${ok.length} lolos, ${bad.length} gagal`);
  if (bad.length) process.exitCode = 1;
})().catch((e) => {
  console.error("VERIFY_FINAL_FAILED", e);
  process.exit(1);
});
