import type { Metadata } from "next";
import { Sec, CTA } from "@/components/drift/sec";
import { Spot, Tilt, Ticker, ScrollBar } from "@/components/drift/interact";
import { WordFlow } from "@/components/drift/word-flow";
import { site, services, process, cases } from "@/lib/site";
import { records } from "@/lib/records";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.bio,
};

export default function Home() {
  const showcase = records.slice(0, 5);

  return (
    <>
      <ScrollBar />

      {/* ==================== HERO ==================== */}
      <section className="hero">
        <div className="wrap">
          <p className="hero__eyebrow" data-as data-drift data-drift-x="9" data-drift-y="11">
            <span className="hero__dot" aria-hidden="true" />
            {site.badge} — {site.place}
          </p>

          {/* Nama menumpuk di tiga baris; tiap baris datang dari arah sendiri.
              Tiap baris juga drift dengan kecepatan berbeda (data-dp), jadi
              saat digulir ketiganya berpisah — itu yang terasa seperti ruang. */}
          <h1 className="hero__name">
            <span data-as data-dp="0.5" data-dps="0">
              ARKAN
            </span>
            <span data-as data-dp="-0.22">
              MUSTOFA
            </span>
          </h1>

          <p className="hero__tagline" data-as data-dp="0.34" style={{ ["--as-d" as string]: "360ms" }}>
            Software that gets used, not just shipped.
          </p>

          <div className="hero__grid">
            <div>
              <p className="hero__lede" data-as style={{ ["--as-d" as string]: "420ms" }}>
                I study <b>Information Systems</b> in Bandung and build business software, web apps, and automation.
                My rule is simple: map the process first, then write the code — because the problem is rarely the code.
              </p>

              <div className="hero__actions" data-as data-drift data-drift-x="7" data-drift-y="9" style={{ ["--as-d" as string]: "520ms" }}>
                <a className="btn btn--go" href="/karya">
                  See the work →
                </a>
                <a className="btn btn--ghost" href="/kontak">
                  Start a project
                </a>
              </div>

              {/* Tickernya punya dua baris, dua arah, dua kecepatan — terbaca
                  sebagai kedalaman, bukan band datar. */}
              <Ticker items={["Laravel", "Next.js", "TypeScript", "Node.js", "PHP", "Tailwind", "REST API", "Git", "Discord bots"]} />
            </div>

            <Tilt className="portrait" >
              <div className="portrait__frame" data-as style={{ ["--as-y" as string]: "52px", ["--as-d" as string]: "260ms" }}>
                <img
                  className="portrait__img"
                  src="/github/arkan-avatar-680.webp"
                  alt={`Portrait of ${site.name}`}
                  width={340}
                  height={340}
                  fetchPriority="high"
                  decoding="async"
                />
                <span className="portrait__ring" aria-hidden="true" />
              </div>
              {/* Keterangan ADA DI BAWAH foto — tidak ada yang menutupi wajah. */}
              <div className="portrait__below">
                <span className="chip chip--hot">{site.name}</span>
                <span className="chip">{site.handle}</span>
              </div>
            </Tilt>
          </div>
        </div>
      </section>

      {/* ==================== 01 · SERVICES ==================== */}
      <Sec
        eyebrow="Services"
        title="Four things I ~actually do."
        sub="No sales list. Every one of these comes from work that already exists in the case studies."
      >
        <div className="spots">
          {services.map((s, i) => (
            <Spot key={s.slug}>
              <a href={`/layanan/${s.slug}`} data-as style={{ ["--as-d" as string]: `${i * 90}ms` }}>
                <span className="spot__n mono">{s.no}</span>
                <h3 className="spot__t">{s.name}</h3>
                <p className="spot__d">{s.tagline}</p>
                <p className="spot__d" style={{ color: "var(--cyan-ink)", marginTop: 14 }}>
                  Read more →
                </p>
              </a>
            </Spot>
          ))}
        </div>
      </Sec>

      {/* ==================== 02 · WORK ==================== */}
      <Sec
        eyebrow="Selected work"
        title="Already ~running."
        sub="Five of seven records. Each one has its own page with the problem, what I built, and the outcome."
      >
        <div className="reel">
          {showcase.map((r, i) => (
            <div className="row glass" key={r.id} data-as data-dp={i % 2 ? "-0.09" : "0.13"} style={{ ["--as-d" as string]: `${i * 70}ms` }}>
              <div className="row__no mono">{r.no}</div>
              <div className="row__body">
                <h3 className="row__t">
                  <a href={r.href}>{r.title}</a>
                </h3>
                <p className="row__meta">
                  {r.kind} · {r.year}
                  {r.where ? ` · ${r.where}` : ""}
                </p>
                <p className="row__sum">{r.summary}</p>
                <div className="row__tag">
                  {r.state === "live" && <span className="tag tag--hot">In production</span>}
                  {r.state === "public" && <span className="tag tag--cool">Source public</span>}
                  {r.state === "building" && <span className="tag">In progress</span>}
                  {r.state === "record" && <span className="tag tag--hot">Awarded</span>}
                  {r.state === "shipped" && <span className="tag">Delivered</span>}
                  {r.state === "doc" && <span className="tag tag--cool">Document</span>}
                </div>
              </div>
              <div className="row__shot">
                <img src={r.image} alt={`${r.title} preview`} width={1200} height={751} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
              </div>
              <div className="row__act">
                <a className="btn btn--ghost btn--sm btn--wide" href={r.href}>
                  Case study
                </a>
                {r.external && (
                  <a className="btn btn--ghost btn--sm btn--wide" href={r.external.href} target="_blank" rel="noopener noreferrer">
                    {r.external.label}
                  </a>
                )}
                {!r.external && <span className="row__ev">Source not public</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26 }} data-as>
          <a className="btn btn--ghost" href="/karya">
            All work ({records.length})
          </a>
        </div>
      </Sec>

      {/* ==================== 03 · PROCESS ==================== */}
      <Sec
        eyebrow="How I work"
        title="Four steps, ~in order."
        sub="The order is the method. If step two has no document, the feature list was invented while coding — and that is what makes people abandon software."
      >
        <div className="steps">
          {process.map((p, i) => (
            <div className="step" key={p.no} data-as data-dp={i % 2 ? "0.1" : "-0.14"} style={{ ["--as-y" as string]: "46px", ["--as-d" as string]: `${i * 110}ms` }}>
              <span className="step__n mono">{p.no}</span>
              <h3 className="step__t">{p.title}</h3>
              <p className="step__d">{p.body}</p>
              <p className="step__out mono">
                → {p.no === "01" ? "current-state map" : p.no === "02" ? "requirement list" : p.no === "03" ? "working build" : "handover notes"}
              </p>
            </div>
          ))}
        </div>
      </Sec>

      {/* ==================== 04 · QUOTE ==================== */}
      <section className="sec">
        <div className="wrap">
          <div className="quote">
            <p className="eyebrow" data-as>
              The rule
            </p>
            <h2 className="quote__t">
              <WordFlow text="The problem is rarely the ~code. It is the ~flow — who does what, and where the work gets stuck." />
            </h2>
            <p className="quote__s mono" data-as style={{ ["--as-d" as string]: "220ms" }}>
              {site.name} · {site.place} · {cases.length} case studies
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
