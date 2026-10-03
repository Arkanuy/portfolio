/**
 * VERIFIKASI "FIELD"
 * ==================
 * Konsep ini dibangun dari DUA REFERENSI yang dibaca lebih dulu. Jadi yang
 * diuji pertama adalah: apakah mekanisme referensinya benar-benar ada?
 *
 *   landonorris.com       gulir halus · seksi dipatok · judul dipecah ·
 *                         gambar nyata banyak · hampir tanpa keyframe CSS
 *   blue-marine/.../the-sea-we-breathe/
 *                         preloader · tombol sudut-terpotong · narasi
 *                         berlangkah · (audio toggle)
 *
 * Lalu dua hal yang tidak boleh dikorbankan:
 *   · BAN anti-slop tetap nol (orb, kaca, gradien, glow, radius besar)
 *   · TANPA JS / reduced-motion: tidak ada satu pun elemen tersembunyi
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "field");
fs.mkdirSync(OUT, { recursive: true });

const ok = [], bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const pages = [
  "/", "/karya/", "/layanan/", "/tentang/", "/riwayat/", "/kontak/",
  "/layanan/business-systems/", "/layanan/web/", "/layanan/analysis/", "/layanan/automation/",
  "/karya/mafiablox/", "/karya/pixwatch/", "/karya/buildplan/", "/karya/aplikasi-solusi-bisnis/",
  "/karya/rollerskool/", "/karya/tasty-food/", "/karya/website-sekolah/",
];

const lum = (c) => { const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

(async () => {
  const browser = await chromium.launch();
  const report = {};

  /* ============ 1. rute + error ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [], failed = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
    p.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text().slice(0, 160)));
    p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
    const status = {};
    for (const u of pages) {
      const res = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 25000 });
      status[u] = res ? res.status() : 0;
    }
    check("17 routes return 200", Object.values(status).every((s) => s === 200), { bad: Object.entries(status).filter(([, s]) => s !== 200) });
    check("no page/console errors", errs.length === 0, { errs: errs.slice(0, 3) });
    check("no 4xx/5xx", failed.length === 0, { failed: failed.slice(0, 3) });
    report.status = status;
    await ctx.close();
  }

  /* ============ 2. MEKANISME REFERENSI ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();

    /* 2a. preloader ada dan benar-benar hilang setelah siap.
       Bagian pertama harus diperiksa SANGAT cepat setelah DOM siap: kalau
       tidak, preloader sudah selesai dan gate ini tidak pernah benar-benar
       melihat preloadernya. */
    /* Preloader diperiksa dari HTML MENTAH: memasangnya adalah hal pertama yang
       dilakukan React, jadi memeriksa DOM setelah `commit` bisa sudah
       melewatkannya. Yang diuji: penandanya ada di HTML, dan setelah siap
       elemennya benar-benar dilepas dari DOM. */
    /* Ambil HTML mentah lewat Node, bukan fetch di dalam halaman tanpa origin. */
    const html = await (await p.request.get(BASE + "/")).text();
    const loaderInHtml = html.includes('class="load"');
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const early = { loader: loaderInHtml, ready: null, motion: null };
    await p.waitForTimeout(2600);
    const late = await p.evaluate(() => ({
      loaderVisible: !!document.querySelector(".load"),
      ready: document.documentElement.dataset.ready || null,
    }));
    check("preloader shows then clears (mechanism from reference)", early.loader && !late.loaderVisible && late.ready === "true", { early, late });

    /* 2b. gulir halus: engine memasang data-motion SETELAH preloader selesai */
    const motionNow = await p.evaluate(() => document.documentElement.getAttribute("data-motion"));
    check("motion engine active after preloader (data-motion=on)", motionNow === "on", { motion: motionNow, earlyMotion: early.motion });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(500);
    await p.mouse.move(700, 500);
    for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 420); await p.waitForTimeout(130); }
    await p.waitForTimeout(1400);
    const afterWheel = await p.evaluate(() => window.scrollY);
    check("smooth wheel scrolling actually moves the page", afterWheel > 400, { scrollY: Math.round(afterWheel) });

    /* 2c. judul dipecah: tiap kata punya jeda berbeda, dan kata benar-benar naik */
    const split = await p.evaluate(() => {
      const el = document.querySelector(".hero__t [data-split]") || document.querySelector("[data-split]");
      if (!el) return null;
      const words = Array.from(el.querySelectorAll(".w > span"));
      return {
        count: words.length,
        delays: words.map((w) => getComputedStyle(w).animationDelay),
        transforms: words.map((w) => getComputedStyle(w).transform.slice(0, 24)),
        overflowHidden: getComputedStyle(el.querySelector(".w")).overflow,
      };
    });
    check("headline is split per word with staggered delays", !!split && split.count >= 4 && new Set(split.delays).size >= 4, split && { words: split.count, distinctDelays: new Set(split.delays).size, sample: split.delays.slice(0, 4) });
    check("each word sits in its own overflow-hidden mask (typeset up)", !!split && split.overflowHidden === "hidden", { overflow: split?.overflowHidden });

    /* 2d. marquee dua baris, arah berlawanan, benar bergerak */
    const mq = await p.evaluate(() => Array.from(document.querySelectorAll(".mq__row")).map((r) => { const cs = getComputedStyle(r); return { dur: cs.animationDuration, dir: cs.animationDirection, name: cs.animationName, count: r.children.length }; }));
    check("marquee: 2 rows, opposite direction, real content", mq.length === 2 && mq[0].dur !== mq[1].dur && new Set(mq.map((m) => m.dir)).size === 2 && mq.every((m) => m.count >= 14), { mq: mq.map((m) => ({ dur: m.dur, dir: m.dir, items: m.count })) });
    const m1 = await p.evaluate(() => getComputedStyle(document.querySelector(".mq__row")).transform);
    await p.waitForTimeout(800);
    const m2 = await p.evaluate(() => getComputedStyle(document.querySelector(".mq__row")).transform);
    check("marquee actually scrolls", m1 !== m2, { a: m1.slice(0, 26), b: m2.slice(0, 26) });

    /* 2e. seksi dipatok: pin tetap di puncak saat bloknya bergulir */
    const pin = await p.evaluate(() => {
      const s = document.querySelector(".scrub");
      const pinEl = document.querySelector(".scrub__pin");
      if (!s || !pinEl) return null;
      return { height: Math.round(s.getBoundingClientRect().height), pos: getComputedStyle(pinEl).position, vh: window.innerHeight };
    });
    check("pinned section exists (sticky inner taller than viewport)", !!pin && pin.pos === "sticky" && pin.height > pin.vh * 1.6, pin);

    /* 2f. narasi berlangkah: tombol mulai + langkah berganti */
    const beginBtns = await p.locator(".begin__start").count();
    check("step-narrative start button exists (from reference)", beginBtns >= 1, { buttons: beginBtns });
    await ctx.close();
  }

  /* ============ 3. NARASI BERLANGKAH benar berganti ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(1600);
    await p.locator(".begin").scrollIntoViewIfNeeded();
    await p.waitForTimeout(900);

    /* ---------------------------------------------------------------------
       URUTAN GATE INI PENTING, dan itu pelajaran dari percobaan yang gagal:
       keadaan "sebelum dimulai" harus diperiksa SEBELUM ada klik apa pun.
       Versi pertama memeriksanya setelah klik, jadi hasilnya "started=true"
       dan gate melaporkan daftar langkah tidak terlihat — padahal yang salah
       adalah urutan pengukurannya.

       CATATAN SOAL KLIk: engine gulir halus membuat elemen terus bergerak
       selama easing, sehingga Playwright tidak pernah menganggapnya
       "stabil" dan menolak klik. Itu efek samping nyata dari mekanisme
       referensi, bukan bug. Gate ini karena itu memicu klik lewat DOM
       (element.click()) — persis yang dilakukan pengguna pada tombol. */
    const before = await p.evaluate(() => ({
      steps: document.querySelectorAll(".begin__step").length,
      started: document.querySelector(".begin")?.dataset.started || null,
      visible: Array.from(document.querySelectorAll(".begin__step")).filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.9).length,
      stacked: (() => {
        const els = Array.from(document.querySelectorAll(".begin__step"));
        return new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size === els.length;
      })(),
    }));
    check("all four steps exist in the DOM before any click (readable without JS)", before.steps >= 4, { steps: before.steps });
    check("before start: four steps visible as a stacked list", before.started === "false" && before.visible >= 4 && before.stacked, before);

    /* mulai */
    await p.evaluate(() => document.querySelector(".begin__intro .begin__start")?.click());
    await p.waitForTimeout(1100);
    const afterStart = await p.evaluate(() => {
      const sect = document.querySelector(".begin");
      const on = Array.from(document.querySelectorAll(".begin__step")).filter((e) => e.dataset.on === "true");
      return {
        started: sect?.dataset.started || null,
        active: on.length,
        txt: (on[0]?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 70),
      };
    });
    check("start button switches to the step view", afterStart.started === "true" && afterStart.active === 1, afterStart);
    check("first step becomes the active narrative", /Step 0?1/.test(afterStart.txt) || afterStart.txt.length > 12, { txt: afterStart.txt.slice(0, 50) });

    /* maju satu langkah */
    await p.evaluate(() => document.querySelector(".begin__ctrl .begin__start")?.click());
    await p.waitForTimeout(1100);
    const second = await p.evaluate(() => {
      const on = Array.from(document.querySelectorAll(".begin__step")).filter((e) => e.dataset.on === "true");
      return {
        active: on.length,
        txt: (on[0]?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 70),
        activeDots: Array.from(document.querySelectorAll(".begin__dot")).filter((d) => d.dataset.on === "true").length,
      };
    });
    check("narrative advances to the next step", second.txt.length > 12 && second.txt !== afterStart.txt, { first: afterStart.txt.slice(0, 40), second: second.txt.slice(0, 40) });
    check("step indicator follows the active step", second.active === 1 && second.activeDots === 1, { active: second.active, activeDots: second.activeDots });

    await ctx.close();
  }

  /* ============ 4. ANTI-SLOP: semua nol ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const found = { backdrop: [], filter: [], shadow: [], gradient: [], clipText: [], bigRadius: [], glow: [], circles: [] };
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(160);
      const r = await p.evaluate(() => {
        const out = { backdrop: [], filter: [], shadow: [], gradient: [], clipText: [], bigRadius: [], glow: [], circles: [] };
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const cs = getComputedStyle(el);
          const id = el.tagName + "." + (el.className || "").toString().split(" ")[0].slice(0, 20);
          if (cs.backdropFilter && cs.backdropFilter !== "none") out.backdrop.push(id);
          if (cs.filter && cs.filter !== "none") out.filter.push(id);
          const sh = cs.boxShadow || "";
          if (sh && sh !== "none") { out.shadow.push(id); if (!/rgba?\(0,\s*0,\s*0/.test(sh)) out.glow.push(id); }
          if ((cs.backgroundImage || "").includes("gradient")) out.gradient.push(id);
          if (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text") out.clipText.push(id);
          const rawRad = cs.borderTopLeftRadius, isPct = rawRad.endsWith("%"), rad = parseFloat(rawRad) || 0;
          const w = el.getBoundingClientRect().width;
          if (!isPct && rad > 14 && !(rad >= 999 && w <= 40)) out.bigRadius.push(id);
          if (!isPct && rad >= 999 && w > 40) out.circles.push(id);
        }
        return out;
      });
      for (const k of Object.keys(found)) if (r[k].length) found[k].push({ u, n: r[k].length, ex: r[k].slice(0, 2) });
    }
    const flat = (k, label) => check(`zero ${label} across 17 routes`, found[k].length === 0, { offenders: found[k].slice(0, 2) });
    flat("backdrop", "backdrop-filter (glass)");
    flat("filter", "CSS filter (blur/glow)");
    flat("shadow", "box-shadow");
    flat("gradient", "gradient backgrounds");
    flat("clipText", "gradient text");
    flat("bigRadius", "border-radius > 14px");
    flat("glow", "coloured glow");
    flat("circles", "large circles (orbs)");
    report.tells = found;
    await ctx.close();
  }

  /* ============ 5. TANPA JS + reduced-motion: tidak ada yang tersembunyi ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(400);
    const n = await p.evaluate(() => {
      const hidden = Array.from(document.querySelectorAll("[data-split] .w > span, [data-reveal], [data-reveal] > *, .sec__rule, .load"))
        .filter((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === "none") return true;
          if (parseFloat(cs.opacity) < 0.9) return true;
          const t = cs.transform;
          if (t && t !== "none") { const m = (t.match(/-?[\d.]+/g) || []).map(Number); if (m.length >= 6 && Math.abs(m[5]) > 4) return true; }
          const cb = cs.clipPath;
          if (cb && cb.includes("inset") && /100%/.test(cb)) return true;
          return false;
        }).length;
      return {
        hidden,
        len: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
        links: document.querySelectorAll("a[href]").length,
        motion: document.documentElement.getAttribute("data-motion"),
        headline: (document.querySelector("h1")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 70),
        steps: document.querySelectorAll(".begin__step").length,
      };
    });
    check("no-JS: nothing hidden (no preloader, no clipped text)", n.hidden === 0 && n.motion === null, n);
    check("no-JS: content fully readable", n.len > 1800 && n.links > 15, { len: n.len, links: n.links });
    check("no-JS: headline text intact with spaces", /Software that gets used/.test(n.headline), { headline: n.headline });
    check("no-JS: narrative steps still in the document", n.steps >= 4, { steps: n.steps });
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p2.waitForTimeout(700);
    const r = await p2.evaluate(() => {
      const broken = Array.from(document.querySelectorAll("[data-split] .w > span, [data-reveal], .load"))
        .filter((el) => { const cs = getComputedStyle(el); return cs.display === "none" || parseFloat(cs.opacity) < 0.9; }).length;
      return { broken, motion: document.documentElement.getAttribute("data-motion"), len: document.body.innerText.replace(/\s+/g, " ").trim().length };
    });
    check("reduced-motion: everything visible, engine off", r.broken === 0 && r.motion === null, r);
    check("reduced-motion: full text present", r.len > 1800, { len: r.len });
    await ctx2.close();
  }

  /* ============ 6. kontras dua tema ============ */
  {
    for (const theme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const fails = [];
      for (const [u, vw] of [["/", 1440], ["/karya/", 1440], ["/layanan/", 1440], ["/tentang/", 1440], ["/riwayat/", 1440], ["/kontak/", 1440], ["/karya/mafiablox/", 1440], ["/", 390], ["/karya/", 390]]) {
        await p.setViewportSize({ width: vw, height: 900 });
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(300);
        const rows = await p.evaluate(() => {
          const parse = (s) => { if (!s) return null; const nums = (s.match(/[\d.]+/g) || []).map(Number); if (nums.length < 3) return null; const isColorFn = s.startsWith("color("); const a = nums.length >= 4 ? nums[3] : 1; const scale = isColorFn ? 255 : 1; return { c: [nums[0] * scale, nums[1] * scale, nums[2] * scale], a }; };
          const over = (t, b) => { const a = t.a + b.a * (1 - t.a); if (a === 0) return { c: [0, 0, 0], a: 0 }; return { c: t.c.map((v, i) => (v * t.a + b.c[i] * b.a * (1 - t.a)) / a), a }; };
          const bgOf = (el) => { const chain = []; let n = el; while (n && n.nodeType === 1) { chain.push(n); n = n.parentElement; } chain.reverse(); let acc = { c: [255, 255, 255], a: 1 }; for (const node of chain) { const bg = parse(getComputedStyle(node).backgroundColor); if (bg && bg.a > 0) acc = over(bg, acc); } return acc.c; };
          const out = [];
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const own = Array.from(el.childNodes).filter((nd) => nd.nodeType === 3 && nd.textContent.trim().length > 1);
            if (!own.length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (parseFloat(cs.opacity) < 0.4) continue;
            const fg = parse(cs.color); if (!fg) continue;
            out.push({ fg: fg.c, bg: bgOf(el), t: own[0].textContent.trim().slice(0, 24) });
          }
          return out;
        });
        for (const r of rows) { const cr = ratio(r.fg, r.bg); if (cr < 4.5) fails.push({ u, vw, cr: +cr.toFixed(2), t: r.t }); }
      }
      check(`contrast >= 4.5:1 (${theme})`, fails.length === 0, { count: fails.length, sample: fails.slice(0, 5) });
      await ctx.close();
    }
  }

  /* ============ 7. viewport ============ */
  {
    for (const v of [{ w: 320, h: 720, n: "320" }, { w: 375, h: 780, n: "375" }, { w: 414, h: 800, n: "414" }, { w: 768, h: 900, n: "768" }, { w: 1280, h: 800, n: "1280" }, { w: 1920, h: 1080, n: "1920" }]) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
      const p = await ctx.newPage();
      const over = [];
      for (const u of ["/", "/karya/", "/tentang/", "/kontak/", "/karya/mafiablox/"]) {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(260);
        const r = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth, left: Math.round(document.documentElement.getBoundingClientRect().left) }));
        if (r.doc > r.win + 2 || r.left !== 0) over.push({ u, ...r });
      }
      check(`no horizontal overflow @ ${v.n}px`, over.length === 0, { over: over.slice(0, 2) });
      if (v.w <= 640) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(400);
        const small = await p.evaluate(() => Array.from(document.querySelectorAll("a.btn, button.btn, .dl__b")).filter((el) => { const b = el.getBoundingClientRect(); return b.height > 0 && b.height < 40; }).map((el) => el.className.toString().slice(0, 24) + " h=" + Math.round(el.getBoundingClientRect().height)));
        check(`touch targets >= 40px @ ${v.n}px`, small.length === 0, { small: small.slice(0, 4) });
      }
      await ctx.close();
    }
  }

  /* ============ 8. teks ============ */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const glued = [], leaks = [];
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "networkidle" });
      await p.waitForTimeout(240);
      const r = await p.evaluate(() => {
        const it = (document.body.innerText || "").replace(/\s+/g, " ").trim();
        const emailish = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i;
        const suspicious = it.split(" ").filter((w) => !emailish.test(w) && !/https?:|github\.com|instagram\.com/i.test(w)).filter((w) => /[a-z]{16,}/.test(w) && !/-/.test(w) && !/^[A-Z]/.test(w)).slice(0, 4);
        return { len: it.length, suspicious, text: it };
      });
      if (r.len === 0) glued.push({ u, reason: "empty innerText" });
      if (r.suspicious.length) glued.push({ u, suspicious: r.suspicious });
      const forbidden = [/\d{3,4}\s?[x×]\s?\d{3,4}/i, /\.(png|jpg|jpeg|webp|pdf)\b/i, /needs confirmation/i, /lorem ipsum/i, /undefined/, /NaN/, /\[object Object\]/];
      const hits = forbidden.filter((re) => re.test(r.text)).map((re) => re.source);
      if (hits.length) leaks.push({ u, hits });
    }
    check("no glued-word text corruption", glued.length === 0, { glued: glued.slice(0, 3) });
    check("no metadata leaks in rendered text", leaks.length === 0, { leaks: leaks.slice(0, 3) });
    await ctx.close();
  }

  report.summary = { pass: ok.length, fail: bad.length };
  report.failures = bad;
  fs.writeFileSync(path.join(OUT, "verify.json"), JSON.stringify(report, null, 2));
  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 240)));
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
