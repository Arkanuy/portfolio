import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { records, recordById, STATUS } from "@/lib/records";

export function generateStaticParams() {
  return records.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) return { title: "Catatan tidak ditemukan" };
  return { title: r.title, description: r.summary };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) notFound();
  const i = records.findIndex((x) => x.id === slug);
  const next = records[(i + 1) % records.length];
  const st = STATUS[r.state];

  const chars = [
    { name: "status", type: "enum", value: st.label },
    { name: "kind", type: "string", value: r.kind },
    { name: "year", type: "number", value: r.year },
    { name: "stack", type: "string", value: r.stack },
    ...(r.where ? [{ name: "context", type: "string", value: r.where }] : []),
  ];

  return (
    <article className="page">
      <p className="k">
        {r.kind} · {r.year}
      </p>
      <h1 className="h1" style={{ marginTop: 10 }}>
        {r.title}
      </h1>
      <p className="lede">{r.summary}</p>

      <div className="chips">
        <span className="chip chip--sig">{st.label}</span>
        {r.external && <span className="chip chip--sig2">artefak publik</span>}
        {r.where && <span className="chip">{r.where}</span>}
      </div>

      <section className="spec">
        <div className="spec__ti">
          <span className="k" style={{ color: "var(--ink-2)" }}>
            Spesifikasi
          </span>
        </div>
        <table className="tbl">
          <tbody>
            {chars.map((c) => (
              <tr key={c.name}>
                <td className="tbl__f">{c.name}</td>
                <td className="tbl__ty">{c.type}</td>
                <td className="tbl__v">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <h2 className="h2">Masalahnya</h2>
      <p className="p">{r.problem}</p>

      <h2 className="h2">Yang dibangun</h2>
      <ol className="steps">
        {r.built.map((b, k) => (
          <li className="step" key={b}>
            <span className="step__n">{k + 1}</span>
            <div>
              <p className="step__t">{b}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="h2">Hasil tercatat</h2>
      <p className="p">{r.evidence}</p>

      <figure className="fig" style={{ marginTop: 24 }}>
        <img src={r.image} alt={`Tampilan ${r.title}`} width={1200} height={750} fetchPriority="high" decoding="async" />
      </figure>
      <p className="figcap">{r.imageNote}</p>

      <section className="keep">
        <svg className="keep__i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <div>
          <p className="keep__t">Kekuatan bukti</p>
          <p className="keep__d">{st.note}</p>
        </div>
      </section>

      <div style={{ marginTop: 26, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a className="btn" href="/karya">
          ← Katalog
        </a>
        <a className="btn btn--sig" href={next.href}>
          Berikutnya: {next.title} <span aria-hidden="true">→</span>
        </a>
        {r.external && (
          <a className="btn" href={r.external.href} target="_blank" rel="noopener noreferrer">
            {r.external.label}
          </a>
        )}
      </div>
    </article>
  );
}
