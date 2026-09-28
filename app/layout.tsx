import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Motion from "@/components/ui/motion";
import ScrollProgress from "@/components/ui/scroll-progress";
import { site } from "@/lib/site";
import { ClickSpark } from "@/components/ui/anim";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://arkanmustofa.com"),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description: site.bio,
  authors: [{ name: site.name }],
  keywords: ["Arkan Mustofa", "Sistem Informasi", "web developer Bandung", "Laravel", "Next.js", "bot Discord", "BRD"],
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.bio,
    type: "website",
    locale: "id_ID",
  },
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
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Skip to content
        </a>
        <ScrollProgress />
        <Header />
        <main id="isi">{children}</main>
        <Footer />
        <Motion />
        <ClickSpark />
      </body>
    </html>
  );
}
