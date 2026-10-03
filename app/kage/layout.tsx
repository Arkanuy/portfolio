import Header from "@/components/ui/header";

/**
 * LAYOUT /kage.
 *
 * Dokumen Kage tetap utuh di dalam frame-nya, tapi HALAMAN yang membungkusnya
 * jelas milik situs ini: header yang sama (termasuk tombol tema), dan baris
 * kredit di bawah yang menyebut sumbernya serta jalan pulang.
 *
 * Itu bagian "disesuaikan dengan proyek kita" yang tidak menyentuh karya
 * aslinya: yang disesuaikan adalah konteksnya, bukan lukisannya.
 */
export default function KageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kage">
      <Header />
      <main id="isi" className="kage__body">
        {children}
      </main>
      <div className="kage__foot">
        <div className="wrap">
          <p>
            Scene by <b>ThreeUI</b> — Kage, “Hidden Realms of Kyoto”. Dokumen dan asetnya dipakai apa adanya
            (terverifikasi hash); yang disesuaikan hanya tipografi dan warna aksen.
          </p>
          <p className="kage__links">
            <a href="/">← Back to the portfolio</a>
            <a href="/karya">Work</a>
            <a href="/kontak">Contact</a>
          </p>
        </div>
      </div>
    </div>
  );
}
