import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Masthead from "@/components/punch/masthead";
import Footer from "@/components/punch/footer";
import { site } from "@/lib/site";

/**
 * TIGA PERAN TIPE: Archivo (display, grotesk padat) · IBM Plex Sans (badan)
 * · IBM Plex Mono (data). Monospace membereskan nada "kartu terbaca mesin".
 */
const display = Archivo({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#f2efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#17161a" },
  ],
};

const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${display.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Lompat ke isi
        </a>
        <Masthead />
        <main id="isi" className="machine">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
