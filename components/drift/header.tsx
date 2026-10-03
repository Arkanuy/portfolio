"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/karya", label: "Work" },
  { href: "/layanan", label: "Services" },
  { href: "/tentang", label: "About" },
  { href: "/riwayat", label: "History" },
];

/** HEADER — mengapung, lalu memadat saat digulir. */
export default function Header() {
  const [path, setPath] = useState("/");
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPath(window.location.pathname);
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const active = (href: string) => (href === "/" ? path === "/" || path === "" : path.startsWith(href));

  return (
    <>
      <header className="hd" data-solid={solid}>
        <div className="wrap hd__in">
          <a className="hd__brand" href="/">
            <span className="hd__orb" aria-hidden="true" />
            <span>
              Arkan Mustofa
              <span className="hd__sub mono">Information Systems · Bandung</span>
            </span>
          </a>

          <nav className="hd__nav" aria-label="Pages">
            {links.map((l) => (
              <a
                key={l.href}
                className="hd__link"
                href={l.href}
                data-active={active(l.href)}
                aria-current={active(l.href) ? "page" : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hd__right">
            <ThemeSwitch />
            <a className="btn btn--go hd__cta" href="/kontak">
              Start a project
            </a>
            <button
              type="button"
              className="hd__burger"
              aria-expanded={open}
              aria-controls="drawer"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="hd__burgerBox" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="drawer" id="drawer" data-open={open}>
        {links.map((l) => (
          <a
            key={l.href}
            className="drawer__link"
            href={l.href}
            data-active={active(l.href)}
            aria-current={active(l.href) ? "page" : undefined}
          >
            {l.label}
          </a>
        ))}
        <a className="drawer__link" href="/kontak">
          Contact
        </a>
      </div>
    </>
  );
}

/** Tombol tema: dua ikon yang bertukar dengan putaran. */
function ThemeSwitch() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    const read = () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") ?? "dark";
    setTheme(read());
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* mode privat */
    }
  }

  const dark = theme !== "light";
  const label = dark ? "Switch to daylight sheet" : "Switch to night";

  return (
    <button type="button" className="icBtn" onClick={toggle} aria-label={label} title={label}>
      <span className="icBtn__stack" aria-hidden="true">
        <span className="icBtn__one icBtn__one--sun">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.4" />
            <path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
          </svg>
        </span>
        <span className="icBtn__one icBtn__one--moon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <path d="M20.5 14.8A8.8 8.8 0 0 1 9.2 3.5a8.8 8.8 0 1 0 11.3 11.3Z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
