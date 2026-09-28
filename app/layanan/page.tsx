import type { Metadata } from "next";
import Image from "next/image";
import { Section, CTABand } from "@/components/ui/section";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Four services: business systems, web, analysis and documentation, and automation.",
};

export default function LayananPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow">Services</p>
          <h1 className="pageHero__t">
            What I <em>actually do</em>.
          </h1>
          <p className="pageHero__s">
            Four kinds of work, all of them coming from the experience listed on the history page. Pick whichever
            is closest to your problem.
          </p>
        </div>
      </section>

      <Section>
        <div className="svcList">
          {services.map((s, i) => (
            <div data-fx className="svcRow" key={s.slug} >
              <div className="svcRow__head">
                <span className="svcRow__no">{s.no}</span>
                <h2 className="svcRow__name">{s.name}</h2>
                <p className="svcRow__tag">{s.tagline}</p>
              </div>

              <div className="svcRow__body">
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
                <a className="btn btn--ghost" href={`/layanan/${s.slug}`}>
                  More about {s.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Not everything needs software" titleText="When I tell you ~not to build an app." tint>
        <div className="twoCol2">
          <div data-fx className="noteCard" >
            <h3 className="noteCard__t">When the problem is one step</h3>
            <p className="noteCard__d">
              Three people editing one file and copy-pasting the wrong version? That is solved with one template
              and a naming rule. No application needed.
            </p>
          </div>
          <div data-fx className="noteCard" >
            <h3 className="noteCard__t">When nobody wants to use it</h3>
            <p className="noteCard__d">
              Software only helps if people are willing to leave the old way behind. If they are not, I say so up
              front instead of building something that gets abandoned.
            </p>
          </div>
        </div>
      </Section>

      <div className="wrap aboutStrip">
        <div className="aboutStrip__text">
          <p className="eyebrow">Why me</p>
          <p className="aboutStrip__p">
            I graduated from a vocational school in Software Engineering, and I am now studying Information Systems.
            That puts me on both sides: writing code, and tidying the business process behind it. The second one is
            usually what decides whether the software gets used at all.
          </p>
          <a className="btn btn--ghost" href="/tentang">
            More about me
          </a>
        </div>
        <figure className="aboutStrip__photo">
          <Image src="/github/arkan-avatar-2x.png" alt={`Portrait of ${site.name}`} width={680} height={680} sizes="(max-width: 860px) 92vw, 340px" />
        </figure>
      </div>

      <CTABand />
    </>
  );
}
