# portfolio-arkan — **EDITION**

Portfolio pribadi **Arkan Mustofa** — mahasiswa Sistem Informasi di Bandung.
Situs statis Next.js. Deploy: **https://portfolio-arkan.pages.dev**

---

## Arahnya: surat kabar yang seluruhnya bergerak

Tiga percobaan sebelumnya gagal karena masing-masing menjawab pertanyaan yang
salah. Yang pertama sengaja beku. Yang kedua penuh orb bercahaya dan kartu kaca
(ditolak: "glossy, AI slop"). Yang ketiga datar tapi tanpa gerak
(ditolak: "lebih parah lagi").

Yang diminta: **konsep yang geraknya penuh, tapi rapi, clean, terasa seperti
halaman berita.** Gabungan itu yang jadi batasannya — dan batasan itulah yang
menentukan desainnya.

**Kuncinya: yang bergerak adalah TIPOGRAFI, bukan cahaya.**
Orb/glow/kaca sudah dicoret dari kosakatanya. Yang bergerak sekarang adalah
huruf, garis, dan angka — kosakata halaman cetak:

| Gerak | Apa yang terjadi |
|---|---|
| **Typesetting** | Judul **terpasang kata demi kata**. Tiap kata punya `clip-path` sendiri + transform, dengan jeda bertingkat (46ms per kata). Terukur: 7 kata, 7 jeda berbeda. |
| **Draw rule** | Aturan 1px **tertarik dari kiri** saat bagiannya masuk layar. Terukur: 15 dari 17 garis mulai dari scaleX 0. |
| **Wipe** | Potret dan blok judul **disapu masuk** dari kiri, bukan fade. |
| **Rise** | Baris tabel dan kartu berita **naik 16px** dengan jeda bertingkat. |
| **Ticker** | Dua baris `LIVE / RECORD / IN PROGRESS` — **arah berlawanan**, kecepatan 42s vs 74s. Berhenti saat disorot. Berjalan tanpa henti. |
| **Counter** | Angka **menghitung naik** dan **mendarat tepat** di nilai aslinya. |
| **Live dot** | Titik status berdenyut di masthead. |

Terukur: **48 elemen beranimasi** saat muat/masuk, 4 keyframe
(`setType`, `drawRule`→transisi, `wipeIn`/`riseIn`, `tickRun`, `livePulse`),
dan hanya 3 elemen yang animasinya tanpa akhir (ticker + titik live).

---

## Struktur persnya

- **Masthead:** baris atas = tanggal terbit + lokasi + status; wordmark besar
  **ARKAN MUSTOFA**; baris seksi bergaris tebal di atas-bawah; garis progres baca.
- **Ticker** band gelap berisi rekam jejak terbaru, dua baris berlawanan arah.
- **Lead story:** kicker + judul raksasa + kolom dek di sebelah kanan dengan
  aturan pemisah, plus blok fakta (based / status / records).
- **Grid berita:** enam berita sekunder dalam kolom rapat 1px — garis atas
  berubah merah saat disorot, bukan kartu.
- **Ledger:** tabel hasil, angka `tabular-nums`, dulu → sekarang.
- **Rail** yang menempel di halaman kasus (status, tahun, stack, artefak publik).
- **Drop cap** di paragraf pertama artikel.
- Tiga peran tipe: **Newsreader** (judul) / **IBM Plex Sans** (badan) / **IBM Plex Mono** (kicker, tanggal, angka).

---

## Ban anti-slop tetap berlaku — dan diukur sebagai NOL

Kicker di sini **dipakai** (kategori berita: `LIVE`, `RECORD`, `IN PROGRESS`),
tapi hanya pada berita — pemakaian kategoris yang sah, bukan label dekoratif di
atas tiap judul seksi. Judul seksi tetap polos.

| Tell | Terukur |
|---|---|
| backdrop-filter (kaca) | **0** |
| CSS filter (blur/glow) | **0** |
| box-shadow | **0** |
| latar bergradien | **0** |
| teks bergradien | **0** |
| glow berwarna | **0** |
| radius piksel > 14px | **0** |
| orb (bulatan besar) | **0** |

Catatan: `border-radius: 50%` pada **titik 7px** tidak dihitung pelanggaran —
itu lingkaran (titik/pil), bukan sudut membulat yang jadi tell.

---

## Verifikasi: 52 gate

```bash
npm run build
npx serve out
PF_BASE=http://localhost:3000 npm run verify
```

| Suite | Gate | Isi |
|---|---|---|
| `verify:edition` | **39/39** | 17 rute 200 tanpa error · 8 gate anti-slop = nol · **gerak nyata** (kata terpasang, jeda bertingkat, garis tertarik, ticker jalan, counter mendarat di nilai benar) · 48 elemen beranimasi · kosakata animasi = typesetting · **tanpa JS: nol elemen terpotong & teks utuh** · reduced-motion: nol terpotong · kontras ≥4.5:1 di 2 tema · tanpa overflow di 6 viewport · target sentuh · tanpa kata menempel / kebocoran metadata |
| `verify:perf` | **13/13** | tanpa pustaka UI pihak ketiga · JS & CSS benar-benar terukur · anggaran · halaman depan tanpa gambar (memang) · gambar studi kasus <200 KB · FCP/LCP · biaya JS handler gulir · long task |
| `shots:edition` | 10 tangkapan | tiap tangkapan diukur: tinta, baris berisi, warna unik, **saturasi** |

Angka rilis:

```
Saturasi rata-rata   0.028 – 0.069   (praktis monokrom; aksen hanya di tempatnya)
Elemen beranimasi    48
Keyframe             4  (typesetting / draw / wipe / ticker / live dot)
Ticker               42s ↔ 74s, arah berlawanan
FCP / LCP            144 ms lokal · 304 ms live      long task 0 ms
JS                   446 KB raw / 131 KB gzip
CSS                   33 KB raw /   7 KB gzip
Font                  5 berkas (dari 11)
```

### Tiga hal yang cuma ketahuan karena diukur

1. **Kata menempel saat JS mati.** `innerText` = `"Softwarethatgetsused,notjustshipped."`
   Spasi ikut masuk ke elemen ber-`clip-path` dan dibuang browser. Sekarang spasi
   jadi text node **di luar** span. Gate `tanpa JS` yang menemukannya — dan gate itu
   ada justru karena "animasi penuh" berarti halaman bisa kosong kalau salah.
2. **Gerak yang tidak bisa diukur karena sudah selesai.** Gate pertama menunggu
   `networkidle` lalu 1,2 detik — pada saat itu animasinya sudah berakhir, jadi
   gate melaporkan "tidak bergerak" padahal geraknya nyata. Sekarang perekam
   dipasang **sebelum** halaman dimuat dan mengambil sampel tiap frame.
3. **Kontras ticker gagal di DUA tema.** `--accent` di atas permukaan `--ink`
   cuma 2.40:1 (tema terang). Tidak ada satu nilai yang aman untuk keduanya,
   jadi ditambah token `--accent-on-ink` yang nilainya dibalik antar tema.

Semua gate negatif sudah **dibuktikan bisa gagal**: satu contoh setiap tell
disuntikkan ke halaman yang berjalan dan ketujuhnya terdeteksi.

### Dua cacat yang hanya muncul saat diuji ke origin LIVE

Static export tetap mengembalikan 200, jadi keduanya tidak terlihat secara lokal:

4. **React hydration error #418** — `<h2><h2>…</h2></h2>`. Judul seksi memakai
   `SetType as="h2"` di dalam `<h2>` pembungkus. Ditemukan karena suite dijalankan
   ke origin live dengan console sungguhan.
5. **Font memblokir render pertama** — Newsreader dimuat 3 bobot × 2 gaya
   (termasuk italic yang tidak pernah dipakai), total **11 berkas**, 5 di antaranya
   `preload`. Terukur **FCP 1916 ms** di live padahal 228 ms di lokal. Setelah
   dipangkas jadi 5 berkas tanpa italic: **FCP 144 ms lokal / 304 ms live.**
   Tidak ada teks yang memakai italic atau bobot 500/700, jadi tidak ada yang hilang.

---

## Susunan berkas

```
app/
  layout.tsx        3 peran font, masthead, footer, engine
  page.tsx          ticker + lead story + grid berita + proses + angka + tooling
  karya/            7 catatan (+ halaman kasus ber-rail)
  layanan/          4 jenis kerja (+ detail)
  tentang/ riwayat/ kontak/
components/edition/
  motion.tsx        engine: reveal per bagian, indeks animasi, counter, garis progres
  type.tsx          SetType / DrawRule / Wipe / Rise / Count  (kosakata gerak)
  masthead.tsx      kepala surat kabar
  ticker.tsx        band terbaru, dua baris berlawanan arah
  footer.tsx
lib/site.ts         konten (CV + repo publik)
lib/records.ts      status bukti tiap catatan
```

**20 rute statis**, semua ter-render jadi HTML (`output: "export"`), tanpa server.

## Menjalankan

```bash
npm install
npm run dev             # http://localhost:4321
npm run build           # 20 rute statis -> out/
npm run verify          # 52 gate
npm run shots:edition   # tangkapan + statistik termasuk saturasi
```

## Deploy

Cloudflare Pages dari repo ini: build `npm run build`, output `out`, Node 20+.
Autodeploy saat push ke `main`.

## Sumber konten

Semua teks dari CV (`public/arkan-mustofa-cv.pdf`) dan repo publik
`github.com/Arkanuy`. Tidak ada metrik, tangkapan layar, atau kredensial yang
dikarang — termasuk isi ticker, yang seluruhnya diambil dari catatan asli.
Foto aslinya 340×340 (avatar GitHub dibatasi 340px); dipakai 680px WebP.
