import type { Metadata } from "next";
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
          <h1 className="display page__t">History</h1>
          <p className="page__s lead">
            Newest first. Each entry is the context behind a record: a placement where the work ran, an award a third
            party recorded, or a programme still in progress.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ol className="tl">
            {track.map((t) => (
              <li className="tl__row" key={t.title + t.date}>
                <p className="tl__d mono">{t.date}</p>
                <div>
                  <h2 className="tl__t">{t.title}</h2>
                  <p className="tl__o">{t.org}</p>
                  <p className="tl__p">{t.desc}</p>
                  <ul className="tl__ul">
                    {t.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <p className="small mono" style={{ marginTop: 10 }}>
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
          <h2 className="display sec__h">Study</h2>
          <div className="defs">
            {school.map((s) => (
              <div className="defs__row" key={s.title}>
                <p className="defs__t mono">{s.period}</p>
                <p className="defs__v">
                  {s.title}
                  {s.org ? ` — ${s.org}` : ""}
                </p>
              </div>
            ))}
            {offHours.map((h) => (
              <div className="defs__row" key={h.name}>
                <p className="defs__t">
                  {h.name}
                  <span>outside class</span>
                </p>
                <p className="defs__v">{h.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
