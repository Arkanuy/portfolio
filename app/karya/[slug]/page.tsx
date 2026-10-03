import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SignOff } from "@/components/trace/sheet";
import { StatusPill } from "@/components/trace/verify";
import { records, recordById, traceStats } from "@/lib/trace";

export function generateStaticParams() {
  return records.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) return { title: "Record not found" };
  return { title: r.title, description: r.summary };
}

export default async function CaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) notFound();

  const i = records.findIndex((x) => x.id === slug);
  const next = records[(i + 1) % records.length];

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta mono">
            <span>Record {r.no} of {records.length}</span>
            <span>{r.kind}</span>
            <span>{r.year}</span>
            {r.where && <span>{r.where}</span>}
            {r.badge && <span>{r.badge}</span>}
          </div>
          <h1 className="pageHero__t">{r.title}</h1>
          <p className="pageHero__s">{r.summary}</p>

          <div style={{ marginTop: 16 }}>
            <StatusPill state={r.state} />
          </div>

          <div className="caseMeta">
            <div>
              <span className="caseMeta__k">Stack</span>
              <span className="caseMeta__v">{r.stack}</span>
            </div>
            <div>
              <span className="caseMeta__k">Role</span>
              <span className="caseMeta__v">Designed and built</span>
            </div>
            <div>
              <span className="caseMeta__k">Context</span>
              <span className="caseMeta__v">{r.where ?? "Personal project"}</span>
            </div>
            <div>
              <span className="caseMeta__k">Evidence</span>
              <span className="caseMeta__v">{r.evidence}</span>
            </div>
            {r.external && (
              <div>
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

      <section className="wrap caseWrap">
        <div className="caseMedia">
          <div className="caseShot">
            <Image
              src={r.image}
              alt={`View of ${r.title}`}
              width={1400}
              height={876}
              priority
              sizes="(max-width: 1100px) 100vw, 1000px"
            />
          </div>
          <div className="caseShotAlt">
            <Image
              src={r.image}
              alt={`Detail of ${r.title}`}
              width={645}
              height={400}
              sizes="220px"
            />
            <span className="tiny mono" style={{ display: "block", padding: "7px 9px" }}>
              detail
            </span>
          </div>
          <p className="caseNote">{r.imageNote}</p>
        </div>

        <div className="caseBody">
          <div className="caseBlock" data-rv>
            <h2 className="caseBlock__k">The problem</h2>
            <p className="caseBlock__p">{r.problem}</p>
          </div>

          <div className="caseBlock" data-rv>
            <h2 className="caseBlock__k">What I built</h2>
            <ul className="caseBlock__list">
              {r.built.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="caseBlock" data-rv>
            <h2 className="caseBlock__k">Recorded outcome</h2>
            <p className="caseBlock__p">{r.evidence}</p>
          </div>

          <div className="caseBlock" data-rv>
            <h2 className="caseBlock__k">Evidence strength</h2>
            <p className="caseBlock__p">
              {r.state === "live" &&
                "Strongest available: the product runs in production and takes real orders. The source is private, so the artefact itself is the proof — not a repository."}
              {r.state === "public" &&
                "Strong: the source code is public and can be read line by line, so nothing here has to be taken on trust."}
              {r.state === "record" &&
                "Documented externally: the result is recorded in a competition and on the CV, which makes it checkable by a third party."}
              {r.state === "shipped" &&
                "Delivered work: it was handed over during a placement and used afterwards."}
              {r.state === "doc" &&
                "A document, deliberately: the value of this record is a requirements baseline written before code, not an application."}
              {r.state === "building" &&
                "Weakest of the finished work here, and labelled that way. It is in progress; treating it as a shipped product would be a false claim."}
              {r.state === "declared" && "No linked record. This entry exists in the list without a work record behind it."}
              {` This portfolio counts ${traceStats.records} records and reports ${traceStats.gaps} capabilities with no linked record.`}
            </p>
          </div>
        </div>

        <nav className="caseNav" aria-label="Other records">
          <a className="btn btn--ghost btn--sm" href="/karya">
            ← all records
          </a>
          <a className="caseNav__next" href={next.href}>
            <span className="mono">next record</span>
            <span className="caseNav__t">{next.title} →</span>
          </a>
        </nav>
      </section>

      <SignOff />
    </>
  );
}