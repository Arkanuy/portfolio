import type { Metadata } from "next";
import { track, school, offHours } from "@/lib/site";

export const metadata: Metadata = {
  title: "Riwayat",
  description: "Penempatan kerja, penghargaan, pendidikan, dan kegiatan di luar kelas.",
};

export default function HistoryPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="stamp stamp--accent">Riwayat · {track.length} entri</p>
          <h1 className="page__h">Di mana pekerjaannya berlangsung.</h1>
          <p className="page__s">
            Terbaru dulu. Tiap entri adalah konteks di balik satu kartu: tempat kerja, penghargaan yang dicatat pihak
            ketiga, atau program yang masih berjalan.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ol className="steps">
            {track.map((t) => (
              <li key={t.title + t.date} style={{ gridTemplateColumns: "minmax(0,190px) minmax(0,1fr)" }}>
                <p className="mono" style={{ fontSize: 13, color: "var(--accent)" }}>
                  {t.date}
                </p>
                <div>
                  <h2 className="steps__t" style={{ fontSize: 19 }}>
                    {t.title}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3 }}>{t.org}</p>
                  <p className="steps__d" style={{ marginTop: 10 }}>
                    {t.desc}
                  </p>
                  <ul style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {t.points.map((p) => (
                      <li key={p} style={{ position: "relative", paddingLeft: 18, fontSize: 15, color: "var(--ink-2)" }}>
                        <span style={{ position: "absolute", left: 0, top: 10, width: 9, height: 1, background: "var(--ink-3)", display: "block" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mono" style={{ marginTop: 10, fontSize: 11.5, color: "var(--ink-3)" }}>
                    {[t.badge, ...t.tags].filter(Boolean).join(" / ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <table className="tbl" style={{ marginTop: 40 }}>
            <tbody>
              {school.map((s) => (
                <tr key={s.title}>
                  <td className="tbl__n mono">{s.period}</td>
                  <td className="tbl__t">{s.title}</td>
                  <td>{s.org}</td>
                </tr>
              ))}
              {offHours.map((h) => (
                <tr key={h.name}>
                  <td className="tbl__n mono">luar kelas</td>
                  <td className="tbl__t">{h.name}</td>
                  <td>{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
