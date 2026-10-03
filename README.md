# portfolio-arkan — **DRIFT**

Portfolio pribadi **Arkan Mustafa** — mahasiswa Sistem Informasi di Bandung.
Situs statis Next.js, deploy di Cloudflare Pages: **https://portfolio-arkan.pages.dev**

---

## Konsepnya: medan yang bergerak

Bukan halaman dengan animasi tempelan. Lapisannya sendiri yang bergerak.

Dua warna aksen berlawanan suhu — **coral hangat** dan **cyan dingin** — di atas
tinta gelap, plus grain yang bergerak. Tidak ada kartu berbayang, tidak ada
kursor kustom, tidak ada partikel.

---

## Tiga lapis gerak

Semuanya di satu engine: satu listener `scroll`, satu `rAF`, satu
`MutationObserver`. Ditulis ke CSS custom property; CSS yang memiliki
transform-nya (`components/drift/engine.tsx`).

### 1 · DRIFT — kedalaman
Parallax berlapis. Yang fokus paling cepat, latar **belakangnya bergerak
berlawanan arah**. Arah berlawanan itu yang dibaca mata sebagai kedalaman —
satu kecepatan seragam cuma terlihat seperti kertas yang tergeser.

Terukur pada 640px gulir:

| kecepatan | perpindahan |
|---|---|
| `0.34` (kata aksen judul) | **+223px** |
| `0.50` (fokus, nama) | **+145px** |
| `-0.22` (nama kedua, kontra) | **−96px** |
| `0.13` / `-0.09` (baris proyek) | ±52px |

5 kecepatan berbeda · 8 dari 13 lapisan bergerak · satu lapis kontra-arah.

### 2 · ASSEMBLE — bukan fade
Konten **menyusun diri**: tiap bagian datang dari arah, sudut, dan jeda sendiri.
Tiga baris nama masuk dari −60px/+70px, +80px/+70px, lalu tagline — masing-masing
dengan jeda bertingkat. Setelah perakitan selesai, transisi transform dilepas
supaya gerak ambient bisa terlihat (lihat "yang ditemukan" di bawah).

### 3 · AMBIENT — tidak pernah diam
Setiap permukaan ber-`data-drift` bergerak pelan terus-menerus — termasuk saat
pengunjung tidak menyentuh apa pun:
- **medan**: tiga cahaya bergerak (26s / 33s / 41s) + grain ber-`steps()`
- **ticker**: dua baris, kecepatan 34s vs 68s, arah berlawanan
- **kursor**: cahaya mengikuti pointer di dalam kartu + kartu miring 6°

---

## Yang ditemukan oleh pengukuran (bukan oleh mata)

Konsepnya soal gerak, jadi gate-nya mengukur **gerak**, bukan "ada animasi".
Enam cacat nyata ketahuan dari angka:

1. **Gerak yang tidak terlihat.** Ganti nama flag induk jadi `data-motion`
   dulu bernama `data-drift` — dan itu menaruh atribut `data-drift` di `<html>`,
   yang **cocok dengan selektor per-elemen**. Seluruh dokumen tertransformasi
   6px dari tepi, muncul sebagai "overflow horizontal di semua viewport".
   Sekarang ada gate khusus: `<html>` tidak boleh punya transform.
2. **Ambient yang diam padahal nilainya berubah.** Elemen dengan transisi
   `transform` 780ms (perakitan) sekaligus gerak ambient (~8×/detik) membuat
   browser terus menginterpolasi ke target yang bergerak — **posisinya nyaris
   tidak maju**. Terukur: `matrix(..., 6.89, -8.51)` saat transisi dimatikan,
   `matrix(..., 0, 0)` saat menyala. Satu-satunya cara menemukannya adalah
   mengukur **perpindahan piksel antar waktu**, bukan membaca nilai CSS.
3. **9 fps karena rasterisasi software.** Mesin ini menjalankan Chrome di atas
   **SwiftShader** (tanpa GPU). Versi pertama punya 5 lapisan seluas layar +
   `filter: blur(70px)` yang dianimasikan → p95 116ms. Sekarang: orb lebih
   kecil tanpa blur, kisi statis, satu grain ber-`steps()`. Gate-nya pun
   diubah: yang diuji **biaya JS handler gulir** (p95 **1.4ms**) dan
   **long task** (0), karena waktu frame absolut tidak bisa jadi ambang di
   mesin tanpa GPU.
4. **CSS-nya tidak pernah terkirim.** Saat menulis ulang `layout.tsx`, baris
   `import "./globals.css"` hilang — 0 byte CSS, dan hasilnya halaman
   tanpa gaya sama sekali. Ketahuan karena gate "radius 0" tidak menemukan
   satu pun elemen ber-radius: **nol pelanggaran** ternyata bisa berarti
   **CSS-nya tidak ada**.
5. **Foto & poster terlalu berat.** Enam PNG plate 104-118 KB = 660 KB.
   Dikonversi ke WebP: **527 KB → 143 KB** (−73%).
6. **Aksi hero di bawah lipatan.** Pada layar 900px tinggi, lede dan tombol
   ada di y=1014. Tiga baris nama dengan ukuran display mendorongnya keluar
   layar. Diperbaiki + gate baru: aksi harus terlihat tanpa menggulir di
   1440×900, 1366×768, dan 1280×720.

---

## Verifikasi: 56 gate, semuanya hijau

```bash
npm run build
npx serve out
PF_BASE=http://localhost:3000 npm run verify
```

| Suite | Gate | Isi |
|---|---|---|
| `verify:drift` | **47/47** | 17 rute 200 tanpa error · **gerak ≥40px di ≥4 lapisan** · ≥3 kecepatan · ada lapis kontra-arah · fokus ≥90px · ambient bergerak **secara posisi** tanpa interaksi · orbs + grain + ticker benar beranimasi · aksi hero terlihat tanpa menggulir (3 ukuran laptop) · perakitan berarah & bertingkat · kursor + tilt · kontras ≥4.5:1 di 2 tema (termasuk 390px) · tanpa overflow horizontal di 6 viewport · target sentuh ≥40px · auto-scroll konten di bawah lipatan · redraw banner no-JS · tanpa kata menempel · tanpa kebocoran metadata |
| `verify:perf` | **9/9** | tanpa pustaka animasi/UI pihak ketiga · anggaran JS/CSS · **gambar < 200 KB** · FCP/LCP · **biaya JS handler gulir p95 ≤ 16ms** · tanpa long task |
| `shots:drift` | 10 tangkapan | tiap tangkapan diukur: rasio tinta, baris berisi, jumlah warna unik — tangkapan rata/kosong tidak bisa lolos |

Angka rilis terakhir:

```
JS       452 KB raw / 134 KB gzip   (lantai runtime React 19 + Next 16)
CSS       43 KB raw /   9 KB gzip
Gambar   143 KB  (potret + 6 poster WebP)
FCP/LCP  216 ms          long task  0 ms
Handler gulir p95  1.4 ms
```

---

## Susunan berkas

```
app/
  layout.tsx        tema (bawaan gelap) + medan + header + footer + engine
  page.tsx          hero berdrift + layanan + rekam jejak + proses + CTA
  karya/            7 catatan (+ studi kasus per catatan)
  layanan/          4 jenis kerja (+ detail)
  tentang/ riwayat/ kontak/
components/drift/
  engine.tsx        tiga lapis gerak (drift / assemble / ambient)
  field.tsx         cahaya + grain + kisi
  interact.tsx      Spot (cahaya kursor) · Tilt · Ticker · ScrollBar
  header.tsx  footer.tsx  sec.tsx  word-flow.tsx
lib/site.ts         konten (dari CV + repo publik)
lib/records.ts      status bukti tiap catatan + peta celah
```

**20 rute statis**, semua ter-render jadi HTML (`output: "export"`), tanpa server.

## Menjalankan

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # 20 rute statis -> out/
npm run verify         # 56 gate
npm run shots:drift    # tangkapan + statistik gambar
```

## Deploy

Cloudflare Pages dari repo ini: build `npm run build`, output `out`, Node 20+.
Autodeploy jalan saat push ke `main`.

## Sumber konten

Semua teks dari CV (`public/arkan-mustofa-cv.pdf`) dan repo publik
`github.com/Arkanuy`. Tidak ada metrik, tangkapan layar, atau kredensial yang
dikarang. Sumber foto aslinya 340×340 (avatar GitHub memang dibatasi 340px);
yang dipakai 680px WebP untuk layar retina.
