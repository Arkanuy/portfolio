const { chromium } = require("playwright");
const path = require("path");
const OUT = path.join(__dirname, "..", "evidence");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // kutipan
  await p.goto("http://localhost:4321/", { waitUntil: "load" });
  await p.waitForTimeout(1600);
  await p.evaluate(() => {
    const el = document.querySelector(".quote");
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 260);
  });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: path.join(OUT, "w-1-kutipan.jpg"), quality: 90, type: "jpeg" });

  // kartu layanan di halaman detail
  await p.goto("http://localhost:4321/layanan/web", { waitUntil: "load" });
  await p.waitForTimeout(1300);
  await p.evaluate(() => document.querySelector(".sec--tint .svcGrid").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, "w-2-kartu-layanan.jpg"), quality: 90, type: "jpeg" });

  await ctx.close();

  // ponsel: kutipan
  const mc = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const mp = await mc.newPage();
  await mp.goto("http://localhost:4321/", { waitUntil: "load" });
  await mp.waitForTimeout(1600);
  await mp.evaluate(() => {
    const el = document.querySelector(".quote");
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 200);
  });
  await mp.waitForTimeout(1500);
  await mp.screenshot({ path: path.join(OUT, "w-3-kutipan-ponsel.jpg"), quality: 90, type: "jpeg" });
  await mc.close();

  await b.close();
  console.log("saved w-1..w-3");
})();
