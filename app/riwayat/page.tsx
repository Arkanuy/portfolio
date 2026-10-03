import type { Metadata } from "next";
import { Sec, CTA } from "@/components/drift/sec";
import { track, school, offHours } from "@/lib/site";

export const metadata: Metadata = {
  title: "History",
  description: "Placements, awards, education, and life outside class.",
};

export default function RiwayatPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow" data-as>
            History · {track.length} entries
          </p>
          <h1 className="pageHero__t">
            <span data-as data-dp="0.15" style={{ display: "block" }}>
              Where the work
            </span>
            <span data-as data-dp="-0.12" style={{ display: "block" }}>
              <em>happened.</em>
            </span>
          </h1>
          <p className="pageHero__s" data-as style={{ ["--as-d" as string]: "280ms" }}>
            Newest first. Each entry is the context behind a project: a placement where the work ran, an award a third
            party recorded, or a programme still in progress.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ol className="timeList">
            {track.map((t, i) => (
              <li className="timeItem" key={t.title + t.date} data-as data-dp={i % 2 ? "-0.09" : "0.11"} style={{ ["--as-d" as string]: `${i * 90}ms` }}>
                <div>
                  <p className="timeItem__date mono">{t.date}</p>
                </div>
                <div>
                  <h2 className="timeItem__t">{t.title}</h2>
                  <p className="timeItem__org">{t.org}</p>
                  <p className="timeItem__d">{t.desc}</p>
                  <ul className="timeItem__list">
                    {t.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="timeItem__tags">
                    {t.badge && <span className="tag tag--hot">{t.badge}</span>}
                    {t.tags.map((x) => (
                      <span key={x} className="tag">
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Sec eyebrow="Study" title="Programmes, and hours ~outside them.">
        <div className="spots">
          <div className="glass spot" data-as data-dp="0.1">
            <p className="cap__k">Education</p>
            <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
              {school.map((s) => (
                <div key={s.title}>
                  <p className="mono" style={{ fontSize: 12.5, color: "var(--cyan-ink)" }}>
                    {s.period}
                  </p>
                  <p style={{ marginTop: 4, fontSize: 17, fontWeight: 650 }}>{s.title}</p>
                  <p style={{ marginTop: 3, fontSize: 14, color: "var(--text-2)" }}>{s.org}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass spot" data-as data-dp="-0.1" style={{ ["--as-d" as string]: "120ms" }}>
            <p className="cap__k">Outside class hours</p>
            <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
              {offHours.map((h) => (
                <div key={h.name}>
                  <p style={{ fontSize: 17, fontWeight: 650 }}>{h.name}</p>
                  <p style={{ marginTop: 3, fontSize: 14, color: "var(--text-2)" }}>{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Sec>

      <CTA />
    </>
  );
}
