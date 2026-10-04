import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * ROOT LAYOUT.
 *
 * Tipografi: badan dan judul memakai Onest dari Kage (lihat app/fonts.css),
 * monospace tetap JetBrains Mono untuk label teknis. Tidak ada lagi Inter —
 * itu huruf yang membuat halaman-halaman lain terasa beda bahasa dengan scene.
 * Penggantinya diambil dari berkas font milik Kage sendiri, jadi hurufnya
 * identik, bukan sekadar mirip.
 *
 * Tema: Kage adalah malam, jadi GELAP adalah tampilan baku situs ini. Terang
 * tetap tersedia lewat tombol tema (dan lewat preferensi sistem), karena
 * halaman yang tidak bisa dibaca di siang hari bukan halaman yang selesai.
 */
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
    { media: "(prefers-color-scheme: dark)", color: "#05070a" },
  ],
};

/* Tema ditulis sebelum cat pertama supaya tidak ada kedipan.

   Baku = GELAP, dan itu TIDAK mengikuti preferensi sistem. Versi pertama saya
   menuruti "prefers-color-scheme: light" kalau sistem memintanya — akibatnya
   seluruh situs kembali terang di mesin yang setelannya terang (terukur:
   theme=light di semua rute), dan konsepnya hilang. Yang menentukan tema di
   sini cuma dua hal: pilihan eksplisit pengunjung lewat tombol, atau baku
   gelap. */
const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t="dark";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={mono.variable}>
      <head>
        {/* Onest — FON YANG SAMA dengan scene Kage.
            Dimuat lewat <link>, bukan bundler: berkasnya sudah ada di
            /public sebagai bagian dari aset Kage, dan di dalamnya tiap
            @font-face menyimpan WOFF2 sebagai data-URI, jadi satu permintaan
            ini membawa seluruh keluarga huruf (tanpa berkas biner terpisah,
            dan langsung di-cache bersama iframe Kage). */}
        <link rel="stylesheet" href="/landing-pages/secret-pathways-assets/fonts.css" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
