import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sec, CTA } from "@/components/drift/sec";
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
          <p className="eyebrow" data-as>
            Service {s.no} · {s.name}
          </p>
          <h1 className="pageHero__t" data-as data-dp="0.14">
            {s.name}
          </h1>
          <p className="pageHero__s" data-as style={{ ["--as-d" as string]: "240ms" }}>
            {s.tagline}
          </p>
          <p className="svcRow__proof" style={{ maxWidth: 720, marginTop: 26 }} data-as>
            <strong>Evidence:</strong> {s.proof}
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="spots">
            <div className="svcRow" style={{ gridTemplateColumns: "minmax(0,1fr)" }} data-as data-dp="0.1">
              <span className="svcRow__no mono">{s.no}</span>
              <div>
                <p className="svcRow__for">
                  <strong>Who it is for:</strong> {s.for}
                </p>
                <h2 className="svcRow__name" style={{ marginTop: 22, fontSize: 22 }}>
                  What is included
                </h2>
                <ul className="svcRow__list">
                  {s.includes.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <p className="svcRow__proof">
                  <strong>Starting point:</strong> {s.from}
                </p>
                <div style={{ marginTop: 20 }}>
                  <a className="btn btn--go" href="/kontak">
                    Tell me about the project →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sec eyebrow="Also available" title="The other three.">
        <div className="svcGrid">
          {others.map((o, i) => (
            <a className="svcCard" key={o.slug} href={`/layanan/${o.slug}`} data-as data-dp={i % 2 ? "-0.1" : "0.1"} style={{ ["--as-d" as string]: `${i * 90}ms` }}>
              <p className="svcCard__n mono">{o.no}</p>
              <h3 className="svcCard__t">{o.name}</h3>
              <p className="svcCard__d">{o.tagline}</p>
            </a>
          ))}
        </div>
      </Sec>

      <CTA />
    </>
  );
}
