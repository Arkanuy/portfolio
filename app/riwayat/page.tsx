import type { Metadata } from "next";
import { Split, Reveal } from "@/components/field/motion";
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
          <p className="kicker" data-reveal>
            History · {track.length} entries
          </p>
          <Split as="h1" className="serif page__h" text="Where the work happened." accentLast />
          <p className="page__s lead" data-reveal style={{ ["--d" as string]: "160ms" }}>
            Newest first. Each entry is the context behind a record — a placement where the work ran, an award a third
            party recorded, or a programme still in progress.
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap">
          <ol className="steps">
            {track.map((t, i) => (
              <li key={t.title + t.date} data-reveal style={{ ["--d" as string]: `${i * 70}ms`, gridTemplateColumns: "minmax(0,190px) minmax(0,1fr)" }}>
                <p className="mono" style={{ fontSize: 13, color: "var(--accent)" }}>
                  {t.date}
                </p>
                <div>
                  <h2 className="steps__t" style={{ fontSize: 19 }}>
                    {t.title}
                  </h2>
                  <p className="small" style={{ marginTop: 3 }}>
                    {t.org}
                  </p>
                  <p className="steps__d" style={{ marginTop: 10 }}>
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

          <Reveal delay={100}>
            <table className="tbl" style={{ marginTop: 44 }}>
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
                    <td className="tbl__n mono">outside class</td>
                    <td className="tbl__t">{h.name}</td>
                    <td>{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>
    </>
  );
}
