import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/trace/header";
import Footer from "@/components/trace/footer";
import Motion from "@/components/trace/motion";
import { site } from "@/lib/site";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-arkan.site"),
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
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eeebe3" },
    { media: "(prefers-color-scheme: dark)", color: "#14140f" },
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
        <span className="prog" aria-hidden="true">
          <span className="prog__bar" id="trace-prog" />
        </span>
        <Header />
        <main id="isi">
          <div className="wrap">
            <p className="nojs">
              JavaScript is off, so the source panel and index filters are inert. Every record, status, and link on
              this page is still readable as static text — that is deliberate.
            </p>
          </div>
          {children}
        </main>
        <Footer />
        <Motion />
      </body>
    </html>
  );
}