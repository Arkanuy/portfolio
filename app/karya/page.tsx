import type { Metadata } from "next";
import WorkTable from "@/components/site/work-table";
import { records } from "@/lib/records";

export const metadata: Metadata = {
  title: "Work",
  description: "Seven records: a live product, public repositories, a requirements document, and competition work.",
};

export default function WorkPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <h1 className="display page__t">Work</h1>
          <p className="page__s lead">
            {records.length} records, newest first. Each row states how far the work actually got — running in
            production, source public, delivered on placement, a document, or still being built.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <WorkTable />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="body">
            <h2 className="display sec__h">On evidence</h2>
            <p>
              A portfolio is a claim about someone&rsquo;s work, so each record carries the strongest thing that can
              actually be pointed at rather than a mood. Where nothing can be pointed at, the row says so.
            </p>
            <ul>
              <li>
                <b>in production</b> — the product runs and takes real orders. The source is private, so the artefact
                is the proof.
              </li>
              <li>
                <b>source public</b> — the code can be read line by line.
              </li>
              <li>
                <b>awarded</b> — recorded by a third party, which makes it externally checkable.
              </li>
              <li>
                <b>document</b> — the value is a requirements baseline written before any code.
              </li>
              <li>
                <b>in progress</b> — unfinished, and deliberately labelled that way.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
