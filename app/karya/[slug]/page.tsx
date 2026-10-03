import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CTABand } from "@/components/ui/section";
import { cases, caseBySlug } from "@/lib/site";

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) return { title: "Case study not found" };
  return { title: c.title, description: c.summary };
}

export default async function CaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) notFound();

  const i = cases.findIndex((x) => x.slug === slug);
  const next = cases[(i + 1) % cases.length];

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow">
            Case {c.no} · {c.kind} · {c.year}
            {c.badge ? ` · ${c.badge}` : ""}
          </p>
          <h1 className="pageHero__t">{c.title}</h1>
          <p className="pageHero__s">{c.summary}</p>

          <div className="caseMeta">
            <div>
              <span className="caseMeta__k">Stack</span>
              <span className="caseMeta__v">{c.stack}</span>
            </div>
            <div>
              <span className="caseMeta__k">Role</span>
              <span className="caseMeta__v">Rolecang & pembangun</span>
            </div>
            <div>
              <span className="caseMeta__k">Context</span>
              <span className="caseMeta__v">{c.where}</span>
            </div>
            {c.link && (
              <div>
                <span className="caseMeta__k">Link</span>
                <span className="caseMeta__v">
                  <a href={c.link.href} target="_blank" rel="noopener noreferrer">
                    {c.link.label} ↗
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="wrap caseMedia">
        <div className="caseShot">
          <Image src={c.image} alt={`View of ${c.title}`} width={1400} height={876} priority sizes="(max-width: 1100px) 100vw, 1100px" />
        </div>
        {c.imageAlt && (
          <div className="caseShotAlt">
            <Image src={c.imageAlt} alt={`Mobile view of ${c.title}`} width={645} height={1320} sizes="220px" />
            <span className="tiny">mobile view</span>
          </div>
        )}
        <p className="caseNote">{c.imageNote}</p>
      </section>

      <section className="wrap caseBody">
        <div data-fx className="caseBlock" >
          <h2 className="caseBlock__k">The problem</h2>
          <p className="caseBlock__p">{c.problem}</p>
        </div>

        <div data-fx className="caseBlock" >
          <h2 className="caseBlock__k">What I built</h2>
          <ul className="caseBlock__list">
            {c.did.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div data-fx className="caseBlock" >
          <h2 className="caseBlock__k">The outcome</h2>
          <p className="caseBlock__p">{c.result}</p>
        </div>
      </section>

      <nav className="wrap caseNav" aria-label="Other work">
        <a className="caseNav__link" href="/karya">
          ← all work
        </a>
        <a className="caseNav__next" href={`/karya/${next.slug}`}>
          <span className="tiny">next</span>
          <span className="caseNav__t">{next.title} →</span>
        </a>
      </nav>

      <CTABand />
    </>
  );
}
