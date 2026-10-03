import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Masthead from "@/components/edition/masthead";
import Footer from "@/components/edition/footer";
import Motion from "@/components/edition/motion";
import { site } from "@/lib/site";

/**
 * TIGA PERAN TIPE:
 *   display  Newsreader       → judul berita (serif baca)
 *   body     IBM Plex Sans    → badan teks
 *   mono     IBM Plex Mono    → kicker, tanggal, angka
 */
const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-arkan.site"),
  title: { default: `${site.name} — ${site.role}`, template: `%s · ${site.name}` },
  description: site.bio,
  authors: [{ name: site.name }],
  keywords: ["Arkan Mustofa", "Sistem Informasi", "web developer Bandung", "Laravel", "Next.js", "bot Discord", "BRD"],
  openGraph: { title: `${site.name} — ${site.role}`, description: site.bio, type: "website", locale: "en_US" },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#12110f" },
  ],
};

const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* Tema dipasang sebelum cat pertama supaya tidak ada kedipan.
            CATATAN: tidak ada skrip yang menandai "JS hidup" — penanda itu
            dipasang `Motion` saat React benar-benar jalan, dan seluruh CSS
            yang menyembunyikan konten bergantung padanya. */}
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Skip to content
        </a>
        <Masthead />
        <main id="isi">{children}</main>
        <Footer />
        <Motion />
      </body>
    </html>
  );
}
