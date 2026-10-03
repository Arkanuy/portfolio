import { site } from "@/lib/site";
import { Split, Reveal } from "./motion";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <h2>
          <Split text="Tell me how the work runs today." as="span" className="serif foot__t" accentLast />
        </h2>
        <Reveal className="foot__in" delay={120}>
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
        </Reveal>
        <p className="foot__note">
          {site.status}. Everything here comes from the CV and public repositories — no invented metrics, no placeholder
          screenshots.
        </p>
      </div>
    </footer>
  );
}
