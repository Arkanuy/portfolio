import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, CTABand } from "@/components/ui/section";
import { services } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Service not found" };
  return { title: s.name, description: s.tagline };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();

  const others = services.filter((x) => x.slug !== slug);

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow">
            Service {s.no} · {s.name}
          </p>
          <h1 className="pageHero__t">
            {s.name}
          </h1>
          <p className="pageHero__s">{s.tagline}</p>
        </div>
      </section>

      <Section>
        <div className="svcDetail">
          <div>
            <p className="svcRow__for">
              <strong>Who it is for:</strong> {s.for}
            </p>
            <h2 className="h2" style={{ marginTop: 28 }}>
              What is included
            </h2>
            <ul className="svcRow__list">
              {s.includes.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <aside className="svcAside">
            <p className="svcAside__k">Evidence</p>
            <p className="svcAside__v">{s.proof}</p>
            <p className="svcAside__k">Starting point</p>
            <p className="svcAside__v">{s.from}</p>
            <a className="btn btn--dark" href="/kontak">
              Tell me about the project
              <span aria-hidden="true">→</span>
            </a>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Other services" titleText="Also ~available." tint>
        <div className="svcGrid">
          {others.map((o) => (
            <div key={o.slug} className="svc">
              <a className="svc__link" href={`/layanan/${o.slug}`}>
                <span className="svc__no">{o.no}</span>
                <span className="svc__name">{o.name}</span>
                <span className="svc__tag">{o.tagline}</span>
                <span className="svc__for">{o.for}</span>
                <span className="svc__go">
                  Read more
                  <i aria-hidden="true">→</i>
                </span>
              </a>
            </div>
          ))}
        </div>
      </Section>

      <CTABand />
    </>
  );
}
