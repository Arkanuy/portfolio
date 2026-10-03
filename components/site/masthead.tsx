"use client";

import { useEffect, useState } from "react";

/**
 * MASTHEAD — "running head" satu baris, seperti kepala halaman dokumen.
 *
 * Sengaja BUKAN pola nav AI yang paling gampang dikenali: wordmark kiri +
 * 4-5 tautan sejajar + tombol pil di kanan, latar putih mengapung, sticky.
 * Di sini: nama di kiri, tautan kecil sejajar baseline, TIDAK ADA tombol,
 * dan satu garis progres baca di bawah (satu-satunya elemen yang bergerak
 * saat menggulir — dan ia membawa arti: sejauh mana sudah dibaca).
 */
const links = [
  { href: "/karya", label: "Work" },
  { href: "/layanan", label: "Services" },
  { href: "/tentang", label: "About" },
  { href: "/riwayat", label: "History" },
  { href: "/kontak", label: "Contact" },
];

export default function Masthead() {
  const [path, setPath] = useState("/");
  const [p, setP] = useState(0);

  useEffect(() => {
    setPath(window.location.pathname);
    const bar = document.getElementById("read-progress");
    let raf = 0;
    const paint = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const v = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      setP(v);
      if (bar) bar.style.transform = `scaleX(${v})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const active = (href: string) => (href === "/" ? path === "/" || path === "" : path.startsWith(href));

  return (
    <header className="head">
      <div className="wrap head__in">
        <a className="head__me" href="/">
          Arkan Mustofa
          <span>Information systems, Bandung</span>
        </a>
        <nav className="head__nav" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="head__prog" aria-hidden="true">
        <span className="head__progFill" id="read-progress" />
      </div>
      <span className="sr" aria-live="off">
        {Math.round(p * 100)}% read
      </span>
    </header>
  );
}
