import type { Metadata } from "next";
import { Section, CTABand } from "@/components/ui/section";
import { track, school, offHours } from "@/lib/site";

export const metadata: Metadata = {
  title: "History",
  description: "Work experience, education, and life outside class.",
};

export default function RiwayatPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow">History</p>
          <h1 className="pageHero__t">
            Experience <em>& awards</em>.
          </h1>
          <p className="pageHero__s">Newest first.</p>
        </div>
      </section>

      <Section>
        <ol className="timeList">
          {track.map((t, i) => (
            <div data-fx className="timeItem" key={t.title + t.date} >
              <div className="timeItem__left">
                <span className="timeItem__date">{t.date}</span>
              </div>
              <div className="timeItem__right">
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
            </div>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Education" titleText="Schools and ~programmes." tint>
        <div className="twoCol2">
          <div data-fx className="card2" >
            {school.map((s) => (
              <div key={s.title} className="rowItem">
                <span className="rowItem__k">{s.period}</span>
                <span className="rowItem__t">{s.title}</span>
                <span className="rowItem__o">{s.org}</span>
              </div>
            ))}
          </div>
          <div data-fx className="card2" >
            <p className="card2__k">Outside class hours</p>
            {offHours.map((h) => (
              <div key={h.name} className="rowItem">
                <span className="rowItem__t">{h.name}</span>
                <span className="rowItem__o">{h.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <CTABand />
    </>
  );
}
