import type { Metadata } from "next";
import { site, process, stack, numbers, education, hobbies } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Background, working method, and tooling of Arkan Mustofa.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <h1 className="display page__t">Process first, code second.</h1>
          <p className="page__s lead">{site.bio}</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap body">
          <p>{site.bioLong}</p>
          <p>
            I finished vocational school in Software Engineering and I am now studying Information Systems. That puts
            me on both sides: writing the code, and tidying the business process behind it.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="display sec__h">How I work</h2>
          <p className="small" style={{ marginBottom: 16, maxWidth: "64ch" }}>
            The order is the method. If the second step produced no document, the feature list was invented while
            coding — and that is what makes people abandon software.
          </p>
          <ol className="steps">
            {process.map((p) => (
              <li key={p.no}>
                <span className="steps__n mono">{p.no}</span>
                <span className="steps__t">{p.title}</span>
                <span className="steps__d">{p.body}</span>
                <span className="steps__o mono">
                  → {p.no === "01" ? "current-state map" : p.no === "02" ? "requirement list" : p.no === "03" ? "working build" : "handover notes"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="display sec__h">Tooling</h2>
          <div className="defs">
            {stack.map((g) => (
              <div className="defs__row" key={g.group}>
                <p className="defs__t">
                  {g.group}
                  <span>{g.items.length} tools</span>
                </p>
                <p className="defs__v">{g.items.map((it) => `${it.name} — ${it.evidence}`).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="display sec__h">Facts</h2>
          <div className="defs">
            <div className="defs__row">
              <p className="defs__t">Born</p>
              <p className="defs__v">{site.born}</p>
            </div>
            <div className="defs__row">
              <p className="defs__t">Based in</p>
              <p className="defs__v">{site.place}</p>
            </div>
            <div className="defs__row">
              <p className="defs__t">Status</p>
              <p className="defs__v">{site.status}</p>
            </div>
            {education.map((e: { period: string; title: string; org?: string }) => (
              <div className="defs__row" key={e.title}>
                <p className="defs__t">
                  {e.period}
                  <span>education</span>
                </p>
                <p className="defs__v">
                  {e.title}
                  {e.org ? ` — ${e.org}` : ""}
                </p>
              </div>
            ))}
            {hobbies.map((h: { name: string; note: string }) => (
              <div className="defs__row" key={h.name}>
                <p className="defs__t">
                  {h.name}
                  <span>outside class</span>
                </p>
                <p className="defs__v">{h.note}</p>
              </div>
            ))}
            {numbers.map((n) => (
              <div className="defs__row" key={n.label}>
                <p className="defs__t">
                  {n.value}
                  <span>{n.note}</span>
                </p>
                <p className="defs__v">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
