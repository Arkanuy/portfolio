import type { Metadata } from "next";
import { SetType, DrawRule, Rise } from "@/components/edition/type";
import { records, STATUS } from "@/lib/records";

export const metadata: Metadata = {
  title: "Work",
  description: "Seven records: a live product, public repositories, a requirements document, and competition work.",
};

export default function WorkPage() {
  const live = records.filter((r) => r.state === "live").length;

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">Index · {records.length} records</p>
          <SetType as="h1" className="page__h" text="Every record, and how far it got." accentLast />
          <p className="page__s dek">
            Newest first. Status is the strongest thing that can be pointed at: a product taking real orders, a public
            repository, a document, an award, or an honest note that it is unfinished.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
          </div>
          <table className="ledger">
            <caption>
              {records.length} records · {live} in production. Hover a row to follow it.
            </caption>
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Year</th>
                <th scope="col">Record</th>
                <th scope="col">Kind</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  <span className="sr">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="ledger__no mono">{r.no}</td>
                  <td className="ledger__yr mono">{r.year}</td>
                  <td className="ledger__t">
                    <a href={r.href}>{r.title}</a>
                  </td>
                  <td className="ledger__k">{r.kind}</td>
                  <td className="st" data-s={r.state}>
                    {STATUS[r.state].label}
                  </td>
                  <td className="ledger__go">
                    <a href={r.href}>
                      Case study <span aria-hidden="true">→</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="What the status words mean." />
          </div>
          <div className="art">
            <ul>
              {Object.entries(STATUS).map(([k, v]) => (
                <li key={k}>
                  <b className="mono">{v.label}</b> — {v.note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
