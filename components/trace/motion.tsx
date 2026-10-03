"use client";

import { useEffect } from "react";

/**
 * REVEAL + bendera JavaScript.
 *
 * Satu-satunya animasi masuk di situs: elemen `data-rv` naik 10px sambil
 * memudar, sekali, lalu berhenti. Di konsep ini gerak berarti "baris ini
 * muncul di lembar", bukan "konten melompat supaya terlihat keren".
 *
 * Komponen ini juga bukti bahwa JavaScript hidup: atribut `data-js` di <html>
 * dipasang di sini. Peringatan "tanpa JavaScript" hanya muncul kalau atribut
 * itu tidak ada.
 */
export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.js = "on";

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = () => Array.from(document.querySelectorAll<HTMLElement>("[data-rv]"));

    if (reduce.matches) {
      nodes().forEach((el) => (el.dataset.on = "true"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.on = "true";
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    nodes().forEach((el) => {
      if (el.dataset.bound === "1") return;
      el.dataset.bound = "1";
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return null;
}