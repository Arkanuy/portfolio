"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "/karya", label: "Work" },
  { href: "/layanan", label: "Services" },
  { href: "/tentang", label: "About" },
  { href: "/riwayat", label: "History" },
  { href: "/kontak", label: "Contact" },
];

/** Tanggal edisi: ditulis sebagai tanggal, bukan angka yang berpendar. */
function dateline() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function Masthead() {
  const [path, setPath] = useState("/");
  const [date, setDate] = useState("");

  useEffect(() => {
    setPath(window.location.pathname);
    setDate(dateline());
  }, []);

  const active = (href: string) => (path === href || (href !== "/" && path.startsWith(href)));

  return (
    <header className="head">
      <div className="wrap">
        <div className="head__top mono">
          <span>{date || "Edition"}</span>
          <span>Bandung, Indonesia</span>
          <span className="head__clock">
            <span className="head__lock">
              <span className="head__dot" aria-hidden="true" />
              Available for work
            </span>
          </span>
        </div>

        <div className="head__mid">
          <a className="head__name" href="/">
            ARKAN <span>MUSTOFA</span>
          </a>
          <p className="head__tag">
            Information systems, web apps, business software — and the process behind them.
          </p>
        </div>

        <nav className="head__nav" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="head__bar" aria-hidden="true">
        <span className="head__barFill" id="read-progress" />
      </div>
    </header>
  );
}
