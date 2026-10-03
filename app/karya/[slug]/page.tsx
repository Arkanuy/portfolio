import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { encode, byColumn } from "@/lib/punch";
import { records, recordById, STATUS } from "@/lib/records";

export function generateStaticParams() {
  return records.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) return { title: "Kartu tidak ditemukan" };
  return { title: r.title, description: r.summary };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = recordById(slug);
  if (!r) notFound();

  const i = records.findIndex((x) => x.id === slug);
  const next = records[(i + 1) % records.length];
  const st = STATUS[r.state];
  const code = encode({ slug: r.id, title: r.title, year: r.year, state: r.state, built: r.built.length });
  const cols = byColumn(code);
  const open = new Set(code.holes.map((h: { col: number; row: number }) => `${h.col}:${h.row}`));
  const cw = 100 / code.columns;
  const rh = 100 / code.rows;

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="stamp stamp--accent">
            Kartu {r.no} · {r.year} · {r.kind}
          </p>
          <h1 className="page__h">{r.title}</h1>
          <p className="page__s">{r.summary}</p>
          <p className="stamp" style={{ marginTop: 16 }}>
            {r.where ?? "Proyek pribadi"} · {st.label}
          </p>
        </div>
      </section>

      {/* kartu lengkapnya, ukuran penuh */}
      <section className="wrap" style={{ paddingBottom: "clamp(20px,3vw,34px)" }}>
        <div className="card" data-lifted="true" data-in="true">
          <header className="card__head">
            <span className="card__no">{r.no}</span>
            <span className="card__title">{r.title}</span>
            <span>{code.holes.length} lubang</span>
          </header>
          <div className="field">
            <svg
              className="field__grid"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Punch card ${r.no}: ${code.holes.length} holes`}
            >
              {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((c) => (
                <line key={`g${c}`} className="field__guide" x1={c * cw} y1="0" x2={c * cw} y2="20" vectorEffect="non-scaling-stroke" />
              ))}
              {Array.from({ length: code.rows }, (_, k) => k).map((k) => (
                <line key={`h${k}`} className="field__guide" x1="0" y1={k * rh * 2} x2="100" y2={k * rh * 2} vectorEffect="non-scaling-stroke" />
              ))}
              {cols.map(({ col, rows }) => (
                <g className="field__col" key={col} data-col={col}>
                  {rows.map((row) => (
                    <rect key={`${col}:${row}`} x={(col - 0.86) * cw} y={(row * rh + rh * 0.14) * 2} width={cw * 0.72} height={rh * 1.72} />
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div className="art">
            <header className="head">
              <span className="head__r" />
              <h2 className="sec__h">Masalahnya</h2>
            </header>
            <p>{r.problem}</p>

            <header className="head" style={{ marginTop: 34 }}>
              <span className="head__r" />
              <h2 className="sec__h">Yang saya bangun</h2>
            </header>
            <ul>
              {r.built.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <header className="head" style={{ marginTop: 34 }}>
              <span className="head__r" />
              <h2 className="sec__h">Hasilnya</h2>
            </header>
            <p>{r.evidence}</p>
            <p>{st.note}</p>

            <figure className="fig" style={{ marginTop: 30 }}>
              <img src={r.image} alt={`Tampilan ${r.title}`} width={1200} height={750} fetchPriority="high" decoding="async" />
            </figure>
            <p className="figcap">{r.imageNote}</p>
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Status</p>
                <p className="rail__v">{st.label}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Stack</p>
                <p className="rail__v">{r.stack}</p>
              </div>
              {r.external && (
                <div className="rail__g">
                  <p className="rail__k">Artefak publik</p>
                  <p className="rail__v">
                    <a href={r.external.href} target="_blank" rel="noopener noreferrer">
                      {r.external.label}
                    </a>
                  </p>
                </div>
              )}
              <div className="rail__g">
                <p className="rail__k">Kartu berikutnya</p>
                <p className="rail__v">
                  <a href={next.href}>{next.title} →</a>
                </p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Cara membaca</p>
                {code.legend.slice(0, 5).map((l) => (
                  <p className="code__r" key={`${l.col}:${l.row}`}>
                    <span className="code__c">
                      k{l.col}/b{l.row}
                    </span>
                    <span>{l.text}</span>
                  </p>
                ))}
              </div>
            </div>
            <p style={{ marginTop: 18 }}>
              <a className="btn btn--line" href="/karya">
                ← Semua kartu
              </a>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
