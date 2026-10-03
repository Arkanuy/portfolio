/**
 * PUNCH — pengkodean data ke kartu punch-card 80 kolom.
 * =====================================================
 * Konsep: setiap catatan kerja adalah SATU KARTU 80 kolom x 12 baris, dan
 * LUBANGNYA ADALAH DATANYA. Tidak ada lubang yang hiasan: setiap baris dan
 * kolom bisa dijelaskan oleh aturan di bawah, dan aturan itu bisa kamu
 * periksa sendiri karena sumbernya `lib/site.ts` + `lib/records.ts`.
 *
 * GEOMETRI (mengikuti kartu Hollerith 80 kolom):
 *   baris 0  = zona 12
 *   baris 1  = zona 11
 *   baris 2..11 = digit 0..9   (indeks baris = digit + 2)
 *
 * TATA LETAK KOLOM (1-indeks, seperti kartu asli):
 *   kol 1        zona status
 *                  12 = live · 11 = in progress · 0 = shipped/public
 *                  digit 1..3 = peringkat bukti (record / document / building)
 *   kol 2..5     tahun, satu kolom per digit
 *   kol 6..7     banyak hal yang dibangun (2 digit, dari `built.length`)
 *   kol 8..13    enam huruf pertama judul, tiap huruf = puluhan + satuan
 *   kol 14..79   POLA PERIKSA (checksum)
 *                  baris = (kolom * 7 + hash(slug) * 11) mod 10  → digit
 *                  jadi setiap kartu punya tekstur sendiri, tapi teksturnya
 *                  tetap berasal dari data, bukan acak.
 *   kol 80       tanda akhir (baris digit sesuai panjang stack judul mod 10)
 */

export type Hole = { col: number; row: number };

const ROW = {
  zone12: 0,
  zone11: 1,
  digit: (d: number) => 2 + Math.max(0, Math.min(9, d)),
};

/** Hash sederhana dan deterministik supaya pola sama tiap kali dibangun. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export type PunchCode = {
  holes: Hole[];
  /** Lubang yang bisa dijelaskan + artinya, untuk ditampilkan sebagai legenda. */
  legend: { col: number; row: number; text: string }[];
  columns: number;
  rows: number;
};

const COLS = 80;
const ROWS = 12;

export function encode(input: {
  slug: string;
  title: string;
  year: string;
  state: string;
  built: number;
}): PunchCode {
  const holes: Hole[] = [];
  const legend: { col: number; row: number; text: string }[] = [];
  const seen = new Set<string>();
  const put = (col: number, row: number, why?: string) => {
    if (col < 1 || col > COLS || row < 0 || row >= ROWS) return;
    const k = `${col}:${row}`;
    if (seen.has(k)) return;
    seen.add(k);
    holes.push({ col, row });
    if (why) legend.push({ col, row, text: why });
  };

  /* --- kolom 1: zona status (satu lubang, bisa dibaca mesin) --- */
  const zone: Record<string, [number, string]> = {
    live: [ROW.zone12, "zona 12 · berjalan di produksi"],
    building: [ROW.zone11, "zona 11 · masih dikerjakan"],
    public: [ROW.digit(1), "digit 1 · kode publik"],
    record: [ROW.digit(2), "digit 2 · catatan pihak ketiga"],
    doc: [ROW.digit(3), "digit 3 · dokumen kebutuhan"],
    shipped: [ROW.digit(0), "digit 0 · sudah diserahkan"],
    declared: [ROW.digit(4), "digit 4 · belum ada catatan"],
  };
  const z = zone[input.state] ?? zone.declared;
  put(1, z[0], z[1]);

  /* --- kolom 2..5: tahun --- */
  const yDigits = (input.year.match(/\d/g) || []).slice(-4);
  yDigits.forEach((d, i) => put(2 + i, ROW.digit(Number(d)), i === 0 ? `tahun ${input.year}` : undefined));

  /* --- kolom 6..7: berapa bagian yang dibangun --- */
  const n = String(Math.max(0, Math.min(99, input.built))).padStart(2, "0");
  put(6, ROW.digit(Number(n[0])), `${input.built} bagian dibangun`);
  put(7, ROW.digit(Number(n[1])));

  /* --- kolom 8..13: enam huruf pertama judul --- */
  const letters = input.title.replace(/[^A-Za-z]/g, "").slice(0, 6).toUpperCase();
  letters.split("").forEach((ch, i) => {
    const v = ch.charCodeAt(0) - 64; // A=1
    put(8 + i, ROW.digit(Math.floor(v / 10)), i === 0 ? `judul "${letters}"` : undefined);
    put(8 + i, ROW.digit(v % 10));
  });

  /* --- kolom 14..79: pola periksa ---
   * Percobaan pertama membuat SATU lubang per kolom, dan hasilnya semua kartu
   * punya 86 lubang — seragam, jadi kartunya terbaca sebagai hiasan, bukan data.
   * Sekarang KEPADATAN pola ditentukan oleh data: panjang ringkasan mengatur
   * berapa lubang per kolom, dan hash menggeser posisinya. Jadi kartu dengan
   * isi lebih panjang benar-benar lebih padat lubangnya. */
  const h = hash(input.slug);
  const density = 1 + (input.title.length % 3); // 1..3 lubang per kolom
  for (let col = 14; col <= 79; col++) {
    const n = 1 + ((col * 13 + h) % density);
    for (let k = 0; k < n; k++) {
      put(col, ROW.digit((col * 7 + h * 11 + k * 37) % 10));
    }
  }

  /* --- kolom 80: tanda akhir --- */
  put(COLS, ROW.digit(input.title.length % 10), "kolom 80 · tanda akhir");

  return { holes, legend, columns: COLS, rows: ROWS };
}

/** Titik-titik lubang dikelompokkan per kolom: satu <g> per kolom. */
export function byColumn(code: PunchCode): { col: number; rows: number[] }[] {
  const map = new Map<number, number[]>();
  for (const hole of code.holes) {
    if (!map.has(hole.col)) map.set(hole.col, []);
    map.get(hole.col)!.push(hole.row);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([col, rows]) => ({ col, rows: rows.sort((a, b) => a - b) }));
}
