import { site } from "@/lib/site";

/**
 * FOOTER — penutup, bukan katalog.
 *
 * Pola "4 kolom tautan + baris ikon sosial + baris copyright kecil" adalah
 * salah satu tell paling gampang dikenali. Di sini footer cuma menutup:
 * identitas, satu baris tautan, satu baris keterangan.
 */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__in">
          <p className="foot__id">
            <b>{site.name}</b>
            {site.place}
          </p>
          <nav className="foot__links" aria-label="Elsewhere">
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
          {site.status}. Everything here comes from the CV and public repositories — no invented metrics, no
          placeholder screenshots.
        </p>
      </div>
    </footer>
  );
}
