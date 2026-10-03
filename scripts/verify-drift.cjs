/**
 * VERIFIKASI KONSEP DRIFT
 *
 * Konsep ini soal gerak dan "hidup". Jadi yang diuji bukan cuma "ada animasi",
 * tapi SEBERAPA BESAR dan SEBERAPA BERLAPIS — dua kesalahan yang pernah lolos
 * suite versi lama:
 *
 *   1. Gerak 2-18px per layar lolos gerbang "delta > 1px", padahal manusia
 *      tidak melihatnya sama sekali. Ambang di sini 40px.
 *   2. Satu kecepatan seragam = kertas yang tergeser, bukan kedalaman. Jadi
 *      wajib ada kecepatan BERBEDA dan minimal satu lapis yang BERLAWANAN arah.
 *   3. "Hidup tanpa interaksi" harus dibuktikan: saat tidak ada scroll dan
 *      tidak ada kursor, transform tetap berubah (ambient). Nol transform di
 *      sini tidak mungkin.
 */
const { chromium } = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PF_BASE || "http://127.0.0.1:4381";
const OUT = path.join(__dirname, "..", "evidence", "drift");
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

  /* ---------------- 2. AMBIENT: hidup tanpa interaksi ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(600);

    /* tidak ada scroll, tidak ada pointer. Ambil tiga sampel transform
     * ambient pada momen berbeda — kalau identik, halaman itu diam. */
    const sample = async () =>
      p.evaluate(() => {
        /* Hanya permukaan yang TERLIHAT. Elemen di bawah lipatan sengaja belum
         * dirakit (opacity 0), jadi mewajibkannya "bergerak" akan menuntut
         * sesuatu yang memang belum waktunya. */
        const els = Array.from(document.querySelectorAll("[data-drift]")).filter((el) => {
          const b = el.getBoundingClientRect();
          return b.top < window.innerHeight && b.bottom > 0 && parseFloat(getComputedStyle(el).opacity) > 0.5;
        });
        return els.map((el) => {
          const cs = getComputedStyle(el);
          return { cls: el.className.toString().slice(0, 26), t: cs.transform };
        });
      });

    const a = await sample();
    await p.waitForTimeout(1400);
    const b = await sample();
    await p.waitForTimeout(1400);
    const c = await sample();

    const changed = a.filter((x, i) => x.t !== b[i].t || x.t !== c[i].t).length;
    /* Gate ini lahir dari bug nyata: flag induk pernah bernama `data-drift`,
     * sehingga <html> ikut cocok dengan selektor per-elemen dan SELURUH
     * dokumen tertransformasi 6px. Gejalanya muncul di tempat lain
     * ("overflow horizontal"), jadi gate-nya harus di sini. */
    const rootClean = await p.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return { transform: cs.transform, hasDriftAttr: document.documentElement.hasAttribute("data-drift") };
    });
    check(
      "root <html> carries no transform and no data-drift attr",
      (rootClean.transform === "none" || rootClean.transform === "matrix(1, 0, 0, 1, 0, 0)") &&
        rootClean.hasDriftAttr === false,
      rootClean,
    );

    /* Gate yang menangkap bug nyata: elemen ber-transisi transform yang juga
     * bergerak ambient akan terus diinterpolasi ke target yang bergerak, jadi
     * NILAINYA berubah tapi POSISINYA nyaris tidak. Mengukur nilai CSS saja
     * melaporkan "bergerak" padahal mata melihat diam. Jadi ukur posisi
     * piksel sesungguhnya. */
    const moved = a.filter((x, i) => {
      const m = (s) => (s.match(/-?[\d.]+/g) || []).map(Number);
      const p1 = m(x.t);
      const p2 = m(c[i].t);
      const d1 = p1.length >= 6 ? Math.hypot(p1[4], p1[5]) : 0;
      const d2 = p2.length >= 6 ? Math.hypot(p2[4], p2[5]) : 0;
      return Math.abs(d1 - d2) > 1.5;
    }).length;
    check("ambient surfaces physically displace (not just recompute)", moved === a.length, {
      visible: a.length,
      physicallyMoved: moved,
    });

    const totalAmbient = await p.evaluate(() => document.querySelectorAll("[data-drift]").length);
    check("ambient surfaces exist across the site", totalAmbient >= 4, { totalAmbient });
    check(
      "every VISIBLE ambient surface moves with zero interaction",
      a.length >= 1 && changed === a.length,
      { visible: a.length, changed, sample: a[0]?.t?.slice(0, 44) },
    );

    /* orb medan harus benar-benar beranimasi */
    const orbAnim = await p.evaluate(() => {
      const orb = document.querySelector(".field__orb--a");
      const cs = orb ? getComputedStyle(orb) : null;
      return cs ? { name: cs.animationName, dur: cs.animationDuration } : null;
    });
    check("field orbs are animating", !!orbAnim && orbAnim.name !== "none" && orbAnim.name !== "", orbAnim);

    const grain = await p.evaluate(() => {
      const g = document.querySelector(".field__grain");
      const cs = g ? getComputedStyle(g) : null;
      return cs ? cs.animationName : null;
    });
    check("grain is alive (not a static texture)", !!grain && grain !== "none", { grain });

    /* ticker: dua baris, arah berbeda, kecepatan berbeda */
    const ticks = await p.evaluate(() =>
      Array.from(document.querySelectorAll(".ticks__row")).map((r) => {
        const cs = getComputedStyle(r);
        return { dur: cs.animationDuration, dir: cs.animationDirection, name: cs.animationName };
      }),
    );
    check(
      "ticker has 2 rows, different duration AND opposite direction",
      ticks.length === 2 &&
        ticks[0].dur !== ticks[1].dur &&
        ticks.some((t) => t.dir === "reverse") &&
        new Set(ticks.map((t) => t.dir)).size === 2,
      { ticks },
    );
    await ctx.close();
  }

  /* ---------------- 3. DRIFT: besar + berlapis + kontra-arah ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(700);

    /* Matikan animasi ambient dulu. Tanpa ini, transform gabungan elemen
       bergeser sendiri karena waktu, dan "perpindahan karena gulir" jadi
       tidak bisa dipisahkan dari "perpindahan karena napas". */
    await p.addStyleTag({
      content: ".field__grain,.field__orb,.hd__orb,.ticks__row{animation:none!important}",
    });

    const read = () =>
      p.evaluate(() =>
        Array.from(document.querySelectorAll("[data-dp]")).map((el) => ({
          speed: Number(el.dataset.dp || 0),
          dp: parseFloat(el.style.getPropertyValue("--dp")) || 0,
          cls: el.tagName + "." + el.className.toString().split(" ")[0].slice(0, 22),
        })),
      );

    /* Ukur lintas BEBERAPA posisi gulir: engine memang sengaja melewati elemen
       yang jauh di luar layar (hemat kerja), jadi mengukur di dua posisi saja
       akan melaporkan "tidak bergerak" untuk bagian bawah halaman. */
    const samples = [];
    for (const y of [0, 320, 700, 1100, 1600, 2200]) {
      await p.evaluate((n) => window.scrollTo(0, n), y);
      await p.waitForTimeout(360);
      samples.push(await read());
    }
    const base = samples[0];
    const rows = base.map((t, i) => {
      let maxMove = 0;
      let best = 0;
      for (const s of samples.slice(1)) {
        const d = s[i].dp - t.dp;
        if (Math.abs(d) > Math.abs(maxMove)) {
          maxMove = d;
          best = s[i].dp;
        }
      }
      return { cls: t.cls, speed: t.speed, geser: +maxMove.toFixed(1) };
    });

    const moved = rows.filter((r) => Math.abs(r.geser) > 1);
    const visible = rows.filter((r) => Math.abs(r.geser) >= 40);
    const speeds = new Set(moved.map((r) => r.speed));
    const pos = moved.filter((r) => r.geser > 0);
    const neg = moved.filter((r) => r.geser < 0);

    check("drift layers exist and move on scroll", moved.length >= 5, { moved: moved.length, of: rows.length });
    check("travel is big enough to actually see (>=40px, >=4 layers)", visible.length >= 4, {
      visible: visible.length,
      top5: visible.sort((a, b) => Math.abs(b.geser) - Math.abs(a.geser)).slice(0, 5),
    });
    check("layers use at least 3 distinct speeds", speeds.size >= 3, { speeds: [...speeds] });
    check("some layer counter-moves (depth, not a sliding sheet)", pos.length > 0 && neg.length > 0, {
      positive: pos.length,
      negative: neg.length,
      range: `${Math.min(...moved.map((r) => r.geser))} .. ${Math.max(...moved.map((r) => r.geser))}`,
    });

    /* elemen fokus (nama hero baris pertama) harus bergerak paling jauh */
    const focal = rows.find((r) => r.speed === 0.5);
    check("focal hero layer travels far (>=90px)", !!focal && Math.abs(focal.geser) >= 90, { focal });

    report.drift = { rows, moved: moved.length, visible: visible.length, speeds: [...speeds] };
    await ctx.close();
  }

  /* ---------------- 3b. aksi hero terlihat tanpa menggulir ---------------- */
  {
    for (const v of [
      { w: 1440, h: 900, n: "laptop 1440x900" },
      { w: 1366, h: 768, n: "laptop 1366x768" },
      { w: 1280, h: 720, n: "laptop 1280x720" },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
      const p = await ctx.newPage();
      await p.goto(BASE + "/", { waitUntil: "networkidle" });
      await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const acts = document.querySelector(".hero__actions");
        const lede = document.querySelector(".hero__lede");
        const b = acts ? acts.getBoundingClientRect() : null;
        return {
          actionsTop: b ? Math.round(b.top) : null,
          actionsInView: b ? b.top < window.innerHeight - 8 && b.bottom > 0 : false,
          ledeInView: lede ? lede.getBoundingClientRect().top < window.innerHeight : false,
          vh: window.innerHeight,
        };
      });
      check(`hero actions visible without scrolling @ ${v.n}`, r.actionsInView && r.ledeInView, r);
      await ctx.close();
    }
  }

  /* ---------------- 4. ASSEMBLE: perakitan, bukan sekadar reveal ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    /* telusuri halaman supaya setiap bagian dapat giliran menyusun diri */
    await p.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.6)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(900);

    const as = await p.evaluate(() => {
      const els = Array.from(document.querySelectorAll("[data-as]"));
      const visible = els.filter((e) => {
        const b = e.getBoundingClientRect();
        return b.top < window.innerHeight && b.bottom > 0;
      });
      return {
        total: els.length,
        triggered: els.filter((e) => e.getAttribute("data-as") === "in").length,
        /* Elemen di bawah lipatan memang BELUM waktunya muncul — itu perilaku
         * yang benar. Yang tidak boleh: ada yang terlihat mata tapi transparan. */
        hiddenInViewport: visible.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length,
        visibleNow: visible.length,
      };
    });
    check(
      "assemble: nothing visible stays transparent",
      as.total >= 8 && as.hiddenInViewport === 0,
      as,
    );
    check("assemble: most elements triggered after the scroll journey", as.triggered >= as.total * 0.9, as);

    /* hero name rows must come from DIFFERENT directions, with staggered delays */
    const hero = await p.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".hero__name > span"));
      return rows.map((r) => ({
        x: getComputedStyle(r).getPropertyValue("--as-x").trim(),
        y: getComputedStyle(r).getPropertyValue("--as-y").trim(),
        delay: getComputedStyle(r).getPropertyValue("--as-d").trim(),
      }));
    });
    const dirs = new Set(hero.map((h) => `${h.x}|${h.y}`));
    const delays = new Set(hero.map((h) => h.delay));
    check("headline rows assemble from different directions", dirs.size >= 2, { hero });
    /* Judul nama punya 2 baris, tagline 1 baris — tiga kelompok dengan jeda
     * berbeda. Yang penting: tidak semuanya masuk serentak. */
    const tagDelay = await p.evaluate(() => {
      const t = document.querySelector(".hero__tagline");
      return t ? getComputedStyle(t).getPropertyValue("--as-d").trim() : "";
    });
    const allDelays = new Set([...delays, tagDelay].filter(Boolean));
    check("assembly is staggered, not simultaneous", allDelays.size >= 3, { delays: [...allDelays] });
    await ctx.close();
  }

  /* ---------------- 5. kursor: menyala + miring ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(500);

    const spot = p.locator(".spot").first();
    /* WAJIB di-scroll dulu: sedikit di bawah lipatan, pointerEvent tidak akan
       pernah sampai, dan kegagalannya terlihat seperti bug fitur. */
    await spot.scrollIntoViewIfNeeded();
    await p.waitForTimeout(420);
    const box = await spot.boundingBox();
    if (box) {
      await p.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.3);
      await p.waitForTimeout(260);
      const s1 = await spot.evaluate((el) => ({ x: el.style.getPropertyValue("--sx"), y: el.style.getPropertyValue("--sy") }));
      await p.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.75);
      await p.waitForTimeout(260);
      const s2 = await spot.evaluate((el) => ({ x: el.style.getPropertyValue("--sx"), y: el.style.getPropertyValue("--sy") }));
      check(
        "cursor light follows the pointer",
        s1.x !== "" && s2.x !== "" && s1.x !== s2.x && s1.y !== s2.y,
        { s1, s2 },
      );
    } else {
      check("cursor light follows the pointer", false, { reason: "no .spot found" });
    }

    const tilt = p.locator(".tiltable").first();
    await tilt.scrollIntoViewIfNeeded();
    await p.waitForTimeout(420);
    const tb = await tilt.boundingBox();
    if (tb) {
      await p.mouse.move(tb.x + tb.width * 0.2, tb.y + tb.height * 0.25);
      await p.waitForTimeout(200);
      const t1 = await tilt.evaluate((el) => ({ rx: el.style.getPropertyValue("--rx"), ry: el.style.getPropertyValue("--ry") }));
      await p.mouse.move(tb.x + tb.width * 0.85, tb.y + tb.height * 0.8);
      await p.waitForTimeout(200);
      const t2 = await tilt.evaluate((el) => ({ rx: el.style.getPropertyValue("--rx"), ry: el.style.getPropertyValue("--ry") }));
      check("tilt responds to pointer", t1.ry !== "" && t2.ry !== "" && t1.ry !== t2.ry, { t1, t2 });
    } else {
      check("tilt responds to pointer", false, { reason: "no .tiltable found" });
    }
    await ctx.close();
  }

  /* ---------------- 6. potret: tidak terpotong, tidak tertutup ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });

    /* Scroll potret ke layar DULU. Kalau tidak, elemennya masih dalam keadaan
     * awal "assemble" (translate 52px + scale 0.94), dan pengukuran tata letak
     * akan melaporkan keterangan yang menimpa foto — padahal yang terjadi cuma
     * animasi belum jalan. Itu mengukur animasi, bukan tata letak. */
    await p.locator(".portrait").scrollIntoViewIfNeeded();
    /* CATATAN API: Playwright memakai waitForFunction(fn, arg, options) — opsi
     * di argumen KETIGA. Menaruhnya di argumen kedua membuatnya diperlakukan
     * sebagai `arg` dan batas waktunya jatuh ke bawaan 30s (itu menghasilkan
     * timeout yang menyesatkan). */
    await p.waitForFunction(
      () => {
        const f = document.querySelector(".portrait__frame");
        if (!f || f.getAttribute("data-as") !== "in") return false;
        /* Tunggu transisinya benar-benar selesai. Elemen yang sudah mendarat
         * memang masih punya transform IDENTITAS (rotate 0, scale 1, geser 0)
         * karena `[data-as="in"]` menyusun ulang transform bersama variabel
         * drift. Jadi yang diperiksa: skalanya ~1 dan gesernya ~0px. */
        const n = (getComputedStyle(f).transform.match(/-?[\d.]+/g) || []).map(Number);
        if (n.length < 6) return true;
        return Math.abs(n[0] - 1) < 0.02 && Math.abs(n[5]) < 3;
      },
      undefined,
      { timeout: 10000 },
    );
    await p.waitForTimeout(200);

    const r = await p.evaluate(() => {
      const img = document.querySelector(".portrait__img");
      const fig = document.querySelector(".portrait__frame");
      const below = document.querySelector(".portrait__below");
      if (!img || !fig) return null;
      const ib = img.getBoundingClientRect();
      const fb = fig.getBoundingClientRect();

      // apakah ada elemen lain yang menutupi foto?
      const blockers = Array.from(document.querySelectorAll("body *"))
        .filter((el) => {
          if (el === img || el === fig || el.contains(img) || img.contains(el)) return false;
          if (el.classList.contains("portrait__ring") || el.classList.contains("field__orb")) return false;
          const cs = getComputedStyle(el);
          if (cs.position !== "absolute" && cs.position !== "fixed") return false;
          if (cs.pointerEvents === "none" || parseFloat(cs.opacity) < 0.05) return false;
          const eb = el.getBoundingClientRect();
          const ox = Math.max(0, Math.min(ib.right, eb.right) - Math.max(ib.left, eb.left));
          const oy = Math.max(0, Math.min(ib.bottom, eb.bottom) - Math.max(ib.top, eb.top));
          return (ox * oy) / (ib.width * ib.height) > 0.02;
        })
        .map((el) => el.className.toString().slice(0, 40));

      return {
        shown: Math.round(ib.width),
        natural: img.naturalWidth,
        covering: blockers,
        captionBelow: below ? Math.round(below.getBoundingClientRect().top) >= Math.round(fb.bottom - 2) : null,
        captionVisible: below ? parseFloat(getComputedStyle(below).opacity) > 0.9 : false,
        /* toleransi 1px: pembulatan sub-piksel saat transition berakhir */
        frameSettled: (() => {
          const tr = getComputedStyle(img.closest(".portrait__frame")).transform;
          if (tr === "none") return true;
          const n = (tr.match(/-?[\d.]+/g) || []).map(Number);
          return n.length >= 6 ? Math.abs(n[0] - 1) < 0.02 && Math.abs(n[5]) < 3 : false;
        })(),
        frameScale: getComputedStyle(img.closest(".portrait__frame")).transform,
      };
    });

    check("portrait rendered at real resolution (no upscale)", !!r && r.shown <= r.natural + 2, r);
    check("nothing paints over the portrait", !!r && r.covering.length === 0, { covering: r?.covering });
    check(
      "portrait caption sits outside the photo and is visible",
      !!r && r.captionBelow === true && r.captionVisible === true,
      { captionBelow: r?.captionBelow, captionVisible: r?.captionVisible },
    );
    check("portrait frame is not mid-animation when measured", !!r && r.frameSettled === true, {
      frameScale: r?.frameScale,
    });
    await ctx.close();
  }

  /* ---------------- 7. kontras dua tema, termasuk ponsel ---------------- */
  {
    for (const theme of ["dark", "light"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const fails = [];
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
        await p.waitForTimeout(260);
        const found = await p.evaluate(() => {
          /* Parser warna yang benar.
           * Dua jebakan yang bikin seluruh tema terang dilaporkan gagal:
           *   1. color-mix() resolve jadi `color(srgb 0.96 0.94 0.97 / 0.45)`
           *      — komponennya NORMALISASI 0-1, bukan 0-255. Mengalikan asumsi
           *      255 membuat latar terang terbaca hampir hitam.
           *   2. latarnya sering ber-alpha, jadi harus di-COMPOSITE di atas
           *      lapisan di bawahnya, bukan dipakai apa adanya. */
          const parse = (s) => {
            if (!s) return null;
            const norm = s.startsWith("color(");
            const nums = (s.match(/[\d.]+/g) || []).map(Number);
            if (nums.length < 3) return null;
            let a = nums.length >= 4 ? nums[3] : 1;
            if (s.startsWith("rgba(") || (s.startsWith("rgb(") && nums.length >= 4)) a = nums[3];
            if (s.startsWith("color(") && s.includes("/")) a = nums[3];
            const scale = norm ? 255 : 1;
            return { c: [nums[0] * scale, nums[1] * scale, nums[2] * scale], a };
          };
          const over = (top, bot) => {
            const a = top.a + bot.a * (1 - top.a);
            if (a === 0) return { c: [0, 0, 0], a: 0 };
            return {
              c: top.c.map((v, i) => (v * top.a + bot.c[i] * bot.a * (1 - top.a)) / a),
              a,
            };
          };
          /* Warna stop gradien, kalau ada. Tanpa ini, teks di atas gradien
           * diukur terhadap panel di belakangnya — bisa lolos padahal aslinya
           * gagal, atau gagal padahal aslinya lolos. Dua-duanya dusta. */
          const gradientStops = (img) => {
            if (!img || img === "none" || !img.includes("gradient")) return null;
            /* `... linear-gradient(...) padding-box, ... border-box` = gradien
             * dipakai sebagai GARIS TEPI, bukan latar di belakang teks. */
            if (/padding-box|border-box|content-box/.test(img)) return null;
            const found = [];
            for (const m of img.matchAll(/(rgba?\([^)]+\)|color\([^)]+\)|#[0-9a-f]{3,8})/gi)) {
              const c = parse(m[1]);
              if (c) found.push(c.c);
            }
            return found.length ? found : null;
          };

          /* Susun dari <html> ke bawah: latar akhir yang benar-benar dilihat mata. */
          const bgOf = (el) => {
            const chain = [];
            let n = el;
            while (n && n.nodeType === 1) {
              chain.push(n);
              n = n.parentElement;
            }
            chain.reverse();
            let acc = { c: [255, 255, 255], a: 1 };
            for (const node of chain) {
              const cs2 = getComputedStyle(node);
              const bg = parse(cs2.backgroundColor);
              if (bg && bg.a > 0) acc = over(bg, acc);
              /* gradien menimpa warna latar: pakai stop terburuk sebagai latar */
              const stops = gradientStops(cs2.backgroundImage);
              if (stops && bg && bg.a > 0.9) acc = { c: stops[0], a: 1 };
            }
            return acc.c;
          };

          const worstStop = (el) => {
            const img = getComputedStyle(el).backgroundImage;
            return gradientStops(img);
          };
          const out = [];
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
            if (!own.length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (parseFloat(cs.opacity) < 0.4) continue;
            if (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text") continue; // teks gradien
            const fg = parse(cs.color);
            if (!fg) continue;
            const label = own[0].textContent.trim().slice(0, 28);
            const stops = worstStop(el);
            if (stops) {
              /* uji terhadap SEMUA stop gradien, ambil yang terburuk */
              for (const st of stops) out.push({ fg: fg.c, bg: st, t: label + " [gradient]" });
            } else {
              out.push({ fg: fg.c, bg: bgOf(el), t: label });
            }
          }
          return out;
        });
        for (const f of found) {
          if (f.fg.length < 3) continue;
          const cr = ratio(f.fg, f.bg);
          if (cr < 4.5) fails.push({ u, vw, cr: +cr.toFixed(2), t: f.t });
        }
      }
      check(`contrast >= 4.5:1 (${theme})`, fails.length === 0, { count: fails.length, sample: fails.slice(0, 5) });
      await ctx.close();
    }
  }

  /* ---------------- 8. viewport: overflow + target sentuh ---------------- */
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
        await p.waitForTimeout(220);
        const r = await p.evaluate(() => ({
          doc: document.documentElement.scrollWidth,
          win: window.innerWidth,
          wide: Array.from(document.querySelectorAll("body *"))
            .filter((el) => {
              const b = el.getBoundingClientRect();
              return b.width > 2 && (b.right > window.innerWidth + 2 || b.left < -2);
            })
            .slice(0, 3)
            .map((el) => el.tagName + "." + el.className.toString().slice(0, 26)),
        }));
        if (r.doc > r.win + 2) over.push({ u, doc: r.doc, win: r.win, wide: r.wide });
      }
      check(`no horizontal overflow @ ${v.n}px`, over.length === 0, { over: over.slice(0, 2) });

      if (v.w <= 640) {
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await p.waitForTimeout(320);
        const small = await p.evaluate(() => {
          const isCtl = (el) =>
            ["btn", "icBtn", "hd__burger", "contactRow__b", "bead", "tag"].some((c) => el.classList.contains(c)) ||
            el.classList.contains("hd__link");
          return Array.from(document.querySelectorAll("a, button"))
            .filter(isCtl)
            .filter((el) => {
              const b = el.getBoundingClientRect();
              if (b.width === 0 || b.height === 0) return false;
              if (getComputedStyle(el).display === "none") return false;
              return b.height < 40;
            })
            .slice(0, 5)
            .map((el) => el.className.toString().slice(0, 30) + " h=" + Math.round(el.getBoundingClientRect().height));
        });
        check(`touch targets >= 40px @ ${v.n}px`, small.length === 0, { small });
      }
      await ctx.close();
    }
  }

  /* ---------------- 9. reduced motion: mati tapi terbaca ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const els = Array.from(document.querySelectorAll("[data-as], .wf__w"));
      const hidden = els.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length;
      const txt = document.body.innerText.replace(/\s+/g, " ").trim();
      return {
        hidden,
        len: txt.length,
        driftFlag: document.documentElement.dataset.motion,
        orbAnim: getComputedStyle(document.querySelector(".field__orb--a")).animationName,
        asCount: document.querySelectorAll('[data-as="in"]').length,
      };
    });
    check("reduced-motion: nothing stays invisible", r.hidden === 0, r);
    check("reduced-motion: content is present", r.len > 900, { len: r.len });
    check("reduced-motion: field animation stops", r.driftFlag === "off" && r.orbAnim === "none", r);
    await ctx.close();
  }

  /* ---------------- 10. tanpa JS ---------------- */
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
        visible: nojs ? getComputedStyle(nojs).display !== "none" : false,
        hasJs: document.documentElement.hasAttribute("data-js"),
      };
    });
    check("no-JS: content still readable", r.len > 1000 && r.links > 10, { len: r.len, links: r.links });
    check("no-JS: the site states its own limitation", r.visible && !r.hasJs, r);
    await ctx.close();
  }

  /* ---------------- 11. dengan JS: banner itu hilang ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({
      js: document.documentElement.getAttribute("data-js"),
      nojs: getComputedStyle(document.querySelector(".nojs")).display,
    }));
    check("with JS: no false 'JavaScript is off' banner", r.js === "on" && r.nojs === "none", r);
    await ctx.close();
  }

  /* ---------------- 12. teks + kebocoran metadata ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const glued = [];
    const leaks = [];
    for (const u of pages) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(150);
      const r = await p.evaluate(() => {
        const it = (document.body.innerText || "").replace(/\s+/g, " ").trim();
        const emailish = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i;
        const words = it.split(" ");
        const suspicious = words
          .filter((w) => !emailish.test(w) && !/https?:|github\.com|instagram\.com/i.test(w))
          .filter((w) => /[a-z]{14,}/.test(w) && !/-/.test(w) && !/^[A-Z]/.test(w))
          .slice(0, 5);
        return { len: it.length, suspicious, text: it };
      });
      if (r.len === 0) glued.push({ u, reason: "empty innerText" });
      if (r.suspicious.length) glued.push({ u, suspicious: r.suspicious });

      const forbidden = [/\d{3,4}\s?[x×]\s?\d{3,4}/i, /\.(png|jpg|jpeg|webp|pdf)\b/i, /needs confirmation/i, /lorem ipsum/i, /undefined/, /NaN/, /\[object Object\]/];
      const hits = forbidden.filter((re) => re.test(r.text)).map((re) => re.source);
      if (hits.length) leaks.push({ u, hits });
    }
    check("no glued-word corruption", glued.length === 0, { glued: glued.slice(0, 3) });
    check("no metadata leaks in rendered text", leaks.length === 0, { leaks });
    await ctx.close();
  }

  report.summary = { pass: ok.length, fail: bad.length };
  report.failures = bad;
  fs.writeFileSync(path.join(OUT, "verify-drift.json"), JSON.stringify(report, null, 2));
  console.log(`\n=== ${ok.length} PASS / ${bad.length} FAIL ===`);
  if (bad.length) bad.forEach((b) => console.log(" -", b.n, JSON.stringify(b).slice(0, 260)));
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
