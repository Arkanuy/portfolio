import type { Metadata } from "next";
import { Sheet, SignOff } from "@/components/trace/sheet";
import { CapabilityIndex, GapReport } from "@/components/trace/verify";
import { site, process, numbers } from "@/lib/site";
import { traceStats } from "@/lib/trace";

export const metadata: Metadata = {
  title: "Method",
  description: "How Arkan Mustofa works: read the process, write the requirements, build and test, then hand over with notes.",
};

export default function TentangPage() {
  return (
    <>
      <section className="aboutHero">
        <div className="wrap aboutHero__in">
          <div>
            <p className="tag-line" style={{ marginBottom: 12 }}>
              Sheet 03 / 05 · Method
            </p>
            <h1 className="aboutHero__t">Process first, code second. That order is the whole method.</h1>
            <p className="aboutHero__p">{site.bio}</p>
            <p className="aboutHero__p">{site.bioLong}</p>

            <dl className="aboutFacts">
              <div>
                <dt>Born</dt>
                <dd>{site.born}</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{site.place}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{site.status}</dd>
              </div>
              <div>
                <dt>Indexed</dt>
                <dd>
                  {traceStats.records} records · {traceStats.capabilities} capabilities · {traceStats.gaps} unsourced
                </dd>
              </div>
            </dl>
          </div>

          <figure className="aboutPhoto">
                        <img
              src="/github/arkan-avatar-680.webp"
              alt={`Portrait of ${site.name}`}
              width={340}
              height={340}
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>
              <span>{site.name}</span>
              <span>{site.handle}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <Sheet
        k="Key 04.1 / Sequence"
        title="Four steps, and the artefact each one leaves behind."
        sub="The point of the order is that you can read the output of every step. If step two has no document, then the feature list was invented while coding — and that is what makes people abandon software."
      >
        <div className="flow">
          {process.map((p) => (
            <div className="flow__step" key={p.no} data-rv>
              <span className="flow__n">{p.no}</span>
              <span className="flow__t">{p.title}</span>
              <div>
                <p className="flow__d">{p.body}</p>
                <span className="flow__out">
                  {p.no === "01"
                    ? "current-state map"
                    : p.no === "02"
                      ? "requirement list"
                      : p.no === "03"
                        ? "working build"
                        : "handover notes"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet
        k="Key 04.2 / Instruments"
        title="What I use — and which of it I can ~prove here."
        sub="Same index as the front page. It is repeated on purpose: the tool list is the easiest place to inflate a portfolio, so it is the place that most deserves a visible evidence column."
      >
        <CapabilityIndex />
        <GapReport />
      </Sheet>

      <Sheet k="Key 04.3 / Counters" title="Numbers, with what they ~actually count.">
        <div className="flow">
          {numbers.map((n) => (
            <div className="flow__step" key={n.label} data-rv style={{ gridTemplateColumns: "110px minmax(0,1fr)" }}>
              <span className="flow__n" style={{ fontSize: 22, fontWeight: 640, color: "var(--ink)" }}>
                {n.value}
              </span>
              <div>
                <p className="flow__t">{n.label}</p>
                <p className="flow__d">{n.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <SignOff />
    </>
  );
}