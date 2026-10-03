import type { Metadata } from "next";
import RecordCard from "@/components/trace/record-card";
import { SignOff } from "@/components/trace/sheet";
import { records, traceStats, STATE_LABEL, STATE_NOTE, type EvidenceState } from "@/lib/trace";

export const metadata: Metadata = {
  title: "Records",
  description: "Seven work records with the strength of evidence behind each one: live product, public source, document, award, or in progress.",
};

const ORDER: EvidenceState[] = ["live", "record", "shipped", "public", "doc", "building", "declared"];

export default function KaryaPage() {
  const counts = ORDER.map((s) => ({ s, n: records.filter((r) => r.state === s).length })).filter((x) => x.n > 0);

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta mono">
            <span>Sheet 01 / 05</span>
            <span>Records {records.length}</span>
            <span>Unsourced tools {traceStats.gaps}</span>
          </div>
          <h1 className="pageHero__t">
            Seven records, ranked by how much of them can be <em>verified</em>.
          </h1>
          <p className="pageHero__s">
            Each row carries the strongest evidence available: a product running in production, a public repository, a
            requirements document, a competition result, or an honest note that it is not finished. Screenshots are
            useful, but they are not the same thing as proof — so they are shown small and greyed until you look at
            them.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            {counts.map((c) => (
              <span className={`st st--${c.s}`} key={c.s} title={STATE_NOTE[c.s]}>
                {STATE_LABEL[c.s]} · {c.n}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap">
          <div className="ccGrid">
            {records.map((r, i) => (
              <RecordCard key={r.id} item={r} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      <SignOff />
    </>
  );
}