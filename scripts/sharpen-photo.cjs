const sharp = require("C:/Users/MyBook Hype AMD/Documents/RobloxWindows/node_modules/sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "github", "arkan-avatar.png");
const OUT = path.join(__dirname, "..", "public", "github");

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log("sumber:", meta.width + "x" + meta.height);

  // 1. versi 2x (680) untuk layar rapat: Lanczos + unsharp supaya tidak lembek
  await sharp(SRC)
    .resize(680, 680, { kernel: "lanczos3", fit: "cover", position: "top" })
    .sharpen({ sigma: 1.1, m1: 0.8, m2: 0.4, x1: 2, y2: 12, y3: 18 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "arkan-avatar-2x.png"));
  console.log("arkan-avatar-2x.png", Math.round(fs.statSync(path.join(OUT, "arkan-avatar-2x.png")).size / 1024) + "KB");

  // 2. versi 1x tetap (tidak diubah), dipakai kalau layar biasa
  const m2 = await sharp(path.join(OUT, "arkan-avatar-2x.png")).metadata();
  console.log("hasil 2x:", m2.width + "x" + m2.height);
})();
