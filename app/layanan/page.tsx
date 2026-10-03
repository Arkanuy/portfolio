import type { Metadata } from "next";
import { Split, Reveal } from "@/components/field/motion";
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
          <p className="kicker" data-reveal>
            Services · {services.length} kinds of work
          </p>
          <Split as="h1" className="serif page__h" text="What I actually do." accentLast />
          <p className="page__s lead" data-reveal style={{ ["--d" as string]: "160ms" }}>
            Four kinds of work, each coming from a record on the work page. Pick whichever is closest to your problem.
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap split">
          <div>
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <article className="card" style={{ display: "block", paddingBottom: 30, marginBottom: 30, borderBottom: "1px solid var(--rule)" }} data-scrub>
                  <p className="card__no mono">{s.no} — {s.name}</p>
                  <h2 className="serif card__t">{s.name}</h2>
                  <p className="card__d">{s.tagline}</p>
                  <p className="card__d">
                    <b>Who it is for.</b> {s.for}
                  </p>
                  <ul className="art" style={{ marginTop: 14 }}>
                    {s.includes.map((it) => (
                      <li key={it} style={{ fontSize: 15.5 }}>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <p className="card__meta">
                    <span>
                      <b>Evidence.</b> {s.proof}
                    </span>
                  </p>
                  <p className="card__go">
                    <a className="btn btn--line" href={`/layanan/${s.slug}`}>
                      <span className="btn__fill" aria-hidden="true" />
                      Detail <i aria-hidden="true">→</i>
                    </a>
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Based in</p>
                <p className="rail__v">{site.place}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Status</p>
                <p className="rail__v">{site.status}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Start</p>
                <p className="rail__v">
                  <a href="/kontak">Tell me about the project</a>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
