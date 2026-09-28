"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Ikon tema, digambar sendiri.
 *
 * Kenapa diganti: ikon lama memakai `fill` datar dengan 8 garis lurus, jadi
 * terlihat seperti roda gigi dan tidak jelas arah putarnya. Yang baru:
 *   - matahari: sinar miring bergantian panjang-pendek, ada titik terang di inti,
 *     dan sinarnya berputar pelan selama tombol disorot
 *   - bulan: bulan sabit dengan kawah dan dua bintang kecil
 * Keduanya memakai `stroke` dengan ujung membulat supaya terlihat sengaja
 * digambar, bukan ikon bawaan.
 */
function SunIcon() {
  return (
    <svg className="ic ic--sun" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none">
      {/* sinar: bergantian panjang & pendek, miring, ujung membulat */}
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.2v2.6" />
        <path d="M12 19.2v2.6" />
        <path d="M2.2 12h2.6" />
        <path d="M19.2 12h2.6" />
        <path d="m5.1 5.1 1.9 1.9" />
        <path d="m17 17 1.9 1.9" />
        <path d="m18.9 5.1-1.9 1.9" />
        <path d="m7 17-1.9 1.9" />
      </g>
      {/* inti: lingkaran kosong dengan titik terang di sudut kiri atas */}
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="10.5" cy="10.4" r="1.25" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="ic ic--moon" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none">
      {/* sabit: dua busur, bukan satu bentuk penuh */}
      <path
        d="M20.4 14.9A8.7 8.7 0 0 1 9.1 3.6a8.7 8.7 0 1 0 11.3 11.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* kawah kecil */}
      <circle cx="8.6" cy="13.4" r="1.15" fill="currentColor" opacity="0.45" />
      <circle cx="11.6" cy="17" r="0.75" fill="currentColor" opacity="0.35" />
      {/* dua bintang */}
      <path d="M17.4 4.2v2.2M16.3 5.3h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20.4 8.4v1.5M19.65 9.15h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Tombol ganti tema: ikon saja. `data-theme` di <html> satu-satunya sumber. */
export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = () => (document.documentElement.getAttribute("data-theme") as Theme) ?? "light";
    setTheme(read());
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next: Theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* mode privat */
    }
    window.dispatchEvent(new Event("themechange"));
  }

  const dark = theme === "dark";
  const label = theme === null ? "Switch theme" : dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button type="button" className="icBtn" onClick={toggle} aria-label={label} title={label}>
      <span className="icBtn__stack">
        <span className="icBtn__one icBtn__one--sun">
          <SunIcon />
        </span>
        <span className="icBtn__one icBtn__one--moon">
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
