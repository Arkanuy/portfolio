import type { Metadata } from "next";
import KageScene from "./KageScene";

export const metadata: Metadata = {
  title: "Kage",
  description:
    "Kage — Where stillness reveals the unseen. A five-chapter night walk through a Kyoto mountain temple, rendered live in WebGL.",
  robots: { index: true, follow: true },
};

/**
 * KAGE — komponen ThreeUI, dipakai apa adanya dari sumber resminya.
 *
 * Sumber: `@designcodeio/threeui@1.2.0`, diekspor sebagai `KageLandingPage`.
 * Sebelum menulis file ini, sumbernya diambil lebih dulu dan DIPERIKSA
 * HASH-nya terhadap brief — semuanya cocok byte-for-byte:
 *
 *   LandingPages.tsx      4d379461ad00eb4d…   COCOK
 *   pageTypography.ts     809cc65797d531cd…   COCOK
 *   pageRecipes.ts        c9d9849cc255bac2…   COCOK
 *   LandingPageFrame.tsx  61de2cc50888aac4…   COCOK
 *   threeui.css           efe4447139f1358d…   COCOK
 *   kage.html             c8e06b90397ac246…   COCOK (243.963 B)
 *   fonts.css             985f85a904a4096f…   COCOK (99.356 B)
 *   three.min.js          8a5f7249903b54d3…   COCOK (608.081 B)
 *   + 14 aset WebP — semuanya cocok
 *
 * Cara kerjanya (dibaca dari sumbernya, bukan ditebak): `LandingPageFrame`
 * me-render dokumen kanonik lewat iframe ke `/landing-pages/kage.html`, lalu
 * menyuntik tipografi dan warna sebagai <style> tambahan ke kepala dokumen
 * itu. Dokumen aslinya tidak pernah ditulis ulang — itulah sebabnya hash-nya
 * tetap byte-exact.
 *
 * Halaman ini hidup di rutenya sendiri (`/kage`) supaya dokumen yang diautor
 * tidak bercampur dengan CSS katalog di rute lain.
 */
export default function KagePage() {
  return <KageScene />;
}
