import type { Metadata } from "next";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Empat jenis pekerjaan: sistem bisnis, web, analisis & dokumentasi, otomasi.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="stamp stamp--accent">Layanan · {services.length} jenis</p>
          <h1 className="page__h">Yang benar-benar saya kerjakan.</h1>
          <p className="page__s">
            Empat jenis pekerjaan, semuanya berasal dari kartu di halaman kerja. Pilih yang paling dekat dengan
            masalahmu.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="steps">
            {services.map((s) => (
              <li key={s.slug}>
                <span className="steps__n">{s.no}</span>
                <span className="steps__t">
                  <a href={`/layanan/${s.slug}`}>{s.name}</a>
                </span>
                <span className="steps__d">
                  <b>{s.tagline}</b>
                  <br />
                  Untuk: {s.for}
                  <ul style={{ marginTop: 10 }}>
                    {s.includes.map((it) => (
                      <li key={it} style={{ position: "relative", paddingLeft: 18, fontSize: 15 }}>
                        <span style={{ position: "absolute", left: 0, top: 10, width: 9, height: 1, background: "var(--ink-3)", display: "block" }} />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <span style={{ display: "block", marginTop: 12, color: "var(--ink-3)", fontSize: 14 }}>
                    <b style={{ color: "var(--ink-2)" }}>Bukti.</b> {s.proof}
                  </span>
                </span>
                <span className="steps__o">→ /layanan/{s.slug}</span>
              </li>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap art">
          <header className="head">
            <span className="head__r" />
            <h2 className="sec__h">Kapan saya bilang jangan bikin aplikasi</h2>
          </header>
          <p>
            Perangkat lunak yang ditinggalkan lebih mahal daripada perangkat lunak yang tidak pernah dimulai. Mengatakan
            ini sebelum kerja dimulai adalah bagian dari pekerjaannya.
          </p>
          <ul>
            <li>
              <b>Kalau masalahnya cuma satu langkah.</b> Tiga orang mengedit satu berkas lalu menempel versi yang salah
              bukan masalah perangkat lunak. Itu satu templat dan satu aturan penamaan.
            </li>
            <li>
              <b>Kalau tidak ada yang mau memakainya.</b> Perangkat lunak hanya menolong kalau orang bersedia
              meninggalkan cara lama. Kalau tidak, saya lebih baik bilang di depan.
            </li>
          </ul>

          <header className="head" style={{ marginTop: 34 }}>
            <span className="head__r" />
            <h2 className="sec__h">Dua sisi dari masalah yang sama</h2>
          </header>
          <p>
            Saya lulus dari SMK jurusan Rekayasa Perangkat Lunak dan sekarang menempuh Sistem Informasi. Itu menempatkan
            saya di dua sisi: menulis kodenya, dan merapikan proses bisnis di belakangnya. Yang kedua biasanya yang
            menentukan apakah perangkat lunaknya dipakai.
          </p>
          <p>
            Berbasis di {site.place}. {site.status}.
          </p>
        </div>
      </section>
    </>
  );
}
