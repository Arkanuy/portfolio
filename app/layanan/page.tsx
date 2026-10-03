import type { Metadata } from "next";
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
          <h1 className="display page__t">Services</h1>
          <p className="page__s lead">
            Four kinds of work, all of them coming from the records on the work page. Pick whichever is closest to your
            problem.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="svc">
            {services.map((s) => (
              <div className="svc__row" key={s.slug}>
                <p className="svc__n mono">{s.no}</p>
                <div>
                  <h2 className="svc__t">{s.name}</h2>
                  <p className="svc__tag">{s.tagline}</p>
                  <p className="svc__tag">
                    <b>Who it is for.</b> {s.for}
                  </p>
                  <ul className="svc__ul">
                    {s.includes.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <p className="svc__proof">
                    <b>Evidence.</b> {s.proof}
                  </p>
                  <p className="open__links" style={{ marginTop: 14 }}>
                    <a href={`/layanan/${s.slug}`}>Detail</a>
                    <a href="/kontak">Discuss this</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="body">
            <h2 className="display sec__h">When I tell you not to build an app</h2>
            <p>
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

            <h2 className="display sec__h" style={{ marginTop: 38 }}>
              Both sides of the same problem
            </h2>
            <p>
              I finished vocational school in Software Engineering and I am now studying Information Systems. That puts
              me on both sides: writing the code, and tidying the business process behind it. The second one usually
              decides whether software gets used at all.
            </p>
            <p>
              Based in {site.place}. {site.status}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
