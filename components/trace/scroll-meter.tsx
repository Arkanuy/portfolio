"use client";

import { useEffect } from "react";

/**
 * Scroll meter di header.
 *
 * Bukan bilah progres dekoratif: ini bagian dari bahasa "lembar ukur".
 * Nilainya juga ditulis sebagai angka di header (000–100), jadi pengunjung
 * tahu di mana ia berada di dalam dokumen.
 */
export default function ScrollMeter() {
  useEffect(() => {
    const bar = document.getElementById("trace-prog");
    let raf = 0;
    const paint = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const v = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      if (bar) bar.style.transform = `scaleY(${v})`;
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
  return null;
}