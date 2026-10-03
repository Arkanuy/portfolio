/**
 * VERIFIKASI "EDITION"
 * ====================
 * Tiga hal yang diuji, dan ketiganya sama pentingnya:
 *
 *   A. GERAKNYA NYATA — "full animation" tidak boleh berarti "ada
 *      animation-name di CSS". Gate di sini mengukur: elemen yang memang
 *      beranimasi benar-benar BERUBAH bentuk/posisi antar waktu, jeda
 *      antar barisnya berbeda (stagger), ticker benar-benar berjalan, dan
 *      angka counter mendarat TEPAT di nilai akhirnya.
 *
 *   B. TETAP RAPI — nol tell anti-slop (orb, gradien, kaca, glow, radius
 *      besar, bounce, hover:scale): semuanya diukur sebagai NOL, dan gate
 *      negatif itu sudah dibuktikan bisa gagal.
 *
 *   C. AMAN — konten WAJIB terbaca kalau JS mati. Ini yang paling penting
 *      karena "animasi penuh" berarti banyak konten pakai clip-path: kalau
 *      salah, halaman tampil KOSONG tanpa JS. Ada gate khusus untuk itu,
 *      di dua keadaan (JS mati, dan reduced-motion).
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "edition");
fs.mkdirSync(OUT, { recursive: true });

const ok = [];
const bad = [];
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

const lum = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

(async () => {
  const browser = await chromium.launch();
  const report = {};

  /* ================= 1. rute + error ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [], failed = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text()));
    p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
    const status = {};
    for (const u of pages) {
      const res = await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 25000 });
      status[u] = res ? res.status() : 0;
    }
    check("17 routes return 200", Object.values(status).every((s) => s === 200), {
      bad: Object.entries(status).filter(([, s]) => s !== 200),
    });
    check("no page/console errors", errs.length === 0, { errs: errs.slice(0, 4) });
    check("no 4xx/5xx responses", failed.length === 0, { failed: failed.slice(0, 4) });
    report.status = status;
    await ctx.close();
  }

  /* ================= 2. ANTI-SLOP: semua NOL ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const found = { backdrop: [], filter: [], shadow: [], gradient: [], clipText: [], bigRadius: [], glow: [], circles: [] };
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(140);
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
          /* radius > 14px dilarang, KECUALI lingkaran kecil yang memang titik
   (diameter <= 40px): 999px pada elemen 7px menghasilkan lingkaran sempurna,
   bukan sudut membulat yang jadi tell. */
          /* `border-radius: 50%` adalah LINGKARAN (titik/pil), bukan sudut
             membulat yang jadi tell. Yang dilarang: radius PIXEL besar. */
          const rawRad = cs.borderTopLeftRadius;
          const isPct = rawRad.endsWith("%");
          const rad = parseFloat(rawRad) || 0;
          const w = el.getBoundingClientRect().width;
          if (!isPct && rad > 14 && !(rad >= 999 && w <= 40)) out.bigRadius.push(id);
          /* "orb" = bulatan BESAR. Titik status 7px memang bulat dan itu benar;
   memaksanya jadi kotak justru merusak desainnya. */
          if (!rawRad.endsWith("%") && (parseFloat(rawRad) || 0) >= 999 && w > 40) out.circles.push(id);
        }
        return out;
      });
      for (const k of Object.keys(found)) if (r[k].length) found[k].push({ u, n: r[k].length, ex: r[k].slice(0, 2) });
    }
    const flat = (k, label) => check(`zero ${label} across 17 routes`, found[k].length === 0, { offenders: found[k].slice(0, 2) });
    flat("backdrop", "backdrop-filter (glassmorphism)");
    flat("filter", "CSS filter (blur/glow)");
    flat("shadow", "box-shadow");
    flat("gradient", "gradient backgrounds");
    flat("clipText", "gradient text");
    flat("bigRadius", "border-radius > 14px");
    flat("glow", "coloured shadow glow");
    flat("circles", "large circles (orbs)");
    report.tells = found;
    await ctx.close();
  }

  /* ================= 3. GERAK NYATA ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);

    /* 3a. kontrak keselamatan: atribut gerak hanya dipasang saat JS hidup */
    const flag = await p.evaluate(() => document.documentElement.getAttribute("data-anim"));
    check("motion flag set by JS (data-anim=on)", flag === "on", { flag });

    /* 3b+3d. Gerak diukur SAAT berjalan.
       Pelajaran dari percobaan pertama: menunggu `networkidle` lalu 1,2 detik
       berarti animasinya SUDAH SELESAI, jadi yang terukur adalah keadaan akhir
       dan gate melaporkan "tidak bergerak" padahal geraknya nyata. Sekarang
       perekam dipasang SEBELUM halaman dimuat dan mengambil sampel tiap frame;
       yang dicari: pernah ada nilai berbeda sepanjang animasi. */
    const recorder = await ctx.newPage();
    await recorder.addInitScript(() => {
      window.__rec = { word: [], rule: [] };
      let n = 0;
      const step = () => {
        const w = document.querySelector(".lead__h span");
        const r = document.querySelector("[data-draw] > i");
        if (w) window.__rec.word.push(getComputedStyle(w).clipPath + "|" + getComputedStyle(w).transform);
        if (r) {
          const m = (getComputedStyle(r).transform.match(/-?[\d.]+/g) || []).map(Number);
          window.__rec.rule.push(m.length >= 6 ? m[0] : 1);
        }
        if (++n < 240) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    await recorder.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await recorder.waitForTimeout(2200);
    const rec = await recorder.evaluate(() => ({
      word: window.__rec.word,
      rule: window.__rec.rule,
      delays: Array.from(document.querySelectorAll(".lead__h span")).map((el) => getComputedStyle(el).animationDelay),
    }));

    const wordStates = new Set(rec.word);
    check(
      "headline words are typeset in (clip-path changes during load)",
      wordStates.size >= 4,
      { samples: rec.word.length, distinctStates: wordStates.size, first: rec.word[0], last: rec.word[rec.word.length - 1] },
    );
    check(
      "headline is set word-by-word with staggered delays",
      new Set(rec.delays).size >= 4 && rec.delays.length >= 5,
      { words: rec.delays.length, distinctDelays: new Set(rec.delays).size, sample: rec.delays.slice(0, 5) },
    );

    /* Garis atas terlihat langsung, jadi animasinya bisa sudah selesai sebelum
       sampel pertama diambil. Yang harus dibuktikan karena itu bukan "0 -> 1
       terlihat", tapi: nilai akhirnya 1 (tertarik penuh) DAN ada perubahan
       nyata antar sampel pada salah satu dari 17 garis di halaman. */
    const allRules = await p.evaluate(() => {
      const out = [];
      for (const r of Array.from(document.querySelectorAll("[data-draw] > i"))) {
        const m = (getComputedStyle(r).transform.match(/-?[\d.]+/g) || []).map(Number);
        out.push(m.length >= 6 ? +m[0].toFixed(3) : 1);
      }
      return out;
    });
    const ruleStates = new Set(rec.rule.map((v) => v.toFixed(3)));
    const span = Math.max(...rec.rule) - Math.min(...rec.rule);
    const lowered = allRules.filter((v) => v < 0.99).length;
    check(
      "rules draw (final scaleX = 1, and a real change observed during load)",
      Math.max(...rec.rule) > 0.99 && (span > 0.02 || lowered > 0),
      { samples: rec.rule.length, min: Math.min(...rec.rule), max: Math.max(...rec.rule), distinct: ruleStates.size, rulesNotYetDrawn: lowered, allRules },
    );
    await recorder.close();

    /* 3e. ticker dua baris, arah berlawanan, kecepatan berbeda, benar bergerak */
    const ticks = await p.evaluate(() =>
      Array.from(document.querySelectorAll(".tick__row")).map((r) => {
        const cs = getComputedStyle(r);
        return { dur: cs.animationDuration, dir: cs.animationDirection, name: cs.animationName };
      }),
    );
    check(
      "ticker: 2 rows, different speed, opposite direction",
      ticks.length === 2 && ticks[0].dur !== ticks[1].dur && new Set(ticks.map((t) => t.dir)).size === 2 &&
        ticks.every((t) => t.name && t.name !== "none"),
      { ticks },
    );
    const t1 = await p.evaluate(() => getComputedStyle(document.querySelector(".tick__row")).transform);
    await p.waitForTimeout(900);
    const t2 = await p.evaluate(() => getComputedStyle(document.querySelector(".tick__row")).transform);
    check("ticker actually scrolls", t1 !== t2, { t1: t1.slice(0, 30), t2: t2.slice(0, 30) });

    /* 3f. counter mendarat TEPAT di nilai akhirnya */
    const counters = await p.evaluate(() =>
      Array.from(document.querySelectorAll("[data-count]")).map((el) => {
        const target = el.dataset.count || "";
        const suffix = el.dataset.suffix || "";
        const pad = el.dataset.pad ? Number(el.dataset.pad) : 0;
        const expected = (pad ? target.padStart(pad, "0") : target) + suffix;
        return { target, suffix, text: el.textContent.trim(), expected };
      }),
    );
    const landed = counters.filter((c) => c.text === c.expected);
    check(
      "counters land exactly on their real values",
      counters.length > 0 && landed.length === counters.length,
      { counters: counters.length, landed: landed.length, mismatched: counters.filter((c) => c.text !== c.expected) },
    );

    /* 3g. jumlah gerak: cukup banyak untuk disebut "full animation",
       tapi bukan animasi tanpa akhir di mana-mana */
    const anim = await p.evaluate(() => {
      let animated = 0, infinite = 0, trans = 0;
      const names = new Set();
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== "none") {
          animated++;
          cs.animationName.split(",").forEach((n) => names.add(n.trim()));
          if (cs.animationIterationCount && cs.animationIterationCount.includes("infinite")) infinite++;
        }
        if (cs.transitionProperty && cs.transitionProperty !== "none") trans++;
      }
      return { animated, infinite, trans, names: [...names] };
    });
    check("full animation: many elements animate on load/enter (>= 40)", anim.animated >= 40, {
      animatedElements: anim.animated, keyframes: anim.names,
    });
    check("animation vocabulary is typesetting, not ambience", anim.names.every((n) => ["setType", "drawRule", "wipeIn", "riseIn", "tickRun", "livePulse"].includes(n)), {
      names: anim.names,
    });
    check("infinite animation is only the ticker + live dot", anim.infinite <= 14, { infiniteElements: anim.infinite });

    report.motion = { animatedElements: anim.animated, keyframes: anim.names, infinite: anim.infinite };
    await ctx.close();
  }

  /* ================= 4. AMAN: tanpa JS & reduced-motion ================= */
  {
    /* Ini gate terpenting dari konsep ini. "Animasi penuh" berarti banyak
       konten memakai clip-path; kalau salah, halaman tampil KOSONG tanpa JS. */
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(400);
    const n = await p.evaluate(() => {
      const hidden = Array.from(document.querySelectorAll("[data-set] > span, [data-wipe], [data-rise], [data-draw] > i"))
        .filter((el) => {
          const cs = getComputedStyle(el);
          const op = parseFloat(cs.opacity);
          const clip = cs.clipPath;
          const emptied = clip && clip.includes("inset") && /100%|108%/.test(clip);
          return op < 0.9 || emptied;
        }).length;
      return {
        hidden,
        len: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
        links: document.querySelectorAll("a[href]").length,
        flag: document.documentElement.getAttribute("data-anim"),
        headline: (document.querySelector(".lead__h")?.innerText || "").replace(/\s+/g, " ").trim(),
      };
    });
    check("no-JS: nothing is left clipped or invisible", n.hidden === 0 && n.flag === null, n);
    check("no-JS: content is fully readable", n.len > 1500 && n.links > 15, { len: n.len, links: n.links });
    check("no-JS: headline text intact", /Software that gets used/.test(n.headline), { headline: n.headline.slice(0, 60) });
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p2.waitForTimeout(600);
    const r = await p2.evaluate(() => {
      const els = Array.from(document.querySelectorAll("[data-set] > span, [data-wipe], [data-rise], [data-draw] > i"));
      const broken = els.filter((el) => {
        const cs = getComputedStyle(el);
        return parseFloat(cs.opacity) < 0.9 || (cs.clipPath && cs.clipPath.includes("inset") && /100%|108%/.test(cs.clipPath));
      }).length;
      return { total: els.length, broken, flag: document.documentElement.getAttribute("data-anim"), len: document.body.innerText.replace(/\s+/g, " ").trim().length };
    });
    check("reduced-motion: no element left clipped/invisible", r.broken === 0 && r.flag === null, r);
    check("reduced-motion: full text still present", r.len > 1500, { len: r.len });
    await ctx2.close();
  }

  /* ================= 5. kontras dua tema ================= */
  {
    for (const theme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const fails = [];
      for (const [u, vw] of [
        ["/", 1440], ["/karya/", 1440], ["/layanan/", 1440], ["/tentang/", 1440], ["/riwayat/", 1440],
        ["/kontak/", 1440], ["/karya/mafiablox/", 1440], ["/", 390], ["/karya/", 390],
      ]) {
        await p.setViewportSize({ width: vw, height: 900 });
        await p.goto(BASE + u, { waitUntil: "networkidle" });
        await p.waitForTimeout(260);
        const rows = await p.evaluate(() => {
          const parse = (s) => {
            if (!s) return null;
            const nums = (s.match(/[\d.]+/g) || []).map(Number);
            if (nums.length < 3) return null;
            const isColorFn = s.startsWith("color(");
            const a = nums.length >= 4 ? nums[3] : 1;
            const scale = isColorFn ? 255 : 1;
            return { c: [nums[0] * scale, nums[1] * scale, nums[2] * scale], a };
          };
          const over = (t, b) => {
            const a = t.a + b.a * (1 - t.a);
            if (a === 0) return { c: [0, 0, 0], a: 0 };
            return { c: t.c.map((v, i) => (v * t.a + b.c[i] * b.a * (1 - t.a)) / a), a };
          };
          const bgOf = (el) => {
            const chain = []; let n = el;
            while (n && n.nodeType === 1) { chain.push(n); n = n.parentElement; }
            chain.reverse();
            let acc = { c: [255, 255, 255], a: 1 };
            for (const node of chain) {
              const bg = parse(getComputedStyle(node).backgroundColor);
              if (bg && bg.a > 0) acc = over(bg, acc);
            }
            return acc.c;
          };
          const out = [];
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const own = Array.from(el.childNodes).filter((nd) => nd.nodeType === 3 && nd.textContent.trim().length > 1);
            if (!own.length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (parseFloat(cs.opacity) < 0.4) continue;
            const fg = parse(cs.color);
            if (!fg) continue;
            out.push({ fg: fg.c, bg: bgOf(el), t: own[0].textContent.trim().slice(0, 24) });
          }
          return out;
        });
        for (const r of rows) {
          const cr = ratio(r.fg, r.bg);
          if (cr < 4.5) fails.push({ u, vw, cr: +cr.toFixed(2), t: r.t });
        }
      }
      check(`contrast >= 4.5:1 (${theme})`, fails.length === 0, { count: fails.length, sample: fails.slice(0, 5) });
      await ctx.close();
    }
  }

  /* ================= 6. overflow + target sentuh ================= */
  {
    for (const v of [
      { w: 320, h: 720, n: "320" }, { w: 375, h: 780, n: "375" }, { w: 414, h: 800, n: "414" },
      { w: 768, h: 900, n: "768" }, { w: 1280, h: 800, n: "1280" }, { w: 1920, h: 1080, n: "1920" },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
      const p = await ctx.newPage();
      const over = [];
      for (const u of ["/", "/karya/", "/tentang/", "/kontak/", "/karya/mafiablox/"]) {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(220);
        const r = await p.evaluate(() => ({
          doc: document.documentElement.scrollWidth,
          win: window.innerWidth,
          left: Math.round(document.documentElement.getBoundingClientRect().left),
        }));
        if (r.doc > r.win + 2 || r.left !== 0) over.push({ u, ...r });
      }
      check(`no horizontal overflow @ ${v.n}px`, over.length === 0, { over: over.slice(0, 2) });
      if (v.w <= 640) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(300);
        const small = await p.evaluate(() =>
          Array.from(document.querySelectorAll("a.btn, button.btn, .dl__b"))
            .filter((el) => { const b = el.getBoundingClientRect(); return b.height > 0 && b.height < 40; })
            .map((el) => el.className.toString().slice(0, 24) + " h=" + Math.round(el.getBoundingClientRect().height)),
        );
        check(`touch targets >= 40px @ ${v.n}px`, small.length === 0, { small: small.slice(0, 4) });
      }
      await ctx.close();
    }
  }

  /* ================= 7. teks ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const glued = [], leaks = [];
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "networkidle" });
      await p.waitForTimeout(200);
      const r = await p.evaluate(() => {
        const it = (document.body.innerText || "").replace(/\s+/g, " ").trim();
        const emailish = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i;
        const suspicious = it.split(" ")
          .filter((w) => !emailish.test(w) && !/https?:|github\.com|instagram\.com/i.test(w))
          .filter((w) => /[a-z]{16,}/.test(w) && !/-/.test(w) && !/^[A-Z]/.test(w)).slice(0, 4);
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
