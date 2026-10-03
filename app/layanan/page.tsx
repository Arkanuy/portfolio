import type { Metadata } from "next";
import { SetType, DrawRule, Rise } from "@/components/edition/type";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Four kinds of work: business systems, web, analysis and documentation, and automation.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">Services · {services.length} kinds of work</p>
          <SetType as="h1" className="page__h" text="What I actually do." accentLast />
          <p className="page__s dek">
            Four kinds of work, each coming from a record on the work page. Pick whichever is closest to your problem.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="grid3">
            {services.map((s) => (
              <article className="story" key={s.slug}>
                <DrawRule tone="rule" onEnter={false} />
                <p className="kicker" style={{ marginTop: 12 }}>
                  {s.no}
                </p>
                <h2 className="story__h">
                  <a href={`/layanan/${s.slug}`}>{s.name}</a>
                </h2>
                <p className="story__d">{s.tagline}</p>
                <ul className="art" style={{ marginTop: 12 }}>
                  {s.includes.slice(0, 3).map((it) => (
                    <li key={it} style={{ fontSize: 14.5 }}>
                      {it}
                    </li>
                  ))}
                </ul>
                <p className="story__meta meta">
                  <b>Evidence.</b> {s.proof}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="When I tell you not to build an app." />
          </div>
          <div className="art">
            <p className="art__drop">
              Abandoned software costs more than software that was never started. Saying this before the work begins is
              part of the job.
            </p>
            <ul>
              <li>
                <b>When the problem is one step.</b> Three people editing one file and pasting the wrong version is not
                a software problem. That is one template and a naming rule.
              </li>
              <li>
                <b>When nobody will use it.</b> Software only helps if people are willing to leave the old way behind.
                If they are not, I would rather say so up front.
              </li>
            </ul>
            <h2 className="sec__h" style={{ marginTop: 34 }}>
              <SetType as="h2" text="Both sides of the same problem." />
            </h2>
            <p>
              I finished vocational school in Software Engineering and I am now studying Information Systems. That puts
              me on both sides: writing the code, and tidying the business process behind it. The second one usually
              decides whether software gets used at all.
            </p>
            <p>Based in {site.place}. {site.status}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
