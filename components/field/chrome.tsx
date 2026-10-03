"use client";

import { useEffect, useState } from "react";

/**
 * PRELOADER + NAV
 *
 * Preloader diambil dari mekanisme referensi Blue Marine (`pageLoaderLogo`):
 * satu tanda, bilah progres, lalu KELUAR dengan pengungkapan (clip-path),
 * bukan memudar. Dipatok pendek: maksimum ~900ms, dan kalau JS mati tidak
 * pernah muncul sama sekali.
 *
 * Nav: menipis saat digulir + garis progres baca di bawahnya.
 */
const links = [
  { href: "/karya", label: "Work" },
  { href: "/layanan", label: "Services" },
  { href: "/tentang", label: "About" },
  { href: "/riwayat", label: "History" },
  { href: "/kontak", label: "Contact" },
];

export default function Chrome() {
  const [p, setP] = useState(0);
  const [ready, setReady] = useState(false);
  const [solid, setSolid] = useState(false);
  const [path, setPath] = useState("/");

  useEffect(() => {
    setPath(window.location.pathname);
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* progres preloader: mendekati 100 lalu ditutup. Bukan bilah palsu yang
     * jalan sendiri tanpa arti — ia mengikuti kesiapan dokumen. */
    let v = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const el = now - t0;
      v = reduce ? 100 : Math.min(100, (el / 780) * 100);
      setP(v);
      if (v < 100) requestAnimationFrame(tick);
      else {
        setReady(true);
        root.dataset.ready = "true";
      }
    };
    requestAnimationFrame(tick);

    const bar = document.getElementById("read-bar");
    const onScroll = () => {
      setSolid(window.scrollY > 40);
      if (bar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  return (
    <>
      {!ready && (
        <div className="load" aria-hidden="true">
          <p className="load__mark">
            Arkan<span style={{ color: "var(--accent)" }}>.</span>
          </p>
          <span className="load__bar">
            <span className="load__barFill" style={{ transform: `scaleX(${p / 100})` }} />
          </span>
          <p className="load__pct mono">{String(Math.round(p)).padStart(3, "0")}</p>
        </div>
      )}

      <header className="nav" data-solid={solid}>
        <div className="wrap">
          <div className="nav__in">
            <a className="nav__me" href="/">
              Arkan<span>.</span>
            </a>
            <nav className="nav__list" aria-label="Sections">
              {links.map((l) => (
                <a key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="nav__bar" aria-hidden="true">
            <span className="nav__barFill" id="read-bar" />
          </div>
        </div>
      </header>
    </>
  );
}
