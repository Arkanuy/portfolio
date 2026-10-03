import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Chrome from "@/components/field/chrome";
import Footer from "@/components/field/footer";
import Field from "@/components/field/engine";
import { site } from "@/lib/site";

/**
 * TIGA PERAN TIPE, dan hanya bobot yang dipakai.
 * Fraunces = serif display dengan sumbu optis (menggantikan peran Brier/TT Lakes),
 * IBM Plex Sans = badan, IBM Plex Mono = angka.
 * 5 berkas font saja — 11 berkas pernah membuat FCP 1916ms.
 */
const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#121210" },
  ],
};

const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Skip to content
        </a>
        <Chrome />
        <main id="isi">{children}</main>
        <Footer />
        <Field />
      </body>
    </html>
  );
}
