import ClaimTrace from "@/components/trace/claim-trace";
import ScrollMeter from "@/components/trace/scroll-meter";
import { Sheet, SignOff } from "@/components/trace/sheet";
import { RecordLedger, CapabilityIndex, GapReport } from "@/components/trace/verify";
import { process, site } from "@/lib/site";
import { records, traceStats } from "@/lib/trace";

export default function Home() {
  return (
    <>
      <ScrollMeter />

      {/* ==================== LEMBAR DEPAN ====================
          Bukan hero. Ini folio: identitas, satu kalimat, lalu panel sumber
          tempat semua klaim di situs ini bisa diuji. */}
      <section className="folio">
        <div className="wrap">
          <div className="folio__meta mono">
            <span>
              <b>Folio</b> 00 / 05
            </span>
            <span>Subject: {site.name}</span>
            <span>{site.place}</span>
            <span>Records: {records.length}</span>
            <span>
              Status: <b>{site.badge}</b>
            </span>
          </div>

          <h1 className="folio__h1">
            A portfolio you <em>check</em>, not one you scroll past.
          </h1>

          <div className="folio__sub">
            <p>
              I am <strong>{site.name}</strong>. I study Information Systems in Bandung and I build business software,
              web apps, and automation. My working rule: map the process first, then write the code.
            </p>
            <p>
              Everything below is an <strong>auditable claim</strong>. Pick a number on the left and the rule walks to
              the record that proves it. Where a claim has no record yet, this site says so instead of hiding it.
            </p>
          </div>

          {/* ---- tanda tangan interaksi ---- */}
          <ClaimTrace />
        </div>
      </section>

      {/* ==================== 01 · RECORDS ==================== */}
      <Sheet
        k="Key 01 / Records"
        title="Every record, and how strong its evidence is."
        sub="Seven work records, newest first. The evidence column is not a mood — it is the strongest thing that can actually be pointed at: a live product, a public repository, a document, an award, or nothing yet."
      >
        <RecordLedger />
      </Sheet>

      {/* ==================== 02 · CAPABILITY ==================== */}
      <Sheet
        k="Key 02 / Capability"
        title="Tools, each one pointing at the work that proves it."
        sub="Switch the trace off and you get the same list most portfolios show: names with no evidence behind them. Switch it on and the unsourced rows hatch. I would rather show you the gap than pad the list."
      >
        <CapabilityIndex />
        <GapReport />
      </Sheet>

      {/* ==================== 03 · METHOD ==================== */}
      <Sheet
        k="Key 03 / Method"
        title="The order I work in, and what each step produces."
        sub="This sequence is the reason the work gets used instead of merely finished. At every step the output is something you can read — not a status update."
      >
        <div className="flow">
          {process.map((p) => (
            <div className="flow__step" key={p.no} data-rv>
              <span className="flow__n">{p.no}</span>
              <span className="flow__t">{p.title}</span>
              <div>
                <p className="flow__d">{p.body}</p>
                <span className="flow__out">
                  {p.no === "01"
                    ? "current-state map"
                    : p.no === "02"
                      ? "requirement list"
                      : p.no === "03"
                        ? "working build"
                        : "handover notes"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      {/* ==================== 04 · THE RULE ==================== */}
      <section className="sec">
        <div className="wrap">
          <div className="quote">
            <p className="quote__k mono">Key 04 / The rule</p>
            <div>
              <h2 className="quote__t">
                The problem is rarely the code. It is the <em>flow</em> — who does what, and where the work gets stuck.
              </h2>
              <p className="quote__src">
                {site.name} · {site.place} · {traceStats.capabilities} capabilities indexed
              </p>
            </div>
          </div>
        </div>
      </section>

      <SignOff />
    </>
  );
}