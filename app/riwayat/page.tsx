import type { Metadata } from "next";
import { SetType, DrawRule, Rise } from "@/components/edition/type";
import { track, school, offHours } from "@/lib/site";

export const metadata: Metadata = {
  title: "History",
  description: "Placements, awards, education, and life outside class.",
};

export default function HistoryPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">History · {track.length} entries</p>
          <SetType as="h1" className="page__h" text="Where the work happened." accentLast />
          <p className="page__s dek">
            Newest first. Each entry is the context behind a record — a placement where the work ran, an award a third
            party recorded, or a programme still in progress.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <ol className="steps">
            {track.map((t) => (
              <li key={t.title + t.date} data-rise data-on-enter style={{ gridTemplateColumns: "minmax(0, 190px) minmax(0, 1fr)" }}>
                <p className="mono" style={{ fontSize: 13, color: "var(--accent)" }}>
                  {t.date}
                </p>
                <div>
                  <h2 className="steps__t" style={{ fontSize: 19 }}>
                    {t.title}
                  </h2>
                  <p className="meta" style={{ marginTop: 3 }}>
                    {t.org}
                  </p>
                  <p className="steps__d" style={{ marginTop: 9 }}>
                    {t.desc}
                  </p>
                  <ul className="art" style={{ marginTop: 10 }}>
                    {t.points.map((p) => (
                      <li key={p} style={{ fontSize: 15 }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mono" style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)" }}>
                    {[t.badge, ...t.tags].filter(Boolean).join(" / ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="Study, and hours outside them." />
          </div>
          <table className="ledger">
            <tbody>
              {school.map((s) => (
                <tr key={s.title}>
                  <td className="ledger__yr mono">{s.period}</td>
                  <td className="ledger__t">{s.title}</td>
                  <td className="ledger__k">{s.org}</td>
                </tr>
              ))}
              {offHours.map((h) => (
                <tr key={h.name}>
                  <td className="ledger__yr mono">outside class</td>
                  <td className="ledger__t">{h.name}</td>
                  <td className="ledger__k">{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
