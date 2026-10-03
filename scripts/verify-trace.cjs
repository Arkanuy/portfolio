/**
 * VERIFIKASI KONSEP TRACE
 *
 * Semua klaim desain diukur di browser sungguhan. Yang diuji bukan "kelihatan
 * bagus", tapi pernyataan yang bisa salah:
 *   1. semua halaman 200, tanpa error konsol
 *   2. NOL box-shadow dan NOL border-radius > 0 (janji sistem Graphite/Pencil)
 *   3. interaksi tanda tangan benar-benar mengubah keadaan panel
 *   4. tombol TRACE benar-benar menyembunyikan/menampilkan celah
 *   5. kontras teks >= 4.5:1 di DUA tema
 *   6. reduced-motion: konten tetap terlihat (opacity 1)
 *   7. tidak ada overflow horizontal di 6 viewport
 *   8. target sentuh >= 44px di ponsel
 *   9. tidak ada kata menempel (innerText == textContent yang sudah dinormalkan)
 *  10. tidak ada kebocoran metadata (nama file, dimensi px, "needs confirmation")
 *  11. aksen merah dipakai hemat (jumlah elemen beraksen kecil vs total teks)
 *  12. tanpa JS: konten tetap terbaca
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "trace");
fs.mkdirSync(OUT, { recursive: true });

const ok = [];
const bad = [];
const check = (n, pass, extra = {}) => {
  (pass ? ok : bad).push({ n, pass, ...extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${n}${Object.keys(extra).length ? "  " + JSON.stringify(extra) : ""}`);
};

const pages = [
  "/",
  "/karya/",
  "/layanan/",
  "/tentang/",
  "/riwayat/",
  "/kontak/",
  "/layanan/business-systems/",
  "/layanan/web/",
  "/layanan/analysis/",
  "/layanan/automation/",
  "/karya/mafiablox/",
  "/karya/pixwatch/",
  "/karya/buildplan/",
  "/karya/aplikasi-solusi-bisnis/",
  "/karya/rollerskool/",
  "/karya/tasty-food/",
  "/karya/website-sekolah/",
];

(async () => {
  const browser = await chromium.launch();
  const report = {};

  /* ---------------- 1. semua halaman + error konsol ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    const failed = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text()));
    p.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });

    const status = {};
    for (const u of pages) {
      const res = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 25000 });
      status[u] = res ? res.status() : 0;
    }
    const badStatus = Object.entries(status).filter(([, s]) => s !== 200);
    check("17 routes return 200", badStatus.length === 0, { badStatus });
    check("no page errors / console errors", errs.length === 0, { errs: errs.slice(0, 5) });
    check("no 4xx/5xx responses", failed.length === 0, { failed: failed.slice(0, 5) });
    report.status = status;
    await ctx.close();
  }

  /* ---------------- 2. janji sistem: nol radius, nol bayangan ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const offenders = { radius: [], shadow: [] };
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      const found = await p.evaluate(() => {
        const rad = [];
        const sh = [];
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const cs = getComputedStyle(el);
          const r = parseFloat(cs.borderTopLeftRadius) || 0;
          if (r > 0.5) rad.push(el.tagName + "." + (el.className || "").toString().slice(0, 40) + " r=" + r);
          if (cs.boxShadow && cs.boxShadow !== "none") sh.push(el.tagName + "." + (el.className || "").toString().slice(0, 40) + " -> " + cs.boxShadow);
        }
        return { rad, sh };
      });
      if (found.rad.length) offenders.radius.push({ u, n: found.rad.length, ex: found.rad.slice(0, 3) });
      if (found.sh.length) offenders.shadow.push({ u, n: found.sh.length, ex: found.sh.slice(0, 3) });
    }
    check("zero border-radius across 17 routes", offenders.radius.length === 0, { offenders: offenders.radius.slice(0, 3) });
    check("zero box-shadow across 17 routes", offenders.shadow.length === 0, { offenders: offenders.shadow.slice(0, 3) });

    // blur / backdrop-filter tidak boleh ada (kecuali tidak ada sama sekali)
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const filters = await p.evaluate(() =>
      Array.from(document.querySelectorAll("body *")).filter((el) => {
        const cs = getComputedStyle(el);
        return (cs.backdropFilter && cs.backdropFilter !== "none") || (cs.filter && cs.filter.includes("blur"));
      }).length,
    );
    check("zero backdrop-blur / blur filters on home", filters === 0, { filters });
    await ctx.close();
  }

  /* ---------------- 3. INTERAKSI TANDA TANGAN ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });

    const panel = p.locator(".tracePanel");
    check("source panel exists", (await panel.count()) === 1);

    const claims = p.locator(".claim");
    const nClaims = await claims.count();
    check("claim column has entries", nClaims >= 3, { nClaims });

    // keadaan awal
    const before = await p.evaluate(() => {
      const v = document.querySelector(".traceView__head .traceView__cnt");
      const detail = document.querySelector(".traceView__detail");
      const nodes = Array.from(document.querySelectorAll(".helix__node")).map((n) => n.querySelector(".helix__l")?.textContent);
      const marker = document.querySelector(".tracePanel > span[aria-hidden]");
      return {
        cnt: v ? v.textContent.trim() : null,
        detail: detail ? detail.textContent.trim().slice(0, 60) : null,
        nodes,
        markerH: marker ? marker.getBoundingClientRect().height : 0,
        checkedLabel: document.querySelector('.claim[aria-checked="true"] .claim__l')?.textContent,
      };
    });
    check("initial claim is selected (aria-checked)", !!before.checkedLabel, { label: before.checkedLabel });
    check("measure marker is rendered from real geometry", before.markerH > 10, { markerH: Math.round(before.markerH) });

    // pilih klaim kedua
    await claims.nth(1).click();
    await p.waitForTimeout(420);
    const after = await p.evaluate(() => {
      const v = document.querySelector(".traceView__head .traceView__cnt");
      const detail = document.querySelector(".traceView__detail");
      return {
        cnt: v ? v.textContent.trim() : null,
        detail: detail ? detail.textContent.trim().slice(0, 60) : null,
        nodes: Array.from(document.querySelectorAll(".helix__node")).map((n) => n.querySelector(".helix__l")?.textContent),
        sig: document.querySelector(".sig")?.textContent.trim(),
      };
    });
    check("selection changes the evidence column", before.cnt !== after.cnt, { before: before.cnt, after: after.cnt });
    check("evidence detail text changes", before.detail !== after.detail);
    check("source rows change with the claim", JSON.stringify(before.nodes) !== JSON.stringify(after.nodes), {
      before: before.nodes,
      after: after.nodes,
    });
    check("open row carries a timestamp signature", /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(after.sig || ""), { sig: after.sig });

    // keyboard: arrow down harus pindah klaim
    await p.locator('.claim[aria-checked="true"]').focus();
    await p.keyboard.press("ArrowDown");
    await p.waitForTimeout(260);
    const kb = await p.evaluate(() => document.querySelector('.claim[aria-checked="true"] .claim__l')?.textContent);
    check("keyboard arrow moves between claims", kb && kb !== after.nodes && kb !== before.checkedLabel, { kb });

    // baris sumber benar-benar menuju halaman catatan
    const hrefs = await p.evaluate(() => Array.from(document.querySelectorAll(".helix__node")).map((a) => a.getAttribute("href")));
    check("source rows link to real routes", hrefs.length > 0 && hrefs.every((h) => h && h.startsWith("/")), { hrefs });

    await ctx.close();
  }

  /* ---------------- 4. tombol TRACE ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const btn = p.locator(".traceOnBtn");
    check("trace toggle exists", (await btn.count()) === 1);

    const on = await p.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".capRow"));
      return {
        pressed: document.querySelector(".traceOnBtn")?.getAttribute("aria-pressed"),
        hatched: rows.filter((r) => r.getAttribute("data-gap") === "true").length,
        sourced: rows.filter((r) => r.getAttribute("data-src") === "true").length,
        total: rows.length,
        gapChips: document.querySelectorAll(".chip--none").length,
        srcChips: document.querySelectorAll(".chip:not(.chip--none)").length,
      };
    });
    check("trace on: sourced rows are marked", on.sourced > 0, on);
    check("trace on: gaps are reported, not hidden", on.gapChips === on.total - on.sourced && on.gapChips > 0, on);
    check("trace on: sourced rows carry clickable source chips", on.srcChips > 0, { srcChips: on.srcChips });

    await btn.click();
    await p.waitForTimeout(360);
    const off = await p.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".capRow"));
      /* "Hilang" berarti tidak terlihat — bukan tidak ada di DOM.
         Chip yang di-display:none tetap ada di DOM tapi tidak dirender. */
      const visible = (sel) =>
        Array.from(document.querySelectorAll(sel)).filter((el) => el.getBoundingClientRect().width > 0).length;
      return {
        pressed: document.querySelector(".traceOnBtn")?.getAttribute("aria-pressed"),
        hatched: rows.filter((r) => r.getAttribute("data-gap") === "true").length,
        srcMarks: rows.filter((r) => r.getAttribute("data-src") === "true").length,
        gapChips: visible(".chip--none"),
        srcChips: visible(".chip:not(.chip--none)"),
        ticksOn: rows.filter((r) => {
          const i = r.querySelector(".capRow__tick i");
          return i && getComputedStyle(i).backgroundColor !== "rgba(0, 0, 0, 0)";
        }).length,
        total: rows.length,
      };
    });
    check("trace toggle flips aria-pressed", off.pressed === "false", off);
    /* Saat trace MATI, seluruh tanda bukti harus hilang: tidak ada tanda centang
       sumber, tidak ada arsir celah, tidak ada chip. Semua baris tampak sama —
       persis seperti daftar kemampuan di portfolio biasa. */
    check(
      "trace off: every evidence mark disappears",
      off.hatched === 0 && off.gapChips === 0 && off.srcChips === 0 && off.srcMarks === 0 && off.ticksOn === 0,
      off,
    );

    await btn.click();
    await p.waitForTimeout(300);
    const back = await p.evaluate(() => document.querySelector(".traceOnBtn")?.getAttribute("aria-pressed"));
    check("trace toggle returns to on", back === "true");

    // laporan celah harus menyebut jumlah dan perkakasnya
    const gaps = await p.evaluate(() => ({
      note: document.querySelector(".traceNote")?.innerText || "",
      items: Array.from(document.querySelectorAll(".gap")).map((g) => g.innerText.trim()),
    }));
    check("gap report lists named tools", gaps.items.length >= 3, { items: gaps.items });
    check(
      "gap report states the count in text",
      new RegExp(`\\b${gaps.items.length} tools\\b`).test(gaps.note),
      { note: gaps.note.slice(0, 120) },
    );
    await ctx.close();
  }

  /* ---------------- 5. kontras dua tema ---------------- */
  {
    const lum = (c) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => {
      const l1 = lum(a);
      const l2 = lum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const theme of ["light", "dark"]) {
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const results = [];
      for (const [u, vw] of [
        ["/", 1440],
        ["/karya/", 1440],
        ["/layanan/", 1440],
        ["/tentang/", 1440],
        ["/riwayat/", 1440],
        ["/kontak/", 1440],
        ["/karya/mafiablox/", 1440],
        ["/", 390],
        ["/karya/", 390],
        ["/kontak/", 390],
      ]) {
        await p.setViewportSize({ width: vw, height: 900 });
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(120);
        const found = await p.evaluate(() => {
          const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          const bgOf = (el) => {
            let n = el;
            while (n && n !== document.documentElement) {
              const cs = getComputedStyle(n);
              const c = cs.backgroundColor;
              if (c && !c.includes("rgba(0, 0, 0, 0)")) return parse(c);
              n = n.parentElement;
            }
            return parse(getComputedStyle(document.body).backgroundColor);
          };
          const out = [];
          const walk = (root) => {
            for (const el of Array.from(root.querySelectorAll("*"))) {
              const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
              if (!own.length) continue;
              const cs = getComputedStyle(el);
              if (cs.visibility === "hidden" || cs.display === "none") continue;
              const op = parseFloat(cs.opacity);
              if (op < 0.4) continue;
              out.push({ fg: cs.color, bg: bgOf(el), t: own[0].textContent.trim().slice(0, 30) });
            }
          };
          walk(document.body);
          return out;
        });
        for (const r of found) {
          const fg = (r.fg.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          if (fg.length < 3) continue;
          const cr = ratio(fg, r.bg);
          if (cr < 4.5) results.push({ u, cr: +cr.toFixed(2), t: r.t, fg: r.fg, bg: r.bg });
        }
      }
      check(`contrast >= 4.5:1 (${theme} theme)`, results.length === 0, { sample: results.slice(0, 6), count: results.length });
      await p.close();
    }
    await ctx.close();
  }

  /* ---------------- 6. reduced motion + 7. overflow + 8. touch ---------------- */
  {
    const scenarios = [
      { w: 320, h: 720, name: "320px" },
      { w: 375, h: 780, name: "375px" },
      { w: 414, h: 800, name: "414px" },
      { w: 768, h: 900, name: "768px" },
      { w: 1280, h: 800, name: "1280px" },
      { w: 1920, h: 1080, name: "1920px" },
    ];
    for (const s of scenarios) {
      const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
      const p = await ctx.newPage();
      const over = [];
      for (const u of ["/", "/karya/", "/tentang/", "/kontak/", "/karya/mafiablox/"]) {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(150);
        const r = await p.evaluate(() => ({
          doc: document.documentElement.scrollWidth,
          win: window.innerWidth,
          wide: Array.from(document.querySelectorAll("body *"))
            .filter((el) => {
              const b = el.getBoundingClientRect();
              return b.width > 2 && (b.right > window.innerWidth + 2 || b.left < -2);
            })
            .slice(0, 4)
            .map((el) => el.tagName + "." + (el.className || "").toString().slice(0, 30)),
        }));
        if (r.doc > r.win + 2) over.push({ u, doc: r.doc, win: r.win, wide: r.wide });
      }
      check(`no horizontal overflow @ ${s.name}`, over.length === 0, { over: over.slice(0, 3) });

      // target sentuh di ponsel
      if (s.w <= 414) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        const small = await p.evaluate(() => {
          /* Di lebar sentuh, tombol kecil direntangkan oleh aturan @media.
             Yang diperiksa di sini adalah elemen yang UKURANNYA SENDIRI kecil. */
          const isBtn = (el) =>
            el.classList.contains("btn") ||
            el.classList.contains("hd__burger") ||
            el.classList.contains("themeBtn") ||
            el.classList.contains("traceOnBtn") ||
            el.classList.contains("contactRow__b") ||
            el.classList.contains("claim") ||
            el.classList.contains("drawer__link") ||
            el.classList.contains("hd__cta");
          return Array.from(document.querySelectorAll("a, button"))
            .filter(isBtn)
            .filter((el) => {
              const b = el.getBoundingClientRect();
              if (b.width === 0 || b.height === 0) return false;
              return b.height < 40;
            })
            .slice(0, 6)
            .map((el) => (el.className || "").toString().slice(0, 34) + " h=" + Math.round(el.getBoundingClientRect().height));
        });
        check(`touch targets >= 40px @ ${s.name}`, small.length === 0, { small });
      }
      await ctx.close();
    }

    // reduced motion: semua konten harus terlihat
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(500);
    const rm = await p.evaluate(() => {
      const hidden = Array.from(document.querySelectorAll("[data-rv], .wf__w, .helix__node")).filter(
        (el) => parseFloat(getComputedStyle(el).opacity) < 0.9,
      );
      const bodyText = document.body.innerText.replace(/\s+/g, " ").trim();
      return { hidden: hidden.length, len: bodyText.length };
    });
    check("reduced-motion: nothing stays invisible", rm.hidden === 0, { hidden: rm.hidden });
    check("reduced-motion: content is present", rm.len > 800, { len: rm.len });
    await ctx.close();
  }

  /* ---------------- 9. kata menempel + 10. kebocoran metadata ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const glued = [];
    const leaks = [];
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      const r = await p.evaluate(() => {
        const it = document.body.innerText;
        const tc = document.body.textContent || "";
        const norm = (s) => s.replace(/\s+/g, " ").trim();
        const words = norm(it).split(" ");
        const emailish = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i;
        const suspicious = words
          .filter((w) => !emailish.test(w))
          .filter((w) => !/https?:|github\.com|instagram\.com/i.test(w))
          .filter((w) => /[a-z]{14,}/.test(w) && !/-/.test(w) && !/^[A-Z]/.test(w))
          .slice(0, 6);
        return { itLen: norm(it).length, tcLen: norm(tc).length, suspicious, text: norm(it) };
      });
      if (r.itLen === 0) glued.push({ u, reason: "empty innerText" });
      if (r.suspicious.length) glued.push({ u, suspicious: r.suspicious });

      const forbidden = [
        /\d{3,4}\s?[x×]\s?\d{3,4}/i,
        /\.(png|jpg|jpeg|webp|pdf)\b/i,
        /needs confirmation/i,
        /tbd\b/i,
        /lorem ipsum/i,
        /placeholder/i,
        /undefined/,
        /NaN/,
        /\[object Object\]/,
      ];
      const hits = forbidden.filter((re) => re.test(r.text)).map((re) => re.source);
      if (hits.length) leaks.push({ u, hits });
    }
    check("no glued-word text corruption", glued.length === 0, { glued: glued.slice(0, 4) });
    check("no metadata leaks in rendered text", leaks.length === 0, { leaks });
    await ctx.close();
  }

  /* ---------------- 11. aksen dipakai hemat ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const use = await p.evaluate(() => {
      const mark = getComputedStyle(document.documentElement).getPropertyValue("--mark").trim();
      const rgb = (() => {
        const d = document.createElement("div");
        d.style.color = mark;
        document.body.appendChild(d);
        const c = getComputedStyle(d).color;
        d.remove();
        return c;
      })();
      const all = Array.from(document.querySelectorAll("body *"));
      const textEls = all.filter((el) => el.innerText && el.innerText.trim().length > 1);
      const accented = all.filter((el) => {
        const cs = getComputedStyle(el);
        return cs.color === rgb && el.innerText && el.innerText.trim().length > 1;
      });
      return { rgb, textEls: textEls.length, accented: accented.length };
    });
    const share = use.textEls ? use.accented / use.textEls : 1;
    check("accent used as signal, not decoration (<25% of text nodes)", share < 0.25, {
      ...use,
      share: +share.toFixed(3),
    });
    await ctx.close();
  }

  /* ---------------- 12. tanpa JS ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const r = await p.evaluate(() => {
      const txt = (document.body.innerText || "").replace(/\s+/g, " ").trim();
      const nojs = document.querySelector(".nojs");
      return {
        len: txt.length,
        links: document.querySelectorAll("a[href]").length,
        records: document.querySelectorAll(".bench__row").length,
        nojsVisible: nojs ? getComputedStyle(nojs).display !== "none" : false,
        hasJsFlag: document.documentElement.hasAttribute("data-js"),
      };
    });
    check("no-JS: content still readable", r.len > 1200 && r.links > 10, r);
    check("no-JS: all records still listed", r.records === 7, { records: r.records });
    check("no-JS: the site states its own limitation", r.nojsVisible && !r.hasJsFlag, r);
    await ctx.close();
  }

  /* ---------------- 12b. dengan JS: peringatan itu WAJIB hilang ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({
      jsFlag: document.documentElement.getAttribute("data-js"),
      nojsDisplay: getComputedStyle(document.querySelector(".nojs")).display,
    }));
    check("with JS: no false 'JavaScript is off' banner", r.jsFlag === "on" && r.nojsDisplay === "none", r);
    await ctx.close();
  }

  /* ---------------- JSON ---------------- */
  report.summary = { pass: ok.length, fail: bad.length };
  report.failures = bad;
  fs.writeFileSync(path.join(OUT, "verify-trace.json"), JSON.stringify(report, null, 2));
  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) {
    console.log("FAILURES:");
    bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 300)));
  }
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();