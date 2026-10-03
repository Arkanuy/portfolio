"use client";

import { useEffect, useState } from "react";
import ThemeSwitch from "./theme-switch";

const links = [
  { href: "/", no: "00", label: "Folio" },
  { href: "/karya", no: "01", label: "Records" },
  { href: "/layanan", no: "02", label: "Work" },
  { href: "/tentang", no: "03", label: "Method" },
  { href: "/riwayat", no: "04", label: "History" },
];

/**
 * HEADER — strip instrumen.
 *
 * Bukan navbar "mengapung dengan blur". Ini baris alat ukur: nama lembar,
 * nomor halaman, meter gulir, dan tombol tema berbentuk teks. Semuanya
 * dipisah garis 1px tanpa radius.
 */
export default function Header() {
  const [path, setPath] = useState("/");
  const [open, setOpen] = useState(false);
  const [p, setP] = useState(0);

  useEffect(() => {
    setPath(window.location.pathname);
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const active = (href: string) => (href === "/" ? path === "/" || path === "" : path.startsWith(href));
  const cur = links.find((l) => active(l.href));

  return (
    <>
      <header className="hd">
        <div className="wrap hd__in">
          <a className="hd__brand" href="/">
            <span className="hd__dot" aria-hidden="true" />
            Arkan Mustofa
            <span className="mono" style={{ color: "var(--ink-4)", fontWeight: 400, letterSpacing: 0 }}>
              / trace
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
                <span className="mono" style={{ marginRight: 7, color: "var(--ink-4)" }}>
                  {l.no}
                </span>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hd__right">
            <span className="hd__meter mono">
              {cur ? cur.label.toLowerCase() : "—"}
              <span className="hd__meterBar" aria-hidden="true">
                <span className="hd__meterFill" style={{ transform: `scaleX(${p})` }} />
              </span>
              {String(Math.round(p * 100)).padStart(3, "0")}
            </span>
            <ThemeSwitch />
            <a className="hd__cta" href="/kontak">
              Send a brief
              <span aria-hidden="true">→</span>
            </a>
            <button
              type="button"
              className="hd__burger"
              aria-expanded={open}
              aria-controls="drawer"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="hd__burgerBox" aria-hidden="true">
                <i />
                <i />
              </span>
              {open ? "Close" : "Index"}
            </button>
          </div>
        </div>
      </header>

      <div className="drawer" id="drawer" data-open={open} hidden={!open ? false : undefined}>
        {links.map((l) => (
          <a
            key={l.href}
            className="drawer__link"
            href={l.href}
            data-active={active(l.href)}
            aria-current={active(l.href) ? "page" : undefined}
          >
            <span>{l.no}</span>
            {l.label}
          </a>
        ))}
        <a className="drawer__link" href="/kontak">
          <span>05</span>
          Contact
        </a>
      </div>
    </>
  );
}