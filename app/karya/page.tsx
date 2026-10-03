import type { Metadata } from "next";
import { Split, Reveal } from "@/components/field/motion";
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
          <p className="kicker" data-reveal>
            Work · {records.length} records
          </p>
          <Split as="h1" className="serif page__h" text="Every record, and how far it got." accentLast />
          <p className="page__s lead" data-reveal style={{ ["--d" as string]: "160ms" }}>
            Newest first. Status is the strongest thing that can be pointed at — a product taking real orders, a public
            repository, a document, an award, or an honest note that it is unfinished.
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap">
          <table className="tbl">
            <caption className="small" style={{ textAlign: "left", paddingBottom: 12 }}>
              {records.length} records · {live} in production
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
                  <td className="tbl__n mono">{r.no}</td>
                  <td className="tbl__n mono">{r.year}</td>
                  <td className="tbl__t">
                    <a href={r.href}>{r.title}</a>
                  </td>
                  <td>{r.kind}</td>
                  <td className="card__st mono" data-s={r.state}>
                    {STATUS[r.state].label}
                  </td>
                  <td className="tbl__go">
                    <a href={r.href}>Case study →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Reveal className="art" delay={120}>
            <ul style={{ marginTop: 34 }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <li key={k}>
                  <b className="mono">{v.label}</b> — {v.note}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
