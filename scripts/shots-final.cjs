/** Tangkapan layar konsep baru (tema terang) untuk dibagikan. */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "evidence");
const BASE = "http://localhost:4321";

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1380, height: 880 } });
  const p = await ctx.newPage();

  const go = async (u) => {
    try {
      await p.goto(BASE + u, { waitUntil: "networkidle", timeout: 20000 });
    } catch {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 20000 });
    }
    await p.waitForTimeout(1000);
  };

  const items = [
    ["/", "1-beranda", 0],
    ["/", "2-beranda-tengah", 1500],
    ["/layanan", "3-layanan", 0],
    ["/karya", "4-karya", 0],
    ["/karya/mafiablox", "5-studi-kasus", 0],
    ["/tentang", "6-tentang", 0],
    ["/riwayat", "7-riwayat", 0],
    ["/kontak", "8-kontak", 0],
  ];

  for (const [u, name, scroll] of items) {
    await go(u);
    if (scroll) {
      await p.evaluate((y) => window.scrollTo(0, y), scroll);
      await p.waitForTimeout(1100);
    }
    const f = path.join(OUT, `f-${name}.jpg`);
    await p.screenshot({ path: f, type: "jpeg", quality: 86 });
    console.log("saved", path.basename(f), Math.round(fs.statSync(f).size / 1024) + "KB");
  }

  // tema gelap
  await go("/");
  await p.evaluate(() => document.querySelector(".tgl")?.click());
  await p.waitForTimeout(1200);
  const f = path.join(OUT, "f-9-gelap.jpg");
  await p.screenshot({ path: f, type: "jpeg", quality: 86 });
  console.log("saved", path.basename(f), Math.round(fs.statSync(f).size / 1024) + "KB");

  await b.close();
})();
