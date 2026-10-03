import type { Metadata } from "next";
import { Sheet, SignOff } from "@/components/trace/sheet";
import { track, school, offHours } from "@/lib/site";

export const metadata: Metadata = {
  title: "History",
  description: "Placements, awards, education, and the record of what changed at each step.",
};

export default function RiwayatPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta mono">
            <span>Sheet 04 / 05</span>
            <span>Entries {track.length}</span>
            <span>Newest first</span>
          </div>
          <h1 className="pageHero__t">
            The record behind the <em>records</em>.
          </h1>
          <p className="pageHero__s">
            Each entry here is what makes a claim on the front page checkable: a placement where the work happened, an
            award that a third party recorded, or a programme still running.
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap">
          <ol className="timeList">
            {track.map((t) => (
              <li className="timeItem" key={t.title + t.date} data-rv>
                <div>
                  <span className="timeItem__date">{t.date}</span>
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

      <Sheet k="Key 05.1 / Study" title="Programmes, and hours ~outside them.">
        <div className="twoCol2">
          <div className="card2" data-rv>
            <p className="card2__k">Education</p>
            {school.map((s) => (
              <div key={s.title} className="rowItem">
                <span className="rowItem__k">{s.period}</span>
                <span className="rowItem__t">{s.title}</span>
                <span className="rowItem__o">{s.org}</span>
              </div>
            ))}
          </div>
          <div className="card2" data-rv>
            <p className="card2__k">Outside class hours</p>
            {offHours.map((h) => (
              <div key={h.name} className="rowItem">
                <span className="rowItem__t">{h.name}</span>
                <span className="rowItem__o">{h.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      <SignOff />
    </>
  );
}