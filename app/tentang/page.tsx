import type { Metadata } from "next";
import { SetType, DrawRule, Rise, Count } from "@/components/edition/type";
import { site, process, stack, numbers, education, hobbies } from "@/lib/site";
import { records } from "@/lib/records";

export const metadata: Metadata = {
  title: "About",
  description: "Background, working method, and tooling of Arkan Mustofa.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">About · Method</p>
          <SetType as="h1" className="page__h" text="Process first, code second." accentLast />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div className="art">
            <p className="art__drop">{site.bio}</p>
            <p>{site.bioLong}</p>
            <p>
              I finished vocational school in Software Engineering and I am now studying Information Systems. That puts
              me on both sides: writing the code, and tidying the business process behind it. The second one usually
              decides whether software gets used at all.
            </p>

            <SetType as="h2" className="sec__h" text="How I work" />
            <ol className="steps" style={{ marginTop: 14 }}>
              {process.map((p) => (
                <li key={p.no} data-rise data-on-enter>
                  <span className="steps__n mono">{p.no}</span>
                  <span className="steps__t">{p.title}</span>
                  <span className="steps__d">{p.body}</span>
                  <span className="steps__o mono">
                    → {p.no === "01" ? "current-state map" : p.no === "02" ? "requirement list" : p.no === "03" ? "working build" : "handover notes"}
                  </span>
                </li>
              ))}
            </ol>

            <SetType as="h2" className="sec__h" text="Facts" />
            <ul>
              <li>
                <b>Born</b> — {site.born}
              </li>
              <li>
                <b>Based in</b> — {site.place}
              </li>
              <li>
                <b>Status</b> — {site.status}
              </li>
              {education.map((e: { period: string; title: string; org?: string }) => (
                <li key={e.title}>
                  <b>{e.period}</b> — {e.title}
                  {e.org ? `, ${e.org}` : ""}
                </li>
              ))}
              {numbers.map((n) => (
                <li key={n.label}>
                  <b>{n.value}</b> — {n.label}
                  {n.note ? ` (${n.note})` : ""}
                </li>
              ))}
            </ul>

            <SetType as="h2" className="sec__h" text="Tooling" />
            <p className="meta" style={{ marginBottom: 12 }}>
              Each tool with the work it was used on.
            </p>
            <ul>
              {stack.map((g) => (
                <li key={g.group}>
                  <b>{g.group}</b> — {g.items.map((it) => `${it.name} (${it.evidence})`).join("; ")}
                </li>
              ))}
            </ul>

            <SetType as="h2" className="sec__h" text="Outside class" />
            <ul>
              {hobbies.map((h: { name: string; note: string }) => (
                <li key={h.name}>
                  <b>{h.name}</b> — {h.note}
                </li>
              ))}
            </ul>
          </div>

          <aside className="sticky">
            <figure className="portrait">
              <img src="/github/arkan-avatar-680.webp" alt={`Portrait of ${site.name}`} width={340} height={340} fetchPriority="high" decoding="async" />
              <figcaption className="portrait__cap mono">
                <span>{site.name}</span>
                <span>{site.handle}</span>
              </figcaption>
            </figure>
            <div className="rail" style={{ marginTop: 22 }}>
              <div className="rail__g">
                <p className="rail__k">Records</p>
                <p className="rail__v">
                  <Count value={records.length} /> with evidence
                </p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Tool groups</p>
                <p className="rail__v">
                  <Count value={stack.length} /> · <Count value={stack.reduce((n, g) => n + g.items.length, 0)} /> tools
                </p>
              </div>
              <div className="rail__g">
                <p className="rail__k">CV</p>
                <p className="rail__v">
                  <a href={site.cv} download>
                    Download PDF
                  </a>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
