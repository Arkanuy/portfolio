import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Bar from "@/components/browse/bar";
import Footer from "@/components/browse/footer";
import { site } from "@/lib/site";

/**
 * TIPE: JetBrains Mono sebagai tipe UTAMA (itu tanda tangan referensinya —
 * body font di threeui.com memang monospace), Inter hanya untuk blok teks
 * panjang supaya tetap nyaman dibaca.
 */
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-arkan.site"),
  title: { default: `${site.name} — katalog catatan kerja`, template: `%s · ${site.name}` },
  description: site.bio,
  authors: [{ name: site.name }],
  keywords: ["Arkan Mustofa", "Sistem Informasi", "web developer Bandung", "Laravel", "Next.js", "bot Discord", "BRD"],
  openGraph: { title: `${site.name} — katalog catatan kerja`, description: site.bio, type: "website", locale: "id_ID" },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050608" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
  ],
};

/* Bawaan: gelap. Katalog komponen memang hidup di layar gelap. */
const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t="dark";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${mono.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Lompat ke isi
        </a>
        <Bar />
        <main id="isi">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
