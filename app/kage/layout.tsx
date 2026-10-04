import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Motion from "@/components/ui/motion";
import ScrollProgress from "@/components/ui/scroll-progress";
import { ClickSpark } from "@/components/ui/anim";

/**
 * LAYOUT /kage — BAB MALAM PORTFOLIO.
 *
 * Koreksi penting: rute ini ada di `app/kage/`, yaitu DI LUAR grup `(site)`,
 * jadi layout situs tidak berlaku di sini. Awalnya saya mengira header/footer
 * ikut terpasang sendiri — ternyata tidak, dan verifikasi menangkapnya
 * (terukur nav = 0). Chrome-nya karena itu dipasang eksplisit di sini, sama
 * persis dengan layout situs: header, footer, bilah kemajuan, mesin gerak, dan
 * efek klik.
 *
 * Yang membedakan hanya satu: semuanya dibungkus `.kageNight`, yang me-remap
 * token warna (--bg, --ink, --line, --accent, ...) jadi palet malam. Karena
 * header dan footer sudah memakai token yang sama, keduanya ikut gelap tanpa
 * satu pun kelas ditambahkan ke komponennya.
 *
 * Jadi halaman ini memakai kontrol yang SAMA dan konten yang SAMA dengan
 * portfolio — hanya dibaca dalam gelap. Itu bentuk "menyatu"-nya.
 */
export default function KageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kageNight">
      <a className="skip" href="#isi">
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="isi" className="kageNight__body">
        {children}
      </main>
      <Footer />
      <Motion />
      <ClickSpark />
    </div>
  );
}
