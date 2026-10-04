import type { Metadata } from "next";
import KageScene from "./KageScene";

export const metadata: Metadata = {
  title: "Kage",
  description: "A five-part WebGL night walk through a Kyoto mountain temple.",
};

/**
 * /kage — scene-nya sendiri.
 *
 * Dua keputusan di sini, dan alasannya:
 *
 * 1. TIDAK ada narasi tambahan. Versi sebelumnya saya isi istilah karangan
 *    sendiri ("Chapter · night", "night chapter", "back to the light"). Itu
 *    keliru: yang diminta adalah GAYA dan KONSEP Kage, bukan bahasanya. Kata
 *    "scene" dan baris kredit sudah cukup.
 *
 * 2. Scene-nya dibiarkan SEPENUH LEBAR layar, bukan dimasukkan ke kolom
 *    konten. Dokumen ini memang dirancang sebagai bidang penuh; menyempitkannya
 *    ke lebar kolom (terukur 1220px dari 1440px) memotong komposisinya. Baris
 *    kredit di bawahnya tetap di dalam kolom, supaya sejajar dengan halaman
 *    lain.
 */
export default function KagePage() {
  return (
    <>
      <KageScene />
      <div className="wrap">
        <p className="kagePage__credit">
          Kage — Hidden Realms of Kyoto, by ThreeUI. The document and its assets are served exactly as published;
          only the typography and the accent colour are fitted to this portfolio.
        </p>
      </div>
    </>
  );
}
