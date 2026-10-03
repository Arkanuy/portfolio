import Image from "next/image";
import { site, services, cases } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__top">
          <div className="ft__brandCol">
            <div className="ft__brand">
              <Image className="ft__avatar" src="/github/arkan-avatar-2x.png" alt={`Portrait of ${site.name}`} width={56} height={56} />
              <div>
                <p className="ft__name">{site.name}</p>
                <p className="ft__role">{site.role}</p>
              </div>
            </div>
            <p className="ft__status">{site.status}</p>
            <a className="btn btn--dark" href={`mailto:${site.email}`}>
              Send an email
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="ft__col">
            <p className="ft__h">Pages</p>
            <a href="/layanan">Services</a>
            <a href="/karya">Work</a>
            <a href="/tentang">About</a>
            <a href="/riwayat">History</a>
            <a href="/kontak">Contact</a>
          </div>

          <div className="ft__col">
            <p className="ft__h">Services</p>
            {services.map((s) => (
              <a key={s.slug} href={`/layanan/${s.slug}`}>
                {s.name}
              </a>
            ))}
          </div>

          <div className="ft__col">
            <p className="ft__h">Recent work</p>
            {cases.slice(0, 4).map((c) => (
              <a key={c.slug} href={`/karya/${c.slug}`}>
                {c.no} · {c.title}
              </a>
            ))}
          </div>
        </div>

        <div className="ft__bottom">
          <p>
            © {new Date().getFullYear()} {site.name}, {site.place}
          </p>
          <p className="ft__links">
            <a href={site.github.url} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={site.cv} download>
              CV
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
