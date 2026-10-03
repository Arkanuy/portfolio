"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "/karya", label: "Kartu" },
  { href: "/layanan", label: "Layanan" },
  { href: "/tentang", label: "Metode" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/kontak", label: "Kontak" },
];

/** KEPALA MESIN — bilah status, nama, baris bagian. */
export default function Masthead() {
  const [path, setPath] = useState("/");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  const active = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  return (
    <header className="mast">
      <div className="wrap">
        <div className="mast__slot">
          <span className="mast__lamp">
            <span className="mast__bulb" aria-hidden="true" />
            mesin siap
          </span>
          <span>Bandung, Indonesia</span>
          <span className="mast__auto">tersedia untuk kerja</span>
        </div>

        <div className="mast__id">
          <a className="mast__name" href="/">
            ARKAN<span>.</span>MUSTOFA
          </a>
          <p className="mast__role">
            Sistem informasi, aplikasi web, perangkat lunak bisnis — dan proses di belakangnya.
          </p>
        </div>

        <nav className="mast__nav" aria-label="Bagian">
          {links.map((l) => (
            <a key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
