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
    <article className="page">
      <p className="k">Layanan {s.no}</p>
      <h1 className="h1" style={{ marginTop: 10 }}>
        {s.name}
      </h1>
      <p className="lede">{s.tagline}</p>

      <section className="spec">
        <div className="spec__ti">
          <span className="k" style={{ color: "var(--ink-2)" }}>
            Spesifikasi
          </span>
        </div>
        <table className="tbl">
          <tbody>
            <tr>
              <td className="tbl__f">untuk</td>
              <td className="tbl__ty">string</td>
              <td className="tbl__v">{s.for}</td>
            </tr>
            <tr>
              <td className="tbl__f">termasuk</td>
              <td className="tbl__ty">array[{s.includes.length}]</td>
              <td className="tbl__v">
                <ol className="steps" style={{ marginTop: 0, borderTop: 0 }}>
                  {s.includes.map((it, i) => (
                    <li className="step" key={it} style={{ padding: "8px 0" }}>
                      <span className="step__n">{i + 1}</span>
                      <p className="step__t" style={{ fontWeight: 400 }}>
                        {it}
                      </p>
                    </li>
                  ))}
                </ol>
              </td>
            </tr>
            <tr>
              <td className="tbl__f">bukti</td>
              <td className="tbl__ty">record</td>
              <td className="tbl__v">{s.proof}</td>
            </tr>
            <tr>
              <td className="tbl__f">titik mulai</td>
              <td className="tbl__ty">string</td>
              <td className="tbl__v">{s.from}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <h2 className="h2">Layanan lain</h2>
      <div className="chips">
        {others.map((o) => (
          <a className="chip" key={o.slug} href={`/layanan/${o.slug}`}>
            {o.no} · {o.name}
          </a>
        ))}
      </div>

      <p style={{ marginTop: 22 }}>
        <a className="btn btn--sig" href="/kontak">
          Ceritakan proyeknya <span aria-hidden="true">→</span>
        </a>
      </p>
    </article>
  );
}
