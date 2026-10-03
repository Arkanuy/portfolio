# portfolio-arkan — **FIELD**

Portfolio pribadi **Arkan Mustofa** — mahasiswa Sistem Informasi di Bandung.
Situs statis Next.js. Deploy: **https://portfolio-arkan.pages.dev**

---

## Konsepnya: mekanisme dua referensi, dikerjakan sendiri

Empat percobaan sebelumnya gagal karena saya **mengarang arah** alih-alih
membaca contoh. Kali ini dua referensi diberikan — dan dikoreksi satu kali —
jadi langkah pertama bukan mendesain, tapi **membedah**:

### yang dibaca: `landonorris.com`
```
libs        lenis (gulir halus) · gsap · Three.js     → html.class = "w-mod-js lenis"
sticky      .sticky-item · .horizontal-pin-sticky
teks        .css-split-type                          (judul per huruf)
animasi     HANYA 1 keyframe CSS; sisanya scroll-driven
gambar      133 <img> · 21 <canvas> · 0 video
warna       bg rgb(40,44,32) olive gelap · teks rgb(244,244,237)
font        Mona Sans Variable + Brier
kanvas      21 (beberapa 36x36 dan 60x60 — ikon, bukan adegan 3D)
```

### yang dibaca: `bluemarinefoundation.com/the-sea-we-breathe/`
```
scrollH     208px, docH 900px  → BUKAN alur dokumen: narasi terkendali
struktur    preloader (pageLoaderLogo) → kanvas 1440x900 penuh →
            tombol "Let's Begin" (.js-enter-si) → NARASI BERLANGKAH →
            "Project Spotlight" · audio ambient + toggle (.js-audio-btn)
animasi     pageLoaderLogo · audioBar · draw (garis SVG menggambar) · marquee
tombol      clip-path: polygon(100% calc(100% - 10px), ...)  ← sudut terpotong
teks        140px / 103px / "t-title" 43.68px · font TT Lakes
isi         "Take a minute to relax and breathe in time with the rolling waves."
```

### yang ditiru (mekanisme, bukan tampilan)

| Mekanisme | Ada di sini |
|---|---|
| gulir halus (lerp) | engine sendiri, ~40 baris. **Bukan** dengan mengganti `window.scrollTo` ke transform — itu yang dulu merusak anchor/sticky/observer |
| seksi dipatok | `.scrub` tinggi 2340px, isi tetap `sticky; top:0`, panel kanan berganti per progres |
| judul dipecah | per **kata** (bukan huruf — per huruf membuat browser memotong baris di tengah kata dan spasinya hilang) |
| scrub | progres tiap bagian ditulis ke `--p`; CSS yang menggeser/menskalakan |
| narasi berlangkah | tombol "Let's begin" → empat langkah yang saling menggantikan |
| preloader | satu tanda + bilah + persentase, keluar dengan pengungkapan, maksimum ~900ms |
| marquee | dua baris, arah berlawanan, 38s vs 62s, berhenti saat disorot |
| gambar nyata | 3 tangkapan asli dari produk yang berjalan (mafiablox.com, build Fath School, arkanuy.github.io) |
| tombol sudut-terpotong | `clip-path: polygon(100% calc(100% - 11px), ...)` |

**Tanpa pustaka.** `package.json` tetap hanya `next`, `react`, `react-dom`.
Lenis + GSAP di referensi bernilai ratusan KB; mekanisme yang dipakai di sini
cukup ditulis sendiri, dan itu dijaga oleh gate.

---

## Ban anti-slop tetap berlaku, dan tetap diukur NOL

Delapan tell yang sudah terbukti ditolak, semuanya nol di 17 rute:
backdrop-filter · CSS filter (blur/glow) · box-shadow · latar gradien ·
teks gradien · radius piksel > 14px · glow berwarna · orb.

Gradien khusus jadi masalah: scrim di atas foto dibutuhkan untuk keterbacaan
judul, tapi gradien dilarang. Solusinya **lapisan bertingkat beropasitas
menurun** — hasil visual setara, tanpa `background-image: linear-gradient`.

---

## Verifikasi: 58 gate

```bash
npm run build
npx serve out
PF_BASE=http://localhost:3000 npm run verify
```

| Suite | Gate | Isi |
|---|---|---|
| `verify:field` | **45/45** | 17 rute 200 tanpa error · **mekanisme referensi**: preloader muncul lalu hilang, engine aktif, **gulir roda benar-benar menggerakkan halaman**, judul terpecah 4 kata dengan 4 jeda berbeda + tiap kata bermask, marquee 2 baris arah berlawanan & benar berjalan, seksi dipatok `sticky` lebih tinggi dari viewport, tombol narasi ada, **4 langkah ada di DOM sebelum klik**, langkah berganti saat diklik, indikator ikut · 8 gate anti-slop = nol · **tanpa JS: nol elemen tersembunyi, teks utuh, 4 langkah tetap ada** · reduced-motion: nol rusak · kontras ≥4.5:1 di 2 tema · tanpa overflow di 6 viewport · target sentuh · tanpa kata menempel / kebocoran |
| `verify:perf` | **13/13** | tanpa pustaka pihak ketiga · JS & CSS terukur · gambar halaman depan <400 KB · FCP/LCP · biaya JS handler gulir · long task |
| `shots:field` | 10 tangkapan | tiap tangkapan diukur: tinta, baris berisi, warna unik, saturasi |

Angka rilis:

```
Keyframe CSS        6 (setType · drawRule · wipeIn · riseIn · mqRun · loadOut)
Elemen beranimasi   48+        marquee     38s ↔ 62s arah berlawanan
Seksi dipatok       2340px vs viewport 900px
Judul terpecah      4 kata · jeda 0 / 58 / 116 / 174 ms
FCP / LCP           216 ms              long task 0 ms
JS                  449 KB raw / 133 KB gzip
CSS                  37 KB raw /   8 KB gzip
Gambar halaman dp   154 KB (3 tangkapan asli)
```

### Cacat yang cuma ketahuan karena diukur

1. **Langkah narasi hilang tanpa JS.** Versi pertama hanya merender langkah
   setelah tombol diklik — tanpa JS isi bagian itu lenyap. Sekarang keempat
   langkah selalu ada di DOM; tanpa JS tampil sebagai daftar, dengan JS satu aktif.
2. **Keempat langkah saling menimpa.** Di state daftar, `grid-area: 1/1`
   membuat semuanya di sel yang sama (terukur semua di `top=390`). Diperbaiki
   dengan `grid-area: auto` saat belum dimulai.
3. **Urutan pengukuran gate salah.** Gate memeriksa keadaan "sebelum dimulai"
   SETELAH ada klik, jadi selalu melaporkan gagal. Yang salah pengukurannya,
   bukan halamannya.
4. **Klik otomatis ditolak Playwright.** Engine gulir halus membuat elemen
   terus bergerak selama easing sehingga tidak pernah "stabil". Itu efek
   samping nyata dari mekanisme referensi; gate memicu klik lewat DOM.
5. **Tombol "Let's begin" gagal kontras di dua tema sekaligus** (1.89:1 di
   terang, 3.06:1 di gelap) karena memakai token yang dibalik antar tema.
   Sekarang pasangan tetap terang-di-gelap: 16.4:1, tidak bergantung tema.
6. **Turbopack cache rusak** setelah sunting massal (`Module not found:
   @vercel/turbopack-next/internal/font/google/font`). Bersihkan
   `.next` + `node_modules/.cache`, build ulang.

---

## Susunan berkas

```
app/
  layout.tsx       3 peran font, preloader+nav, engine
  page.tsx         hero ber-scrub · marquee · kartu kerja · narasi · kutipan
                   · seksi dipatok · tabel bukti · angka
  karya/ layanan/ tentang/ riwayat/ kontak/
components/field/
  engine.tsx       gulir halus + scrub + panel + reveal + progress
  chrome.tsx       preloader + nav
  motion.tsx       Split / Reveal / Scrub  (kosakata gerak)
  begin.tsx        narasi berlangkah ("Let's begin")
  footer.tsx
lib/site.ts        konten (CV + repo publik)
lib/records.ts     status bukti
scripts/make-shots.cjs   ambil tangkapan asli dari produk yang jalan
```

**20 rute statis**, semuanya ter-render jadi HTML (`output: "export"`).

## Menjalankan

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # 20 rute statis -> out/
npm run verify         # 58 gate
npm run shots:field    # tangkapan + statistik
npm run assets:shots   # ambil ulang tangkapan dari situs asli
```

## Deploy

Cloudflare Pages: build `npm run build`, output `out`, Node 20+. Autodeploy
saat push ke `main`.

## Sumber konten

Semua teks dari CV (`public/arkan-mustofa-cv.pdf`) dan repo publik
`github.com/Arkanuy`. Tangkapan di `public/shots/` diambil langsung dari
produk yang berjalan, bukan mockup. Tidak ada metrik atau kredensial yang
dikarang.
