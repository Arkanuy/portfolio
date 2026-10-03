import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTA } from "@/components/drift/sec";
import { records, recordById } from "@/lib/records";

export function generateStaticParams() {
  return records.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) return { title: "Record not found" };
  return { title: r.title, description: r.summary };
}

const STATE_TONE: Record<string, { label: string; cls: string; note: string }> = {
  live: { label: "In production", cls: "tag--hot", note: "Running right now, taking real orders. The source is private, so the product itself is the proof." },
  public: { label: "Source public", cls: "tag--cool", note: "The code can be read line by line, so nothing here needs to be taken on trust." },
  record: { label: "Awarded", cls: "tag--hot", note: "Recorded by a third party in a competition, which makes it externally checkable." },
  shipped: { label: "Delivered", cls: "", note: "Handed over during a placement and used afterwards." },
  doc: { label: "Document", cls: "tag--cool", note: "The value here is a requirements baseline written before any code, not an application." },
  building: { label: "In progress", cls: "", note: "Not finished, and labelled that way. Calling it shipped would be a false claim." },
  declared: { label: "Unproven", cls: "", note: "Listed without a work record behind it." },
};

export default async function CaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) notFound();

  const i = records.findIndex((x) => x.id === slug);
  const next = records[(i + 1) % records.length];
  const tone = STATE_TONE[r.state] ?? STATE_TONE.declared;

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta" data-as>
            <span className="mono" style={{ fontSize: 13, color: "var(--text-3)" }}>
              Record {r.no} of {records.length}
            </span>
            <span className={`tag ${tone.cls}`}>{tone.label}</span>
          </div>

          <h1 className="pageHero__t" data-as data-dp="0.14">
            {r.title}
          </h1>
          <p className="pageHero__s" data-as style={{ ["--as-d" as string]: "260ms" }}>
            {r.summary}
          </p>

          <div className="caseMeta">
            <div data-as style={{ ["--as-d" as string]: "340ms" }}>
              <span className="caseMeta__k">Stack</span>
              <span className="caseMeta__v">{r.stack}</span>
            </div>
            <div data-as style={{ ["--as-d" as string]: "400ms" }}>
              <span className="caseMeta__k">Role</span>
              <span className="caseMeta__v">Designed and built</span>
            </div>
            <div data-as style={{ ["--as-d" as string]: "460ms" }}>
              <span className="caseMeta__k">Context</span>
              <span className="caseMeta__v">{r.where ?? "Personal project"}</span>
            </div>
            {r.external && (
              <div data-as style={{ ["--as-d" as string]: "520ms" }}>
                <span className="caseMeta__k">Public artefact</span>
                <span className="caseMeta__v">
                  <a href={r.external.href} target="_blank" rel="noopener noreferrer">
                    {r.external.label} ↗
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <figure className="caseShot" data-as data-dp="0.08" data-dps="0.02">
            <img src={r.image} alt={`View of ${r.title}`} width={1400} height={876} fetchPriority="high" decoding="async" />
          </figure>
          <p className="caseNote mono" data-as>
            {r.imageNote}
          </p>

          <div className="caseBody">
            <div className="caseBlock" data-as data-dp="-0.06">
              <h2 className="caseBlock__k">The problem</h2>
              <p className="caseBlock__p">{r.problem}</p>
            </div>

            <div className="caseBlock" data-as data-dp="0.09" style={{ ["--as-d" as string]: "80ms" }}>
              <h2 className="caseBlock__k">What I built</h2>
              <ul className="caseBlock__list">
                {r.built.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="caseBlock" data-as data-dp="-0.08" style={{ ["--as-d" as string]: "140ms" }}>
              <h2 className="caseBlock__k">Outcome</h2>
              <p className="caseBlock__p">{r.evidence}</p>
              <p className="caseBlock__p" style={{ color: "var(--text-3)", fontSize: 14 }}>
                {tone.note}
              </p>
            </div>
          </div>

          <nav className="caseNav" aria-label="Other work">
            <a className="btn btn--ghost btn--sm" href="/karya">
              ← all work
            </a>
            <a href={next.href} style={{ textAlign: "right" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", display: "block" }}>
                next record
              </span>
              <span className="caseNav__t">{next.title} →</span>
            </a>
          </nav>
        </div>
      </section>

      <CTA />
    </>
  );
}
