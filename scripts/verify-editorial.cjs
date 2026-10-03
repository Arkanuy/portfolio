/**
 * VERIFIKASI KONSEP "EDITORIAL INDEX"
 *
 * Bedanya dengan suite sebelumnya: yang diuji di sini sebagian besar adalah
 * NEGATIF. Cacat yang dilaporkan pengguna ("terlalu glossy", "ambient-nya
 * terasa AI slop") bukan cacat yang bisa dilihat dari "apakah ada elemennya",
 * tapi dari "apakah elemen terlarang itu ADA". Jadi gate-nya menuntut nol:
 *
 *   nol orb · nol blur/backdrop · nol box-shadow · nol gradient
 *   nol teks ber-background-clip · nol radius besar · nol hover:scale
 *   nol easing overshoot · nol eyebrow · nol animasi masuk di setiap seksi
 *
 * Kalau salah satu muncul, gate gagal — apa pun yang lain.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "editorial");
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

(async () => {
  const browser = await chromium.launch();
  const report = {};

  /* ---------------- 1. rute + error ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    const failed = [];
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
    check("no 4xx/5xx", failed.length === 0, { failed: failed.slice(0, 4) });
    report.status = status;
    await ctx.close();
  }

  /* ---------------- 2. GATE NEGATIF: daftar tell ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const found = {
      backdrop: [],
      filter: [],
      shadow: [],
      gradient: [],
      clipText: [],
      bigRadius: [],
      glow: [],
      circles: [],
    };

    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(120);
      const r = await p.evaluate(() => {
        const out = { backdrop: [], filter: [], shadow: [], gradient: [], clipText: [], bigRadius: [], glow: [], circles: [] };
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const cs = getComputedStyle(el);
          const id = el.tagName + "." + (el.className || "").toString().split(" ")[0].slice(0, 22);
          if (cs.backdropFilter && cs.backdropFilter !== "none") out.backdrop.push(id);
          if (cs.filter && cs.filter !== "none") out.filter.push(id + " " + cs.filter.slice(0, 30));
          if (cs.boxShadow && cs.boxShadow !== "none") out.shadow.push(id + " " + cs.boxShadow.slice(0, 40));
          const bi = cs.backgroundImage || "none";
          if (bi.includes("gradient")) out.gradient.push(id + " " + bi.slice(0, 40));
          if (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text") out.clipText.push(id);
          const rad = parseFloat(cs.borderTopLeftRadius) || 0;
          if (rad > 14) out.bigRadius.push(id + " r=" + rad);
          const sh = cs.boxShadow || "";
          // glow = shadow berwarna (bukan hitam netral)
          if (sh && sh !== "none" && !/rgba?\(0,\s*0,\s*0/.test(sh)) out.glow.push(id);
          // lingkaran besar ber-blur = orb
          const w = el.getBoundingClientRect().width;
          if (rad >= 999 && w > 120) out.circles.push(id + " w=" + Math.round(w));
        }
        return out;
      });
      for (const k of Object.keys(found)) if (r[k].length) found[k].push({ u, n: r[k].length, ex: r[k].slice(0, 2) });
    }

    const flat = (k, label) =>
      check(`zero ${label} across 17 routes`, found[k].length === 0, { offenders: found[k].slice(0, 2) });

    flat("backdrop", "backdrop-filter (glassmorphism)");
    flat("filter", "CSS filter (blur / glow)");
    flat("shadow", "box-shadow");
    flat("gradient", "gradient backgrounds");
    flat("clipText", "gradient text (background-clip)");
    flat("bigRadius", "border-radius > 14px");
    flat("glow", "coloured shadow glow");
    flat("circles", "large blurred circles (orbs)");

    report.tells = found;
    await ctx.close();
  }

  /* ---------------- 3. gerak: hemat, dan konsisten dengan konsep ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(900);

    const anim = await p.evaluate(() => {
      const rows = [];
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const cs = getComputedStyle(el);
        const names = cs.animationName && cs.animationName !== "none" ? cs.animationName.split(",").map((s) => s.trim()) : [];
        const tr = cs.transitionProperty && cs.transitionProperty !== "none" ? cs.transitionProperty.split(",").map((s) => s.trim()) : [];
        if (names.length || tr.length) {
          rows.push({
            cls: el.tagName + "." + (el.className || "").toString().split(" ")[0].slice(0, 20),
            anim: names,
            trans: tr,
            dur: cs.transitionDuration,
            ease: cs.transitionTimingFunction,
          });
        }
      }
      return rows;
    });

    const animatedNames = [...new Set(anim.flatMap((a) => a.anim))];
    check("animation set is tiny (<= 2 keyframe animations on entry)", animatedNames.length <= 2, {
      names: animatedNames,
    });
    check("no ambient/infinite loop animation anywhere", !anim.some((a) => a.anim.length > 0 && /spin|orb|grain|drift|float|pulse|marquee|ticker/i.test(a.anim.join(","))), {
      animatedNames,
    });

    // easing: tidak boleh ada overshoot (nilai y > 1 pada cubic-bezier)
    const overshoot = anim
      .flatMap((a) => (a.ease || "").split(","))
      .map((s) => s.trim())
      .filter((s) => s.startsWith("cubic-bezier"))
      .filter((s) => {
        const n = (s.match(/-?[\d.]+/g) || []).map(Number);
        return n.length === 4 && (n[1] > 1 || n[3] > 1);
      });
    check("no overshoot/bounce easings", overshoot.length === 0, { overshoot: [...new Set(overshoot)].slice(0, 4) });

    // hover:scale tidak boleh ada
    const scaleHover = await p.evaluate(() => {
      const out = [];
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const cs = getComputedStyle(el);
        if ((cs.transitionProperty || "").includes("transform") && /card|spot|glass|row|bead/i.test(el.className.toString()))
          out.push(el.className.toString().slice(0, 30));
      }
      return out;
    });
    check("no transform transitions on card-like elements (no hover:scale)", scaleHover.length === 0, {
      offenders: scaleHover.slice(0, 3),
    });

    // eyebrow: tidak ada label mono kecil di atas heading
    const eyebrows = await p.evaluate(() =>
      Array.from(document.querySelectorAll("body *"))
        .filter((el) => {
          const cs = getComputedStyle(el);
          const txt = (el.textContent || "").trim();
          if (!txt || txt.length > 26) return false;
          const isMono = /mono|Plex_Mono/i.test(cs.fontFamily);
          const upper = cs.textTransform === "uppercase" || txt === txt.toUpperCase();
          const small = parseFloat(cs.fontSize) <= 13.5;
          const p = el.previousElementSibling;
          const nextTag = p ? p.tagName : "";
          return isMono && upper && small && el.tagName !== "TH";
        })
        .map((el) => el.textContent.trim().slice(0, 22)),
    );
    check("no eyebrow labels above headings", eyebrows.length === 0, { eyebrows: [...new Set(eyebrows)].slice(0, 5) });

    report.motion = { animatedNames, transitions: anim.length, overshoot: overshoot.length, scaleHover: scaleHover.length, eyebrows: eyebrows.length };
    await ctx.close();
  }

  /* ---------------- 4. data kerja disajikan sebagai tabel ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/karya/", { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const t = document.querySelector("table.work");
      if (!t) return null;
      const th = Array.from(t.querySelectorAll("thead th")).map((e) => e.textContent.trim());
      const rows = t.querySelectorAll("tbody tr").length;
      const nums = getComputedStyle(t.querySelector("td")).fontVariantNumeric;
      return { th, rows, nums, caption: !!t.querySelector("caption") };
    });
    check("work is a real table, not a card grid", !!r && r.rows === 7 && r.th.length >= 5, r);
    check("numbers use tabular-nums (columns align)", !!r && r.nums.includes("tabular-nums"), { nums: r?.nums });
    check("table has a caption", !!r && r.caption === true, { caption: r?.caption });

    // di ponsel tabelnya jadi baris, bukan kartu bertumpuk
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(300);
    const m = await p.evaluate(() => {
      const tr = document.querySelector("table.work tbody tr");
      const td = tr ? tr.querySelector("td") : null;
      return { display: tr ? getComputedStyle(tr).display : null, tdDisplay: td ? getComputedStyle(td).display : null };
    });
    check("mobile: table rows become blocks (not stacked cards)", m.display === "block" && m.tdDisplay === "block", m);
    await ctx.close();
  }

  /* ---------------- 5. kontras, dua tema ---------------- */
  {
    for (const theme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const fails = [];
      for (const [u, vw] of [
        ["/", 1440], ["/karya/", 1440], ["/layanan/", 1440], ["/tentang/", 1440],
        ["/riwayat/", 1440], ["/kontak/", 1440], ["/karya/mafiablox/", 1440],
        ["/", 390], ["/karya/", 390],
      ]) {
        await p.setViewportSize({ width: vw, height: 900 });
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(200);
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
            const chain = [];
            let n = el;
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
            const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
            if (!own.length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (parseFloat(cs.opacity) < 0.4) continue;
            if (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text") continue;
            const fg = parse(cs.color);
            if (!fg) continue;
            out.push({ fg: fg.c, bg: bgOf(el), t: own[0].textContent.trim().slice(0, 26) });
          }
          return out;
        });
        for (const r of rows) {
          const cr = ratio(r.fg, r.bg);
          if (cr < 4.5) fails.push({ u, vw, cr: +cr.toFixed(2), t: r.t });
        }
      }
      check(`contrast >= 4.5:1 (${theme})`, fails.length === 0, { count: fails.length, sample: fails.slice(0, 4) });
      await ctx.close();
    }
  }

  /* ---------------- 6. viewport: overflow + target sentuh ---------------- */
  {
    for (const v of [
      { w: 320, h: 720, n: "320" },
      { w: 375, h: 780, n: "375" },
      { w: 414, h: 800, n: "414" },
      { w: 768, h: 900, n: "768" },
      { w: 1280, h: 800, n: "1280" },
      { w: 1920, h: 1080, n: "1920" },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
      const p = await ctx.newPage();
      const over = [];
      for (const u of ["/", "/karya/", "/tentang/", "/kontak/", "/karya/mafiablox/"]) {
        await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(180);
        const r = await p.evaluate(() => ({
          doc: document.documentElement.scrollWidth,
          win: window.innerWidth,
          rootLeft: Math.round(document.documentElement.getBoundingClientRect().left),
        }));
        if (r.doc > r.win + 2 || r.rootLeft !== 0) over.push({ u, ...r });
      }
      check(`no horizontal overflow @ ${v.n}px`, over.length === 0, { over: over.slice(0, 2) });

      if (v.w <= 640) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(200);
        const small = await p.evaluate(() => {
          const isCtl = (el) => el.classList.contains("btn") || el.classList.contains("dl__b") || el.classList.contains("head__nav");
          return Array.from(document.querySelectorAll("a, button"))
            .filter((el) => el.classList.contains("btn") || el.classList.contains("dl__b"))
            .filter((el) => {
              const b = el.getBoundingClientRect();
              return b.height > 0 && b.height < 40;
            })
            .map((el) => el.className.toString().slice(0, 26) + " h=" + Math.round(el.getBoundingClientRect().height));
        });
        check(`touch targets >= 40px @ ${v.n}px`, small.length === 0, { small: small.slice(0, 4) });
      }
      await ctx.close();
    }
  }

  /* ---------------- 7. reduced motion + tanpa JS ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const t = document.querySelector(".open__t");
      return {
        clip: t ? getComputedStyle(t).clipPath : null,
        anim: t ? getComputedStyle(t).animationName : null,
        len: document.body.innerText.replace(/\s+/g, " ").trim().length,
      };
    });
    check("reduced-motion: heading not clipped, no animation", (r.clip === "none" || r.clip === "") && (r.anim === "none" || r.anim === ""), r);
    check("reduced-motion: content present", r.len > 900, { len: r.len });
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const n = await p2.evaluate(() => ({
      len: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
      links: document.querySelectorAll("a[href]").length,
      rows: document.querySelectorAll("table.work tbody tr").length,
    }));
    check("no-JS: content readable (no animation gate)", n.len > 1000 && n.links > 10 && n.rows === 7, n);
    await ctx2.close();
  }

  /* ---------------- 8. teks: kata menempel + kebocoran ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const glued = [];
    const leaks = [];
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(120);
      const r = await p.evaluate(() => {
        const it = (document.body.innerText || "").replace(/\s+/g, " ").trim();
        const emailish = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i;
        const suspicious = it
          .split(" ")
          .filter((w) => !emailish.test(w) && !/https?:|github\.com|instagram\.com/i.test(w))
          .filter((w) => /[a-z]{16,}/.test(w) && !/-/.test(w) && !/^[A-Z]/.test(w))
          .slice(0, 4);
        return { len: it.length, suspicious, text: it };
      });
      if (r.len === 0) glued.push({ u, reason: "empty innerText" });
      if (r.suspicious.length) glued.push({ u, suspicious: r.suspicious });
      const forbidden = [/\d{3,4}\s?[x×]\s?\d{3,4}/i, /\.(png|jpg|jpeg|webp|pdf)\b/i, /needs confirmation/i, /lorem ipsum/i, /undefined/, /NaN/, /\[object Object\]/, /--/];
      const hits = forbidden.filter((re) => re.test(r.text)).map((re) => re.source);
      if (hits.length) leaks.push({ u, hits });
    }
    check("no glued-word text corruption", glued.length === 0, { glued: glued.slice(0, 3) });
    check("no metadata leaks / straight double-hyphens", leaks.length === 0, { leaks: leaks.slice(0, 3) });
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
