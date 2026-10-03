"use client";

import { useEffect, useRef } from "react";
import { encode, byColumn } from "@/lib/punch";
import type { Record_ } from "@/lib/records";

/**
 * KARTU PUNCH — komponen inti konsep ini.
 *
 * 80 kolom x 12 baris sebagai grid SVG. Lubang yang terbuka berasal dari
 * `lib/punch.ts` (status, tahun, jumlah bagian, huruf judul, pola periksa).
 * Lubang yang tidak terbuka tetap digambar sebagai kotak gelap, jadi yang
 * terlihat adalah KARTU, bukan titik mengambang.
 *
 * Kepala pembaca menyapu kolom mengikuti gulir: kolom yang dilewati menyala.
 */
export default function PunchCard({
  item,
  lifted,
  onPick,
}: {
  item: Record_;
  lifted: boolean;
  onPick: () => void;
}) {
  const code = encode({
    slug: item.id,
    title: item.title,
    year: item.year,
    state: item.state,
    built: item.built.length,
  });
  const cols = byColumn(code);
  const ref = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const paint = () => {
      raf = 0;
      const grid = gridRef.current;
      if (!grid) return;
      const r = grid.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      const reader = el.querySelector<HTMLElement>(".reader");
      if (reader) reader.style.setProperty("--x", String(p * r.width));
      const active = Math.max(1, Math.round(p * code.columns));
      el.querySelectorAll<SVGGElement>(".field__col").forEach((g) => {
        const c = Number(g.dataset.col || 0);
        g.dataset.lit = Math.abs(c - active) <= 1 ? "true" : "false";
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [code.columns]);

  const cw = 100 / code.columns;
  const rh = 100 / code.rows;
  const zone =
    item.state === "live"
      ? "zona 12"
      : item.state === "building"
        ? "zona 11"
        : `digit ${item.state === "public" ? 1 : item.state === "record" ? 2 : item.state === "doc" ? 3 : 0}`;

  return (
    <article className="card" data-lifted={lifted ? "true" : "false"} data-in="true">
      <header className="card__head">
        <span className="card__no">{item.no}</span>
        <span className="card__title">{item.title}</span>
        <span>
          {item.year} · {item.kind.split("·")[0].trim()}
        </span>
        <button type="button" className="card__pick btn btn--line" onClick={onPick}>
          {lifted ? "Kembalikan" : "Angkat kartu"}
        </button>
      </header>

      <div className="field" ref={ref}>
        <svg
          className="field__grid"
          ref={gridRef}
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Kartu punch ${item.no}: ${code.holes.length} lubang, memuat ${item.title}`}
        >
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((c) => (
            <line key={`g${c}`} className="field__guide" x1={c * cw} y1="0" x2={c * cw} y2="20" vectorEffect="non-scaling-stroke" />
          ))}
          {Array.from({ length: code.rows }, (_, k) => k).map((k) => (
            <line key={`h${k}`} className="field__guide" x1="0" y1={k * rh * 2} x2="100" y2={k * rh * 2} vectorEffect="non-scaling-stroke" />
          ))}
          {cols.map(({ col, rows }) => (
            <g className="field__col" key={col} data-col={col} style={{ ["--c" as string]: col }}>
              {rows.map((row) => (
                <rect
                  key={`${col}:${row}`}
                  x={(col - 0.86) * cw}
                  y={(row * rh + rh * 0.14) * 2}
                  width={cw * 0.72}
                  height={rh * 1.72}
                />
              ))}
            </g>
          ))}
        </svg>
        <span className="reader" aria-hidden="true" />
      </div>

      <footer className="card__head" style={{ borderBottom: 0, borderTop: "1px solid var(--rule-2)" }}>
        <span>{code.holes.length} lubang</span>
        <span>·</span>
        <span>{code.columns} kolom</span>
        <span>·</span>
        <span>{zone}</span>
      </footer>
    </article>
  );
}
