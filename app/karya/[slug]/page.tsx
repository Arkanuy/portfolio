import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { records, recordById, STATUS } from "@/lib/records";

export function generateStaticParams() {
  return records.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) return { title: "Record not found" };
  return { title: r.title, description: r.summary };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) notFound();

  const i = records.findIndex((x) => x.id === slug);
  const next = records[(i + 1) % records.length];
  const st = STATUS[r.state];

  return (
    <>
      <section className="page">
        <div className="wrap">
          <h1 className="display page__t">{r.title}</h1>
          <p className="page__s lead">{r.summary}</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap spec">
          <div>
            <figure className="shot">
              <img src={r.image} alt={`View of ${r.title}`} width={1200} height={750} fetchPriority="high" decoding="async" />
            </figure>
            <p className="shot__cap">{r.imageNote}</p>

            <div className="body" style={{ marginTop: "clamp(28px,4vw,48px)" }}>
              <h2 className="display sec__h">The problem</h2>
              <p>{r.problem}</p>

              <h2 className="display sec__h" style={{ marginTop: 38 }}>
                What I built
              </h2>
              <ul>
                {r.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <h2 className="display sec__h" style={{ marginTop: 38 }}>
                Outcome
              </h2>
              <p>{r.evidence}</p>
              <p>{st.note}</p>
            </div>
          </div>

          <aside className="spec__aside">
            <div className="spec__grp">
              <p className="spec__k">Status</p>
              <p className="spec__v">
                <span className="st" data-s={r.state}>
                  {st.label}
                </span>
              </p>
            </div>
            <div className="spec__grp">
              <p className="spec__k">Year</p>
              <p className="spec__v mono">{r.year}</p>
            </div>
            <div className="spec__grp">
              <p className="spec__k">Kind</p>
              <p className="spec__v">{r.kind}</p>
            </div>
            <div className="spec__grp">
              <p className="spec__k">Stack</p>
              <p className="spec__v">{r.stack}</p>
            </div>
            {r.where && (
              <div className="spec__grp">
                <p className="spec__k">Context</p>
                <p className="spec__v">{r.where}</p>
              </div>
            )}
            {r.external && (
              <div className="spec__grp">
                <p className="spec__k">Public artefact</p>
                <p className="spec__v">
                  <a href={r.external.href} target="_blank" rel="noopener noreferrer">
                    {r.external.label}
                  </a>
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <nav className="nextrow" aria-label="Other work">
            <a href="/karya">← All work</a>
            <span>
              Next record &nbsp;
              <a href={next.href}>{next.title} →</a>
            </span>
          </nav>
        </div>
      </section>
    </>
  );
}
