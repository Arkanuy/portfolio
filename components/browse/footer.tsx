import { site } from "@/lib/site";
import { records } from "@/lib/records";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__in">
          <p className="foot__t">
            {site.name}
            <span>Katalog · {records.length} catatan</span>
          </p>
          <nav className="foot__l" aria-label="Di tempat lain">
            <a href={`mailto:${site.email}`}>email</a>
            <a href={site.github.url} target="_blank" rel="noopener noreferrer">
              github.com/{site.github.user}
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              instagram
            </a>
            <a href={site.cv} download>
              cv.pdf
            </a>
          </nav>
        </div>
        <p className="foot__n">
          {site.status}. Semua isi katalog berasal dari CV dan repo publik. Tidak ada metrik, tangkapan layar, atau
          kredensial yang dikarang.
        </p>
      </div>
    </footer>
  );
}
