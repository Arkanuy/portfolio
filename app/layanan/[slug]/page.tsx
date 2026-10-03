import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sheet, SignOff } from "@/components/trace/sheet";
import { services } from "@/lib/site";
import { records } from "@/lib/trace";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Work type not found" };
  return { title: s.name, description: s.tagline };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();

  const others = services.filter((x) => x.slug !== slug);
  const linked = records.filter((r) =>
    slug === "business-systems"
      ? r.state === "live" || r.state === "record"
      : slug === "web"
        ? r.state === "shipped" || r.state === "public"
        : slug === "analysis"
          ? r.state === "doc"
          : r.title === "PixWatch" || r.title === "BuildPlan",
  );

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta mono">
            <span>Work type {s.no} / 04</span>
            <span>{linked.length} linked records</span>
          </div>
          <h1 className="pageHero__t">{s.name}</h1>
          <p className="pageHero__s">{s.tagline}</p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap">
          <div className="svcDetail">
            <div>
              <p className="svcRow__for">
                <strong>Who it is for:</strong> {s.for}
              </p>
              <h2 className="caseBlock__k" style={{ marginTop: 24 }}>
                What is included
              </h2>
              <ul className="svcRow__list">
                {s.includes.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>

              <h2 className="caseBlock__k" style={{ marginTop: 24 }}>
                Records that prove it
              </h2>
              <div className="ccGrid" style={{ borderTop: "1px solid var(--ink)" }}>
                {linked.map((r) => (
                  <a className="cc" key={r.id} href={r.href} style={{ gridTemplateColumns: "44px minmax(0,1fr) 150px" }}>
                    <span className="cc__no mono">{r.no}</span>
                    <span>
                      <span className="cc__title" style={{ display: "block", fontSize: 18 }}>
                        {r.title}
                      </span>
                      <span className="cc__ev" style={{ display: "block" }}>
                        {r.evidence}
                      </span>
                    </span>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                      open case study →
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <aside className="svcAside">
              <p className="svcAside__k">Evidence</p>
              <p className="svcAside__v">{s.proof}</p>
              <p className="svcAside__k">Starting point</p>
              <p className="svcAside__v">{s.from}</p>
              <a className="btn btn--fill btn--sm btn--wide" href="/kontak">
                Tell me about the project →
              </a>
            </aside>
          </div>
        </div>
      </section>

      <Sheet k="Key 03.2 / Also" title="The other three kinds of ~work.">
        <div className="svcGrid">
          {others.map((o) => (
            <div className="svc" key={o.slug}>
              <a className="svc__link" href={`/layanan/${o.slug}`}>
                <span className="svc__no">{o.no}</span>
                <span className="svc__name">{o.name}</span>
                <span className="svc__tag">{o.tagline}</span>
                <span className="svc__for">{o.for}</span>
                <span className="svc__go">
                  Detail <i aria-hidden="true">→</i>
                </span>
              </a>
            </div>
          ))}
        </div>
      </Sheet>

      <SignOff />
    </>
  );
}