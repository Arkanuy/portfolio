import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetType, DrawRule } from "@/components/edition/type";
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

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== slug);

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">Service {s.no}</p>
          <SetType as="h1" className="page__h" text={s.name} />
          <p className="page__s dek">{s.tagline}</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div className="art">
            <SetType as="h2" className="sec__h" text="Who it is for" />
            <p>{s.for}</p>

            <SetType as="h2" className="sec__h" text="What is included" />
            <ul>
              {s.includes.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>

            <SetType as="h2" className="sec__h" text="Evidence" />
            <p>{s.proof}</p>
            <p style={{ marginTop: 20 }}>
              <a className="btn" href="/kontak">
                Tell me about the project <i aria-hidden="true">→</i>
              </a>
            </p>
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Number</p>
                <p className="rail__v mono">{s.no}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Starting point</p>
                <p className="rail__v">{s.from}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Other services</p>
                <ul>
                  {others.map((o) => (
                    <li key={o.slug} style={{ marginTop: 6 }}>
                      <a className="rail__v" style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)" }} href={`/layanan/${o.slug}`}>
                        {o.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
