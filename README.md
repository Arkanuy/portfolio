# portfolio-arkan — **BROWSE**

Portfolio pribadi **Arkan Mustofa**. Statis Next.js.
Live: **https://portfolio-arkan.pages.dev**

---

## Konsepnya: katalog, bukan halaman

Referensi: **threeui.com**. Saya bedah dulu bahasanya, bukan menebak:

```
body bg       rgb(5, 6, 8)  near-black
body font     JetBrains Mono — monospace jadi tipe UTAMA, bukan pelengkap
struktur      sidebar daftar komponen · doc-intro (nama + Copy Prompt +
              Open Preview) · area demo dengan FPS & pemilih varian ·
              tabel Field | Type | Value · langkah instalasi bernomor ·
              kartu "integrity" · chip GET PRO · bingkai inset-shadow
```

Bahasa itu yang dipakai: **katalog + lembar spesifikasi**. Tiap catatan kerja
jadi satu "komponen" yang bisa dibuka.

### Yang membentuk konsepnya

- **Sidebar daftar** — 7 catatan dikelompokkan per kekuatan bukti (Berjalan ·
  Diserahkan & publik · Tercatat & dokumen · Masih dikerjakan). Klik untuk pindah.
- **Panel kanan** — nama, ringkasan, chip status, dua tombol (salin tautan /
  buka studi kasus).
- **Area demo** dengan bilah status dan **pemilih dua tampilan**:
  `Pratinjau` (tangkapan layar asli) ↔ `Diagram` (masalah + alur yang dibangun).
- **Tabel spesifikasi** `Properti | Tipe | Nilai` — semua nilainya dari data
  catatan: `status · year · kind · stack · context · parts · evidence`.
- **Langkah bernomor** — bagian yang dibangun, sebagai cara pakainya.
- **Kartu integritas** — kekuatan bukti + sumber.
- Tombol angka **1–7** memilih catatan, seperti daftar bernomor.

---

## Verifikasi: 35 gate

```bash
npm run build && npx serve out
PF_BASE=http://localhost:3000 npm run verify
```

Gate terpenting di sini bukan "apakah ada elemennya", tapi **apakah ini bersih**.
Konsep sebelumnya mati karena grid kecil terbaca sebagai noise.

| Kelompok | Isi |
|---|---|
| **Struktur katalog** | tata letak dua kolom (268px + panel) · sidebar 7 catatan · panel punya judul + pratinjau + tabel 15 baris + langkah + 2 kartu integritas · memilih catatan mengganti panel · penanda aktif berpindah · chip "bagian" cocok dengan jumlah langkah · tampilan diagram menampilkan alur, bukan gambar |
| **Anti-slop** | nol backdrop-filter · nol gradien dekoratif (≥3 stop) · nol glow berwarna · nol radius > 14px · nol bulatan besar |
| **Aksen hemat** | **< 6% piksel** memakai warna sinyal di setiap halaman (terukur dari tangkapan) |
| **Aman** | tanpa JS panel pertama tetap lengkap (15 baris tabel, sidebar 7 item) · reduced-motion nol tersembunyi |
| **Lain-lain** | 17 rute 200 tanpa error · kontras ≥4.5:1 di 2 tema · tanpa overflow di 6 viewport · target sentuh ≥36px · tanpa kata menempel |

Angka rilis:

```
Aksen dipakai       0.11% – 3.82% piksel   (disiplin; satu warna sinyal)
Piksel netral       10% – 90%              (abu, bukan warna)
Tabel spesifikasi   15 baris, semua dari data catatan
FCP / LCP           216 ms
```

### Tiga cacat yang ketahuan karena diukur

1. **Overflow horizontal 438px di viewport 320px.** Tabel 3 kolom dengan teks
   panjang (`Analysis & documentation`) tidak bisa menyusut dengan
   `table-layout: auto` — tabelnya memaksa lebar 423px dan merusak seluruh
   halaman. Diperbaiki: `table-layout: fixed` + teks membungkus, dan di layar
   ≤640px tiap baris jadi blok berlabel.
2. **Kontras tema terang gagal (119 simpul).** `--ink-3` #6b7079 cuma 4.45:1 di
   atas panel paling terang. Digelapkan jadi #545962.
3. **Gate keyboard saya salah ukur.** Saya cek "catatan ke-6" pakai indeks
   sidebar, padahal sidebar dikelompokkan per status — jadi urutannya beda.
   Yang salah pengukurannya, bukan halamannya.

---

## Susunan berkas

```
app/
  layout.tsx       JetBrains Mono + Inter, bar atas, footer
  page.tsx         strip katalog + panel + indeks perkakas
  karya/           7 catatan (+ studi kasus per catatan)
  layanan/ tentang/ riwayat/ kontak/
components/browse/
  catalog.tsx      sidebar + panel + spesifikasi + langkah + integritas
  bar.tsx          bilah instrumen + pintasan angka
  footer.tsx
lib/site.ts        konten (CV + repo publik)
lib/records.ts     catatan + status bukti
scripts/verify-browse.cjs   35 gate
scripts/shots-browse.cjs    tangkapan + statistik
```

**20 rute statis**, semua ter-render jadi HTML (`output: "export"`).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 20 rute statis -> out/
npm run verify   # 35 gate
npm run shots    # tangkapan + statistik
```

## Deploy

Cloudflare Pages: `npm run build`, output `out`, Node 20+. Autodeploy dari `main`.

## Sumber konten

Semua teks, angka, dan tangkapan dari CV (`public/arkan-mustofa-cv.pdf`) dan repo
publik `github.com/Arkanuy`. Tidak ada metrik atau kredensial yang dikarang.
