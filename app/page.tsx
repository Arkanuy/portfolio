import { Split, Reveal, Scrub } from "@/components/field/motion";
import Begin from "@/components/field/begin";
import { site, services, process, stack, numbers } from "@/lib/site";
import { records } from "@/lib/records";

/** Gambar nyata: tangkapan layar dari produk yang benar-benar jalan.
 *  Menggantikan "plate" desain — referensi keduanya memakai gambar asli. */
const SHOTS: Record<string, { src: string; href: string; label: string }> = {
  mafiablox: { src: "/shots/mafiablox.webp", href: "https://mafiablox.com", label: "mafiablox.com" },
  "website-sekolah": { src: "/shots/next-deploy.webp", href: "https://next-deploy-gold-one.vercel.app", label: "live build" },
  pixwatch: { src: "/shots/arkanuy-io.webp", href: "https://arkanuy.github.io", label: "arkanuy.github.io" },
};

const QUOTE = ["The problem is rarely", "the code. It is the flow —", "who does what, and", "where the work gets stuck."];

export default function Home() {
  const live = records.filter((r) => r.state === "live").length;
  const featured = records.filter((r) => SHOTS[r.id]);

  return (
    <>
      {/* ================= PEMBUKA ================= */}
      <section className="hero" data-scrub>
        <div className="hero__media" aria-hidden="true">
          <img src="/shots/mafiablox.webp" alt="" width={1440} height={900} fetchPriority="high" decoding="async" />
          <span className="hero__scrim" />
        </div>

        <div className="wrap">
          <p className="kicker" data-reveal>
            {site.place} · available for work
          </p>
          <h1 className="serif hero__t" style={{ marginTop: 18 }}>
            <Split text="Software that gets used," as="span" className="serif hero__t" />
            <br />
            <Split text="not just shipped." as="span" className="serif hero__t" accentLast />
          </h1>
          <p className="lead hero__sub" data-reveal style={{ ["--d" as string]: "180ms" }}>
            I am {site.name}. I build business software, web apps and automation — and I map the process before writing
            any code, because the problem is rarely the code.
          </p>
          <div className="hero__cta" data-reveal style={{ ["--d" as string]: "300ms" }}>
            <a className="btn" href="/karya">
              <span className="btn__fill" aria-hidden="true" />
              See the work <i aria-hidden="true">→</i>
            </a>
            <a className="btn btn--line" href="/kontak">
              <span className="btn__fill" aria-hidden="true" />
              Start a project
            </a>
          </div>
          <div className="hero__meta mono" data-reveal style={{ ["--d" as string]: "420ms" }}>
            <span>{records.length} records</span>
            <span>{live} in production</span>
            <span>{stack.reduce((n, g) => n + g.items.length, 0)} tools</span>
          </div>
        </div>
        <span className="hero__scroll mono" aria-hidden="true">
          Scroll
        </span>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="mq" aria-hidden="true">
        <div className="mq__row">
          {[...records, ...records].map((r, i) => (
            <span className="mq__i" key={`a${i}`}>
              <s />
              {r.title}
              <span>{r.year}</span>
            </span>
          ))}
        </div>
        <div className="mq__row mq__row--rev">
          {[...records, ...records].map((r, i) => (
            <span className="mq__i" key={`b${i}`}>
              <s />
              {r.title}
              <span>{r.year}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================= KERJA ================= */}
      <section className="sec">
        <div className="wrap">
          <header className="sec__head" data-reveal>
            <span className="sec__rule" />
            <Split as="h2" className="serif sec__h" text="Work already running." />
            <p className="sec__note">
              Screenshots taken from the live products, not design plates.{" "}
              <b>in production</b> means it takes real orders today.
            </p>
          </header>

          <div className="cards">
            {featured.map((r, i) => {
              const s = SHOTS[r.id];
              return (
                <Reveal key={r.id} delay={i * 90}>
                  <article className="card" data-scrub>
                    <div className="card__media">
                      <img src={s.src} alt={`${r.title} — live interface`} width={1440} height={900} loading={i < 1 ? "eager" : "lazy"} decoding="async" />
                    </div>
                    <div>
                      <p className="card__no mono">{r.no} — {r.kind}</p>
                      <h3 className="serif card__t">{r.title}</h3>
                      <p className="card__d">{r.summary}</p>
                      <p className="card__meta">
                        <span className="card__st" data-s={r.state}>
                          {r.state === "live" ? "in production" : r.state === "public" ? "source public" : r.state}
                        </span>
                        <span>{r.year}</span>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                          {s.label} ↗
                        </a>
                      </p>
                      <p className="card__go">
                        <a className="btn btn--line" href={r.href}>
                          <span className="btn__fill" aria-hidden="true" />
                          Case study <i aria-hidden="true">→</i>
                        </a>
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <div style={{ marginTop: 40 }} data-reveal>
            <a className="btn" href="/karya">
              <span className="btn__fill" aria-hidden="true" />
              All {records.length} records <i aria-hidden="true">→</i>
            </a>
          </div>
        </div>
      </section>

      {/* ================= CARA KERJA (narasi berlangkah) ================= */}
      <Begin />

      {/* ================= KUTIPAN ================= */}
      <section className="sec">
        <div className="wrap">
          <h2 className="serif quote">
            {QUOTE.map((line, i) => (
              <span key={line} style={{ display: "block" }}>
                <Split text={line} as="span" className="serif quote" accentLast={i === QUOTE.length - 1} />
              </span>
            ))}
          </h2>
          <p className="small mono" style={{ marginTop: 26 }}>
            {site.name} · {site.place}
          </p>
        </div>
      </section>

      {/* ================= SEKSI DIPATOK: layanan ================= */}
      <Scrub>
        <div className="scrub__pin">
          <div className="scrub__left">
            <p className="kicker">Services</p>
            <Split as="h2" className="serif sec__h" text="Four kinds of work." />
            <ol className="scrub__list" style={{ marginTop: 28 }}>
              {services.map((s, i) => (
                <li key={s.slug}>
                  <a className="scrub__item" href={`/layanan/${s.slug}`} data-on={i === 0 ? "true" : "false"}>
                    <b>{s.no}</b>
                    <span>
                      {s.name}
                      <em>{s.tagline}</em>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="scrub__prog" aria-hidden="true">
              <span className="scrub__progFill" />
            </div>
          </div>
          <div className="scrub__right" aria-hidden="true">
            {services.map((s, i) => (
              <figure className="scrub__panel" key={s.slug} data-on={i === 0 ? "true" : "false"}>
                <img src={i === 0 ? "/shots/mafiablox.webp" : i === 1 ? "/shots/next-deploy.webp" : "/shots/arkanuy-io.webp"} alt="" width={1440} height={900} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </div>
      </Scrub>

      {/* ================= TABEL BUKTI ================= */}
      <section className="sec">
        <div className="wrap">
          <header className="sec__head" data-reveal>
            <span className="sec__rule" />
            <Split as="h2" className="serif sec__h" text="Every record, and how far it got." />
          </header>
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
                    {r.state === "live" ? "in production" : r.state === "public" ? "source public" : r.state === "building" ? "in progress" : r.state}
                  </td>
                  <td className="tbl__go">
                    <a href={r.href}>Case study →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= ANGKA ================= */}
      <section className="sec sec--tight">
        <div className="wrap">
          <div className="nums">
            {numbers.map((n) => (
              <div className="num" key={n.label} data-reveal>
                <p className="num__v">{n.value}</p>
                <p className="num__l">{n.label}</p>
                <p className="num__n">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
