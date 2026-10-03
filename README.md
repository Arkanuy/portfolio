# portfolio-arkan — **Editorial Index**

Portfolio pribadi **Arkan Mustofa** — mahasiswa Sistem Informasi di Bandung.
Situs statis Next.js. Deploy: **https://portfolio-arkan.pages.dev**

---

## Konsepnya: halaman data yang tenang

Konsep sebelumnya (dua kali) gagal karena satu sebab yang sama: ia berusaha
terlihat mengesankan. Yang pertama sengaja beku, yang kedua penuh orb bercahaya,
kartu kaca, dan teks bergradien — dan itu bukan selera, itu **daftar tell AI
yang sudah punya nama**.

Versi ini dibangun dari arah sebaliknya. Yang dihindari bukan "jelek", tapi
**pola yang gampang dikenali sebagai hasil generate**:

| Tell | Kenapa dilarang | Yang dipakai |
|---|---|---|
| Orb bercahaya / aurora blob | "floating-orb decoration" — ambient tanpa peran | permukaan datar |
| Teks `background-clip: text` bergradien | "the gradient headline" — tell paling cepat dikenali | satu warna ink + satu aksen |
| Panel kaca / `backdrop-filter` | "glassmorphism without purpose" | pemisah 1px |
| `box-shadow` berwarna (glow) | "shadow-glow on dark" | hirarki dari garis, bukan cahaya |
| Satu font untuk semua | "Inter-everywhere" — halaman template | 3 peran: serif / sans / mono |
| Label kecil di atas tiap judul | "eyebrow on every section" | judul langsung |
| `hover:scale` di semua kartu | "universal hover:scale-105" | garis bawah + geser 3px |
| Easing overshoot/bounce | "bouncy overshoot easings" | satu `cubic-bezier` kalibrasi tenang |
| Animasi masuk di tiap seksi | "animate-on-scroll on everything" | satu wipe judul saat muat |
| Nav AI + footer 4 kolom | fingerprint paling dikenali | masthead dokumen + footer penutup |

---

## Yang membuatnya tetap punya karakter

Menghapus slop tidak berarti jadi kosong. Tiga hal dipertahankan:

**1 · Data kerja disajikan sebagai tabel.** Nomor, tahun, nama, jenis, status,
tautan — angka rata (`tabular-nums`), pemisah 1px, tanpa kartu. Di ponsel
tabelnya jadi baris berlabel, bukan ditumpuk jadi kartu. Ini sekaligus cara
menjawab "jangan dump skill sebagai daftar": bukti jadi **data yang bisa
dibandingkan**, bukan lencana warna.

**2 · Status bukti ditulis sebagai kata.** `in production` · `source public` ·
`awarded` · `delivered` · `document` · `in progress`. Tanpa pil, tanpa ikon,
tanpa titik status.

**3 · Satu gerak, dan ia membawa arti.** Judul masuk dengan wipe keras sekali
saat muat (`clip-path`), lalu halaman diam. Satu-satunya elemen yang bergerak
saat menggulir adalah **garis progres baca** di bawah masthead.

**Tipografi** tiga peran: Newsreader (judul, serif baca) + IBM Plex Sans (badan)
+ IBM Plex Mono (angka & status).

---

## Verifikasi: 49 gate, dan gate-nya diuji bisa gagal

```bash
npm run build
npx serve out
PF_BASE=http://localhost:3000 npm run verify
```

Karena keluhannya soal *tampilan* ("glossy", "ambient-nya AI slop"), sebagian
besar gate di sini **menuntut nol** — bukan menuntut "ada".

| Suite | Gate | Isi |
|---|---|---|
| `verify:editorial` | **36/36** | 17 rute 200 tanpa error · **nol** backdrop-filter · **nol** CSS filter · **nol** box-shadow · **nol** gradien · **nol** teks bergradien · **nol** radius > 14px · **nol** glow berwarna · **nol** orb · animasi keyframe ≤ 2 · tanpa loop ambient · tanpa overshoot · tanpa hover-transform · tanpa eyebrow · kerja = tabel 7 baris dgn `tabular-nums` · kontras ≥4.5:1 di 2 tema · tanpa overflow di 6 viewport · target sentuh · reduced-motion · tanpa JS · tanpa kata menempel / kebocoran metadata |
| `verify:perf` | **13/13** | tanpa pustaka UI pihak ketiga · anggaran JS/CSS · gambar <200 KB · FCP/LCP · biaya JS handler gulir · long task |
| `shots:editorial` | 10 tangkapan | tiap tangkapan diukur: rasio tinta, baris berisi, warna unik, **dan saturasi** |

**Gate-nya sudah dibuktikan bisa gagal.** Saya menyuntikkan satu contoh setiap
tell ke halaman yang berjalan (blur, backdrop, shadow berwarna, gradien, radius
999px beserta lingkarannya) dan memastikan **ketujuhnya terdeteksi**. Gate
negatif yang tidak bisa gagal lebih berbahaya daripada tidak ada gate — suite
versi sebelumnya sempat "lulus" karena CSS-nya tidak termuat sama sekali.

Angka rilis terakhir:

```
Saturasi rata-rata   0.039 – 0.059   (praktis monokrom)
Piksel beraksen      2.1 % – 4.6 %
Animasi keyframe     1  ("wipe")
Elemen bertransisi   263  (transisi hover 130ms, bukan animasi masuk)
FCP / LCP            216 ms      long task 0 ms
```

---

## Susunan berkas

```
app/
  layout.tsx        3 peran font + masthead + footer
  page.tsx          buka + kerja(tabel) + layanan + proses + perkakas + ajakan
  karya/            7 catatan (+ halaman kasus)
  layanan/          4 jenis kerja (+ detail)
  tentang/ riwayat/ kontak/
components/site/
  masthead.tsx      running head + garis progres baca
  footer.tsx        penutup, bukan katalog sitemap
  work-table.tsx    tabel kerja
lib/site.ts         konten (CV + repo publik)
lib/records.ts      status bukti + label
```

**20 rute statis**, semua ter-render jadi HTML (`output: "export"`), tanpa server.

## Menjalankan

```bash
npm install
npm run dev              # http://localhost:4321
npm run build            # 20 rute statis -> out/
npm run verify           # 45 gate
npm run shots:editorial  # tangkapan + statistik termasuk saturasi
```

## Deploy

Cloudflare Pages dari repo ini: build `npm run build`, output `out`, Node 20+.
Autodeploy saat push ke `main`.

## Sumber konten

Semua teks dari CV (`public/arkan-mustofa-cv.pdf`) dan repo publik
`github.com/Arkanuy`. Tidak ada metrik, tangkapan layar, atau kredensial yang
dikarang. Foto aslinya 340×340 (avatar GitHub dibatasi 340px); dipakai 680px
WebP untuk layar retina.
