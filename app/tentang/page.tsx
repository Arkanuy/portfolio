import type { Metadata } from "next";
import { Split, Reveal } from "@/components/field/motion";
import { site, stack, numbers, education, hobbies } from "@/lib/site";
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
          <p className="kicker" data-reveal>
            About
          </p>
          <Split as="h1" className="serif page__h" text="Process first, code second." accentLast />
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap split">
          <div className="art">
            <Reveal>
              <p style={{ fontSize: 18 }}>{site.bio}</p>
              <p>{site.bioLong}</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="serif" style={{ fontSize: "clamp(22px,3vw,38px)", marginTop: 34 }}>
                <Split as="h2" text="Facts" />
              </h2>
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
            </Reveal>
            <Reveal delay={140}>
              <h2 className="serif" style={{ fontSize: "clamp(22px,3vw,38px)", marginTop: 34 }}>
                <Split as="h2" text="Tooling" />
              </h2>
              <ul>
                {stack.map((g) => (
                  <li key={g.group}>
                    <b>{g.group}</b> — {g.items.map((it) => `${it.name} (${it.evidence})`).join("; ")}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={180}>
              <h2 className="serif" style={{ fontSize: "clamp(22px,3vw,38px)", marginTop: 34 }}>
                <Split as="h2" text="Outside class" />
              </h2>
              <ul>
                {hobbies.map((h: { name: string; note: string }) => (
                  <li key={h.name}>
                    <b>{h.name}</b> — {h.note}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="sticky">
            <Reveal>
              <figure className="fig">
                <img src="/github/arkan-avatar-680.webp" alt={`Portrait of ${site.name}`} width={340} height={340} fetchPriority="high" decoding="async" />
              </figure>
              <p className="figcap mono">
                {site.name} · {site.handle}
              </p>
            </Reveal>
            <div className="rail" style={{ marginTop: 24 }}>
              <div className="rail__g">
                <p className="rail__k">Records</p>
                <p className="rail__v">{records.length} with evidence</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Tool groups</p>
                <p className="rail__v">
                  {stack.length} · {stack.reduce((n, g) => n + g.items.length, 0)} tools
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
