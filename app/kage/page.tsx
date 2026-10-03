import type { Metadata } from "next";
import KageScene from "./KageScene";

export const metadata: Metadata = {
  title: "Kage — scene",
  description:
    "A five-chapter WebGL night walk through a Kyoto mountain temple, integrated into the portfolio from ThreeUI.",
};

/**
 * /kage — scene WebGL dari ThreeUI, dipasang sebagai bagian dari portfolio ini.
 *
 * Sumber diverifikasi lebih dulu terhadap brief (hash cocok byte-for-byte):
 *   LandingPages.tsx 4d379461… · pageTypography.ts 809cc657… · pageRecipes.ts
 *   c9d9849c… · LandingPageFrame.tsx 61de2cc5… · threeui.css efe44471…
 *   kage.html c8e06b90… (243.963 B) · fonts.css 985f85a9… · three.min.js
 *   8a5f7249… (608.081 B) · 14 aset WebP.
 */
export default function KagePage() {
  return <KageScene />;
}
