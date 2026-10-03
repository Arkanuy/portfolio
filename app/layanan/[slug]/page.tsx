import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
          <h1 className="display page__t">{s.name}</h1>
          <p className="page__s lead">{s.tagline}</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap spec">
          <div className="body">
            <h2 className="display sec__h">Who it is for</h2>
            <p>{s.for}</p>

            <h2 className="display sec__h" style={{ marginTop: 38 }}>
              What is included
            </h2>
            <ul>
              {s.includes.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>

            <h2 className="display sec__h" style={{ marginTop: 38 }}>
              Evidence
            </h2>
            <p>{s.proof}</p>
            <p className="open__links">
              <a href="/kontak">Tell me about the project</a>
            </p>
          </div>

          <aside className="spec__aside">
            <div className="spec__grp">
              <p className="spec__k">Number</p>
              <p className="spec__v mono">{s.no}</p>
            </div>
            <div className="spec__grp">
              <p className="spec__k">Starting point</p>
              <p className="spec__v">{s.from}</p>
            </div>
            <div className="spec__grp">
              <p className="spec__k">Other services</p>
              <ul style={{ display: "grid", gap: 6 }}>
                {others.map((o) => (
                  <li key={o.slug}>
                    <a className="spec__v" style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)" }} href={`/layanan/${o.slug}`}>
                      {o.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
