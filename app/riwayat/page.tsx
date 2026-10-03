import type { Metadata } from "next";
import { track, school, offHours } from "@/lib/site";

export const metadata: Metadata = {
  title: "Riwayat",
  description: "Penempatan kerja, penghargaan, pendidikan, dan kegiatan di luar kelas.",
};

export default function HistoryPage() {
  return (
    <article className="page">
      <p className="k">Riwayat · {track.length} entri</p>
      <h1 className="h1" style={{ marginTop: 10 }}>
        Di mana pekerjaannya berlangsung.
      </h1>
      <p className="lede">
        Terbaru dulu. Tiap entri adalah konteks di balik satu catatan di katalog — tempat kerja, penghargaan yang
        dicatat pihak ketiga, atau program yang masih berjalan.
      </p>

      <ol className="steps" style={{ marginTop: 26 }}>
        {track.map((t) => (
          <li className="step" key={t.title + t.date} style={{ gridTemplateColumns: "150px minmax(0, 1fr)" }}>
            <p className="sig" style={{ fontSize: 12.5 }}>
              {t.date}
            </p>
            <div>
              <p className="step__t">{t.title}</p>
              <p className="k" style={{ marginTop: 4 }}>
                {t.org}
              </p>
              <p className="step__d">{t.desc}</p>
              <ul className="list" style={{ marginTop: 10 }}>
                {t.points.map((p) => (
                  <li key={p} style={{ fontSize: 13.5 }}>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="chips" style={{ marginTop: 10 }}>
                {[t.badge, ...t.tags].filter(Boolean).map((x) => (
                  <span className="chip" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="h2">Pendidikan</h2>
      <section className="spec" style={{ marginTop: 12 }}>
        <table className="tbl">
          <tbody>
            {school.map((s) => (
              <tr key={s.title}>
                <td className="tbl__f">{s.period}</td>
                <td className="tbl__ty">education</td>
                <td className="tbl__v">
                  {s.title}
                  {s.org ? ` — ${s.org}` : ""}
                </td>
              </tr>
            ))}
            {offHours.map((h) => (
              <tr key={h.name}>
                <td className="tbl__f">{h.name}</td>
                <td className="tbl__ty">outside</td>
                <td className="tbl__v">{h.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  );
}
