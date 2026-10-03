import WorkTable from "@/components/site/work-table";
import { site, services, process, stack, numbers } from "@/lib/site";
import { records } from "@/lib/records";

export default function Home() {
  return (
    <>
      {/* ---------- BUKA ---------- */}
      <section className="open">
        <div className="wrap">
          <h1 className="display open__t">
            Software that gets used, <b>not just shipped.</b>
          </h1>

          <div className="open__rows">
            <p className="lead">
              I am {site.name}. I study Information Systems in Bandung and build business software, web apps, and
              automation. The rule I work by: map the process first, then write the code.
            </p>
            <p>
              The problem is rarely the code. It is the flow — who does what, and where the work gets stuck. So the
              work here starts with a process map, not a feature list. Seven records are listed below, each with the
              strength of the evidence behind it.
            </p>
          </div>

          <p className="open__links">
            <a href="/karya">See the work</a>
            <a href="/layanan">Services</a>
            <a href={site.cv} download>
              CV (PDF)
            </a>
            <a href={`mailto:${site.email}`}>Email</a>
          </p>
        </div>
      </section>

      {/* ---------- 1 · KERJA ---------- */}
      <section className="sec" id="work">
        <div className="wrap">
          <h2 className="display sec__h">Work</h2>
          <WorkTable />
          <p className="sec__note">
            <span className="mono">in production</span> means it runs and takes orders today.{" "}
            <span className="mono">in progress</span> means it is unfinished, and saying otherwise would be a false
            claim.
          </p>
        </div>
      </section>

      {/* ---------- 2 · LAYANAN ---------- */}
      <section className="sec" id="services">
        <div className="wrap">
          <h2 className="display sec__h">Services</h2>
          <div className="svc">
            {services.map((s) => (
              <div className="svc__row" key={s.slug}>
                <p className="svc__n mono">{s.no}</p>
                <div>
                  <h3 className="svc__t">
                    <a href={`/layanan/${s.slug}`}>{s.name}</a>
                  </h3>
                  <p className="svc__tag">{s.tagline}</p>
                  <ul className="svc__ul">
                    {s.includes.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <p className="svc__proof">
                    <b>Evidence.</b> {s.proof}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 3 · PROSES (satu-satunya daftar bernomor, karena memang berurutan) ---------- */}
      <section className="sec" id="process">
        <div className="wrap">
          <h2 className="display sec__h">How I work</h2>
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

      {/* ---------- 4 · PERKAKAS + ANGKA ---------- */}
      <section className="sec" id="tooling">
        <div className="wrap">
          <h2 className="display sec__h">Tooling and numbers</h2>
          <div className="defs">
            {stack.map((g) => (
              <div className="defs__row" key={g.group}>
                <p className="defs__t">
                  {g.group}
                  <span>what it was used for</span>
                </p>
                <p className="defs__v">
                  {g.items.map((it) => `${it.name} — ${it.evidence}`).join(" · ")}
                </p>
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
          <p className="sec__note">
            Tools are listed with the work they were used on. Nothing appears here that is not backed by a record above.
          </p>
        </div>
      </section>

      {/* ---------- 5 · AJAKAN ---------- */}
      <section className="sec">
        <div className="wrap">
          <h2 className="display sec__h">Tell me how the work runs today.</h2>
          <p className="lead" style={{ maxWidth: "60ch" }}>
            If a new app turns out not to be the answer, I will say so. Not every problem needs software — and saying
            that early is cheaper than building the wrong thing.
          </p>
          <p className="open__links">
            <a href={`mailto:${site.email}`}>Send an email</a>
            <a href="/kontak">Contact page</a>
          </p>
          <p className="sec__note mono" style={{ marginTop: 26 }}>
            {records.length} records · {stack.reduce((n, g) => n + g.items.length, 0)} tools listed
          </p>
        </div>
      </section>
    </>
  );
}
