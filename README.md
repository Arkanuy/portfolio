# portfolio-arkan — **TRACE**

Portfolio pribadi **Arkan Mustofa** — mahasiswa Sistem Informasi di Bandung.
Situs statis Next.js, deploy di Cloudflare Pages: **https://portfolio-arkan.site**
(proyek Cloudflare: `portfolio-arkan.pages.dev`)

---

## Konsepnya: portfolio yang bisa diperiksa

Portfolio biasanya meminta dipercaya. Yang ini meminta diuji.

Situs ini adalah **lembar catatan teknis**, bukan halaman pemasaran. Setiap
klaim (angka, kemampuan, hasil kerja) punya **simpul sumber**: catatan kerja
nyata yang membuktikannya. Kalau sebuah klaim belum punya catatan, situs ini
mengatakannya — bukan menyembunyikannya.

### Interaksi tanda tangannya

Kolom **SOURCE PANEL** di lembar depan berisi klaim-klaim yang bisa dipilih.
Begitu satu klaim dipilih:

1. kolom bukti berganti isi — catatan yang membuktikan klaim itu,
2. **penanda ukur merah** berpindah ke baris tersebut (posisinya dihitung dari
   `getBoundingClientRect`, jadi benar-benar menunjuk, bukan garis hiasan),
3. baris itu dicap waktu pembukaan di perangkat pengunjung.

Kalau klaimnya tidak punya catatan, panelnya menulis "No linked record".
Penanda ukurnya berubah bentuk mengikuti tata letak: rel vertikal di layar
lebar, garis horizontal begitu kolomnya menumpuk di ponsel.

### Saklar TRACE

Di bagian Capability ada tombol **TRACE on/off**:

- **TRACE on** — baris yang punya catatan diberi tanda, yang belum punya
  diarsir (`no work record linked`), dan jumlah celah dilaporkan.
- **TRACE off** — semua tanda bukti hilang total. Daftarnya kembali terlihat
  seperti daftar kemampuan di portfolio biasa: semua baris tampak sama sahnya.

Perbandingan itulah isi halamannya. Bukan halaman "skills", tapi selisih antara
klaim dan bukti.

---

## Sistem visual: Graphite / Pencil

Aturannya keras dan diuji:

| Aturan | Kenapa |
| --- | --- |
| **Radius 0px** di mana pun | Garis yang memisahkan, bukan kartu. Diuji: `border-radius > 0` = 0 elemen di 17 rute. |
| **Nol box-shadow, nol blur** | Kedalaman datang dari garis dan kepadatan, bukan cahaya palsu. Diuji: 0 elemen di 17 rute. |
| **Satu aksen, hanya sebagai sinyal** | Merah tanda dipakai untuk penanda aktif, garis ukur, status bukti. Diuji: aksen muncul di < 1% simpul teks. |
| **Status bukti = pola arsir, bukan lencana warna** | Bisa dibedakan tanpa mengandalkan warna. |
| **Tidak ada pustaka animasi** | `package.json` hanya `next`, `react`, `react-dom`. Diuji sebagai gate. |
| **Satu gerak bermakna** | Reveal 10px + opacity, sekali. Gerak berarti "baris ini muncul di lembar". |

Tema gelap bukan inversi otomatis: token dibalik sebagai satu set, dan
teks di atas blok aksen memakai `--on-mark` (putih di terang, tinta di gelap).
Kontras diuji di dua tema, termasuk pada latar `--mark-tint` di tata letak sempit.

---

## Struktur

```
app/
  layout.tsx          header + footer + reveal + meter gulir
  page.tsx            FOLIO 00 — identitas + SOURCE PANEL + ledger + capability
  karya/              01 · Records  (+ [slug] studi kasus per catatan)
  layanan/            02 · Work     (+ [slug] per jenis kerja)
  tentang/            03 · Method
  riwayat/            04 · History
  kontak/             05 · Contact
components/trace/     semua komponen konsep TRACE
lib/site.ts           konten (dari CV + repo publik)
lib/trace.ts          peta keterlacakan: klaim → sumber, status bukti, celah
```

**20 rute statis**, semuanya ter-render jadi HTML (`output: "export"`), tanpa
server dan tanpa database. Semua navigasi pakai `<a>` biasa.

---

## Status bukti

Setiap catatan diberi kekuatan bukti dari isi datanya, bukan dari karangan:

- `LIVE` — Mafia Blox, jalan di produksi
- `PUBLIC` — kode bisa dibaca (PixWatch)
- `BUILDING` — belum selesai, dan ditulis begitu (BuildPlan)
- `RECORD` — hasil lomba yang tercatat pihak ketiga
- `SHIPPED` — diserahkan saat penempatan kerja
- `DOCUMENT` — ada sebagai dokumen kebutuhan (BRD Rollerskool)
- `NO RECORD` — disebut di situs, belum ada catatan yang membuktikannya

Kalau klaim tidak punya sumber, itu ditampilkan sebagai **celah**, bukan dihapus.

---

## Verifikasi: 53 gate, semuanya hijau

Klaim desain diuji dengan pengukuran di browser sungguhan, bukan dengan mata.

```bash
npm run build
npx serve out            # atau server statis apa pun
PF_BASE=http://localhost:3000 npm run verify:trace
PF_BASE=http://localhost:3000 npm run verify:perf
```

| Suite | Gate | Isi |
| --- | --- | --- |
| `verify:trace` | **45/45** | 17 rute 200 tanpa error konsol · radius 0 · shadow 0 · blur 0 · interaksi panel (klaim → bukti, penanda ukur, cap waktu, keyboard) · saklar TRACE bolak-balik · kontras ≥4.5:1 di 2 tema (termasuk 390px) · tanpa overflow horizontal di 6 viewport · target sentuh ≥44px · tanpa kata menempel · tanpa kebocoran metadata · tanpa JS tetap terbaca |
| `verify:perf` | **8/8** | tanpa pustaka animasi/UI pihak ketiga · anggaran JS · FCP/LCP · long task · frame saat menggulir · berat gambar |
| `shots:trace` | 10 tangkapan | setiap tangkapan diukur: rasio tinta, baris berisi — tangkapan kosong tidak bisa lolos |

Angka nyata dari rilis terakhir:

```
JS      468 KB raw / 139 KB gzip   (lantai runtime React 19 + Next 16)
CSS      48 KB raw /  10 KB gzip
Gambar   14 KB  (potret WebP)
FCP     168 ms        LCP 168 ms
Frame    p95 16.7 ms  long task 0 ms
DOM      638 nodes     requests: 1 doc + 1 css + 6 js + 2 font + 1 image
```

### Cacat nyata yang ditemukan suite ini

Suite ini bukan formalitas — ia menemukan bug yang tidak terlihat dengan inspeksi:

1. **Penanda ukur tidak pernah muncul.** Peta ref di-key dengan id simpul
   (`n.id`) tapi dicari dengan id klaim (`active`). Penanda ukur — inti
   interaksi tanda tangannya — tidak ada sama sekali. Ketahuan karena gate
   mengukur tingginya (`markerH: 0`), bukan karena "kelihatan oke".
2. **Banner "JavaScript is off" muncul saat JavaScript hidup.** Skrip `<head>`
   memasang bendera `data-nojs`, dan yang menghapusnya adalah sintaks yang tidak
   pernah dipanggil. Sekarang sebaliknya: React memasang `data-js`, CSS yang
   menyembunyikan peringatan. Diuji dua arah.
3. **Saklar TRACE terbalik maksudnya.** Saat dimatikan, arsir celah tetap
   muncul — padahal justru saat itulah tanda bukti harus hilang.
4. **Aturan `@media` sentuh kalah urutan sumber.** `@media (max-width: 640px)`
   ditulis sebelum `.btn--sm`, jadi pada spesifisitas yang sama yang menang
   adalah urutan sumber. Dipindah ke akhir berkas, plus `min-height: 44px`.
5. **Nol kontras lulus di 130 simpul teks.** Token kecil (`--ink-3`, `--ink-4`)
   tidak memenuhi 4.5:1 di latar paling gelap. Semua token dihitung ulang dan
   diuji, bukan ditebak.
6. **Foto 738 KB tanpa tambahan apa pun.** "2x" itu upscale dari avatar 340×340.
   Diganti WebP 680px: 14 KB, dan klaim resolusi jujur (340 ditampilkan 2x).

---

## Menjalankan

```bash
npm install
npm run dev              # http://localhost:4321
npm run build            # 20 rute statis -> out/
npm run verify:trace     # butuh server statis dari out/
npm run verify:perf
npm run shots:trace
```

## Deploy

Cloudflare Pages dari repo ini: build `npm run build`, output `out`, Node 20+.

## Sumber konten

Semua teks dari CV (`public/arkan-mustofa-cv.pdf`) dan repo publik
`github.com/Arkanuy`. Tidak ada metrik, tangkapan layar, atau kredensial yang
dikarang — aturan itu yang membuat konsep "traceability" ini bisa dipertahankan.
