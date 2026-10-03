"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * INTERAKSI 1 — permukaan yang menyala mengikuti kursor.
 *
 * Bukan bingkai bergaris: `.spot::before` memproyeksikan gradien radial di
 * posisi kursor, jadi cahaya benar-benar mengikuti tangan. Ditulis sebagai
 * custom property `--sx/--sy` supaya CSS yang menggambar.
 *
 * Di perangkat sentuh (tanpa hover) tidak ada listener sama sekali — tidak
 * ada kerja sia-sia di ponsel.
 */
export function Spot({ children, className = "", tone = "cyan" }: { children: ReactNode; className?: string; tone?: "cyan" | "coral" }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let queued = false;
    let x = 50;
    let y = 0;
    const paint = () => {
      queued = false;
      el.style.setProperty("--sx", `${x.toFixed(1)}%`);
      el.style.setProperty("--sy", `${y.toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} data-tone={tone} className={`glass spot ${className}`}>
      {children}
    </div>
  );
}

/**
 * INTERAKSI 2 — kartu yang miring mengikuti kursor.
 *
 * Rotasi kecil (maks 6°) dengan perspektif: cukup untuk terasa hidup, tidak
 * cukup untuk bikin pusing. Dihentikan total di perangkat sentuh.
 */
export function Tilt({ children, className = "", max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let queued = false;
    let nx = 0;
    let ny = 0;
    const paint = () => {
      queued = false;
      el.style.setProperty("--rx", `${(ny * -max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(nx * max).toFixed(2)}deg`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div
      ref={ref}
      className={`tiltable ${className}`}
      style={{ transform: "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
    >
      {children}
    </div>
  );
}

/**
 * INTERAKSI 3 — ticker dua baris.
 *
 * Satu baris berjalan = band datar. Dua baris dengan KECEPATAN dan ARAH
 * berbeda terbaca sebagai kedalaman. Berhenti saat disorot supaya bisa dibaca.
 */
export function Ticker({ items }: { items: string[] }) {
  const seq = [...items, ...items];
  return (
    <div className="ticks" aria-hidden="true">
      <div className="ticks__row">
        {seq.map((t, i) => (
          <span className="tick" key={`a${i}`}>
            <i />
            {t}
          </span>
        ))}
      </div>
      <div className="ticks__row ticks__row--slow">
        {seq.map((t, i) => (
          <span className="tick" key={`b${i}`}>
            <i />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Bilah progres: satu isyarat, bukan hiasan. */
export function ScrollBar() {
  useEffect(() => {
    const bar = document.getElementById("drift-prog");
    if (!bar) return;
    let raf = 0;
    const paint = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0})`;
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
