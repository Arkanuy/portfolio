import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Split, Reveal } from "@/components/field/motion";
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
          <p className="kicker" data-reveal>
            {r.kind} · {r.year}
          </p>
          <Split as="h1" className="serif page__h" text={r.title} />
          <p className="page__s lead" data-reveal style={{ ["--d" as string]: "160ms" }}>
            {r.summary}
          </p>
          <p className="small mono" data-reveal style={{ marginTop: 18, ["--d" as string]: "240ms" }}>
            By Arkan Mustofa · {r.where ?? "Personal project"}
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap split">
          <div>
            <Reveal>
              <figure className="fig" data-scrub>
                <img src={r.image} alt={`View of ${r.title}`} width={1200} height={750} fetchPriority="high" decoding="async" />
              </figure>
              <p className="figcap mono">{r.imageNote}</p>
            </Reveal>

            <div className="art" style={{ marginTop: "clamp(26px,4vw,46px)" }}>
              <Reveal>
                <Split as="h2" className="serif" text="The problem" style={{ fontSize: "clamp(22px,3vw,38px)" }} />
                <p style={{ marginTop: 14 }}>{r.problem}</p>
              </Reveal>
              <Reveal delay={80}>
                <Split as="h2" className="serif" text="What I built" style={{ fontSize: "clamp(22px,3vw,38px)" }} />
                <ul>
                  {r.built.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={140}>
                <Split as="h2" className="serif" text="Outcome" style={{ fontSize: "clamp(22px,3vw,38px)" }} />
                <p>{r.evidence}</p>
                <p>{st.note}</p>
              </Reveal>
            </div>
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Status</p>
                <p className="rail__v card__st mono" data-s={r.state}>
                  {st.label}
                </p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Year</p>
                <p className="rail__v mono">{r.year}</p>
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
            <p style={{ marginTop: 20 }}>
              <a className="btn btn--line" href="/karya">
                <span className="btn__fill" aria-hidden="true" />
                ← All records
              </a>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
