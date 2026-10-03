import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Layanan tidak ditemukan" };
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
          <p className="stamp stamp--accent">Layanan {s.no}</p>
          <h1 className="page__h">{s.name}</h1>
          <p className="page__s">{s.tagline}</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div className="art">
            <header className="head">
              <span className="head__r" />
              <h2 className="sec__h">Untuk siapa</h2>
            </header>
            <p>{s.for}</p>

            <header className="head" style={{ marginTop: 32 }}>
              <span className="head__r" />
              <h2 className="sec__h">Yang termasuk</h2>
            </header>
            <ul>
              {s.includes.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>

            <header className="head" style={{ marginTop: 32 }}>
              <span className="head__r" />
              <h2 className="sec__h">Bukti</h2>
            </header>
            <p>{s.proof}</p>
            <p style={{ marginTop: 22 }}>
              <a className="btn" href="/kontak">
                Ceritakan proyeknya <i aria-hidden="true">→</i>
              </a>
            </p>
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Nomor</p>
                <p className="rail__v mono">{s.no}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Titik mulai</p>
                <p className="rail__v">{s.from}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Layanan lain</p>
                <ul style={{ display: "grid", gap: 6, marginTop: 6 }}>
                  {others.map((o) => (
                    <li key={o.slug}>
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
