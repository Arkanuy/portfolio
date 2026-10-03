import { site, services } from "@/lib/site";
import { records, traceStats } from "@/lib/trace";

/** FOOTER — kolom catatan lembar. */
export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__top">
          <div>
            <div className="ft__brand">
              <img
                className="ft__avatar"
                src="/github/arkan-avatar-680.webp"
                alt={`Portrait of ${site.name}`}
                width={340}
                height={340}
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="ft__name">{site.name}</p>
                <p className="ft__role">{site.role}</p>
              </div>
            </div>
            <p className="ft__status">{site.status}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="btn btn--fill btn--sm" href={`mailto:${site.email}`}>
                Send an email →
              </a>
              <a className="btn btn--ghost btn--sm" href={site.cv} download>
                CV (PDF)
              </a>
            </div>
          </div>

          <div className="ft__col">
            <p className="ft__h">Index</p>
            <a href="/karya">Records ({records.length})</a>
            <a href="/layanan">Work</a>
            <a href="/tentang">Method</a>
            <a href="/riwayat">History</a>
            <a href="/kontak">Contact</a>
          </div>

          <div className="ft__col">
            <p className="ft__h">Work types</p>
            {services.map((s) => (
              <a key={s.slug} href={`/layanan/${s.slug}`}>
                {s.no} · {s.name}
              </a>
            ))}
          </div>

          <div className="ft__col">
            <p className="ft__h">Records</p>
            {records.slice(0, 5).map((r) => (
              <a key={r.id} href={r.href}>
                {r.no} · {r.title}
              </a>
            ))}
          </div>
        </div>

        <div className="ft__bottom">
          <p>
            © {new Date().getFullYear()} {site.name}, {site.place} · {traceStats.capabilities} capabilities indexed,{" "}
            {traceStats.gaps} without a linked record
          </p>
          <p className="ft__links">
            <a href={site.github.url} target="_blank" rel="noopener noreferrer">
              github.com/{site.github.user}
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              instagram
            </a>
            <a href="/kontak">contact</a>
          </p>
        </div>
      </div>
    </footer>
  );
}