import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * ROOT LAYOUT — sengaja hanya kerangka dokumen: <html>/<body>, variabel font,
 * dan penulisan tema sebelum cat pertama. TIDAK ada header/footer di sini.
 *
 * Alasannya konkret: rute `/kage` menampilkan dokumen yang diautor ThreeUI.
 * Ketika chrome situs ikut terpasang di sana, dokumen itu bertabrakan dengan
 * CSS katalog dan iframe-nya kehilangan tinggi — terukur canvas utama jadi
 * 1440x0 (tidak terlihat sama sekali). Chrome situs sekarang hidup di
 * `app/(site)/layout.tsx`, jadi tiap halaman mendapat kerangka yang sesuai.
 */
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-arkan.site"),
  title: "Portfolio Arkan Mustofa",
  description: "Sistem informasi, aplikasi web, dan perangkat lunak bisnis.",
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
};

/* Tema ditulis sebelum cat pertama supaya tidak ada kedipan. */
const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
