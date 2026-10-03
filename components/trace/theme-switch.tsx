"use client";

import { useEffect, useState } from "react";

/** Tombol tema: teks + kotak tanda, bukan ikon dekoratif. */
export default function ThemeSwitch() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const read = () => (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light";
    setTheme(read());
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* mode privat */
    }
  }

  const dark = theme === "dark";
  const label = theme === null ? "Switch theme" : dark ? "Switch to light sheet" : "Switch to dark sheet";

  return (
    <button type="button" className="themeBtn" onClick={toggle} aria-label={label} title={label}>
      <span className="themeBtn__box" aria-hidden="true" />
      {theme === null ? "theme" : dark ? "dark" : "light"}
    </button>
  );
}