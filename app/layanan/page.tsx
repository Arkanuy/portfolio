import type { Metadata } from "next";
import { Sheet, SignOff } from "@/components/trace/sheet";
import { services, site } from "@/lib/site";
import { records } from "@/lib/trace";

export const metadata: Metadata = {
  title: "Work",
  description: "Four kinds of work — business systems, web, analysis and documentation, automation — each traced to the records that prove it.",
};

export default function LayananPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta mono">
            <span>Sheet 02 / 05</span>
            <span>Work types 4</span>
            <span>Records {records.length}</span>
          </div>
          <h1 className="pageHero__t">
            Four kinds of work, each one <em>traceable</em> to something I already built.
          </h1>
          <p className="pageHero__s">
            This is not a sales list. Every row below names the record that proves it, and if you follow that link you
            land on the case study, the status of its evidence, and what was actually delivered.
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap">
          <div className="svcList">
            {services.map((s) => {
              const linked = records.filter((r) =>
                s.slug === "business-systems"
                  ? r.state === "live" || r.state === "record"
                  : s.slug === "web"
                    ? r.state === "shipped" || r.state === "public"
                    : s.slug === "analysis"
                      ? r.state === "doc"
                      : r.stack.toLowerCase().includes("node") || r.title === "PixWatch" || r.title === "BuildPlan",
              );
              return (
                <div className="svcRow" key={s.slug} data-rv>
                  <div>
                    <p className="svcRow__no">{s.no}</p>
                  </div>
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
                    <div className="capRow__src" style={{ marginTop: 12 }}>
                      {linked.map((r) => (
                        <a className="chip" key={r.id} href={r.href}>
                          <span className="mono" style={{ color: "var(--mark-ink)" }}>
                            rec
                          </span>
                          {r.no} · {r.title}
                        </a>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 14 }}>
                      <a className="btn btn--sm" href={`/layanan/${s.slug}`}>
                        Detail
                      </a>
                      <a className="btn btn--sm btn--ghost" href="/kontak">
                        Discuss this
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Sheet
        k="Key 03.1 / Refusal"
        title="The two cases where I tell you ~not to build an app."
        sub="A system that gets abandoned is more expensive than no system. Saying this before the work starts is part of the job."
      >
        <div className="twoCol2">
          <div className="noteCard" data-rv>
            <h3 className="noteCard__t">When the problem is one step</h3>
            <p className="noteCard__d">
              Three people editing one file and pasting the wrong version is not a software problem. That is one
              template and a naming rule. No application needed.
            </p>
          </div>
          <div className="noteCard" data-rv>
            <h3 className="noteCard__t">When nobody will use it</h3>
            <p className="noteCard__d">
              Software only helps if people are willing to leave the old way behind. If they are not, I would rather
              say so up front than build something that quietly gets abandoned.
            </p>
          </div>
        </div>
      </Sheet>

      <section className="sec">
        <div className="wrap aboutStrip" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,300px)", gap: "clamp(20px,4vw,44px)", alignItems: "start" }}>
          <div>
            <p className="tag-line" style={{ marginBottom: 10 }}>
              Why me
            </p>
            <p className="aboutHero__p" style={{ marginTop: 0 }}>
              I finished vocational school in Software Engineering and I am now studying Information Systems. That puts
              me on both sides: writing the code, and tidying the business process behind it. The second one is usually
              what decides whether the software gets used at all — which is why this site shows you the process and the
              evidence, not a wall of features.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <a className="btn btn--sm" href="/tentang">
                Method →
              </a>
              <a className="btn btn--sm btn--ghost" href="/riwayat">
                History
              </a>
            </div>
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

      <SignOff />
    </>
  );
}