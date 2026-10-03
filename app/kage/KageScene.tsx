"use client";

import { KageLandingPage } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

/**
 * KAGE — dipakai dari komponen resmi ThreeUI, dengan TIPOGRAFI DAN WARNA
 * DISESUAIKAN ke token proyek ini.
 *
 * Yang disesuaikan (dan sumber nilainya):
 *
 *   headingFont   "geist"    KAGE hanya menyediakan Onest/Instrument Serif/
 *                            Newsreader/Geist. Situs ini memakai Inter, jadi
 *                            yang dipilih Geist — grotesk netral, sekeluarga
 *                            dengan Inter, bukan serif (serif akan mengubah
 *                            watak halaman secara liar).
 *   bodyFont      "geist"    Sama, supaya judul dan badan satu suara.
 *   headingWeight "700"      Situs ini memakai 700 untuk judul
 *                            (globals.css: `h3 { font-weight: 700 }`).
 *   bodyWeight    "400"      Badan teks situs ini 400 (Inter regular).
 *   primaryColor  "#f95400"  Aksen oranye situs ini, bukan vermilion #e0231c.
 *                            Resep Kage menurunkan warna lain (--ember) dari
 *                            nilai ini, jadi rimanya ikut menyesuaikan.
 *   bodySize      18         Naik dari 17: Inter pada 17px terbaca lebih kecil
 *                            daripada Onest pada ukuran yang sama.
 *   letterSpacing -0.025em   Situs ini memakai -0.025em untuk judul; nilai
 *                            bawaan (-0.012) terlalu longgar untuk Inter.
 *
 * Yang TIDAK diubah: dokumen, five chapters, runtime three.js, 14 aset WebGL,
 * judul Jepang di navigasi, dan seluruh kata pengantar karya aslinya.
 *
 * Catatan lisensi: tiga berkas sumber ThreeUI tidak disalin ke repo ini. Nilai
 * di atas seluruhnya lewat props publik komponen, jadi paketnya tetap dipakai
 * apa adanya seperti yang dimaksudkan pembuatnya.
 */
export default function KageScene() {
  return (
    <div className="shader-frame">
      <KageLandingPage
        headingFont="geist"
        bodyFont="geist"
        headingWeight="700"
        bodyWeight="400"
        primaryColor="#f95400"
        headingSize={46}
        bodySize={18}
        headingLetterSpacing={-0.025}
      />
    </div>
  );
}
