# portfolio-arkan — **PUNCH**

Portfolio pribadi **Arkan Mustofa**. Situs statis Next.js.
Deploy: **https://portfolio-arkan.pages.dev**

---

## Konsepnya: portfolio sebagai setumpuk kartu punch dan mesin pembacanya

Arah lama dibuang semua. Referensi komponen WebGL di internet berisi hal yang
sama berulang: tombol shader, liquid metal, kain 3D, silva/temple scene, holo
card, typography vortex, portal field, constellation background. Semua itu
justru **dihindari** di sini — tidak ada WebGL, tidak ada shader, tidak ada
kaca, tidak ada glow.

Yang dipakai: **kartu Hollerith 80 kolom**. Setiap catatan kerja adalah satu
kartu, dan **lubangnya adalah datanya**. Ini pra-komputer, dan jujur untuk
orang yang pekerjaannya membangun sistem dan menulis requirement:
antarmuka yang bisa dibaca mesin.

### Lubangnya benar-benar data

`lib/punch.ts` memetakan data ke geometri kartu. Aturannya bisa diperiksa:

| Kolom | Isi | Contoh dari kartu 01 |
|---|---|---|
| 1 | zona status | `zona 12` = berjalan di produksi |
| 2–5 | tahun, satu kolom per digit | 2026 |
| 6–7 | banyak bagian yang dibangun (2 digit) | 4 bagian |
| 8–13 | enam huruf pertama judul (puluhan + satuan) | MAFIAB |
| 14–79 | pola periksa | **kepadatan mengikuti panjang judul** |
| 80 | tanda akhir | panjang stack judul mod 10 |

Kepadatan pola sengaja **tidak seragam**: percobaan pertama membuat satu lubang
per kolom dan hasilnya semua kartu punya 86 lubang — seragam, jadi terbaca
sebagai hiasan. Sekarang panjang judul menentukan berapa lubang per kolom, dan
terukur: **86 / 119 / 152 lubang** antar kartu.

Yang penting: tujuh kartu menghasilkan **tujuh pola berbeda**, dan polanya
**deterministik** — muat ulang, lubangnya sama.

### Mekanisme mesinnya

- **Kepala pembaca** menyapu kolom mengikuti gulir. Terukur: `x` bergerak
  0 → 808 → 1406 sepanjang halaman, dan kolom yang dilewati menyala
  (`[25,26,27]` lalu `[79,80,63]`).
- **Memilih kartu mengangkatnya dari tumpukan**, dan area cetak di bawah mesin
  menampilkan kartu itu — termasuk **legenda pengkodeannya**, supaya tiap lubang
  bisa dipertanggungjawabkan.
- **Tombol angka 1–7** di keyboard memilih kartu, seperti panel mesin.
- Tiap kartu punya `aria-label` yang menyebut jumlah lubangnya.

---

## Anti-slop: semuanya nol, dan diukur

| Tell | Hasil di 17 rute |
|---|---|
| backdrop-filter (kaca) | **0** |
| CSS filter (blur/glow) | **0** |
| box-shadow | **0** |
| latar gradien | **0** |
| teks gradien | **0** |
| radius > 14px | **0** |
| glow berwarna | **0** |
| orb (lingkaran besar) | **0** |

Warna: kertas kartu ivory, logam dingin untuk area cetak, dan **satu aksen
merah pita** yang hanya dipakai di tempat berartinya.

---

## Verifikasi: 41 gate

```bash
npm run build
npx serve out
PF_BASE=http://localhost:3000 npm run verify
```

| Kelompok | Isi |
|---|---|
| **Lubang = data** | 7 kartu tergambar · 80 kolom tiap kartu · 7 pola unik · kepadatan bervariasi (86/119/152) · deterministik setelah muat ulang · legenda menjelaskan tiap lubang |
| **Mekanisme mesin** | kepala pembaca bergerak · kolom menyala & berpindah · memilih kartu mengangkatnya · area cetak ikut berubah · tombol angka berfungsi |
| **Anti-slop** | 8 gate menuntut nol |
| **Aman** | tanpa JS: 833 lubang tetap tergambar, nol elemen tersembunyi · reduced-motion: nol tersembunyi |
| **Lain-lain** | 17 rute 200 tanpa error · kontras ≥4.5:1 di 2 tema · tanpa overflow di 6 viewport · target sentuh ≥40px · tanpa kata menempel / kebocoran |

Angka rilis:

```
Lubang per kartu   86 / 119 / 152   (mengikuti panjang judul)
Pola unik          7 dari 7 kartu
Kepala pembaca     x: 0 → 808 → 1406
Saturasi rata-rata 0.071 – 0.086    (praktis monokrom)
Tanpa JS           833 lubang tetap tergambar
```

### Dua cacat yang ketahuan karena diukur

1. **Semua kartu punya 86 lubang.** Pola periksa awalnya satu lubang per kolom,
   jadi kepadatannya identik dan kartunya terbaca sebagai hiasan. Sekarang
   panjang judul menentukan kepadatan.
2. **Aksen gagal kontras di area cetak.** `--accent` di atas logam cuma 3.28:1
   (terang) dan 4.49:1 (gelap). Ditambah token `--metal-accent` yang nilainya
   berbeda per tema: `#7a1a0a` (5.28:1) dan `#ff8a6e` (5.35:1).

---

## Susunan berkas

```
app/
  layout.tsx       3 peran tipe, kepala mesin, mesin, footer
  page.tsx         pembuka + tumpukan kartu + layanan + metode + angka + perkakas
  karya/           7 kartu (+ halaman kasus dengan kartu ukuran penuh)
  layanan/ tentang/ riwayat/ kontak/
components/punch/
  card.tsx         kartu 80×12 sebagai SVG + kepala pembaca
  deck.tsx         tumpukan + area cetak + legenda
  masthead.tsx     kepala mesin (bilah status + nama + bagian)
  footer.tsx
lib/punch.ts       pengkodean data ke geometri kartu  ← inti konsepnya
lib/records.ts     kartu + status bukti
scripts/verify-punch.cjs   41 gate
scripts/shots-punch.cjs    tangkapan + statistik
```

**20 rute statis**, semua ter-render jadi HTML (`output: "export"`).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 20 rute statis -> out/
npm run verify   # 41 gate
npm run shots    # tangkapan + statistik
```

## Deploy

Cloudflare Pages: build `npm run build`, output `out`, Node 20+.
Autodeploy saat push ke `main`.

## Sumber konten

Semua teks dari CV (`public/arkan-mustofa-cv.pdf`) dan repo publik
`github.com/Arkanuy`. Tidak ada metrik, tangkapan layar, atau kredensial yang
dikarang — termasuk lubang di kartunya, yang seluruhnya dihitung dari data itu.
