"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeSwitch from "./theme-switch";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/layanan", label: "Services" },
  { href: "/karya", label: "Work" },
  { href: "/tentang", label: "About" },
  { href: "/riwayat", label: "History" },
];

/** Header bersih: tinggi tetap, garis tipis saat digulir, indikator halaman. */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <>
      <header className="hd" data-solid={scrolled}>
        <div className="wrap hd__in">
          <a className="hd__brand" href="/">
            <span className="hd__mark">{site.first[0]}{site.last[0]}</span>
            <span className="hd__name">
              {site.name}
              <span className="hd__sub">{site.place}</span>
            </span>
          </a>

          <nav className="hd__nav" aria-label="Pages">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hd__link" data-active={active(l.href)} aria-current={active(l.href) ? "page" : undefined}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hd__right">
            <ThemeSwitch />
            <a className="btn btn--dark hd__cta" href="/kontak">
              Start a project
            </a>
            <button type="button" className="hd__burger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu">
              <span className="hd__burgerBox" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="drawer" data-open={open}>
        {links.map((l) => (
          <a key={l.href} href={l.href} className="drawer__link" data-active={active(l.href)}>
            {l.label}
          </a>
        ))}
        <a href="/kontak" className="drawer__link">
          Contact
        </a>
        <a href="/kontak" className="btn btn--dark drawer__cta">
          Start a project
        </a>
      </div>
    </>
  );
}
