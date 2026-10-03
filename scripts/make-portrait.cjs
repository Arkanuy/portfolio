/**
 * Foto profil: PNG besar -> WebP.
 *
 * Kenapa: `arkan-avatar-680.webp` 721 KB. Itu satu-satunya gambar di lembar depan
 * dan langsung jadi LCP. Sub-konsepnya juga cocok: situs ini soal jejak dan
 * ukuran, jadi berat gambar harus ikut diukur, bukan dirasakan.
 *
 * Satu ukuran saja: 680px = 2x dari kotak tampil ~340px.
 *
 * CATATAN PENTING: resolusi ASLI foto ini 340x340 (avatar GitHub di-cap di
 * 340px — parameter ?s=1024 pun mengembalikan 340). Jadi "680" adalah 2x yang
 * jujur untuk layar retina, bukan detail tambahan. Versi 960 yang sempat dibuat
 * dihapus karena cuma interpolasi: angkanya lebih besar, isinya tidak.
 */
const sharp = require("C:/Users/MyBook Hype AMD/lucifer-controller/node_modules/sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "github", "arkan-avatar.png");
const OUT = path.join(__dirname, "..", "public", "github");

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log("source:", meta.width + "x" + meta.height, Math.round(fs.statSync(SRC).size / 1024) + "KB");

  for (const [name, size, q] of [["arkan-avatar-680.webp", 680, 82]]) {
    const to = path.join(OUT, name);
    await sharp(SRC)
      .resize(size, size, { kernel: "lanczos3", fit: "cover", position: "top" })
      .webp({ quality: q, effort: 6 })
      .toFile(to);
    console.log(name, Math.round(fs.statSync(to).size / 1024) + "KB");
  }
})();
