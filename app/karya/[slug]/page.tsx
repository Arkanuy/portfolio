import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetType, DrawRule, Rise } from "@/components/edition/type";
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
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">
            {r.kind.split("·")[0].trim()} · {r.year}
          </p>
          <SetType as="h1" className="page__h" text={r.title} />
          <p className="page__s dek">{r.summary}</p>
          <p className="byline" style={{ marginTop: 18 }}>
            By <b>Arkan Mustofa</b> · {r.where ?? "Personal project"} · filed {r.year}
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div>
            <figure className="figure">
              <img src={r.image} alt={`View of ${r.title}`} width={1200} height={750} fetchPriority="high" decoding="async" />
            </figure>
            <p className="figcap mono">{r.imageNote}</p>

            <div className="art" style={{ marginTop: "clamp(26px,3.6vw,44px)" }}>
              <SetType as="h2" className="sec__h" text="The problem" />
              <p className="art__drop" style={{ marginTop: 14 }}>
                {r.problem}
              </p>

              <SetType as="h2" className="sec__h" text="What I built" />
              <ul>
                {r.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <SetType as="h2" className="sec__h" text="Outcome" />
              <p>{r.evidence}</p>
              <p>{st.note}</p>
            </div>
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Status</p>
                <p className="rail__v">
                  <span className="st" data-s={r.state}>
                    {st.label}
                  </span>
                </p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Year</p>
                <p className="rail__v mono">{r.year}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Kind</p>
                <p className="rail__v">{r.kind}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Stack</p>
                <p className="rail__v">{r.stack}</p>
              </div>
              {r.where && (
                <div className="rail__g">
                  <p className="rail__k">Context</p>
                  <p className="rail__v">{r.where}</p>
                </div>
              )}
              {r.external && (
                <div className="rail__g">
                  <p className="rail__k">Public artefact</p>
                  <p className="rail__v">
                    <a href={r.external.href} target="_blank" rel="noopener noreferrer">
                      {r.external.label}
                    </a>
                  </p>
                </div>
              )}
              <div className="rail__g">
                <p className="rail__k">Next</p>
                <p className="rail__v">
                  <a href={next.href}>{next.title} →</a>
                </p>
              </div>
            </div>
            <p style={{ marginTop: 18 }}>
              <a className="btn btn--line" href="/karya">
                ← All records
              </a>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
