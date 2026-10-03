"use client";

import { useEffect, useRef, useState } from "react";

/** Angka yang menghitung naik saat masuk layar. Nilai akhir = data asli. */
export default function Counter({ value, className = "" }: { value: string; className?: string }) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^(\D*?)(\d+)([\s\S]*)$/);
    if (!m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, digits, post] = m;
    const target = Number(digits);
    const pad = digits.length;

    let raf = 0;
    let safety = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || done.current) return;
          done.current = true;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / 1000);
            const eased = 1 - Math.pow(1 - p, 3);
            setText(pre + String(Math.round(target * eased)).padStart(pad, "0") + post);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setText(value);
          };
          raf = requestAnimationFrame(tick);
          // Jaring kedua: kalau rAF terhenti (mis. tab tidak aktif atau
          // pengguna menggulir di tengah animasi), angka WAJIB mendarat di
          // nilai aslinya. Tanpa ini pernah tertinggal di nilai antara.
          safety = window.setTimeout(() => {
            cancelAnimationFrame(raf);
            setText(value);
          }, 1500);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
