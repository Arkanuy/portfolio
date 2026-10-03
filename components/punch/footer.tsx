import { site } from "@/lib/site";
import { records } from "@/lib/records";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__in">
          <p className="foot__id">
            {site.name}
            <span>Setumpuk kartu punch · {records.length} kartu</span>
          </p>
          <nav className="foot__links" aria-label="Di tempat lain">
            <a href={`mailto:${site.email}`}>Email</a>
            <a href={site.github.url} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={site.cv} download>
              CV (PDF)
            </a>
          </nav>
        </div>
        <p className="foot__note">
          {site.status}. Setiap lubang di setiap kartu berasal dari data asli di halaman ini, dan cara membacanya
          dijelaskan di area cetak.
        </p>
      </div>
    </footer>
  );
}
