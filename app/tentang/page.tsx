import type { Metadata } from "next";
import { Sec, CTA } from "@/components/drift/sec";
import { Spot } from "@/components/drift/interact";
import { WordFlow } from "@/components/drift/word-flow";
import { site, process, stack, numbers } from "@/lib/site";
import { traceStats } from "@/lib/records";

export const metadata: Metadata = {
  title: "About",
  description: "Background, working method, and tooling of Arkan Mustofa.",
};

export default function TentangPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow" data-as>
            About
          </p>
          <h1 className="pageHero__t">
            <span data-as data-dp="0.16" style={{ display: "block" }}>
              Process first,
            </span>
            <span data-as data-dp="-0.13" style={{ display: "block" }}>
              <em>code</em> second.
            </span>
          </h1>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="about">
            <div>
              <p className="about__p" data-as>
                {site.bio}
              </p>
              <p className="about__p" data-as style={{ ["--as-d" as string]: "120ms" }}>
                {site.bioLong}
              </p>
              <div className="facts">
                <div data-as style={{ ["--as-d" as string]: "180ms" }}>
                  <dt>Born</dt>
                  <dd>{site.born}</dd>
                </div>
                <div data-as style={{ ["--as-d" as string]: "230ms" }}>
                  <dt>Based in</dt>
                  <dd>{site.place}</dd>
                </div>
                <div data-as style={{ ["--as-d" as string]: "280ms" }}>
                  <dt>Status</dt>
                  <dd>{site.status}</dd>
                </div>
                <div data-as style={{ ["--as-d" as string]: "330ms" }}>
                  <dt>Tooling</dt>
                  <dd>
                    {traceStats.capabilities} listed, {traceStats.gaps} without a work record yet
                  </dd>
                </div>
              </div>
            </div>

            <div style={{ position: "sticky", top: 110 }} data-as data-dp="0.12">
              <div className="portrait__frame">
                <img
                  className="portrait__img"
                  src="/github/arkan-avatar-680.webp"
                  alt={`Portrait of ${site.name}`}
                  width={340}
                  height={340}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="portrait__below">
                <span className="chip chip--hot">{site.name}</span>
                <span className="chip">{site.handle}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sec
        eyebrow="Method"
        title="Four steps, and what each ~leaves behind."
        sub="The point of the order is that you can read the output of every step. If step two produced no document, the feature list was invented while coding."
      >
        <div className="steps">
          {process.map((p, i) => (
            <div className="step" key={p.no} data-as data-dp={i % 2 ? "0.11" : "-0.13"} style={{ ["--as-y" as string]: "46px", ["--as-d" as string]: `${i * 110}ms` }}>
              <span className="step__n mono">{p.no}</span>
              <h3 className="step__t">{p.title}</h3>
              <p className="step__d">{p.body}</p>
              <p className="step__out mono">
                → {p.no === "01" ? "current-state map" : p.no === "02" ? "requirement list" : p.no === "03" ? "working build" : "handover notes"}
              </p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec eyebrow="Tooling" title="What I use, and what I can ~prove." sub="Same list as the front page, split by group. Dots mark which tools link to real work.">
        <div className="caps">
          {stack.map((g, gi) => (
            <div className="cap" key={g.group} data-as data-dp={gi % 2 ? "-0.1" : "0.1"} style={{ ["--as-d" as string]: `${gi * 90}ms` }}>
              <p className="cap__k">{g.group}</p>
              <div className="cap__list">
                {g.items.map((it) => (
                  <span className="bead" key={it.name} data-src="true" title={it.evidence}>
                    <i />
                    {it.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec eyebrow="Numbers" title="Counted, not ~claimed.">
        <div className="stats">
          {numbers.map((n, i) => (
            <div className="stat" key={n.label} data-as data-dp={i % 2 ? "0.1" : "-0.1"} style={{ ["--as-d" as string]: `${i * 90}ms` }}>
              <p className="stat__v">{n.value}</p>
              <p className="stat__l">{n.label}</p>
              <p className="stat__n">{n.note}</p>
            </div>
          ))}
        </div>
      </Sec>

      <CTA />
    </>
  );
}
