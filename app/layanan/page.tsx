import type { Metadata } from "next";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Empat jenis pekerjaan: sistem bisnis, web, analisis & dokumentasi, otomasi.",
};

export default function ServicesPage() {
  return (
    <article className="page">
      <p className="k">Layanan · {services.length} jenis</p>
      <h1 className="h1" style={{ marginTop: 10 }}>
        Yang benar-benar saya kerjakan.
      </h1>
      <p className="lede">
        Empat jenis pekerjaan, semuanya berasal dari catatan di katalog. Pilih yang paling dekat dengan masalahmu.
      </p>

      {services.map((s) => (
        <section key={s.slug}>
          <h2 className="h2">
            <span className="sig">{s.no}</span> {s.name}
          </h2>
          <p className="p">{s.tagline}</p>

          <div className="spec">
            <div className="spec__ti">
              <span className="k" style={{ color: "var(--ink-2)" }}>
                Spesifikasi
              </span>
            </div>
            <table className="tbl">
              <tbody>
                <tr>
                  <td className="tbl__f">untuk</td>
                  <td className="tbl__ty">string</td>
                  <td className="tbl__v">{s.for}</td>
                </tr>
                <tr>
                  <td className="tbl__f">termasuk</td>
                  <td className="tbl__ty">array[{s.includes.length}]</td>
                  <td className="tbl__v">{s.includes.join(" · ")}</td>
                </tr>
                <tr>
                  <td className="tbl__f">bukti</td>
                  <td className="tbl__ty">record</td>
                  <td className="tbl__v">{s.proof}</td>
                </tr>
                <tr>
                  <td className="tbl__f">titik mulai</td>
                  <td className="tbl__ty">string</td>
                  <td className="tbl__v">{s.from}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn" href={`/layanan/${s.slug}`}>
              Detail <span aria-hidden="true">→</span>
            </a>
          </p>
        </section>
      ))}

      <h2 className="h2">Kapan saya bilang jangan bikin aplikasi</h2>
      <p className="p">
        Perangkat lunak yang ditinggalkan lebih mahal daripada yang tidak pernah dimulai. Mengatakan ini sebelum kerja
        dimulai adalah bagian dari pekerjaannya.
      </p>
      <ul className="list">
        <li>
          <b>Kalau masalahnya cuma satu langkah.</b> Tiga orang mengedit satu berkas lalu menempel versi yang salah bukan
          masalah perangkat lunak. Itu satu templat dan satu aturan penamaan.
        </li>
        <li>
          <b>Kalau tidak ada yang mau memakainya.</b> Perangkat lunak hanya menolong kalau orang bersedia meninggalkan
          cara lama.
        </li>
      </ul>

      <h2 className="h2">Dua sisi dari masalah yang sama</h2>
      <p className="p">
        Saya lulus dari SMK jurusan Rekayasa Perangkat Lunak dan sekarang menempuh Sistem Informasi. Itu menempatkan saya
        di dua sisi: menulis kodenya, dan merapikan proses bisnis di belakangnya. Yang kedua biasanya yang menentukan
        apakah perangkat lunaknya dipakai.
      </p>
      <p className="p">
        Berbasis di {site.place}. {site.status}.
      </p>
    </article>
  );
}
