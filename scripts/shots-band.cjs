const { chromium } = require("playwright");
const path = require("path");
const OUT = path.join(__dirname, "..", "evidence");
(async () => {
  const b = await chromium.launch();
  for (const theme of ["light", "dark"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto("http://localhost:4321/", { waitUntil: "load" });
    await p.evaluate((t) => localStorage.setItem("theme", t), theme);
    await p.reload({ waitUntil: "load" });
    await p.waitForTimeout(1500);
    await p.evaluate(() => {
      const el = document.querySelector(".band");
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120);
    });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: path.join(OUT, `v-1-cta-${theme}.jpg`), quality: 92, type: "jpeg" });
    await ctx.close();
  }
  await b.close();
  console.log("saved v-1-cta-light.jpg / v-1-cta-dark.jpg");
})();
