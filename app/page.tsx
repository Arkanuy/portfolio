import Ticker from "@/components/edition/ticker";
import { SetType, DrawRule, Rise, Count } from "@/components/edition/type";
import { site, services, process, stack, numbers } from "@/lib/site";
import { records } from "@/lib/records";

/** Berita turunan dari records: judul, kicker (kategori), dek, meta. */
const stories = records.slice(0, 6);

export default function Home() {
  const live = records.filter((r) => r.state === "live").length;
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <Ticker />

      {/* ================= LEAD STORY ================= */}
      <section className="lead">
        <div className="wrap">
          <div className="lead__grid">
            <div>
              <p className="kicker">Lead · {today}</p>
              <SetType
                as="h1"
                className="lead__h"
                text="Software that gets used, not just shipped."
                accentLast
              />
            </div>

            <div className="lead__cut">
              <DrawRule tone="ink" />
              <div style={{ height: 16 }} />
              <p className="dek">
                I study Information Systems in Bandung and build business software, web apps, and automation. The rule
                I work by: map the process first, then write the code.
              </p>
              <p className="dek">
                The problem is rarely the code — it is the flow: who does what, and where the work gets stuck.
              </p>

              <dl className="lead__facts">
                <div>
                  <dt>Based</dt>
                  <dd>{site.place}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{site.status}</dd>
                </div>
                <div>
                  <dt>Records</dt>
                  <dd>
                    <Count value={records.length} /> listed, <Count value={live} /> in production
                  </dd>
                </div>
              </dl>

              <div className="lead__cta">
                <a className="btn" href="/karya">
                  See the work <i aria-hidden="true">→</i>
                </a>
                <a className="btn btn--line" href={`mailto:${site.email}`}>
                  Send an email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BERITA SEKUNDER ================= */}
      <section className="sec" id="work">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="Selected work" />
          </div>

          <div className="grid3">
            {stories.map((r, i) => (
              <article className="story" key={r.id}>
                <DrawRule tone="rule" onEnter={false} />
                <p className="kicker" style={{ marginTop: 12 }}>
                  {r.state === "live" ? "Live" : r.state === "building" ? "In progress" : r.kind.split("·")[0].trim()}
                </p>
                <h3 className="story__h">
                  <a href={r.href}>{r.title}</a>
                </h3>
                <p className="story__d">{r.summary}</p>
                <p className="story__meta meta mono">
                  <span>{r.year}</span>
                  <span>·</span>
                  <span className="st" data-s={r.state}>
                    {r.state === "live" ? "in production" : r.state === "public" ? "source public" : r.state === "building" ? "in progress" : r.state}
                  </span>
                </p>
              </article>
            ))}
          </div>

          <Rise className="sec__note">
            <p>
              Six of {records.length} records. <b>in production</b> means it runs and takes orders today;{" "}
              <b>in progress</b> means it is unfinished, and saying otherwise would be a false claim.
            </p>
            <p style={{ marginTop: 12 }}>
              <a className="btn btn--line" href="/karya">
                All {records.length} records <i aria-hidden="true">→</i>
              </a>
            </p>
          </Rise>
        </div>
      </section>

      {/* ================= LAYANAN ================= */}
      <section className="sec" id="services">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="Services" />
          </div>
          <div className="grid3">
            {services.map((s) => (
              <article className="story" key={s.slug}>
                <DrawRule tone="rule" onEnter={false} />
                <p className="kicker" style={{ marginTop: 12 }}>
                  {s.no}
                </p>
                <h3 className="story__h">
                  <a href={`/layanan/${s.slug}`}>{s.name}</a>
                </h3>
                <p className="story__d">{s.tagline}</p>
                <p className="story__meta meta">{s.from}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROSES ================= */}
      <section className="sec" id="process">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="How the work runs, in order." />
          </div>
          <ol className="steps">
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
        </div>
      </section>

      {/* ================= ANGKA ================= */}
      <section className="sec" id="numbers">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="Numbers, and what they count." />
          </div>
          <div className="nums">
            {numbers.map((n) => (
              <div className="num" key={n.label} data-rise data-on-enter>
                <p className="num__v">
                  {/^\d+$/.test(n.value) ? <Count value={Number(n.value)} /> : /(\d+)/.test(n.value) ? (
                    <>
                      <Count value={Number(n.value.replace(/\D/g, ""))} suffix={`×`} />
                    </>
                  ) : (
                    n.value
                  )}
                </p>
                <p className="num__l">{n.label}</p>
                <p className="num__n">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PERKAKAS ================= */}
      <section className="sec" id="tooling">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="ink" />
            <SetType as="h2" className="sec__h" text="Tooling, and the work it was used on." />
          </div>
          <table className="ledger">
            <caption>Every tool listed with the record that used it.</caption>
            <thead>
              <tr>
                <th scope="col">Group</th>
                <th scope="col">Tools and evidence</th>
              </tr>
            </thead>
            <tbody>
              {stack.map((g) => (
                <tr key={g.group}>
                  <td className="ledger__t" style={{ width: "22%" }}>
                    {g.group}
                  </td>
                  <td className="ledger__k">
                    {g.items.map((it, i) => (
                      <span key={it.name}>
                        {i > 0 ? " · " : ""}
                        <b>{it.name}</b> — {it.evidence}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= AJAKAN ================= */}
      <section className="sec">
        <div className="wrap">
          <div className="sec__bar">
            <DrawRule tone="accent" />
            <SetType as="h2" className="sec__h" text="Tell me how the work runs today." />
          </div>
          <p className="dek" style={{ maxWidth: "62ch" }}>
            If a new app turns out not to be the answer, I will say so. Not every problem needs software — and saying
            that early is cheaper than building the wrong thing.
          </p>
          <div className="lead__cta">
            <a className="btn" href={`mailto:${site.email}`}>
              Send an email <i aria-hidden="true">→</i>
            </a>
            <a className="btn btn--line" href="/kontak">
              Contact page
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
