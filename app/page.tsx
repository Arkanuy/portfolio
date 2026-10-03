import Deck from "@/components/punch/deck";
import { site, services, process, stack, numbers } from "@/lib/site";
import { records, traceStats } from "@/lib/records";

export default function Home() {
  return (
    <>
      {/* ---------- KEPALA MESIN ---------- */}
      <section className="wrap" style={{ padding: "clamp(24px,4vw,48px) var(--gut) clamp(18px,3vw,30px)" }}>
        <p className="stamp stamp--accent">Setumpuk {records.length} kartu · tiap lubang adalah data</p>
        <h1
          className="page__h"
          style={{ fontSize: "clamp(34px,7vw,86px)", maxWidth: "17ch", marginTop: 14 }}
        >
          Perangkat lunak yang dipakai, bukan sekadar dikirim.
        </h1>
        <p className="page__s" style={{ marginTop: 20 }}>
          Saya {site.name}. Saya membangun perangkat lunak bisnis, aplikasi web, dan otomasi — dan saya memetakan
          prosesnya dulu sebelum menulis kode, karena masalahnya jarang ada di kode.
        </p>
        <p className="page__s">
          Halaman ini bukan daftar proyek. Ini <b>setumpuk kartu punch</b>: tiap kartu memuat satu catatan kerja, dan
          <b> lubangnya adalah datanya</b> — tahun, status, berapa bagian yang dibangun. Kepala pembaca menyapu kolom
          saat kamu menggulir. Angkat satu kartu untuk melihat isinya, dan cara membacanya.
        </p>
        <p style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn" href="#kartu">
            Buka tumpukan <i aria-hidden="true">↓</i>
          </a>
          <a className="btn btn--line" href="/kontak">
            Mulai proyek
          </a>
        </p>
      </section>

      {/* ---------- TUMPUKAN + AREA CETAK ---------- */}
      <div id="kartu">
        <Deck />
      </div>

      {/* ---------- LAYANAN ---------- */}
      <section className="sec">
        <div className="wrap">
          <header className="head">
            <span className="head__r" />
            <h2 className="sec__h">Empat jenis pekerjaan</h2>
            <p className="sec__n">
              Semuanya berasal dari kartu di atas — bukan daftar jualan.
            </p>
          </header>
          <div className="steps">
            {services.map((s) => (
              <li key={s.slug}>
                <span className="steps__n">{s.no}</span>
                <span className="steps__t">
                  <a href={`/layanan/${s.slug}`}>{s.name}</a>
                </span>
                <span className="steps__d">
                  {s.tagline} <br />
                  <span style={{ color: "var(--ink-3)", fontSize: 14 }}>Bukti: {s.proof}</span>
                </span>
                <span className="steps__o">→ /layanan/{s.slug}</span>
              </li>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- METODE ---------- */}
      <section className="sec">
        <div className="wrap">
          <header className="head">
            <span className="head__r" />
            <h2 className="sec__h">Urutan kerjanya</h2>
          </header>
          <ol className="steps">
            {process.map((p) => (
              <li key={p.no}>
                <span className="steps__n">{p.no}</span>
                <span className="steps__t">{p.title}</span>
                <span className="steps__d">{p.body}</span>
                <span className="steps__o">
                  → {p.no === "01" ? "peta proses" : p.no === "02" ? "daftar kebutuhan" : p.no === "03" ? "build jalan" : "catatan serah terima"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- ANGKA ---------- */}
      <section className="sec">
        <div className="wrap">
          <header className="head">
            <span className="head__r" />
            <h2 className="sec__h">Angka, dan apa yang dihitung</h2>
          </header>
          <div className="nums">
            {numbers.map((n) => (
              <div className="num" key={n.label}>
                <p className="num__v">{n.value}</p>
                <p className="num__l">{n.label}</p>
                <p className="num__n">{n.note}</p>
              </div>
            ))}
            <div className="num">
              <p className="num__v">{traceStats.gaps}</p>
              <p className="num__l">Perkakas tanpa catatan</p>
              <p className="num__n">Disebut, tapi belum ada kartunya</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PERKAKAS ---------- */}
      <section className="sec">
        <div className="wrap">
          <header className="head">
            <span className="head__r" />
            <h2 className="sec__h">Perkakas, dan pekerjaan yang memakainya</h2>
          </header>
          <table className="tbl">
            <caption>Setiap perkakas ditulis bersama buktinya.</caption>
            <tbody>
              {stack.map((g) => (
                <tr key={g.group}>
                  <td className="tbl__t" style={{ width: "22%" }}>
                    {g.group}
                  </td>
                  <td>
                    {g.items.map((it, i) => (
                      <span key={it.name}>
                        {i > 0 ? " · " : ""}
                        <b>{it.name}</b> — {it.evidence}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- AJAKAN ---------- */}
      <section className="sec">
        <div className="wrap">
          <header className="head">
            <span className="head__r" style={{ background: "var(--accent)" }} />
            <h2 className="sec__h">Ceritakan bagaimana kerjanya berjalan hari ini</h2>
          </header>
          <p className="page__s">
            Kalau ternyata aplikasi baru bukan jawabannya, saya akan bilang. Tidak semua masalah butuh perangkat lunak —
            dan mengatakannya lebih awal lebih murah daripada membangun hal yang salah.
          </p>
          <p style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn" href={`mailto:${site.email}`}>
              Kirim email <i aria-hidden="true">→</i>
            </a>
            <a className="btn btn--line" href="/kontak">
              Halaman kontak
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
