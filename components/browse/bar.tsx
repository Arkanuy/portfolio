"use client";

import { useEffect, useState } from "react";

/** BAR ATAS — bilah instrumen: identitas, bagian, pintasan, ajakan. */
const links = [
  { href: "/karya", label: "Kartu" },
  { href: "/layanan", label: "Layanan" },
  { href: "/tentang", label: "Metode" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/kontak", label: "Kontak" },
];

export default function Bar() {
  const [path, setPath] = useState("/");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  const active = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  return (
    <header className="bar">
      <div className="wrap bar__in">
        <a className="bar__id" href="/">
          <span className="bar__dot" aria-hidden="true" />
          arkan@mustofa
        </a>
        <nav className="bar__nav" aria-label="Bagian">
          {links.map((l) => (
            <a key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <span className="bar__cmd">
          tekan <b>1–7</b> untuk pindah
        </span>
        <a className="bar__cta" href={`mailto:arkanmustofabe@gmail.com`}>
          Hubungi <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
