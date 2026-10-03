import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Motion from "@/components/ui/motion";
import ScrollProgress from "@/components/ui/scroll-progress";
import { ClickSpark } from "@/components/ui/anim";

/**
 * LAYOUT SITUS — hanya untuk rute di grup `(site)`.
 *
 * Chrome situs (header, footer, efek klik) sengaja tidak berada di root layout,
 * supaya rute `/kage` yang menampilkan dokumen diautor ThreeUI tidak
 * bertabrakan dengannya.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#isi">
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="isi">{children}</main>
      <Footer />
      <Motion />
      <ClickSpark />
    </>
  );
}
