import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__in">
          <p className="foot__id">
            Arkan Mustofa
            <span>
              {site.role}
            </span>
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
          {site.status}. Every entry comes from the CV and public repositories — no invented metrics, no placeholder
          screenshots.
        </p>
      </div>
    </footer>
  );
}
