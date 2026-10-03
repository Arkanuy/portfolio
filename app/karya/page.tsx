import type { Metadata } from "next";
import { Sec, CTA } from "@/components/drift/sec";
import { Spot } from "@/components/drift/interact";
import { records, traceStats } from "@/lib/records";

export const metadata: Metadata = {
  title: "Work",
  description: "Seven records: a live product, public repositories, a requirements document, and competition work.",
};

export default function KaryaPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow" data-as>
            Work · {records.length} records
          </p>
          <h1 className="pageHero__t">
            <span data-as data-dp="0.16" style={{ display: "block" }}>
              Built, shipped,
            </span>
            <span data-as data-dp="-0.1" data-dir="-1" style={{ display: "block" }}>
              or honestly <em>in progress.</em>
            </span>
          </h1>
          <p className="pageHero__s" data-as style={{ ["--as-d" as string]: "300ms" }}>
            Newest first. Each row says how far the work actually got: running in production, source public, delivered
            on placement, a document, or still being built. Nothing here is dressed up as more than it is.
          </p>
        </div>
      </section>

      <Sec
        eyebrow="All records"
        title="Seven things I ~made."
        sub="Tap a card for the problem, what I built, and what came out of it."
      >
        <div className="spots">
          {records.map((r, i) => (
            <Spot key={r.id}>
              <a href={r.href} data-as data-dp={i % 2 ? "-0.1" : "0.12"} style={{ ["--as-d" as string]: `${i * 70}ms` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span className="spot__n mono">{r.no}</span>
                  {r.state === "live" && <span className="tag tag--hot">In production</span>}
                  {r.state === "public" && <span className="tag tag--cool">Public</span>}
                  {r.state === "building" && <span className="tag">In progress</span>}
                  {r.state === "record" && <span className="tag tag--hot">Awarded</span>}
                  {r.state === "shipped" && <span className="tag">Delivered</span>}
                  {r.state === "doc" && <span className="tag tag--cool">Document</span>}
                </div>
                <h3 className="spot__t">{r.title}</h3>
                <p className="spot__d">{r.summary}</p>
                <p className="spot__d mono" style={{ marginTop: 14, color: "var(--text-3)", fontSize: 12.5 }}>
                  {r.kind} · {r.year}
                </p>
                <img
                  src={r.image}
                  alt={`${r.title} preview`}
                  width={1200}
                  height={751}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  style={{ marginTop: 16, borderRadius: 16, border: "1px solid var(--line-2)", filter: "saturate(.5)" }}
                />
              </a>
            </Spot>
          ))}
        </div>
      </Sec>

      <Sec
        eyebrow="Evidence"
        title="Why some rows say ~in progress."
        sub={`${traceStats.capabilities} capabilities are listed across this site; ${traceStats.gaps} of them have no work record behind them yet. Saying so is cheaper than pretending otherwise.`}
      >
        <div className="stats">
          {[
            { v: records.length, l: "Work records", n: "Each with its own page" },
            { v: records.filter((r) => r.state === "live").length, l: "In production", n: "Taking real orders daily" },
            { v: records.filter((r) => r.state === "public" || r.state === "shipped").length, l: "Shipped or public", n: "Readable or delivered" },
            { v: traceStats.gaps, l: "Unproven tools", n: "Listed, not hidden" },
          ].map((s, i) => (
            <div className="stat" key={s.l} data-as data-dp={i % 2 ? "0.12" : "-0.12"} style={{ ["--as-d" as string]: `${i * 90}ms` }}>
              <p className="stat__v">{s.v}</p>
              <p className="stat__l">{s.l}</p>
              <p className="stat__n">{s.n}</p>
            </div>
          ))}
        </div>
      </Sec>

      <CTA />
    </>
  );
}
