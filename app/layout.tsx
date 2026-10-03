import type { Metadata } from "next";
import "./globals.css";
import Field from "@/components/drift/field";
import { ScrollBar } from "@/components/drift/interact";
import Header from "@/components/drift/header";
import Footer from "@/components/drift/footer";
import DriftEngine from "@/components/drift/engine";
import { site } from "@/lib/site";

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
    { media: "(prefers-color-scheme: dark)", color: "#08090e" },
    { media: "(prefers-color-scheme: light)", color: "#eeeaf3" },
  ],
};

/* Tema ditulis sebelum cat pertama supaya tidak ada kedipan.
 * Bawaan situs ini GELAP: medan bercahaya memang hidup di malam hari. */
const jsFlag = `document.documentElement.setAttribute("data-js","on");`;

const themeInit = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="light"&&t!=="dark"){t="dark";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <a className="skip" href="#isi">
          Skip to content
        </a>
        <Field />
        <ScrollBar />
        <Header />
        <main id="isi">
          <div className="wrap">
            <p className="nojs">
              JavaScript is off, so the drift, the tilt and the filter panels are inert. Every project, service and
              contact detail on this site is still readable as plain text — that is deliberate.
            </p>
          </div>
          {children}
        </main>
        <Footer />
        <DriftEngine />
      </body>
    </html>
  );
}
