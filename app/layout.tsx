import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Masthead from "@/components/site/masthead";
import Footer from "@/components/site/footer";
import { site } from "@/lib/site";

/**
 * TIGA PERAN TIPE — bukan satu font untuk semuanya (itu tell "Inter-everywhere"):
 *   display  Newsreader      → judul. Serif baca, bukan serif display yang berteriak.
 *   sans     IBM Plex Sans   → badan.
 *   mono     IBM Plex Mono   → angka, tanggal, status.
 */
const display = Newsreader({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-display", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-sans", display: "swap" });
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
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#131311" },
  ],
};

/* Tema ditulis sebelum cat pertama. Bawaan: terang (kertas). */
const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

/* Tandai bahwa JS hidup — dipakai untuk menyembunyikan catatan "tanpa JS". */
const jsFlag = `document.documentElement.setAttribute("data-js","on");`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Skip to content
        </a>
        <Masthead />
        <main id="isi">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
