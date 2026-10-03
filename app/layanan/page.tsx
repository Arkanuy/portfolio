import type { Metadata } from "next";
import { Sec, CTA } from "@/components/drift/sec";
import { Spot } from "@/components/drift/interact";
import { WordFlow } from "@/components/drift/word-flow";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Four kinds of work: business systems, web, analysis and documentation, and automation.",
};

export default function LayananPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow" data-as>
            Services · {services.length} kinds of work
          </p>
          <h1 className="pageHero__t">
            <span data-as data-dp="0.15" style={{ display: "block" }}>
              What I
            </span>
            <span data-as data-dp="-0.12" style={{ display: "block" }}>
              <em>actually</em> do.
            </span>
          </h1>
          <p className="pageHero__s" data-as style={{ ["--as-d" as string]: "300ms" }}>
            Every service below comes from work already on the history page — not a list of things I could theoretically
            attempt. Pick whichever is closest to your problem.
          </p>
        </div>
      </section>

      <Sec eyebrow="Services" title="Four, and what each ~includes.">
        <div className="svcList">
          {services.map((s, i) => (
            <div className="svcRow" key={s.slug} data-as data-dp={i % 2 ? "-0.1" : "0.12"} style={{ ["--as-d" as string]: `${i * 90}ms` }}>
              <span className="svcRow__no mono">{s.no}</span>
              <div>
                <h2 className="svcRow__name">{s.name}</h2>
                <p className="svcRow__tag">{s.tagline}</p>
                <p className="svcRow__for">
                  <strong>Who it is for:</strong> {s.for}
                </p>
                <ul className="svcRow__list">
                  {s.includes.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <p className="svcRow__proof">
                  <strong>Evidence:</strong> {s.proof}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <a className="btn btn--go btn--sm" href={`/layanan/${s.slug}`}>
                    Detail →
                  </a>
                  <a className="btn btn--ghost btn--sm" href="/kontak">
                    Discuss this
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec
        eyebrow="Honesty clause"
        title="The two times I tell you ~not to build an app."
        sub="Abandoned software costs more than software that was never started. Saying this before the work begins is part of the job."
      >
        <div className="spots">
          <Spot>
            <div data-as>
              <h3 className="spot__t">When the problem is one step</h3>
              <p className="spot__d">
                Three people editing one file and pasting the wrong version is not a software problem. That is one
                template and a naming rule. No application needed.
              </p>
            </div>
          </Spot>
          <Spot tone="coral">
            <div data-as style={{ ["--as-d" as string]: "110ms" }}>
              <h3 className="spot__t">When nobody will use it</h3>
              <p className="spot__d">
                Software only helps if people are willing to leave the old way behind. If they are not, I would rather
                say so up front than build something that quietly gets abandoned.
              </p>
            </div>
          </Spot>
        </div>
      </Sec>

      <Sec eyebrow="Why me" title="Both sides of the ~same problem.">
        <div className="about">
          <div>
            <p className="about__p" data-as>
              I finished vocational school in Software Engineering and I am now studying Information Systems. That puts
              me on both sides: writing the code, and tidying the business process behind it.
            </p>
            <p className="about__p" data-as style={{ ["--as-d" as string]: "120ms" }}>
              The second one is usually what decides whether software gets used at all. It is also the part most people
              skip — which is why the work here starts with a process map, not a feature list.
            </p>
            <div className="facts" style={{ maxWidth: 520 }}>
              <div data-as style={{ ["--as-d" as string]: "200ms" }}>
                <dt>Based in</dt>
                <dd>{site.place}</dd>
              </div>
              <div data-as style={{ ["--as-d" as string]: "260ms" }}>
                <dt>Status</dt>
                <dd>{site.status}</dd>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }} data-as>
              <a className="btn btn--go btn--sm" href="/tentang">
                More about me →
              </a>
              <a className="btn btn--ghost btn--sm" href={site.cv} download>
                Download CV
              </a>
            </div>
          </div>

          <div style={{ position: "sticky", top: 110 }} data-as data-dp="0.1">
            <div className="portrait__frame">
              <img
                className="portrait__img"
                src="/github/arkan-avatar-680.webp"
                alt={`Portrait of ${site.name}`}
                width={340}
                height={340}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="portrait__below">
              <span className="chip chip--hot">{site.name}</span>
              <span className="chip">{site.handle}</span>
            </div>
          </div>
        </div>
      </Sec>

      <CTA />
    </>
  );
}
