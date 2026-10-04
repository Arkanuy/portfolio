import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Motion from "@/components/ui/motion";
import ScrollProgress from "@/components/ui/scroll-progress";
import { ClickSpark } from "@/components/ui/anim";

/**
 * LAYOUT /kage.
 *
 * Rute ini ada di app/kage/, di luar grup (site), jadi chrome-nya dinyatakan
 * di sini. Isinya sama persis dengan layout situs — header, footer, bilah
 * kemajuan, mesin gerak, efek klik — sehingga halaman ini tidak lagi terasa
 * seperti pulau.
 *
 * Tidak ada lagi kelas "kageNight" maupun remap token: sejak bahasa visual
 * Kage dipakai SELURUH situs, halaman ini otomatis sewarna dengan yang lain.
 * Tidak perlu pengecualian.
 */
export default function KageLayout({ children }: { children: React.ReactNode }) {
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
